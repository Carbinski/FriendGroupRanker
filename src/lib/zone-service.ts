import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import type { ActiveHours, ZoneDocument } from "@/types";

export interface CreateZoneInput {
  type: "bonus" | "red";
  name: string;
  /**
   * Polygon coordinates in GeoJSON order: [ [ [lng, lat], ... ] ]
   * Only a single outer ring is supported.
   */
  polygon: [number, number][][];
  points: number;
  activeHours?: ActiveHours;
  createdBy: ObjectId;
}

export class ZoneService {
  static isZoneActiveAt(
    zone: { activeHours?: ActiveHours },
    date: Date
  ): boolean {
    const { activeHours } = zone;
    if (!activeHours) return true;
    const hour = date.getHours();
    const { startHour, endHour } = activeHours;
    if (startHour <= endHour) {
      return hour >= startHour && hour <= endHour;
    }
    // Overnight window (e.g. 22–6)
    return hour >= startHour || hour <= endHour;
  }

  static async getAllZones(): Promise<ZoneDocument[]> {
    const db = await getDb();
    return db.collection<ZoneDocument>("zones").find({}).toArray();
  }

  static async createZone(input: CreateZoneInput): Promise<ZoneDocument> {
    const { type, name, polygon, points, activeHours, createdBy } = input;

    if (type !== "bonus" && type !== "red") {
      throw new Error("Invalid zone type");
    }
    if (!name || typeof name !== "string") {
      throw new Error("Zone name is required");
    }
    if (!Array.isArray(polygon) || polygon.length === 0) {
      throw new Error("Polygon coordinates are required");
    }
    const outerRing = polygon[0];
    if (!Array.isArray(outerRing) || outerRing.length < 4) {
      throw new Error("Polygon outer ring must have at least 4 coordinates");
    }

    // Ensure the polygon is closed (first and last coordinate are equal).
    const [firstLng, firstLat] = outerRing[0];
    const [lastLng, lastLat] = outerRing[outerRing.length - 1];
    if (firstLng !== lastLng || firstLat !== lastLat) {
      outerRing.push([firstLng, firstLat]);
    }

    if (typeof points !== "number" || Number.isNaN(points)) {
      throw new Error("Zone points must be a number");
    }
    if (points < 0) {
      throw new Error("Zone points cannot be negative");
    }

    if (activeHours) {
      if (
        activeHours.startHour < 0 ||
        activeHours.startHour > 23 ||
        activeHours.endHour < 0 ||
        activeHours.endHour > 23
      ) {
        throw new Error("Active hours must be between 0 and 23");
      }
    }

    const now = new Date();
    const zone: ZoneDocument = {
      _id: new ObjectId(),
      type,
      name,
      polygon: {
        type: "Polygon",
        coordinates: polygon,
      },
      points: type === "red" ? 0 : points,
      activeHours,
      createdBy,
      createdAt: now,
    };

    const db = await getDb();
    await db.collection<ZoneDocument>("zones").insertOne(zone);
    return zone;
  }

  static async deleteZone(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db
      .collection<ZoneDocument>("zones")
      .deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }

  /**
   * Finds the first zone of the given type that contains the point (lat, lng)
   * and is active at the provided time. Returns the zone or null.
   */
  static async findZoneAtPoint(
    lat: number,
    lng: number,
    type: "bonus" | "red",
    at: Date
  ): Promise<ZoneDocument | null> {
    const db = await getDb();

    const zone = (await db
      .collection<ZoneDocument>("zones")
      .findOne({
        type,
        polygon: {
          $geoIntersects: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat],
            },
          },
        },
      })) as ZoneDocument | null;

    if (!zone) return null;
    if (!ZoneService.isZoneActiveAt(zone, at)) {
      return null;
    }
    return zone;
  }
}

