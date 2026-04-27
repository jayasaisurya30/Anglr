import { PublicExploreHeader } from "@/components/public/public-explore-header";
import { PublicMapView } from "./public-map-view";

export const metadata = { title: "Public map" };

export default function PublicMapPage() {
  return (
    <main className="min-h-screen bg-background">
      <PublicExploreHeader />
      <div className="mt-14 h-[calc(100dvh-3.5rem)] w-full">
        <PublicMapView />
      </div>
    </main>
  );
}
