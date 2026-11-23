// Entorno de demostración aislado: nunca utiliza ni modifica MongoDB Atlas.
import { randomBytes } from 'node:crypto';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import 'dotenv/config';

const mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
process.env.NODE_ENV = 'development';
process.env.PORT = '3000';
process.env.MONGODB_URI = mongo.getUri('checkpoint_preview');
process.env.BETTER_AUTH_SECRET = randomBytes(48).toString('base64');
process.env.BETTER_AUTH_URL = 'http://localhost:5173';
process.env.GITHUB_CLIENT_ID ||= 'preview-not-configured';
process.env.GITHUB_CLIENT_SECRET ||= 'preview-not-configured';
const { app } = await import('../src/app.js');
const { client, db, connectDatabase } = await import('../src/config/db.js');
const { auth } = await import('../src/lib/auth.js');
const { initialGames } = await import('../src/data/games.js');
await connectDatabase();
await auth.api.createUser({ body: { email: 'admin@checkpoint.test', password: 'AdminCheckpoint2026!', name: 'Juan · Admin', role: 'admin' } });
await auth.api.createUser({ body: { email: 'user@checkpoint.test', password: 'UserCheckpoint2026!', name: 'Jugador', role: 'user' } });
const now = new Date();
await db.collection('games').insertMany(initialGames.map(game => ({ ...game, releaseDate: new Date(game.releaseDate), createdAt: now, updatedAt: now })));
const server = app.listen(3000, '0.0.0.0', () => console.log('Demo local lista. Frontend: http://localhost:5173. GitHub requiere configurar OAuth real. Los datos se borran al cerrar.'));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  server.close(() => { void client.close().then(() => mongo.stop()).then(() => process.exit(0)); });
});
