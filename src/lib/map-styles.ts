import { CLOCK_IN_DURATION_MS } from "@/lib/constants";

/** Default map container dimensions. */
export const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "100%",
} as const;

/** Google Maps style definitions for dark theme. */
export const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1a1a2e" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#8892b0" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#2d2d44" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1a1a2e" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e1526" }],
  },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#1a2e1a" }],
  },
];

/** Min/max opacity for clock-in pins; opacity decreases (fades out) as expiration approaches. */
const CLOCK_IN_PIN_OPACITY_MIN = 0.35;
const CLOCK_IN_PIN_OPACITY_MAX = 1;

/** Opacity for a clock-in pin: starts fully visible, slowly fades out as expiration approaches. */
export function getClockInPinOpacity(clockedInAt: string): number {
  const elapsed = Date.now() - new Date(clockedInAt).getTime();
  const progress = Math.min(1, Math.max(0, elapsed / CLOCK_IN_DURATION_MS));
  return (
    CLOCK_IN_PIN_OPACITY_MAX -
    (CLOCK_IN_PIN_OPACITY_MAX - CLOCK_IN_PIN_OPACITY_MIN) * progress
  );
}

/** User pin scale – large so they stand out. */
export const USER_PIN_SCALE = 12;
export const USER_PIN_STROKE_WEIGHT = 3;
