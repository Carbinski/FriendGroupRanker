"use client";

import { useState, useEffect, useCallback } from "react";
import type { ZonePublic } from "@/types";

/**
 * Fetches zones from GET /api/zones.
 * Zones are used by the map to render bonus/red zone polygons.
 */
export function useZones() {
  const [zones, setZones] = useState<ZonePublic[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/zones");
      if (!res.ok) {
        setZones([]);
        return;
      }
      const json = await res.json();
      setZones(json.data ?? []);
    } catch {
      setZones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { zones, loading, refetch };
}
