import { MongoClient } from 'mongodb';
import { env } from './env.js';

export const client = new MongoClient(env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
export const db = client.db();

export async function connectDatabase() {
  await client.connect();
  await db.collection('games').createIndex({ title: 1 });
}
