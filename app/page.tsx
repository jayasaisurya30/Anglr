import { LandingNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { OceanBackground } from "@/components/landing/ocean-background";
import { VignetteOverlay } from "@/components/landing/vignette-overlay";

export default function HomePage() {
  return (
    <main className="relative isolate min-h-[100svh] overflow-hidden bg-[#020611] text-foreground">
      {/* Hoisted into <head> — kicks off the video fetch as the HTML streams. */}
      <link
        rel="preload"
        as="video"
        href="/landing/ocean.mp4"
        type="video/mp4"
      />
      <link rel="preload" as="image" href="/landing/ocean.jpg" />

      <OceanBackground />
      <VignetteOverlay />
      <LandingNav />
      <Hero />
    </main>
  );
}
