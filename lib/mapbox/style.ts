/**
 * Premium dark Mapbox style. Uses Mapbox's dark-v11 with a small runtime patch
 * to boost water saturation/brightness so lakes, rivers, and coastlines
 * pop against the near-black land.
 */

import type { Map as MapboxMap } from "mapbox-gl";

export const MAP_STYLE = "mapbox://styles/mapbox/dark-v11";

export const INITIAL_VIEW = {
  longitude: -97.0,
  latitude: 39.5,
  zoom: 3.6,
  pitch: 0,
  bearing: 0,
};

/**
 * Boost the water layers so they stand out on our custom dark theme.
 * Safe to call multiple times; it's idempotent.
 */
export function patchMapStyle(map: MapboxMap) {
  try {
    const style = map.getStyle();
    if (!style || !style.layers) return;

    for (const layer of style.layers) {
      if (!("type" in layer)) continue;
      const id = layer.id;
      const isWater =
        /water|ocean|marine/i.test(id) || layer["source-layer"] === "water";
      if (!isWater) continue;

      if (layer.type === "fill") {
        try {
          map.setPaintProperty(id, "fill-color", "#0e3560");
          map.setPaintProperty(id, "fill-opacity", 0.95);
        } catch {}
      }
      if (layer.type === "line") {
        try {
          map.setPaintProperty(id, "line-color", "#1a4e8c");
          map.setPaintProperty(id, "line-opacity", 0.9);
        } catch {}
      }
    }
  } catch {
    // Style not fully loaded yet; retry once.
  }
}
