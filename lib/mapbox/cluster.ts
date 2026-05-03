import Supercluster from "supercluster";

export interface CatchPoint {
  id: string;
  lng: number;
  lat: number;
  species: string | null;
  weight_lbs: number | null;
  caught_at: string;
}

export function buildClusterIndex(points: CatchPoint[]) {
  const index = new Supercluster<CatchPoint>({
    radius: 60,
    maxZoom: 14,
    minPoints: 3,
  });
  index.load(
    points.map((p) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [p.lng, p.lat] },
      properties: p,
    }))
  );
  return index;
}

export type BBox = [number, number, number, number];

/** Expand bbox so edge pins stay in the cluster query during pan/zoom (reduces popping). */
export function expandBBox(bounds: BBox, pad = 0.12): BBox {
  const [west, south, east, north] = bounds;
  const lonSpan = east - west;
  const latSpan = north - south;
  const dx = lonSpan * pad;
  const dy = latSpan * pad;
  return [
    Math.max(-180, west - dx),
    Math.max(-85, south - dy),
    Math.min(180, east + dx),
    Math.min(85, north + dy),
  ];
}

/**
 * Approximate WGS84 bounds for center/zoom without a Map instance.
 * Lets Supercluster render pins on first paint before `onLoad` / `getBounds()`.
 */
export function approxViewportBounds(
  lng: number,
  lat: number,
  zoom: number,
  widthPx = 1024,
  heightPx = 768,
): BBox {
  const z = Math.max(0, Math.min(22, zoom));
  const latClamped = Math.max(-85, Math.min(85, lat));
  const latRad = (latClamped * Math.PI) / 180;
  const worldSize = 256 * 2 ** z;
  const cosY = Math.max(0.25, Math.cos(latRad));
  const halfLngDeg = (widthPx * 360) / (worldSize * 2);
  const halfLatDeg = (heightPx * 360) / (worldSize * 2 * cosY);
  return [
    Math.max(-180, lng - halfLngDeg),
    Math.max(-85, latClamped - halfLatDeg),
    Math.min(180, lng + halfLngDeg),
    Math.min(85, latClamped + halfLatDeg),
  ];
}
