import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { ApiResponse, LeaderboardEntry } from "@/types";

/**
 * GET /api/leaderboard?range=all|month|week
 *
 * Returns an aggregated leaderboard of users sorted by total points
 * within the given time range.
 */
export async function GET(req: NextRequest) {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const range = req.nextUrl.searchParams.get("range") || "all";

    // ── Build date filter ─────────────────────────────────────────────
    const now = new Date();
    let dateFilter: Record<string, unknown> = {};

    if (range === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { clockedInAt: { $gte: weekAgo } };
    } else if (range === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { clockedInAt: { $gte: monthAgo } };
    }
    // "all" → no date filter

    // ── Aggregate leaderboard ─────────────────────────────────────────
    const db = await getDb();

    const leaderboard = await db
      .collection("clockins")
      .aggregate<LeaderboardEntry>([
        { $match: dateFilter },
        {
          $group: {
            _id: "$userId",
            totalPoints: { $sum: "$pointsEarned" },
            clockInCount: { $sum: 1 },
          },
        },
        { $sort: { totalPoints: -1 } },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: 0,
            userId: { $toString: "$_id" },
            displayName: "$user.displayName",
            totalPoints: 1,
            clockInCount: 1,
          },
        },
      ])
      .toArray();

    return NextResponse.json<ApiResponse<LeaderboardEntry[]>>({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
