import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb, ensureIndexes } from "@/lib/db";
import { signToken, isValidEmail } from "@/lib/auth";
import { AUTH_COOKIE_NAME, MIN_PASSWORD_LENGTH } from "@/lib/constants";
import type { RegisterRequest, ApiResponse, UserPublic } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RegisterRequest;
    const { email, password, displayName } = body;

    // ── Validation ────────────────────────────────────────────────────
    if (!email || !password || !displayName) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Email, password, and display name are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
        },
        { status: 400 }
      );
    }

    if (displayName.trim().length < 2) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Display name must be at least 2 characters" },
        { status: 400 }
      );
    }

    // ── Database ──────────────────────────────────────────────────────
    const db = await getDb();
    await ensureIndexes();

    const existingUser = await db
      .collection("users")
      .findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await db.collection("users").insertOne({
      email: email.toLowerCase(),
      passwordHash,
      displayName: displayName.trim(),
      createdAt: new Date(),
    });

    // ── Token & Response ──────────────────────────────────────────────
    const token = await signToken({
      userId: result.insertedId.toString(),
      email: email.toLowerCase(),
    });

    const userData: UserPublic = {
      id: result.insertedId.toString(),
      email: email.toLowerCase(),
      displayName: displayName.trim(),
      createdAt: new Date().toISOString(),
    };

    const response = NextResponse.json<ApiResponse<UserPublic>>(
      { success: true, data: userData },
      { status: 201 }
    );

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
