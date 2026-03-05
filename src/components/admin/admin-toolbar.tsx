"use client";

import type { ZonePublic } from "@/types";
import { Button } from "@/components/ui/button";
import { ZoneListItem } from "@/components/admin/zone-list-item";

interface AdminToolbarProps {
  isOpen: boolean;
  zones: ZonePublic[];
  onClose: () => void;
  onStartDrawBonus: () => void;
  onStartDrawRed: () => void;
  onDeleteZone: (id: string) => void | Promise<void>;
}

export function AdminToolbar({
  isOpen,
  zones,
  onClose,
  onStartDrawBonus,
  onStartDrawRed,
  onDeleteZone,
}: AdminToolbarProps) {
  if (!isOpen) return null;

  return (
    <div className="pointer-events-auto w-72 rounded-xl border border-emerald-500/30 bg-slate-900/95 p-3 text-xs text-slate-100 shadow-2xl backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
            Admin tools
          </div>
          <div className="text-[11px] text-slate-400">
            Draw, edit, and delete zones.
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-2 py-1 text-[11px] text-slate-400 hover:bg-slate-800 hover:text-slate-100"
        >
          Close
        </button>
      </div>

      <div className="mb-3 flex gap-2">
        <Button
          type="button"
          size="sm"
          onClick={onStartDrawBonus}
          className="h-8 flex-1 rounded-full bg-emerald-600 text-[11px] font-semibold text-white hover:bg-emerald-500"
        >
          Draw bonus zone
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onStartDrawRed}
          className="h-8 flex-1 rounded-full border-red-500/60 text-[11px] font-semibold text-red-300 hover:bg-red-500/20 hover:text-red-100"
        >
          Draw red zone
        </Button>
      </div>

      <div className="mt-2 space-y-2">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Existing zones
        </div>
        {zones.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-700 bg-slate-900/60 px-3 py-2 text-[11px] text-slate-400">
            No zones yet. Use the buttons above to draw your first zone.
          </div>
        ) : (
          <div className="flex max-h-56 flex-col gap-2 overflow-y-auto pr-1">
            {zones.map((zone) => (
              <ZoneListItem key={zone.id} zone={zone} onDelete={onDeleteZone} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

