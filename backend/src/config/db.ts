import { MongoClient } from 'mongodb';
import { env } from './env.js';

export const client = new MongoClient(env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
export const db = client.db();

export async function connectDatabase() {
  await client.connect();
  await db.collection('games').createIndex({ title: 1 });
  await db.collection('library_entries').createIndex({ ownerId: 1, gameId: 1 }, { unique: true });
  await db.collection('conversations').createIndex({ ownerId: 1, updatedAt: -1 });
  await db.collection('chat_limits').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}
