import { beforeAll, afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, ObjectId } from "mongodb";
import { getDb, clearDbCache } from "@/lib/db";
import type { UserDocument } from "@/types";
import { requireAdmin, AdminAuthError } from "@/lib/admin";

let mongoServer: MongoMemoryServer;
let client: MongoClient;

vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn(),
}));

import { getCurrentUser } from "@/lib/auth";

const mockedGetCurrentUser = vi.mocked(getCurrentUser);

describe("requireAdmin", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    client = new MongoClient(mongoServer.getUri());
    await client.connect();
    process.env.MONGODB_URI = mongoServer.getUri();
    clearDbCache();
    await getDb();
  });

  afterAll(async () => {
    if (client) await client.close();
    if (mongoServer) await mongoServer.stop();
  });

  beforeEach(async () => {
    const db = await getDb();
    await db.collection("users").deleteMany({});
    mockedGetCurrentUser.mockReset();
  });

  it("returns the user document when user is admin", async () => {
    const db = await getDb();
    const user: UserDocument & { isAdmin: boolean } = {
      _id: new ObjectId(),
      email: "admin@example.com",
      passwordHash: "hash",
      displayName: "Admin",
      createdAt: new Date(),
      isAdmin: true,
    };
    await db.collection("users").insertOne(user);

    mockedGetCurrentUser.mockResolvedValue({
      userId: user._id.toString(),
      email: user.email,
    });

    const result = await requireAdmin();

    expect(result._id.toString()).toBe(user._id.toString());
    expect(result.isAdmin).toBe(true);
  });

  it("throws AdminAuthError with 403 when user is not admin", async () => {
    const db = await getDb();
    const user: UserDocument = {
      _id: new ObjectId(),
      email: "user@example.com",
      passwordHash: "hash",
      displayName: "User",
      createdAt: new Date(),
    };
    await db.collection("users").insertOne(user);

    mockedGetCurrentUser.mockResolvedValue({
      userId: user._id.toString(),
      email: user.email,
    });

    await expect(requireAdmin()).rejects.toMatchObject({
      status: 403,
    });
  });

  it("throws AdminAuthError with 401 when unauthenticated", async () => {
    mockedGetCurrentUser.mockResolvedValue(null);

    await expect(requireAdmin()).rejects.toMatchObject({
      status: 401,
    });
  });

  it("auto-migrates missing isAdmin field to false", async () => {
    const db = await getDb();
    const user: UserDocument = {
      _id: new ObjectId(),
      email: "legacy@example.com",
      passwordHash: "hash",
      displayName: "Legacy",
      createdAt: new Date(),
    };
    await db.collection("users").insertOne(user);

    mockedGetCurrentUser.mockResolvedValue({
      userId: user._id.toString(),
      email: user.email,
    });

    await expect(requireAdmin()).rejects.toMatchObject({
      status: 403,
    });

    const updated = await db
      .collection("users")
      .findOne<{ isAdmin?: boolean }>({ _id: user._id });

    expect(updated?.isAdmin).toBe(false);
  });
});

