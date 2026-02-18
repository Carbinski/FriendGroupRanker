"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface UserChipProps {
  displayName: string;
  onLogout: () => void;
}

export function UserChip({ displayName, onLogout }: UserChipProps) {
  const initial = displayName?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/90 px-4 py-2 shadow-lg backdrop-blur-sm">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
        {initial}
      </div>
      <span className="text-sm font-medium text-white">{displayName}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onLogout}
        className="ml-1 h-7 w-7 rounded-full p-0 text-slate-400 hover:bg-slate-700 hover:text-white"
        aria-label="Log out"
      >
        <LogOut className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
