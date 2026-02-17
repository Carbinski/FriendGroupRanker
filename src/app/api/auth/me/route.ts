import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { ApiResponse, UserPublic, UserDocument } from "@/types";

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
    const user = (await db
      .collection("users")
      .findOne({ _id: new ObjectId(payload.userId) })) as UserDocument | null;

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const userData: UserPublic = {
      id: user._id.toString(),
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt.toISOString(),
    };

    return NextResponse.json<ApiResponse<UserPublic>>({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
