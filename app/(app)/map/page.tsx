import { MapView } from "./map-view";

export const metadata = { title: "Map" };

export default function MapPage() {
  return (
    <div className="relative flex h-full min-h-0 min-w-0 w-full flex-1 flex-col">
      <MapView />
    </div>
  );
}
