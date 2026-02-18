"use client";

import { formatTimeAgo, formatTimeRemaining } from "@/lib/utils";
import type { ClockInPublic } from "@/types";

interface ClockInInfoWindowContentProps {
  clockIn: ClockInPublic;
}

export function ClockInInfoWindowContent({ clockIn }: ClockInInfoWindowContentProps) {
  return (
    <div className="min-w-[180px] p-1">
      <h3 className="text-base font-semibold text-slate-900">
        {clockIn.displayName}
      </h3>
      <div className="mt-1 space-y-0.5 text-sm text-slate-600">
        <p>Clocked in: {formatTimeAgo(clockIn.clockedInAt)}</p>
        <p>Expires: {formatTimeRemaining(clockIn.expiresAt, " left")}</p>
        <p className="font-medium text-emerald-600">
          +{clockIn.pointsEarned} pts
        </p>
      </div>
    </div>
  );
}
