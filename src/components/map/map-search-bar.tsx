"use client";

import { Autocomplete } from "@react-google-maps/api";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface MapSearchBarProps {
  onLoad: (autocomplete: google.maps.places.Autocomplete) => void;
  onPlaceChanged: () => void;
}

export function MapSearchBar({ onLoad, onPlaceChanged }: MapSearchBarProps) {
  return (
    <div className="absolute left-1/2 top-4 z-10 w-80 -translate-x-1/2">
      <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search a location…"
            className="border-slate-600 bg-slate-800/90 pl-9 text-white shadow-lg backdrop-blur-sm placeholder:text-slate-500"
          />
        </div>
      </Autocomplete>
    </div>
  );
}
