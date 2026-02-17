"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";
import { useLeaderboard, type TimeRange } from "@/hooks/use-leaderboard";

interface LeaderboardProps {
  currentUserId: string | null;
}

const RANK_ICONS = [Trophy, Medal, Award];
const RANK_COLORS = [
  "text-yellow-400",
  "text-slate-300",
  "text-amber-600",
];

export default function Leaderboard({ currentUserId }: LeaderboardProps) {
  const [range, setRange] = useState<TimeRange>("all");
  const { entries, loading } = useLeaderboard(range);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-slate-700 px-4 py-3">
        <h2 className="text-lg font-bold text-white">Leaderboard</h2>
        <Tabs
          value={range}
          onValueChange={(v) => setRange(v as TimeRange)}
          className="mt-2"
        >
          <TabsList className="w-full bg-slate-700/50">
            <TabsTrigger
              value="all"
              className="flex-1 text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              All Time
            </TabsTrigger>
            <TabsTrigger
              value="month"
              className="flex-1 text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              Month
            </TabsTrigger>
            <TabsTrigger
              value="week"
              className="flex-1 text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              Week
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Entries */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : entries.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">
            No clock-ins yet. Be the first!
          </div>
        ) : (
          <ul className="divide-y divide-slate-700/50">
            {entries.map((entry, index) => {
              const isCurrentUser = entry.userId === currentUserId;
              const RankIcon = index < 3 ? RANK_ICONS[index] : null;
              const rankColor =
                index < 3 ? RANK_COLORS[index] : "text-slate-500";

              return (
                <li
                  key={entry.userId}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    isCurrentUser
                      ? "bg-emerald-500/10"
                      : "hover:bg-slate-700/30"
                  }`}
                >
                  {/* Rank */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                    {RankIcon ? (
                      <RankIcon className={`h-5 w-5 ${rankColor}`} />
                    ) : (
                      <span className="text-sm font-medium text-slate-500">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`truncate text-sm font-medium ${
                        isCurrentUser ? "text-emerald-400" : "text-white"
                      }`}
                    >
                      {entry.displayName}
                      {isCurrentUser && (
                        <span className="ml-1 text-xs text-emerald-500">
                          (you)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">
                      {entry.clockInCount} clock-in
                      {entry.clockInCount !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Points */}
                  <Badge
                    variant="secondary"
                    className="shrink-0 bg-slate-700 text-emerald-400"
                  >
                    {entry.totalPoints} pts
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
