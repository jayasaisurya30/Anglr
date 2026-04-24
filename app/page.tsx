import { LandingNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      <LandingNav />
      <Hero />
    </main>
  );
}
