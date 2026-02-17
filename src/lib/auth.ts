import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, JWT_EXPIRATION } from "./constants";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "change-me-in-production"
);

export interface JwtPayload {
  userId: string;
  email: string;
}

/** Create a signed JWT for the given payload. */
export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(JWT_SECRET);
}

/** Verify and decode a JWT. Returns null if invalid/expired. */
export async function verifyToken(
  token: string
): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

/** Read the auth token from the request cookies. */
export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
}

/** Verify the current user from cookies. Returns payload or null. */
export async function getCurrentUser(): Promise<JwtPayload | null> {
  const token = await getTokenFromCookies();
  if (!token) return null;
  return verifyToken(token);
}

/** Email validation regex. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
