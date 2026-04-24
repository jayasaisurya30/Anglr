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
