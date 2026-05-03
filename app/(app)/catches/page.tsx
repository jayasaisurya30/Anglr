import { Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { PremiumGlassLinkCta } from "@/components/common/premium-glass-cta";
import { CatchesView } from "./catches-view";

export const metadata = { title: "My Catches" };

export default function CatchesPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <PageHeader
        title="My Catches"
        description="Every fish, every spot, every day on the water."
        action={
          <PremiumGlassLinkCta href="/map">
            <Plus
              className="size-[1.05rem] shrink-0 opacity-90 transition-transform duration-500 ease-smooth-out motion-safe:group-hover:translate-x-0.5"
              strokeWidth={2.35}
              aria-hidden
            />
            Add catch
          </PremiumGlassLinkCta>
        }
      />
      <CatchesView />
    </div>
  );
}
