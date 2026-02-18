import type { BonusZone, RedZone, ActiveHours } from "@/types";

/**
 * Returns true if the zone is active at the given date (local time).
 * Zones without activeHours are always active.
 */
export function isZoneActiveAt(
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

/**
 * List of bonus zones on the map.
 * Clock-ins inside these zones earn extra points (when zone is active).
 *
 * To add a new zone, append an entry with:
 *  - A unique `id`
 *  - A human-readable `name`
 *  - `bounds` (north/south/east/west lat/lng)
 *  - `points` to award
 *  - Optional `activeHours`: { startHour, endHour } (0–23) so the zone only counts during that window
 */
export const BONUS_ZONES: BonusZone[] = [
  {
    id: "zone-1",
    name: "PG 3",
    bounds: {
      north: 33.7745,
      south: 33.77422,
      east: -84.39548,
      west: -84.39607,
    },
    points: 20,
  },
  {
    id: "zone-2",
    name: "Student Center",
    bounds: {
      north: 33.77392,
      south: 33.77361,
      east: -84.39801,
      west: -84.39903,
    },
    points: 10,
  },
];

/**
 * List of red zones on the map.
 * Clock-ins inside these zones earn 0 points (when zone is active).
 *
 * To add a new zone, append an entry with:
 *  - A unique `id`
 *  - A human-readable `name`
 *  - `bounds` (north/south/east/west lat/lng)
 *  - Optional `activeHours`: { startHour, endHour } (0–23) so the zone only blocks points during that window
 */
export const RED_ZONES: RedZone[] = [
  {
    id: "red-1",
    name: "SQ5 and Uhouse",
    bounds: {
      north: 33.78048,
      south: 33.77786,
      east: -84.38886,
      west: -84.39054,
    },
    // Example: only active 10am–4pm
    // activeHours: { startHour: 10, endHour: 16 },
  },
  {
    id: "red-2",
    name: "Whistler",
    bounds: {
      north: 33.77949,
      south: 33.77809,
      east: -84.38735,
      west: -84.38870,
    },
  },
];

/** Check if a coordinate falls within any bonus zone that is active at the given time. Returns the zone or null. */
export function findBonusZone(
  lat: number,
  lng: number,
  at: Date = new Date()
): BonusZone | null {
  for (const zone of BONUS_ZONES) {
    const { north, south, east, west } = zone.bounds;
    if (lat <= north && lat >= south && lng <= east && lng >= west) {
      if (isZoneActiveAt(zone, at)) return zone;
      return null;
    }
  }
  return null;
}

/** Check if a coordinate falls within any red zone that is active at the given time. Returns the zone or null. */
export function findRedZone(
  lat: number,
  lng: number,
  at: Date = new Date()
): RedZone | null {
  for (const zone of RED_ZONES) {
    const { north, south, east, west } = zone.bounds;
    if (lat <= north && lat >= south && lng <= east && lng >= west) {
      if (isZoneActiveAt(zone, at)) return zone;
      return null;
    }
  }
  return null;
}
