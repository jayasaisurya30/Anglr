import { LandingNav } from "@/components/landing/nav";
import { PublicMapView } from "./public-map-view";

export const metadata = { title: "Public map" };

export default function PublicMapPage() {
  return (
    <main>
      <LandingNav />
      <div className="pt-16 h-screen">
        <PublicMapView />
      </div>
    </main>
  );
}
