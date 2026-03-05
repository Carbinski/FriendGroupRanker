import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient, ObjectId } from "mongodb";
import { getDb, clearDbCache, ensureIndexes } from "@/lib/db";
import type { ActiveHours, ZoneDocument } from "@/types";
import { ZoneService } from "@/lib/zone-service";

let mongoServer: MongoMemoryServer;
let client: MongoClient;

async function setTestDbUri() {
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  clearDbCache();
  await getDb();
}

describe("ZoneService", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    client = new MongoClient(mongoServer.getUri());
    await client.connect();
    await setTestDbUri();
    await ensureIndexes();
  });

  afterAll(async () => {
    if (client) await client.close();
    if (mongoServer) await mongoServer.stop();
  });

  beforeEach(async () => {
    const db = await getDb();
    await db.collection("zones").deleteMany({});
  });

  it("isZoneActiveAt returns true when no activeHours set", () => {
    const zone = { activeHours: undefined } as ZoneDocument;
    const now = new Date();

    const result = ZoneService.isZoneActiveAt(zone, now);

    expect(result).toBe(true);
  });

  it("isZoneActiveAt respects simple hour windows", () => {
    const hours: ActiveHours = { startHour: 9, endHour: 17 };
    const zone = { activeHours: hours } as ZoneDocument;

    const tenAm = new Date();
    tenAm.setHours(10, 0, 0, 0);
    const sixPm = new Date();
    sixPm.setHours(18, 0, 0, 0);

    expect(ZoneService.isZoneActiveAt(zone, tenAm)).toBe(true);
    expect(ZoneService.isZoneActiveAt(zone, sixPm)).toBe(false);
  });

  it("isZoneActiveAt supports overnight windows", () => {
    const hours: ActiveHours = { startHour: 22, endHour: 6 };
    const zone = { activeHours: hours } as ZoneDocument;

    const elevenPm = new Date();
    elevenPm.setHours(23, 0, 0, 0);
    const twoAm = new Date();
    twoAm.setHours(2, 0, 0, 0);
    const noon = new Date();
    noon.setHours(12, 0, 0, 0);

    expect(ZoneService.isZoneActiveAt(zone, elevenPm)).toBe(true);
    expect(ZoneService.isZoneActiveAt(zone, twoAm)).toBe(true);
    expect(ZoneService.isZoneActiveAt(zone, noon)).toBe(false);
  });

  it("createZone inserts a valid zone document", async () => {
    const db = await getDb();

    const creatorId = new ObjectId();
    const polygon = [
      [
        [0, 0],
        [0.001, 0],
        [0.001, 0.001],
        [0, 0.001],
        [0, 0],
      ],
    ];

    const zone = await ZoneService.createZone({
      type: "bonus",
      name: "Test Zone",
      polygon,
      points: 10,
      activeHours: { startHour: 9, endHour: 17 },
      createdBy: creatorId,
    });

    const inDb = await db.collection("zones").findOne({ _id: zone._id });
    expect(inDb).toBeTruthy();
    expect(inDb?.name).toBe("Test Zone");
    expect(inDb?.type).toBe("bonus");
    expect(inDb?.points).toBe(10);
  });

  it("createZone throws on invalid input", async () => {
    const creatorId = new ObjectId();

    await expect(
      ZoneService.createZone({
        // @ts-expect-error - name is required
        name: "",
        type: "bonus",
        polygon: [],
        points: -5,
        createdBy: creatorId,
      })
    ).rejects.toThrow();
  });

  it("findZoneAtPoint returns the correct zone when point is inside polygon", async () => {
    const db = await getDb();

    const polygon = [
      [
        [0, 0],
        [0.01, 0],
        [0.01, 0.01],
        [0, 0.01],
        [0, 0],
      ],
    ];

    const now = new Date();
    const zone: ZoneDocument = {
      _id: new ObjectId(),
      type: "bonus",
      name: "Inside Zone",
      polygon: {
        type: "Polygon",
        coordinates: polygon,
      },
      points: 20,
      createdBy: new ObjectId(),
      createdAt: now,
    };

    await db.collection("zones").insertOne(zone);

    const found = await ZoneService.findZoneAtPoint(0.005, 0.005, "bonus", now);

    expect(found).not.toBeNull();
    expect(found?.name).toBe("Inside Zone");
  });

  it("findZoneAtPoint returns null when point is outside polygon", async () => {
    const db = await getDb();

    const polygon = [
      [
        [0, 0],
        [0.01, 0],
        [0.01, 0.01],
        [0, 0.01],
        [0, 0],
      ],
    ];

    const now = new Date();
    const zone: ZoneDocument = {
      _id: new ObjectId(),
      type: "bonus",
      name: "Inside Zone",
      polygon: {
        type: "Polygon",
        coordinates: polygon,
      },
      points: 20,
      createdBy: new ObjectId(),
      createdAt: now,
    };

    await db.collection("zones").insertOne(zone);

    const found = await ZoneService.findZoneAtPoint(1, 1, "bonus", now);

    expect(found).toBeNull();
  });

  it("deleteZone removes an existing zone and returns true", async () => {
    const db = await getDb();
    const now = new Date();

    const zone: ZoneDocument = {
      _id: new ObjectId(),
      type: "red",
      name: "To Delete",
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

    const deleted = await ZoneService.deleteZone(zone._id.toString());
    expect(deleted).toBe(true);

    const inDb = await db.collection("zones").findOne({ _id: zone._id });
    expect(inDb).toBeNull();
  });

  it("deleteZone returns false when zone does not exist", async () => {
    const deleted = await ZoneService.deleteZone(new ObjectId().toString());
    expect(deleted).toBe(false);
  });
});

