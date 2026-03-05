"use client";

import type { ZonePublic } from "@/types";
import { Button } from "@/components/ui/button";

interface ZoneListItemProps {
  zone: ZonePublic;
  onDelete: (id: string) => void | Promise<void>;
}

export function ZoneListItem({ zone, onDelete }: ZoneListItemProps) {
  const handleDelete = () => {
    // Simple confirm to prevent accidental deletes.
    // eslint-disable-next-line no-alert
    const confirmed = window.confirm(
      `Delete zone "${zone.name}"? This cannot be undone.`
    );
    if (!confirmed) return;
    void onDelete(zone.id);
  };

  const badgeColor =
    zone.type === "bonus"
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
      : "bg-red-500/20 text-red-300 border-red-500/40";

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs text-slate-100">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{zone.name}</span>
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${badgeColor}`}
          >
            {zone.type === "bonus" ? "Bonus" : "Red"}
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          {zone.type === "bonus" ? `${zone.points} pts` : "0 pts (no score)"}
        </div>
      </div>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={handleDelete}
        className="h-7 rounded-full px-2 text-[11px] text-slate-300 hover:bg-red-600/20 hover:text-red-200"
      >
        Delete
      </Button>
    </div>
  );
}

