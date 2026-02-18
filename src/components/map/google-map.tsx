"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  Rectangle,
  Autocomplete,
} from "@react-google-maps/api";
import { MAP_CENTER, MAP_ZOOM, CLOCK_IN_DURATION_MS } from "@/lib/constants";
import { BONUS_ZONES } from "@/lib/bonus-zones";
import type { ClockInPublic } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Minus, Locate } from "lucide-react";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const LIBRARIES: ("places")[] = ["places"];

/** User pin scale – large so they stand out. */
const USER_PIN_SCALE = 12;
const USER_PIN_STROKE_WEIGHT = 3;

/** Min/max opacity for clock-in pins; opacity increases over time since placed. */
const CLOCK_IN_PIN_OPACITY_MIN = 0.35;
const CLOCK_IN_PIN_OPACITY_MAX = 1;

/** Re-render interval (ms) so pin opacity updates over time. */
const OPACITY_TICK_MS = 10_000;

function getClockInPinOpacity(clockedInAt: string): number {
  const elapsed = Date.now() - new Date(clockedInAt).getTime();
  const progress = Math.min(1, Math.max(0, elapsed / CLOCK_IN_DURATION_MS));
  return (
    CLOCK_IN_PIN_OPACITY_MIN +
    (CLOCK_IN_PIN_OPACITY_MAX - CLOCK_IN_PIN_OPACITY_MIN) * progress
  );
}

interface MapViewProps {
  clockIns: ClockInPublic[];
  currentUserId: string | null;
  /** When set, the map will pan to this position and then clear it. */
  panToTarget?: { lat: number; lng: number } | null;
  onPanDone?: () => void;
}

