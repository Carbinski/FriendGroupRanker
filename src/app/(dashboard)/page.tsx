"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useActiveClockIns } from "@/hooks/use-active-clockins";
import { useZones } from "@/hooks/use-zones";
import MapView from "@/components/map/google-map";
import ClockInButton from "@/components/dashboard/clock-in-button";
import { DashboardLoadingScreen } from "@/components/dashboard/dashboard-loading-screen";
import { DashboardTopBar } from "@/components/dashboard/dashboard-top-bar";
import { LeaderboardPanel } from "@/components/dashboard/leaderboard-panel";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { ZoneFormModal } from "@/components/admin/zone-form-modal";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import type { ActiveHours } from "@/types";

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { clockIns, refetch } = useActiveClockIns();
  const { zones, refetch: refetchZones } = useZones();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showActiveList, setShowActiveList] = useState(false);
  const [showAdminToolbar, setShowAdminToolbar] = useState(false);
  const [drawingZoneType, setDrawingZoneType] = useState<
    "bonus" | "red" | null
  >(null);
  const [pendingZone, setPendingZone] = useState<{
    type: "bonus" | "red";
    path: { lat: number; lng: number }[];
  } | null>(null);
  const [zoneFormOpen, setZoneFormOpen] = useState(false);
  const [panToTarget, setPanToTarget] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const isAdmin = user?.isAdmin ?? false;

  const handlePolygonComplete = useCallback(
    (type: "bonus" | "red", path: { lat: number; lng: number }[]) => {
      setPendingZone({ type, path });
      setZoneFormOpen(true);
      setDrawingZoneType(null);
    },
    []
  );

  const handleZoneFormSubmit = useCallback(
    async (data: {
      name: string;
      points: number;
      activeHours?: ActiveHours;
    }) => {
      if (!pendingZone) return;
      const outerRing = pendingZone.path.map((p) => [p.lng, p.lat] as [number, number]);
      const first = outerRing[0];
      const last = outerRing[outerRing.length - 1];
      if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
        outerRing.push(first);
      }
      const polygon = [outerRing];

      const res = await fetch("/api/admin/zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: pendingZone.type,
          name: data.name,
          polygon,
          points: data.points,
          activeHours: data.activeHours,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Failed to create zone");
      }
      setPendingZone(null);
      setZoneFormOpen(false);
      await refetchZones();
    },
    [pendingZone, refetchZones]
  );

  const handleDeleteZone = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/admin/zones/${id}`, { method: "DELETE" });
      if (res.ok) await refetchZones();
    },
    [refetchZones]
  );

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
        zones={zones}
        adminMode={showAdminToolbar && isAdmin}
        drawingZoneType={drawingZoneType}
        onPolygonComplete={handlePolygonComplete}
      />

      <DashboardTopBar
        displayName={user?.displayName ?? ""}
        isAdmin={user?.isAdmin ?? false}
        clockIns={clockIns}
        showActiveList={showActiveList}
        onToggleActiveList={() => setShowActiveList((v) => !v)}
        onCloseActiveList={() => setShowActiveList(false)}
        onSelectActiveUser={(lat, lng) => {
          setPanToTarget({ lat, lng });
          setShowActiveList(false);
        }}
        onLogout={logout}
        onToggleAdminToolbar={() => setShowAdminToolbar((v) => !v)}
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

      {isAdmin && (
        <div className="absolute bottom-6 left-4 z-20">
          <AdminToolbar
            isOpen={showAdminToolbar}
            zones={zones}
            drawingZoneType={drawingZoneType}
            onClose={() => setShowAdminToolbar(false)}
            onStartDrawBonus={() => setDrawingZoneType("bonus")}
            onStartDrawRed={() => setDrawingZoneType("red")}
            onDeleteZone={handleDeleteZone}
          />
        </div>
      )}

      {pendingZone && (
        <ZoneFormModal
          open={zoneFormOpen}
          type={pendingZone.type}
          onClose={() => {
            setZoneFormOpen(false);
            setPendingZone(null);
          }}
          onSubmit={handleZoneFormSubmit}
        />
      )}
    </div>
  );
}
