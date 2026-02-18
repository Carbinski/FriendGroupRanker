"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useActiveClockIns } from "@/hooks/use-active-clockins";
import MapView from "@/components/map/google-map";
import ClockInButton from "@/components/dashboard/clock-in-button";
import Leaderboard from "@/components/dashboard/leaderboard";
import { Button } from "@/components/ui/button";
import { LogOut, Trophy, X, Users, ChevronDown } from "lucide-react";
import type { ClockInPublic } from "@/types";

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { clockIns, refetch } = useActiveClockIns();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showActiveList, setShowActiveList] = useState(false);
  const [panToTarget, setPanToTarget] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const activeListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        showActiveList &&
        activeListRef.current &&
        !activeListRef.current.contains(e.target as Node)
      ) {
        setShowActiveList(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showActiveList]);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-900">
      {/* Map fills the entire background */}
      <MapView
        clockIns={clockIns}
        currentUserId={user?.id ?? null}
        panToTarget={panToTarget}
        onPanDone={() => setPanToTarget(null)}
      />

      {/* Top bar overlay */}
      <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between pointer-events-none">
        {/* User info */}
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/90 px-4 py-2 shadow-lg backdrop-blur-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
            {user?.displayName?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-white">
            {user?.displayName}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="ml-1 h-7 w-7 rounded-full p-0 text-slate-400 hover:bg-slate-700 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Active users – click to open list, click name to pan */}
        <div className="pointer-events-auto relative" ref={activeListRef}>
          <Button
            variant="ghost"
            onClick={() => setShowActiveList((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/90 px-4 py-2 shadow-lg backdrop-blur-sm text-white hover:bg-slate-700"
          >
            <Users className="h-4 w-4 text-emerald-400" />
            <span className="text-sm">{clockIns.length} active</span>
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform ${
                showActiveList ? "rotate-180" : ""
              }`}
            />
          </Button>
          {showActiveList && (
            <div className="absolute right-0 top-full z-20 mt-1 min-w-[200px] rounded-lg border border-slate-700 bg-slate-800/95 py-1 shadow-xl backdrop-blur-md">
              {clockIns.length === 0 ? (
                <p className="px-3 py-2 text-sm text-slate-500">
                  No one active
                </p>
              ) : (
                <ul className="max-h-64 overflow-y-auto">
                  {clockIns.map((ci: ClockInPublic) => (
                    <li key={ci.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setPanToTarget({ lat: ci.lat, lng: ci.lng });
                          setShowActiveList(false);
                        }}
                        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-white hover:bg-slate-700/80"
                      >
                        <span className="min-w-0 truncate">{ci.displayName}</span>
                        <span className="shrink-0 text-emerald-400 tabular-nums">
                          {ci.pointsEarned} pts
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom controls overlay */}
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
        <div className="flex flex-col items-center gap-3">
          <ClockInButton
            currentUserId={user?.id ?? null}
            clockIns={clockIns}
            onClockIn={refetch}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLeaderboard(true)}
            className="rounded-full border-slate-600 bg-slate-800/90 text-slate-300 shadow-lg backdrop-blur-sm hover:bg-slate-700 hover:text-white"
          >
            <Trophy className="mr-2 h-4 w-4 text-yellow-400" />
            Leaderboard
          </Button>
        </div>
      </div>

      {/* Leaderboard slide-over panel */}
      {showLeaderboard && (
        <>
          {/* Backdrop */}
          <div
            className="absolute inset-0 z-20 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLeaderboard(false)}
          />

          {/* Panel */}
          <div className="absolute bottom-0 right-0 top-0 z-30 w-full max-w-sm border-l border-slate-700 bg-slate-800/95 shadow-2xl backdrop-blur-md animate-in slide-in-from-right">
            <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
              <div />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLeaderboard(false)}
                className="h-8 w-8 rounded-full p-0 text-slate-400 hover:bg-slate-700 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-[calc(100%-3.5rem)]">
              <Leaderboard currentUserId={user?.id ?? null} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
