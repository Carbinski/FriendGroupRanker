"use client";

import { useState } from "react";
import { useLeaderboard, type TimeRange } from "@/hooks/use-leaderboard";
import { LeaderboardTimeTabs } from "@/components/dashboard/leaderboard-time-tabs";
import { LeaderboardEntryRow } from "@/components/dashboard/leaderboard-entry-row";

interface LeaderboardProps {
  currentUserId: string | null;
}

export default function Leaderboard({ currentUserId }: LeaderboardProps) {
  const [range, setRange] = useState<TimeRange>("all");
  const { entries, loading } = useLeaderboard(range);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-700 px-4 py-3">
        <h2 className="text-lg font-bold text-white">Leaderboard</h2>
        <LeaderboardTimeTabs value={range} onValueChange={setRange} />
      </div>

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
            {entries.map((entry, index) => (
              <LeaderboardEntryRow
                key={entry.userId}
                entry={entry}
                index={index}
                isCurrentUser={entry.userId === currentUserId}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
