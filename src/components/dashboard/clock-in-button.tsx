"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, Clock } from "lucide-react";
import type { ClockInPublic } from "@/types";

interface ClockInButtonProps {
  currentUserId: string | null;
  clockIns: ClockInPublic[];
  onClockIn: () => void;
}

export default function ClockInButton({
  currentUserId,
  clockIns,
  onClockIn,
}: ClockInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPoints, setLastPoints] = useState<number | null>(null);

  const activeClockIn = useMemo(
    () => clockIns.find((ci) => ci.userId === currentUserId),
    [clockIns, currentUserId]
  );

  function formatTimeRemaining(dateStr: string): string {
    const diff = new Date(dateStr).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const mins = Math.floor(diff / 60_000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
  }

  async function handleClockIn() {
    setError(null);
    setLastPoints(null);
    setLoading(true);

    try {
      // Get user's current position
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10_000,
          });
        }
      );

      const { latitude: lat, longitude: lng } = position.coords;

      const res = await fetch("/api/clockin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Clock-in failed");
        return;
      }

      setLastPoints(json.data.pointsEarned);
      onClockIn();
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        setError("Location access denied. Please enable location services.");
      } else {
        setError("Failed to clock in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {activeClockIn ? (
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-400">
          <Clock className="h-4 w-4" />
          <span>
            Active — {formatTimeRemaining(activeClockIn.expiresAt)} remaining
          </span>
        </div>
      ) : (
        <Button
          onClick={handleClockIn}
          disabled={loading}
          size="lg"
          className="rounded-full bg-emerald-600 px-6 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-700 hover:shadow-emerald-500/40"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Clocking in…
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              Clock In
            </>
          )}
        </Button>
      )}

      {lastPoints !== null && (
        <div className="animate-in fade-in slide-in-from-bottom-2 rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-medium text-emerald-400">
          +{lastPoints} points earned!
        </div>
      )}

      {error && (
        <div className="max-w-xs rounded-lg bg-red-500/10 px-3 py-1.5 text-center text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
