import { BonusZone } from "@/types";

/**
 * List of bonus zones on the map.
 * Clock-ins inside these zones earn extra points.
 *
 * To add a new zone, append an entry to this array with:
 *  - A unique `id`
 *  - A human-readable `name`
 *  - `bounds` with north/south/east/west lat/lng
 *  - `points` to award
 */
export const BONUS_ZONES: BonusZone[] = [
  {
    id: "zone-1",
    name: "Campus Center",
    bounds: {
      north: 33.7775,
      south: 33.7745,
      east: -84.3945,
      west: -84.3985,
    },
    points: 50,
  },
];

/** Check if a coordinate falls within any bonus zone. Returns the zone or null. */
export function findBonusZone(
  lat: number,
  lng: number
): BonusZone | null {
  for (const zone of BONUS_ZONES) {
    const { north, south, east, west } = zone.bounds;
    if (lat <= north && lat >= south && lng <= east && lng >= west) {
      return zone;
    }
  }
  return null;
}
