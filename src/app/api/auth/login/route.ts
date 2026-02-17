import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { signToken, isValidEmail } from "@/lib/auth";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import type { LoginRequest, ApiResponse, UserPublic, UserDocument } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LoginRequest;
    const { email, password } = body;

    // ── Validation ────────────────────────────────────────────────────
    if (!email || !password) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // ── Database ──────────────────────────────────────────────────────
    const db = await getDb();
    const user = (await db
      .collection("users")
      .findOne({ email: email.toLowerCase() })) as UserDocument | null;

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // ── Token & Response ──────────────────────────────────────────────
    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
    });

    const userData: UserPublic = {
      id: user._id.toString(),
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt.toISOString(),
    };

    const response = NextResponse.json<ApiResponse<UserPublic>>(
      { success: true, data: userData },
      { status: 200 }
    );

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
