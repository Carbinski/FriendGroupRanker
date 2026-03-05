import { beforeAll, afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, ObjectId } from "mongodb";
import { getDb, clearDbCache, ensureIndexes } from "@/lib/db";
import type { ZoneDocument } from "@/types";
import * as AdminModule from "@/lib/admin";
import { GET as getZones } from "@/app/api/zones/route";
import { POST as createZone } from "@/app/api/admin/zones/route";
import { DELETE as deleteZone } from "@/app/api/admin/zones/[id]/route";

vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn(),
}));

let mongoServer: MongoMemoryServer;
let client: MongoClient;

describe("Zone API routes", () => {
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
    await db.collection("zones").deleteMany({});
    vi.restoreAllMocks();
  });

  it("GET /api/zones returns all zones", async () => {
    const { getCurrentUser } = await import("@/lib/auth");
    vi.mocked(getCurrentUser).mockResolvedValue({
      userId: new ObjectId().toString(),
      email: "test@example.com",
    });

    const db = await getDb();
    const now = new Date();
    const zone: ZoneDocument = {
      _id: new ObjectId(),
      type: "bonus",
      name: "Existing",
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
      points: 5,
      createdBy: new ObjectId(),
      createdAt: now,
    };
    await db.collection("zones").insertOne(zone);

    const res = await getZones();
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(1);
    expect(json.data[0].name).toBe("Existing");
  });

  it("POST /api/admin/zones creates a zone when admin", async () => {
    const requireAdminSpy = vi.spyOn(AdminModule, "requireAdmin").mockResolvedValue({
      _id: new ObjectId(),
    } as any);

    const body = {
      type: "bonus",
      name: "API Zone",
      polygon: [
        [
          [0, 0],
          [0.01, 0],
          [0.01, 0.01],
          [0, 0.01],
          [0, 0],
        ],
      ],
      points: 20,
    };

    const req = {
      json: async () => body,
    } as any;

    const res = await createZone(req);
    const json = await res.json();

    expect(requireAdminSpy).toHaveBeenCalled();
    expect(json.success).toBe(true);
    expect(json.data.name).toBe("API Zone");
  });

  it("DELETE /api/admin/zones/[id] deletes a zone when admin", async () => {
    const db = await getDb();
    const now = new Date();
    const zone: ZoneDocument = {
      _id: new ObjectId(),
      type: "red",
      name: "Delete Me",
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

    vi.spyOn(AdminModule, "requireAdmin").mockResolvedValue({
      _id: new ObjectId(),
    } as any);

    const res = await deleteZone({} as any, {
      params: { id: zone._id.toString() },
    } as any);

    expect(res.status).toBe(204);

    const remaining = await db.collection("zones").findOne({ _id: zone._id });
    expect(remaining).toBeNull();
  });
});

