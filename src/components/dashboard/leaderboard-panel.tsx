"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Leaderboard from "@/components/dashboard/leaderboard";

interface LeaderboardPanelProps {
  currentUserId: string | null;
  onClose: () => void;
}

export function LeaderboardPanel({ currentUserId, onClose }: LeaderboardPanelProps) {
  return (
    <>
      <div
        className="absolute inset-0 z-20 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="absolute bottom-0 right-0 top-0 z-30 w-full max-w-sm border-l border-slate-700 bg-slate-800/95 shadow-2xl backdrop-blur-md animate-in slide-in-from-right">
        <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
          <div />
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 rounded-full p-0 text-slate-400 hover:bg-slate-700 hover:text-white"
            aria-label="Close leaderboard"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="h-[calc(100%-3.5rem)]">
          <Leaderboard currentUserId={currentUserId} />
        </div>
      </div>
    </>
  );
}
