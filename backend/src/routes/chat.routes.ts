import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { db } from '../config/db.js';
import { env } from '../config/env.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { objectIdSchema } from '../schemas/library.schema.js';
import { runCatalogAssistant, type AssistantRunner, type ChatTurn, type ChatSource } from '../agent/catalog-agent.js';

interface Conversation { ownerId: string; title: string; messages: (ChatTurn & { sources?: ChatSource[] })[]; createdAt: Date; updatedAt: Date; busyUntil?: Date }
const conversations = db.collection<Conversation>('conversations');
const counters = db.collection<{ _id: string; count: number; expiresAt: Date }>('chat_limits');
const chatSchema = z.object({ message: z.string().trim().min(2).max(1200), conversationId: objectIdSchema.optional() }).strict();

export function createChatRouter(runner: AssistantRunner = runCatalogAssistant) {
  const router = Router();
  router.use(authMiddleware);
  router.get('/conversations', async (req, res) => {
    const data = await conversations.find({ ownerId: req.user!.id }, { projection: { title: 1, createdAt: 1, updatedAt: 1 } }).sort({ updatedAt: -1 }).limit(30).toArray();
    res.json({ data });
  });
  router.param('id', (_req, res, next, id: string) => {
    if (!objectIdSchema.safeParse(id).success) { res.status(400).json({ error: { message: 'El identificador de conversación no es válido.' } }); return; }
    next();
  });
  router.get('/conversations/:id', async (req, res) => {
    const data = await conversations.findOne({ _id: new ObjectId(req.params.id as string), ownerId: req.user!.id }, { projection: { busyUntil: 0 } });
    if (!data) { res.status(404).json({ error: { message: 'Conversación no encontrada.' } }); return; }
    res.json({ data });
  });
  router.delete('/conversations/:id', async (req, res) => {
    const result = await conversations.deleteOne({ _id: new ObjectId(req.params.id as string), ownerId: req.user!.id });
    if (!result.deletedCount) { res.status(404).json({ error: { message: 'Conversación no encontrada.' } }); return; }
    res.status(204).end();
  });
  router.post('/', async (req, res) => {
    const parsed = chatSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: { message: 'Escribí un mensaje de 2 a 1200 caracteres.', issues: parsed.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })) } }); return; }
    if (!env.GROQ_API_KEY) { res.status(503).json({ error: { message: 'El asistente todavía no está disponible. Podés explorar el catálogo y tu biblioteca.' } }); return; }
    const { message, conversationId } = parsed.data;
    const ownerId = req.user!.id;
    const now = new Date();
    const windowMs = 10 * 60 * 1000;
    const counter = await counters.findOneAndUpdate({ _id: `${ownerId}:${Math.floor(now.getTime() / windowMs)}` }, { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(now.getTime() + windowMs * 2) } }, { upsert: true, returnDocument: 'after' });
    if ((counter?.count ?? 0) > 10) { res.set('Retry-After', String(Math.ceil((windowMs - now.getTime() % windowMs) / 1000))).status(429).json({ error: { message: 'Llegaste al límite de 10 consultas cada 10 minutos. Intentá de nuevo más tarde.' } }); return; }
    let conversation;
    const busyUntil = new Date(now.getTime() + 60000);
    if (conversationId) {
      const filter = { _id: new ObjectId(conversationId), ownerId };
      conversation = await conversations.findOneAndUpdate({ ...filter, $or: [{ busyUntil: { $exists: false } }, { busyUntil: { $lt: now } }] }, { $set: { busyUntil } }, { returnDocument: 'after' });
      if (!conversation) {
        const exists = await conversations.findOne(filter);
        res.status(exists ? 409 : 404).json({ error: { message: exists ? 'Esa conversación ya está procesando un mensaje.' : 'Conversación no encontrada.' } }); return;
      }
    } else {
      const document: Conversation = { ownerId, title: message.slice(0, 70), messages: [], createdAt: now, updatedAt: now, busyUntil };
      const inserted = await conversations.insertOne(document);
      conversation = { ...document, _id: inserted.insertedId };
    }
    const controller = new AbortController();
    const cancel = () => { if (!res.writableEnded) controller.abort(); };
    res.once('close', cancel);
    try {
      const result = await runner({ message, history: conversation.messages.slice(-12).map(({ role, content }) => ({ role, content })), userId: ownerId, signal: AbortSignal.any([controller.signal, AbortSignal.timeout(45000)]) });
      const turns: Conversation['messages'] = [{ role: 'user', content: message }, { role: 'assistant', content: result.reply, sources: result.sources }];
      await conversations.updateOne({ _id: conversation._id, ownerId }, { $push: { messages: { $each: turns, $slice: -40 } }, $set: { updatedAt: new Date() } });
      res.json({ data: { conversationId: conversation._id, ...result } });
    } catch (error) {
      console.error('[chat] No se pudo responder:', error instanceof Error ? error.name : 'UnknownError');
      if (!controller.signal.aborted) res.status(503).json({ error: { message: 'El asistente no pudo responder. Intentá nuevamente en unos minutos.' } });
    } finally {
      res.off('close', cancel);
      await conversations.updateOne({ _id: conversation._id }, { $unset: { busyUntil: '' } });
    }
  });
  return router;
}
