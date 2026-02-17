import { MongoClient, Db } from "mongodb";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

/**
 * Returns a cached MongoDB database connection.
 * Re-uses the connection across hot reloads in development.
 */
export async function getDb(): Promise<Db> {
  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  const dbName = process.env.MONGODB_DB_NAME || "friend-group-ranker";

  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return db;
}

/**
 * Ensures required indexes exist. Call once at app startup or in a build script.
 */
export async function ensureIndexes(): Promise<void> {
  const db = await getDb();

  // Unique email index on users
  await db.collection("users").createIndex({ email: 1 }, { unique: true });

  // 2dsphere index for geospatial queries on clock-ins
  await db
    .collection("clockins")
    .createIndex({ location: "2dsphere" });

  // TTL and query indexes for clock-ins
  await db
    .collection("clockins")
    .createIndex({ expiresAt: 1 });

  await db
    .collection("clockins")
    .createIndex({ userId: 1, clockedInAt: -1 });
}
