"use client";

import { Button } from "@/components/ui/button";
import { Plus, Minus, Locate } from "lucide-react";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenterOnUser: () => void;
  hasUserLocation: boolean;
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onCenterOnUser,
  hasUserLocation,
}: MapControlsProps) {
  return (
    <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1 rounded-lg border border-slate-600 bg-slate-800/95 p-1 shadow-lg backdrop-blur-sm">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onZoomIn}
        className="h-9 w-9 rounded-md text-slate-300 hover:bg-slate-700 hover:text-white"
        aria-label="Zoom in"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onZoomOut}
        className="h-9 w-9 rounded-md text-slate-300 hover:bg-slate-700 hover:text-white"
        aria-label="Zoom out"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onCenterOnUser}
        disabled={!hasUserLocation}
        className="h-9 w-9 rounded-md text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-50"
        aria-label="Center on your location"
      >
        <Locate className="h-4 w-4" />
      </Button>
    </div>
  );
}
