import { LandingNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { OceanBackground } from "@/components/landing/ocean-background";
import { VignetteOverlay } from "@/components/landing/vignette-overlay";

export default function HomePage() {
  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[#020611] text-foreground">
      <OceanBackground />
      <VignetteOverlay />
      <LandingNav />
      <Hero />
    </main>
  );
}
