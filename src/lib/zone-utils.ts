import type { ActiveHours } from "@/types";

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
