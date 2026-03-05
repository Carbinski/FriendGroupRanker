"use client";

import { useState } from "react";
import type { ActiveHours } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ZoneFormModalProps {
  open: boolean;
  type: "bonus" | "red";
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    points: number;
    activeHours?: ActiveHours;
  }) => Promise<void> | void;
}

export function ZoneFormModal({
  open,
  type,
  onClose,
  onSubmit,
}: ZoneFormModalProps) {
  const [name, setName] = useState("");
  const [points, setPoints] = useState(50);
  const [useActiveHours, setUseActiveHours] = useState(false);
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(17);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    let activeHours: ActiveHours | undefined;
    if (useActiveHours) {
      activeHours = { startHour, endHour };
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        points: type === "red" ? 0 : points,
        activeHours,
      });
      setName("");
      setPoints(50);
      setUseActiveHours(false);
      setStartHour(9);
      setEndHour(17);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const title = type === "bonus" ? "New bonus zone" : "New red zone";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="zone-name">Name</Label>
            <Input
              id="zone-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. CULC steps"
            />
          </div>

          {type === "bonus" && (
            <div className="space-y-1.5">
              <Label htmlFor="zone-points">Bonus points</Label>
              <Input
                id="zone-points"
                type="number"
                min={0}
                value={points}
                onChange={(e) => setPoints(Number(e.target.value) || 0)}
              />
            </div>
          )}

          {type === "red" && (
            <div className="space-y-1.5 text-sm text-slate-300">
              <Label>Points</Label>
              <div className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2">
                Red zones always award 0 points.
              </div>
            </div>
          )}

          <div className="space-y-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-2">
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                className="h-3 w-3 rounded border-slate-600 bg-slate-900"
                checked={useActiveHours}
                onChange={(e) => setUseActiveHours(e.target.checked)}
              />
              <span>Limit zone to specific hours</span>
            </label>
            {useActiveHours && (
              <div className="mt-2 flex gap-2 text-xs text-slate-300">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="zone-start-hour">Start hour (0–23)</Label>
                  <Input
                    id="zone-start-hour"
                    type="number"
                    min={0}
                    max={23}
                    value={startHour}
                    onChange={(e) =>
                      setStartHour(
                        Math.min(23, Math.max(0, Number(e.target.value) || 0))
                      )
                    }
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="zone-end-hour">End hour (0–23)</Label>
                  <Input
                    id="zone-end-hour"
                    type="number"
                    min={0}
                    max={23}
                    value={endHour}
                    onChange={(e) =>
                      setEndHour(
                        Math.min(23, Math.max(0, Number(e.target.value) || 0))
                      )
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !name.trim()}
          >
            Save zone
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

