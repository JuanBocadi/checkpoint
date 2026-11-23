import { Router } from 'express';
import { ObjectId, type Filter } from 'mongodb';
import type { z } from 'zod';
import { db } from '../config/db.js';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js';
import { gameQuerySchema, gameSchema, updateGameSchema, type GameInput } from '../schemas/game.schema.js';

interface GameDocument extends Omit<GameInput, 'releaseDate'> {
  releaseDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
const games = db.collection<GameDocument>('games');
export const gamesRouter = Router();
function validationError(error: z.ZodError) {
  return { error: { message: 'Revisá los datos enviados.', issues: error.issues.map(i => ({ field: i.path.join('.'), message: i.message })) } };
}

gamesRouter.get('/', async (req, res) => {
  const parsed = gameQuerySchema.safeParse(req.query);
  if (!parsed.success) { res.status(400).json(validationError(parsed.error)); return; }
  const { q, genre, platform, page, limit } = parsed.data;
  const filter: Filter<GameDocument> = {};
  if (q) filter.title = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  if (genre) filter.genre = genre;
  if (platform) filter.platform = platform;
  const [data, total] = await Promise.all([
    games.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
    games.countDocuments(filter),
  ]);
  res.json({ data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

gamesRouter.param('id', (req, res, next, id: string) => {
  if (!/^[a-f\d]{24}$/i.test(id)) { res.status(400).json({ error: { message: 'El identificador del juego no es válido.' } }); return; }
  next();
});

gamesRouter.get('/:id', async (req, res) => {
  const game = await games.findOne({ _id: new ObjectId(req.params.id as string) });
  if (!game) { res.status(404).json({ error: { message: 'No encontramos ese videojuego.' } }); return; }
  res.json({ data: game });
});

gamesRouter.post('/', authMiddleware, requireRole('admin'), async (req, res) => {
  const parsed = gameSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json(validationError(parsed.error)); return; }
  const now = new Date();
  const doc = { ...parsed.data, releaseDate: new Date(parsed.data.releaseDate), createdAt: now, updatedAt: now };
  const result = await games.insertOne(doc);
  res.status(201).location(`/api/games/${result.insertedId}`).json({ data: { ...doc, _id: result.insertedId } });
});

gamesRouter.patch('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const parsed = updateGameSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json(validationError(parsed.error)); return; }
  const update = { ...parsed.data, ...(parsed.data.releaseDate ? { releaseDate: new Date(parsed.data.releaseDate) } : {}), updatedAt: new Date() };
  const game = await games.findOneAndUpdate({ _id: new ObjectId(req.params.id as string) }, { $set: update as Partial<GameDocument> }, { returnDocument: 'after' });
  if (!game) { res.status(404).json({ error: { message: 'No encontramos ese videojuego.' } }); return; }
  res.json({ data: game });
});

gamesRouter.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const result = await games.deleteOne({ _id: new ObjectId(req.params.id as string) });
  if (!result.deletedCount) { res.status(404).json({ error: { message: 'No encontramos ese videojuego.' } }); return; }
  res.status(204).end();
});
