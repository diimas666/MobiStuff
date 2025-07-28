import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const options = {};

// Глобальный кеш для hot-reload в dev-среде
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export async function connectToDatabase() {
  const client = await clientPromise;
  const db = client.db(); // либо .db('your-db-name') если не дефолт
  return { client, db };
}
