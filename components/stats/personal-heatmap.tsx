"use client";

import { useEffect, useMemo, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { MAP_STYLE, INITIAL_VIEW, patchMapStyle } from "@/lib/mapbox/style";
import type { CatchRow } from "@/lib/supabase/types";

export function PersonalHeatmap({ catches }: { catches: CatchRow[] }) {
  const container = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const geojson = useMemo<GeoJSON.FeatureCollection>(() => {
    return {
      type: "FeatureCollection",
      features: catches.map((c) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [c.lng, c.lat] },
        properties: { weight: c.weight_lbs ?? 1 },
      })),
    };
  }, [catches]);

  useEffect(() => {
    if (!container.current || mapRef.current) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: container.current,
      style: MAP_STYLE,
      center: [INITIAL_VIEW.longitude, INITIAL_VIEW.latitude],
      zoom: 3,
      attributionControl: false,
    });
    mapRef.current = map;
    map.on("load", () => {
      patchMapStyle(map);
      map.addSource("catches", { type: "geojson", data: geojson });
      map.addLayer({
        id: "catches-heat",
        type: "heatmap",
        source: "catches",
        paint: {
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", "weight"],
            0,
            0.2,
            20,
            1,
          ],
          "heatmap-intensity": 1.1,
          "heatmap-radius": 26,
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(77,163,255,0)",
            0.2,
            "rgba(77,163,255,0.35)",
            0.6,
            "rgba(127,196,255,0.7)",
            1,
            "rgba(255,255,255,0.9)",
          ],
          "heatmap-opacity": 0.85,
        },
      });

      // Fit to data when we have points
      if (catches.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        catches.forEach((c) =>
          bounds.extend([c.lng, c.lat] as [number, number])
        );
        map.fitBounds(bounds, { padding: 60, maxZoom: 10, duration: 0 });
      }
    });
  }, [geojson, catches]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource("catches") as
      | mapboxgl.GeoJSONSource
      | undefined;
    if (source) source.setData(geojson);
  }, [geojson]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.025] overflow-hidden">
      <div className="px-6 pt-6 pb-2">
        <h3 className="text-sm font-medium">Personal heatmap</h3>
        <p className="text-xs text-muted-foreground">
          Density of your catch locations. Bigger fish weigh heavier.
        </p>
      </div>
      <div ref={container} className="h-[360px] w-full" />
    </div>
  );
}
