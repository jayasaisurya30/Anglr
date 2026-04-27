"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import Map, {
  type MapRef,
  type MapLayerMouseEvent,
  NavigationControl,
} from "react-map-gl";
import mapboxgl from "mapbox-gl";
import { patchMapStyle, MAP_STYLE, INITIAL_VIEW } from "@/lib/mapbox/style";
import {
  approxViewportBounds,
  buildClusterIndex,
  type CatchPoint,
  type BBox,
} from "@/lib/mapbox/cluster";
import { UserLocationMarker } from "./user-location-marker";
import { CatchPin } from "./catch-pin";
import { ClusterMarker } from "./cluster-marker";
import { cn } from "@/lib/utils/cn";

export interface MapCanvasProps {
  points: CatchPoint[];
  userLocation?: { lng: number; lat: number } | null;
  placementMode?: boolean;
  onPlacement?: (lng: number, lat: number) => void;
  onPinClick?: (point: CatchPoint) => void;
  className?: string;
  initialCenter?: { lng: number; lat: number; zoom?: number };
  interactive?: boolean;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

type ClusterView = { bounds: BBox; zoom: number };

export function MapCanvas({
  points,
  userLocation,
  placementMode,
  onPlacement,
  onPinClick,
  className,
  initialCenter,
  interactive = true,
}: MapCanvasProps) {
  const mapRef = useRef<MapRef | null>(null);
  const userLocationRef = useRef(userLocation);
  userLocationRef.current = userLocation;

  const [clusterView, setClusterView] = useState<ClusterView>(() => {
    const lng = initialCenter?.lng ?? INITIAL_VIEW.longitude;
    const lat = initialCenter?.lat ?? INITIAL_VIEW.latitude;
    const zoom = initialCenter?.zoom ?? INITIAL_VIEW.zoom;
    // Fixed viewport size avoids SSR/client hydration mismatch; onLoad syncs real bounds.
    return {
      bounds: approxViewportBounds(lng, lat, zoom, 1024, 768),
      zoom: Math.round(zoom),
    };
  });

  const didCenterOnUserRef = useRef(false);

  const cluster = useMemo(() => buildClusterIndex(points), [points]);

  const syncClusterView = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const b = map.getBounds();
    if (!b) return;
    setClusterView({
      bounds: [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()],
      zoom: Math.round(map.getZoom()),
    });
  }, []);

  const centerOnUserIfNeeded = useCallback(() => {
    if (didCenterOnUserRef.current || initialCenter) return;
    const loc = userLocationRef.current;
    if (!loc) return;
    const map = mapRef.current?.getMap();
    if (!map?.loaded()) return;
    map.easeTo({
      center: [loc.lng, loc.lat],
      zoom: 11,
      duration: 900,
    });
    didCenterOnUserRef.current = true;
  }, [initialCenter]);

  useEffect(() => {
    centerOnUserIfNeeded();
  }, [userLocation, centerOnUserIfNeeded]);

  const clusters = useMemo(
    () => cluster.getClusters(clusterView.bounds, clusterView.zoom),
    [cluster, clusterView],
  );

  const handleClick = useCallback(
    (e: MapLayerMouseEvent) => {
      if (!placementMode) return;
      const { lng, lat } = e.lngLat;
      onPlacement?.(lng, lat);
    },
    [placementMode, onPlacement]
  );

  const handleLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map) {
      patchMapStyle(map);
      syncClusterView();
      queueMicrotask(() => syncClusterView());
      map.once("idle", () => syncClusterView());
    }
    centerOnUserIfNeeded();
  }, [syncClusterView, centerOnUserIfNeeded]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-anglr-ink">
        <div className="glass rounded-2xl p-6 max-w-md text-center">
          <div className="text-sm font-medium">Mapbox token missing</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Set <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> in your{" "}
            <code>.env.local</code> to render the map.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden",
        placementMode && "map-canvas--placing",
        className
      )}
    >
      <Map
        ref={mapRef}
        reuseMaps
        mapboxAccessToken={MAPBOX_TOKEN}
        mapLib={mapboxgl as unknown as never}
        mapStyle={MAP_STYLE}
        initialViewState={{
          longitude: initialCenter?.lng ?? INITIAL_VIEW.longitude,
          latitude: initialCenter?.lat ?? INITIAL_VIEW.latitude,
          zoom: initialCenter?.zoom ?? INITIAL_VIEW.zoom,
          pitch: INITIAL_VIEW.pitch,
          bearing: INITIAL_VIEW.bearing,
        }}
        onClick={handleClick}
        onLoad={handleLoad}
        onMoveEnd={syncClusterView}
        interactive={interactive}
        attributionControl={false}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="bottom-right" showCompass={false} />

        {clusters.map((c) => {
          const [lng, lat] = c.geometry.coordinates;
          const isCluster = (c.properties as { cluster?: boolean }).cluster;
          if (isCluster) {
            const pointCount = (c.properties as { point_count: number })
              .point_count;
            const clusterId = (c.properties as { cluster_id: number })
              .cluster_id;
            return (
              <ClusterMarker
                key={`cluster-${clusterId}`}
                lng={lng}
                lat={lat}
                count={pointCount}
                onClick={() => {
                  const expansionZoom = Math.min(
                    cluster.getClusterExpansionZoom(clusterId),
                    16
                  );
                  mapRef.current?.easeTo({
                    center: [lng, lat],
                    zoom: expansionZoom,
                    duration: 600,
                  });
                }}
              />
            );
          }
          const p = c.properties as unknown as CatchPoint;
          return (
            <CatchPin
              key={p.id}
              lng={lng}
              lat={lat}
              caughtAt={p.caught_at}
              species={p.species}
              weight_lbs={p.weight_lbs}
              onClick={() => onPinClick?.(p)}
            />
          );
        })}

        {userLocation ? (
          <UserLocationMarker lng={userLocation.lng} lat={userLocation.lat} />
        ) : null}
      </Map>

      {placementMode ? (
        <div className="pointer-events-none absolute left-1/2 top-5 z-10 -translate-x-1/2 px-4">
          <div className="rounded-full border border-white/[0.09] bg-[rgba(4,6,10,0.52)] px-3 py-1 backdrop-blur-xl">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/50">
              Tap map to place
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
