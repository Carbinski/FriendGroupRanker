/** Duration a clock-in pin stays visible (in milliseconds). */
export const CLOCK_IN_DURATION_MS = 90 * 60 * 1000; // 1 hour 30 minutes

/** Radius (in meters) to search for nearby clocked-in users. */
export const NEARBY_RADIUS_METERS = 100;

/** Base points awarded per clock-in. */
export const BASE_CLOCK_IN_POINTS = 10;

/** Polling interval for fetching active clock-ins (in milliseconds). */
export const POLL_INTERVAL_MS = 12_000; // 12 seconds

/** Default map center: Atlanta, GA (33.7760045° N, 84.3965908° W). */
export const MAP_CENTER = {
  lat: 33.7760045,
  lng: -84.3965908,
} as const;

/** Default map zoom level. */
export const MAP_ZOOM = 16;

/** Cookie name for JWT auth token. */
export const AUTH_COOKIE_NAME = "fgr-token";

/** JWT expiration time. */
export const JWT_EXPIRATION = "30d";

/** Minimum password length. */
export const MIN_PASSWORD_LENGTH = 8;
