"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  Rectangle,
} from "@react-google-maps/api";
import { MAP_CENTER, MAP_ZOOM } from "@/lib/constants";
import {
  BONUS_ZONES,
  RED_ZONES,
  isZoneActiveAt,
} from "@/lib/bonus-zones";
import {
  MAP_CONTAINER_STYLE,
  DARK_MAP_STYLES,
  getClockInPinOpacity,
  USER_PIN_SCALE,
  USER_PIN_STROKE_WEIGHT,
} from "@/lib/map-styles";
import type { ClockInPublic } from "@/types";
import { MapSearchBar } from "@/components/map/map-search-bar";
import { MapControls } from "@/components/map/map-controls";
import { ClockInInfoWindowContent } from "@/components/map/clock-in-info-window-content";

const LIBRARIES: ("places")[] = ["places"];

/** Re-render interval (ms) so pin opacity updates over time. */
const OPACITY_TICK_MS = 10_000;

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
      <MapSearchBar onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged} />
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCenterOnUser={handleCenterOnUser}
        hasUserLocation={!!userLocation}
      />

      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
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
          styles: DARK_MAP_STYLES,
        }}
      >
        {/* Bonus zone rectangles */}
        {BONUS_ZONES.map((zone) => {
          const active = isZoneActiveAt(zone, new Date());
          return (
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
                fillOpacity: active ? 0.15 : 0.05,
                strokeColor: "#10b981",
                strokeOpacity: active ? 0.6 : 0.25,
                strokeWeight: 2,
              }}
            />
          );
        })}

        {/* Red zone rectangles (no points if clock-in here when active) */}
        {RED_ZONES.map((zone) => {
          const active = isZoneActiveAt(zone, new Date());
          return (
            <Rectangle
              key={zone.id}
              bounds={{
                north: zone.bounds.north,
                south: zone.bounds.south,
                east: zone.bounds.east,
                west: zone.bounds.west,
              }}
              options={{
                fillColor: "#ef4444",
                fillOpacity: active ? 0.15 : 0.05,
                strokeColor: "#ef4444",
                strokeOpacity: active ? 0.6 : 0.25,
                strokeWeight: 2,
              }}
            />
          );
        })}

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
            <ClockInInfoWindowContent clockIn={selectedClockIn} />
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
