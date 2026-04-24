import { PageHeader } from "@/components/common/page-header";
import { CatchesView } from "./catches-view";

export const metadata = { title: "My Catches" };

export default function CatchesPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <PageHeader
        title="My Catches"
        description="Every fish, every spot, every day on the water."
      />
      <CatchesView />
    </div>
  );
}
