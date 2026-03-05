import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import type { ApiResponse, ZonePublic } from "@/types";
import { ZoneService } from "@/lib/zone-service";

function toPublicZone(zone: any): ZonePublic {
  return {
    id: zone._id.toString(),
    type: zone.type,
    name: zone.name,
    polygon: zone.polygon.coordinates,
    points: zone.points,
    activeHours: zone.activeHours,
    createdAt: zone.createdAt.toISOString(),
  };
}

export async function GET() {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const zones = await ZoneService.getAllZones();
    const data: ZonePublic[] = zones.map(toPublicZone);

    return NextResponse.json<ApiResponse<ZonePublic[]>>({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET /api/zones error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

