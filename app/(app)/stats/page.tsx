import { PageHeader } from "@/components/common/page-header";
import { StatsView } from "./stats-view";

export const metadata = { title: "Stats" };

export default function StatsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <PageHeader
        title="Stats"
        description="A concise view of every cast you've logged."
      />
      <StatsView />
    </div>
  );
}
