"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useActiveClockIns } from "@/hooks/use-active-clockins";
import MapView from "@/components/map/google-map";
import ClockInButton from "@/components/dashboard/clock-in-button";
import { DashboardLoadingScreen } from "@/components/dashboard/dashboard-loading-screen";
import { DashboardTopBar } from "@/components/dashboard/dashboard-top-bar";
import { LeaderboardPanel } from "@/components/dashboard/leaderboard-panel";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { clockIns, refetch } = useActiveClockIns();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showActiveList, setShowActiveList] = useState(false);
  const [panToTarget, setPanToTarget] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  if (authLoading) {
    return <DashboardLoadingScreen />;
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-900">
      <MapView
        clockIns={clockIns}
        currentUserId={user?.id ?? null}
        panToTarget={panToTarget}
        onPanDone={() => setPanToTarget(null)}
      />

      <DashboardTopBar
        displayName={user?.displayName ?? ""}
        clockIns={clockIns}
        showActiveList={showActiveList}
        onToggleActiveList={() => setShowActiveList((v) => !v)}
        onCloseActiveList={() => setShowActiveList(false)}
        onSelectActiveUser={(lat, lng) => {
          setPanToTarget({ lat, lng });
          setShowActiveList(false);
        }}
        onLogout={logout}
      />

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

      {showLeaderboard && (
        <LeaderboardPanel
          currentUserId={user?.id ?? null}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
}
