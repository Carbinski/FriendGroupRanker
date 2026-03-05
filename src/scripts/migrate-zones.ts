import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { BONUS_ZONES, RED_ZONES } from "@/lib/bonus-zones";

async function main() {
  const db = await getDb();

  const systemUserId = new ObjectId();
  const now = new Date();

  const zoneDocs = [
    ...BONUS_ZONES.map((zone) => {
      const { north, south, east, west } = zone.bounds;
      return {
        _id: new ObjectId(),
        type: "bonus" as const,
        name: zone.name,
        polygon: {
          type: "Polygon" as const,
          coordinates: [
            [
              [west, south],
              [east, south],
              [east, north],
              [west, north],
              [west, south],
            ],
          ],
        },
        points: zone.points,
        activeHours: zone.activeHours,
        createdBy: systemUserId,
        createdAt: now,
      };
    }),
    ...RED_ZONES.map((zone) => {
      const { north, south, east, west } = zone.bounds;
      return {
        _id: new ObjectId(),
        type: "red" as const,
        name: zone.name,
        polygon: {
          type: "Polygon" as const,
          coordinates: [
            [
              [west, south],
              [east, south],
              [east, north],
              [west, north],
              [west, south],
            ],
          ],
        },
        points: 0,
        activeHours: zone.activeHours,
        createdBy: systemUserId,
        createdAt: now,
      };
    }),
  ];

  if (zoneDocs.length === 0) {
    // eslint-disable-next-line no-console
    console.log("No hardcoded zones found to migrate.");
    return;
  }

  const result = await db.collection("zones").insertMany(zoneDocs);
  // eslint-disable-next-line no-console
  console.log(`Migrated ${result.insertedCount} zones to the database.`);
}

// Run the migration when executed directly (e.g. with tsx)
// eslint-disable-next-line no-console
main().catch((err) => {
  console.error("Zone migration failed:", err);
  process.exit(1);
});

