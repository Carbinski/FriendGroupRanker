import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/types";
import { requireAdmin, AdminAuthError } from "@/lib/admin";
import { ZoneService } from "@/lib/zone-service";

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    const deleted = await ZoneService.deleteZone(id);

    if (!deleted) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Zone not found" },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: error.status }
      );
    }

    console.error("DELETE /api/admin/zones/[id] error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

