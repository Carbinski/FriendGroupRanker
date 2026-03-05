"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Settings2 } from "lucide-react";

interface UserChipProps {
  displayName: string;
  isAdmin: boolean;
  onLogout: () => void;
  onToggleAdminToolbar: () => void;
}

export function UserChip({
  displayName,
  isAdmin,
  onLogout,
  onToggleAdminToolbar,
}: UserChipProps) {
  const initial = displayName?.charAt(0).toUpperCase() ?? "?";
  const [open, setOpen] = useState(false);

  const handleToggleMenu = () => {
    setOpen((prev) => !prev);
  };

  const handleManageZones = () => {
    setOpen(false);
    onToggleAdminToolbar();
  };

  const handleLogout = () => {
    setOpen(false);
    onLogout();
  };

  return (
    <div className="pointer-events-auto relative">
      <button
        type="button"
        onClick={handleToggleMenu}
        className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/90 px-4 py-2 shadow-lg backdrop-blur-sm hover:border-emerald-500/70 hover:bg-slate-800"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
          {initial}
        </div>
        <span className="text-sm font-medium text-white">{displayName}</span>
        <Settings2 className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-lg border border-slate-700 bg-slate-900/95 py-1 text-sm text-slate-100 shadow-xl backdrop-blur">
          {isAdmin && (
            <button
              type="button"
              onClick={handleManageZones}
              className="flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-slate-800"
            >
              <span>Manage zones</span>
            </button>
          )}
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-between rounded-none px-3 py-1.5 text-left text-slate-200 hover:bg-slate-800 hover:text-white"
          >
            <span>Log out</span>
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

