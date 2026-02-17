"use client";

import { useState, useEffect, useCallback } from "react";
import type { LeaderboardEntry } from "@/types";

export type TimeRange = "all" | "month" | "week";

/**
 * Fetches the leaderboard for the given time range.
 * Refetches when `range` changes.
 */
export function useLeaderboard(range: TimeRange = "all") {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?range=${range}`);
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      const json = await res.json();
      setEntries(json.data ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { entries, loading, error, refetch: fetchLeaderboard };
}
