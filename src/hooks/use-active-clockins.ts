"use client";

import { useState, useEffect, useCallback } from "react";
import { POLL_INTERVAL_MS } from "@/lib/constants";
import type { ClockInPublic } from "@/types";

/**
 * Polls GET /api/clockin at a regular interval to keep the map
 * pins up to date. Returns the list of active (non-expired) clock-ins.
 */
export function useActiveClockIns() {
  const [clockIns, setClockIns] = useState<ClockInPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClockIns = useCallback(async () => {
    try {
      const res = await fetch("/api/clockin");
      if (!res.ok) {
        throw new Error("Failed to fetch clock-ins");
      }
      const json = await res.json();
      setClockIns(json.data ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClockIns();
    const interval = setInterval(fetchClockIns, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchClockIns]);

  return { clockIns, loading, error, refetch: fetchClockIns };
}
