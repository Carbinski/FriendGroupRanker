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

// ─── Bonus Zone ──────────────────────────────────────────────────────────────

export interface BonusZone {
  id: string;
  name: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  points: number;
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
