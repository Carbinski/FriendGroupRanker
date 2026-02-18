import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { findBonusZone, findRedZone } from "@/lib/bonus-zones";
import { calculateTotalPoints } from "@/lib/points";
import {
  CLOCK_IN_DURATION_MS,
  NEARBY_RADIUS_METERS,
} from "@/lib/constants";
import { PROXIMITY_BONUS_POINTS } from "@/lib/points";
import type {
  ApiResponse,
  ClockInRequest,
  ClockInPublic,
  ClockInDocument,
  UserDocument,
} from "@/types";

// ─── GET: Fetch all active (non-expired) clock-ins ─────────────────────────

export async function GET() {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const db = await getDb();
    const now = new Date();

    // Join with users to get display names
    const activeClockIns = await db
      .collection("clockins")
      .aggregate<ClockInPublic>([
        { $match: { expiresAt: { $gt: now } } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            id: { $toString: "$_id" },
            userId: { $toString: "$userId" },
            displayName: "$user.displayName",
            lat: { $arrayElemAt: ["$location.coordinates", 1] },
            lng: { $arrayElemAt: ["$location.coordinates", 0] },
            clockedInAt: { $dateToString: { date: "$clockedInAt" } },
            expiresAt: { $dateToString: { date: "$expiresAt" } },
            pointsEarned: 1,
          },
        },
      ])
      .toArray();

    return NextResponse.json<ApiResponse<ClockInPublic[]>>({
      success: true,
      data: activeClockIns,
    });
  } catch (error) {
    console.error("GET clockins error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── POST: Create a new clock-in ───────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = (await req.json()) as ClockInRequest;
    const { lat, lng } = body;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Valid lat and lng are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const now = new Date();
    const userId = new ObjectId(payload.userId);

    // ── Check for existing active clock-in ────────────────────────────
    const existingClockIn = (await db.collection("clockins").findOne({
      userId,
      expiresAt: { $gt: now },
    })) as ClockInDocument | null;

    if (existingClockIn) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "You already have an active clock-in. Wait for it to expire.",
        },
        { status: 409 }
      );
    }

    // ── Check red zone (no points if clock-in here when zone is active) ─
    const redZone = findRedZone(lat, lng, now);
    if (redZone) {
      const result = await db.collection("clockins").insertOne({
        userId,
        location: {
          type: "Point",
          coordinates: [lng, lat],
        },
        clockedInAt: now,
        expiresAt: new Date(now.getTime() + CLOCK_IN_DURATION_MS),
        pointsEarned: 0,
        bonusZoneId: null,
        nearbyUserCount: 0,
      });
      const user = (await db
        .collection("users")
        .findOne({ _id: userId })) as UserDocument | null;
      const clockInData: ClockInPublic = {
        id: result.insertedId.toString(),
        userId: userId.toString(),
        displayName: user?.displayName ?? "Unknown",
        lat,
        lng,
        clockedInAt: now.toISOString(),
        expiresAt: new Date(
          now.getTime() + CLOCK_IN_DURATION_MS
        ).toISOString(),
        pointsEarned: 0,
      };
      return NextResponse.json<ApiResponse<ClockInPublic>>(
        { success: true, data: clockInData },
        { status: 201 }
      );
    }

    // ── Check bonus zone (respects activeHours) ───────────────────────
    const bonusZone = findBonusZone(lat, lng, now);
    const bonusZonePoints = bonusZone?.points ?? 0;

    // ── Count nearby active users (within NEARBY_RADIUS_METERS) ──────
    // Using MongoDB $geoNear-style query with $nearSphere
    const nearbyClockIns = await db
      .collection("clockins")
      .find({
        expiresAt: { $gt: now },
        userId: { $ne: userId },
        location: {
          $nearSphere: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat],
            },
            $maxDistance: NEARBY_RADIUS_METERS,
          },
        },
      })
      .toArray();

    const nearbyCount = nearbyClockIns.length;

    // ── Calculate points ──────────────────────────────────────────────
    const totalPoints = calculateTotalPoints(bonusZonePoints, nearbyCount);

    // ── Insert clock-in ───────────────────────────────────────────────
    const expiresAt = new Date(now.getTime() + CLOCK_IN_DURATION_MS);

    const result = await db.collection("clockins").insertOne({
      userId,
      location: {
        type: "Point",
        coordinates: [lng, lat],
      },
      clockedInAt: now,
      expiresAt,
      pointsEarned: totalPoints,
      bonusZoneId: bonusZone?.id ?? null,
      nearbyUserCount: nearbyCount,
    });

    // ── Give +15 proximity bonus to each nearby user's active clock-in ───
    if (nearbyCount >= 1) {
      const nearbyIds = nearbyClockIns.map(
        (doc: { _id: ObjectId }) => doc._id
      );
      await db.collection("clockins").updateMany(
        { _id: { $in: nearbyIds } },
        { $inc: { pointsEarned: PROXIMITY_BONUS_POINTS } }
      );
    }

    // ── Fetch user display name ───────────────────────────────────────
    const user = (await db
      .collection("users")
      .findOne({ _id: userId })) as UserDocument | null;

    const clockInData: ClockInPublic = {
      id: result.insertedId.toString(),
      userId: userId.toString(),
      displayName: user?.displayName ?? "Unknown",
      lat,
      lng,
      clockedInAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      pointsEarned: totalPoints,
    };

    return NextResponse.json<ApiResponse<ClockInPublic>>(
      { success: true, data: clockInData },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST clockin error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
