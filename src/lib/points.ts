import { BASE_CLOCK_IN_POINTS } from "./constants";

/** Proximity bonus: when there is at least one nearby user, everyone in the group gets this many points. */
export const PROXIMITY_BONUS_POINTS = 10;

/**
 * Calculate bonus points when there are nearby users with active clock-ins.
 * When there is at least one nearby user, the clocking-in user gets +10.
 * Nearby users also receive +10 each (applied in the clock-in API).
 */
export function calculateNearbyPoints(nearbyCount: number): number {
  return nearbyCount >= 1 ? PROXIMITY_BONUS_POINTS : 0;
}

/**
 * Calculate total points for a single clock-in.
 *
 * @param bonusZonePoints - Points from landing in a bonus zone (0 if none)
 * @param nearbyCount     - Number of other users with active clock-ins nearby
 */
export function calculateTotalPoints(
  bonusZonePoints: number,
  nearbyCount: number
): number {
  return (
    BASE_CLOCK_IN_POINTS +
    bonusZonePoints +
    calculateNearbyPoints(nearbyCount)
  );
}
