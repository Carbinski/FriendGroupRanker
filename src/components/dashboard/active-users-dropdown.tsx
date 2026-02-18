"use client";

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Users, ChevronDown } from "lucide-react";
import type { ClockInPublic } from "@/types";

interface ActiveUsersDropdownProps {
  clockIns: ClockInPublic[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelectUser: (lat: number, lng: number) => void;
}

export function ActiveUsersDropdown({
  clockIns,
  isOpen,
  onToggle,
  onClose,
  onSelectUser,
}: ActiveUsersDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div className="pointer-events-auto relative" ref={containerRef}>
      <Button
        variant="ghost"
        onClick={onToggle}
        className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/90 px-4 py-2 shadow-lg backdrop-blur-sm text-white hover:bg-slate-700"
      >
        <Users className="h-4 w-4 text-emerald-400" />
        <span className="text-sm">{clockIns.length} active</span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>
      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[200px] rounded-lg border border-slate-700 bg-slate-800/95 py-1 shadow-xl backdrop-blur-md">
          {clockIns.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-500">No one active</p>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {clockIns.map((ci) => (
                <li key={ci.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectUser(ci.lat, ci.lng);
                      onClose();
                    }}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-white hover:bg-slate-700/80"
                  >
                    <span className="min-w-0 truncate">{ci.displayName}</span>
                    <span className="shrink-0 text-emerald-400 tabular-nums">
                      {ci.pointsEarned} pts
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
