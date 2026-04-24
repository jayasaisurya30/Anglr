import { MapView } from "./map-view";

export const metadata = { title: "Map" };

export default function MapPage() {
  return (
    <div className="relative h-[calc(100vh-4rem)] w-full">
      <MapView />
    </div>
  );
}