export default function MapView({
  clockIns,
  currentUserId,
  panToTarget = null,
  onPanDone,
}: MapViewProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [selectedClockIn, setSelectedClockIn] =
    useState<ClockInPublic | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(
    () => MAP_CENTER
  );
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [, setOpacityTick] = useState(0);

  // Re-render periodically so clock-in pin opacity updates over time
  useEffect(() => {
    const id = setInterval(() => setOpacityTick((t) => t + 1), OPACITY_TICK_MS);
    return () => clearInterval(id);
  }, []);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Center on user location when available; fallback to default. Pan when location turns on later.
  useEffect(() => {
    if (!navigator?.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setMapCenter(loc);
        setUserLocation(loc);
        if (mapRef.current) {
          mapRef.current.panTo(loc);
        }
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10_000 }
    );
    // When user enables location later, pan to them
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setMapCenter(loc);
        setUserLocation(loc);
        if (mapRef.current) {
          mapRef.current.panTo(loc);
        }
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10_000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Pan to target when user clicks a name in the active list
  useEffect(() => {
    if (!panToTarget || !mapRef.current) return;
    mapRef.current.panTo(panToTarget);
    onPanDone?.();
  }, [panToTarget, onPanDone]);

  const onAutocompleteLoad = useCallback(
    (autocomplete: google.maps.places.Autocomplete) => {
      autocompleteRef.current = autocomplete;
    },
    []
  );

  const onPlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (place?.geometry?.location && mapRef.current) {
      mapRef.current.panTo(place.geometry.location);
      mapRef.current.setZoom(17);
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      const zoom = mapRef.current.getZoom() ?? MAP_ZOOM;
      mapRef.current.setZoom(Math.min(zoom + 1, 21));
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      const zoom = mapRef.current.getZoom() ?? MAP_ZOOM;
      mapRef.current.setZoom(Math.max(zoom - 1, 0));
    }
  }, []);

  const handleCenterOnUser = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.panTo(userLocation);
      mapRef.current.setZoom(17);
    }
  }, [userLocation]);

  function formatTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m ago`;
  }

  function formatTimeRemaining(dateStr: string): string {
    const diff = new Date(dateStr).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const mins = Math.floor(diff / 60_000);
    if (mins < 60) return `${mins}m left`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m left`;
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-900">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          Loading map…
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Search bar overlay */}
      <div className="absolute left-1/2 top-4 z-10 w-80 -translate-x-1/2">
        <Autocomplete
          onLoad={onAutocompleteLoad}
          onPlaceChanged={onPlaceChanged}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search a location…"
              className="border-slate-600 bg-slate-800/90 pl-9 text-white shadow-lg backdrop-blur-sm placeholder:text-slate-500"
            />
          </div>
        </Autocomplete>
      </div>

      {/* Custom map controls – themed to match app (bottom right) */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1 rounded-lg border border-slate-600 bg-slate-800/95 p-1 shadow-lg backdrop-blur-sm">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          className="h-9 w-9 rounded-md text-slate-300 hover:bg-slate-700 hover:text-white"
          aria-label="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          className="h-9 w-9 rounded-md text-slate-300 hover:bg-slate-700 hover:text-white"
          aria-label="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleCenterOnUser}
          disabled={!userLocation}
          className="h-9 w-9 rounded-md text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-50"
          aria-label="Center on your location"
        >
          <Locate className="h-4 w-4" />
        </Button>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={MAP_ZOOM}
        onLoad={onLoad}
        options={{
          disableDefaultUI: false,
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          scaleControl: false,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
            {
              elementType: "labels.text.stroke",
              stylers: [{ color: "#1a1a2e" }],
            },
            {
              elementType: "labels.text.fill",
              stylers: [{ color: "#8892b0" }],
            },
            {
              featureType: "road",
              elementType: "geometry",
              stylers: [{ color: "#2d2d44" }],
            },
            {
              featureType: "road",
              elementType: "geometry.stroke",
              stylers: [{ color: "#1a1a2e" }],
            },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#0e1526" }],
            },
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            {
              featureType: "poi.park",
              elementType: "geometry",
              stylers: [{ color: "#1a2e1a" }],
            },
          ],
        }}
      >
        {/* Bonus zone rectangles */}
        {BONUS_ZONES.map((zone) => (
          <Rectangle
            key={zone.id}
            bounds={{
              north: zone.bounds.north,
              south: zone.bounds.south,
              east: zone.bounds.east,
              west: zone.bounds.west,
            }}
            options={{
              fillColor: "#10b981",
              fillOpacity: 0.15,
              strokeColor: "#10b981",
              strokeOpacity: 0.6,
              strokeWeight: 2,
            }}
          />
        ))}

        {/* Current user location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: "#0ea5e9",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 3,
              scale: 10,
            }}
            title="Your location"
            zIndex={100}
          />
        )}

        {/* Clock-in markers – opacity increases the longer ago the pin was placed */}
        {clockIns.map((ci) => (
            <Marker
              key={ci.id}
              position={{ lat: ci.lat, lng: ci.lng }}
              onClick={() => setSelectedClockIn(ci)}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: "#10b981",
                fillOpacity: getClockInPinOpacity(ci.clockedInAt),
                strokeColor: "#ffffff",
                strokeOpacity: getClockInPinOpacity(ci.clockedInAt),
                strokeWeight: USER_PIN_STROKE_WEIGHT,
                scale: USER_PIN_SCALE,
              }}
              title={ci.displayName}
            />
        ))}

        {/* Info window for selected pin */}
        {selectedClockIn && (
          <InfoWindow
            position={{
              lat: selectedClockIn.lat,
              lng: selectedClockIn.lng,
            }}
            onCloseClick={() => setSelectedClockIn(null)}
          >
            <div className="min-w-[180px] p-1">
              <h3 className="text-base font-semibold text-slate-900">
                {selectedClockIn.displayName}
              </h3>
              <div className="mt-1 space-y-0.5 text-sm text-slate-600">
                <p>Clocked in: {formatTimeAgo(selectedClockIn.clockedInAt)}</p>
                <p>Expires: {formatTimeRemaining(selectedClockIn.expiresAt)}</p>
                <p className="font-medium text-emerald-600">
                  +{selectedClockIn.pointsEarned} pts
                </p>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
