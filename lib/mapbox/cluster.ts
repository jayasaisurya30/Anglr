/** Shared shape for catch markers on Mapbox views (no clustering). */
export interface CatchPoint {
  id: string;
  lng: number;
  lat: number;
  species: string | null;
  weight_lbs: number | null;
  caught_at: string;
}
