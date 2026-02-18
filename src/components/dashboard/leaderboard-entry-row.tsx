"use client";

import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";
import type { LeaderboardEntry } from "@/types";

const RANK_ICONS = [Trophy, Medal, Award] as const;
const RANK_COLORS = [
  "text-yellow-400",
  "text-slate-300",
  "text-amber-600",
] as const;

interface LeaderboardEntryRowProps {
  entry: LeaderboardEntry;
  index: number;
  isCurrentUser: boolean;
}

export function LeaderboardEntryRow({
  entry,
  index,
  isCurrentUser,
}: LeaderboardEntryRowProps) {
  const RankIcon = index < 3 ? RANK_ICONS[index] : null;
  const rankColor =
    index < 3 ? RANK_COLORS[index] : "text-slate-500";

  return (
    <li
      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
        isCurrentUser ? "bg-emerald-500/10" : "hover:bg-slate-700/30"
      }`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center">
        {RankIcon ? (
          <RankIcon className={`h-5 w-5 ${rankColor}`} />
        ) : (
          <span className="text-sm font-medium text-slate-500">
            {index + 1}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`truncate text-sm font-medium ${
            isCurrentUser ? "text-emerald-400" : "text-white"
          }`}
        >
          {entry.displayName}
          {isCurrentUser && (
            <span className="ml-1 text-xs text-emerald-500">(you)</span>
          )}
        </p>
        <p className="text-xs text-slate-500">
          {entry.clockInCount} clock-in
          {entry.clockInCount !== 1 ? "s" : ""}
        </p>
      </div>

      <Badge
        variant="secondary"
        className="shrink-0 bg-slate-700 text-emerald-400"
      >
        {entry.totalPoints} pts
      </Badge>
    </li>
  );
}
