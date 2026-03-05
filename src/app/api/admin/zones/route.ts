import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse, ZonePublic } from "@/types";
import { requireAdmin, AdminAuthError } from "@/lib/admin";
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

export async function POST(req: NextRequest) {
  try {
    const adminUser = await requireAdmin();

    const body = (await req.json()) as {
      type?: "bonus" | "red";
      name?: string;
      polygon?: [number, number][][];
      points?: number;
      activeHours?: { startHour: number; endHour: number };
    };

    if (!body || !body.type || !body.name || !body.polygon) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "type, name and polygon are required" },
        { status: 400 }
      );
    }

    const zone = await ZoneService.createZone({
      type: body.type,
      name: body.name,
      polygon: body.polygon,
      points: body.points ?? 0,
      activeHours: body.activeHours,
      createdBy: adminUser._id,
    });

    return NextResponse.json<ApiResponse<ZonePublic>>(
      {
        success: true,
        data: toPublicZone(zone),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.status }
      );
    }

    console.error("POST /api/admin/zones error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

