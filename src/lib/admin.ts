import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { UserDocument } from "@/types";

export class AdminAuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "AdminAuthError";
  }
}

/**
 * Ensure the current request is made by an admin user.
 * - Throws AdminAuthError(401) when unauthenticated
 * - Throws AdminAuthError(403) when user is not an admin
 * - Auto-migrates legacy users by setting isAdmin to false when missing
 */
export async function requireAdmin(): Promise<UserDocument & { isAdmin: boolean }> {
  const payload = await getCurrentUser();
  if (!payload) {
    throw new AdminAuthError("Not authenticated", 401);
  }

  const db = await getDb();
  const user = (await db
    .collection<UserDocument>("users")
    .findOne({ _id: new ObjectId(payload.userId) })) as UserDocument | null;

  if (!user) {
    throw new AdminAuthError("User not found", 401);
  }

  // Auto-migrate legacy users that do not yet have an isAdmin flag.
  if (typeof user.isAdmin === "undefined") {
    await db
      .collection<UserDocument>("users")
      .updateOne({ _id: user._id }, { $set: { isAdmin: false } });
    user.isAdmin = false;
  }

  if (!user.isAdmin) {
    throw new AdminAuthError("Forbidden", 403);
  }

  return user as UserDocument & { isAdmin: boolean };
}

