import express, { type ErrorRequestHandler } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import { db } from './config/db.js';
import { gamesRouter } from './routes/games.routes.js';

export const app = express();
app.disable('x-powered-by');
app.all('/api/auth/*splat', toNodeHandler(auth));
app.use(express.json({ limit: '32kb' }));
app.get('/api/health', async (_req, res) => {
  await db.command({ ping: 1 });
  res.json({ status: 'ok', app: 'Checkpoint' });
});
app.use('/api/games', gamesRouter);
app.use((_req, res) => { res.status(404).json({ error: { message: 'Ruta no encontrada.' } }); });
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: { message: 'El cuerpo de la solicitud debe ser JSON válido.' } });
    return;
  }
  if (err?.type === 'entity.too.large') {
    res.status(413).json({ error: { message: 'La solicitud es demasiado grande.' } });
    return;
  }
  console.error('[api] Error interno:', err instanceof Error ? err.name : 'UnknownError');
  res.status(500).json({ error: { message: 'Ocurrió un error en el servidor. Intentá nuevamente.' } });
};
app.use(errorHandler);
