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
  const [startHour, setStartHour] = useState("");
  const [endHour, setEndHour] = useState("");
  const [hoursError, setHoursError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validateHours = (): boolean => {
    if (!useActiveHours) return true;
    setHoursError(null);
    const start = startHour.trim();
    const end = endHour.trim();
    if (start === "" || end === "") {
      setHoursError("Start and end hours are required.");
      return false;
    }
    const startNum = Number(start);
    const endNum = Number(end);
    if (!Number.isInteger(startNum) || !Number.isInteger(endNum)) {
      setHoursError("Hours must be whole numbers.");
      return false;
    }
    if (startNum < 0 || startNum > 23) {
      setHoursError("Start hour must be between 0 and 23.");
      return false;
    }
    if (endNum < 0 || endNum > 24) {
      setHoursError("End hour must be between 0 and 24 (24 = 11:59 PM).");
      return false;
    }
    const endForCompare = endNum === 24 ? 23 : endNum;
    if (startNum >= endForCompare) {
      setHoursError("Start hour must be before end hour.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    if (!validateHours()) return;

    let activeHours: ActiveHours | undefined;
    if (useActiveHours) {
      const end = Number(endHour);
      activeHours = {
        startHour: Number(startHour),
        endHour: end === 24 ? 23 : end,
      };
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
      setStartHour("");
      setEndHour("");
      setHoursError(null);
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
                onChange={(e) => {
                  setUseActiveHours(e.target.checked);
                  if (!e.target.checked) setHoursError(null);
                }}
              />
              <span>Limit zone to specific hours</span>
            </label>
            {useActiveHours && (
              <div className="mt-2 space-y-2">
                <div className="flex gap-2 text-xs text-slate-300">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="zone-start-hour">Start hour (0–23)</Label>
                    <Input
                      id="zone-start-hour"
                      type="number"
                      min={0}
                      max={23}
                      placeholder="e.g. 9"
                      aria-invalid={!!hoursError}
                      value={startHour}
                      onChange={(e) => {
                        setStartHour(e.target.value);
                        setHoursError(null);
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="zone-end-hour">End hour (0–24, 24 = 11:59 PM)</Label>
                    <Input
                      id="zone-end-hour"
                      type="number"
                      min={0}
                      max={24}
                      placeholder="e.g. 17 or 24"
                      aria-invalid={!!hoursError}
                      value={endHour}
                      onChange={(e) => {
                        setEndHour(e.target.value);
                        setHoursError(null);
                      }}
                    />
                  </div>
                </div>
                {hoursError && (
                  <p className="text-xs text-red-400">{hoursError}</p>
                )}
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
            disabled={
              submitting ||
              !name.trim() ||
              (useActiveHours && (startHour.trim() === "" || endHour.trim() === ""))
            }
          >
            Save zone
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

