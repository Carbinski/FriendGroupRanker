import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import type { ApiResponse } from "@/types";

export async function POST() {
  const response = NextResponse.json<ApiResponse>({
    success: true,
  });

  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
