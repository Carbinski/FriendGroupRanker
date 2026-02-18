import { ObjectId } from "mongodb";

// ─── Database Documents ──────────────────────────────────────────────────────

export interface UserDocument {
  _id: ObjectId;
  email: string;
  passwordHash: string;
  displayName: string;
  createdAt: Date;
}

export interface ClockInDocument {
  _id: ObjectId;
  userId: ObjectId;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  clockedInAt: Date;
  expiresAt: Date;
  pointsEarned: number;
  bonusZoneId: string | null;
  nearbyUserCount: number;
}

// ─── API Response Types ──────────────────────────────────────────────────────

export interface UserPublic {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface ClockInPublic {
  id: string;
  userId: string;
  displayName: string;
  lat: number;
  lng: number;
  clockedInAt: string;
  expiresAt: string;
  pointsEarned: number;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  totalPoints: number;
  clockInCount: number;
}

// ─── Zone Bounds (shared) ─────────────────────────────────────────────────────

export interface ZoneBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/** Hour of day (0–23). Zone is active when current hour is in [startHour, endHour]. */
export interface ActiveHours {
  startHour: number;
  endHour: number;
}

// ─── Bonus Zone ──────────────────────────────────────────────────────────────

export interface BonusZone {
  id: string;
  name: string;
  bounds: ZoneBounds;
  points: number;
  /** If set, zone only awards bonus during these hours (local time). */
  activeHours?: ActiveHours;
}

// ─── Red Zone (no points if user clock-in here) ───────────────────────────────

export interface RedZone {
  id: string;
  name: string;
  bounds: ZoneBounds;
  /** If set, zone only blocks points during these hours (local time). */
  activeHours?: ActiveHours;
}

// ─── API Request/Response Shapes ─────────────────────────────────────────────

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ClockInRequest {
  lat: number;
  lng: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
