import { beforeAll, afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, ObjectId } from "mongodb";
import { getDb, clearDbCache, ensureIndexes } from "@/lib/db";
import type { UserDocument, ZoneDocument } from "@/types";
import { BASE_CLOCK_IN_POINTS } from "@/lib/constants";
import { POST as clockInPost } from "@/app/api/clockin/route";

vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn(),
}));

import { getCurrentUser } from "@/lib/auth";

const mockedGetCurrentUser = vi.mocked(getCurrentUser);

let mongoServer: MongoMemoryServer;
let client: MongoClient;

describe("Clock-in zone integration", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    client = new MongoClient(mongoServer.getUri());
    await client.connect();
    process.env.MONGODB_URI = mongoServer.getUri();
    clearDbCache();
    await getDb();
    await ensureIndexes();
  });

  afterAll(async () => {
    if (client) await client.close();
    if (mongoServer) await mongoServer.stop();
  });

  beforeEach(async () => {
    const db = await getDb();
    await db.collection("users").deleteMany({});
    await db.collection("clockins").deleteMany({});
    await db.collection("zones").deleteMany({});
    mockedGetCurrentUser.mockReset();
  });

  async function createUser(email: string): Promise<UserDocument> {
    const db = await getDb();
    const user: UserDocument = {
      _id: new ObjectId(),
      email,
      passwordHash: "hash",
      displayName: email.split("@")[0],
      createdAt: new Date(),
    };
    await db.collection("users").insertOne(user);
    return user;
  }

  it("earns bonus points when clocking in inside a bonus zone polygon", async () => {
    const db = await getDb();
    const user = await createUser("bonus@example.com");

    mockedGetCurrentUser.mockResolvedValue({
      userId: user._id.toString(),
      email: user.email,
    });

    const now = new Date();
    const zone: ZoneDocument = {
      _id: new ObjectId(),
      type: "bonus",
      name: "Bonus Zone",
      polygon: {
        type: "Polygon",
        coordinates: [
          [
            [0, 0],
            [0.01, 0],
            [0.01, 0.01],
            [0, 0.01],
            [0, 0],
          ],
        ],
      },
      points: 50,
      createdBy: new ObjectId(),
      createdAt: now,
    };
    await db.collection("zones").insertOne(zone);

    const lat = 0.005;
    const lng = 0.005;

    const req = {
      json: async () => ({ lat, lng }),
    } as any;

    const res = await clockInPost(req);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.data.pointsEarned).toBe(BASE_CLOCK_IN_POINTS + 50);
  });

  it("earns 0 points when clocking in inside a red zone polygon", async () => {
    const db = await getDb();
    const user = await createUser("red@example.com");

    mockedGetCurrentUser.mockResolvedValue({
      userId: user._id.toString(),
      email: user.email,
    });

    const now = new Date();
    const zone: ZoneDocument = {
      _id: new ObjectId(),
      type: "red",
      name: "Red Zone",
      polygon: {
        type: "Polygon",
        coordinates: [
          [
            [0, 0],
            [0.01, 0],
            [0.01, 0.01],
            [0, 0.01],
            [0, 0],
          ],
        ],
      },
      points: 0,
      createdBy: new ObjectId(),
      createdAt: now,
    };
    await db.collection("zones").insertOne(zone);

    const lat = 0.005;
    const lng = 0.005;

    const req = {
      json: async () => ({ lat, lng }),
    } as any;

    const res = await clockInPost(req);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.data.pointsEarned).toBe(0);
  });

  it("earns base points when outside all zones", async () => {
    const user = await createUser("base@example.com");

    mockedGetCurrentUser.mockResolvedValue({
      userId: user._id.toString(),
      email: user.email,
    });

    const lat = 10;
    const lng = 10;

    const req = {
      json: async () => ({ lat, lng }),
    } as any;

    const res = await clockInPost(req);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.data.pointsEarned).toBe(BASE_CLOCK_IN_POINTS);
  });
});

