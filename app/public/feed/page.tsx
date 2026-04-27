import { PageHeader } from "@/components/common/page-header";
import { PublicExploreHeader } from "@/components/public/public-explore-header";
import { FeedView } from "./feed-view";

export const metadata = { title: "Public feed" };

export default function PublicFeedPage() {
  return (
    <main>
      <PublicExploreHeader />
      <div className="mx-auto max-w-2xl px-6 pt-20 pb-20">
        <PageHeader
          title="Public feed"
          description="Fresh catches from anglers around the world."
        />
        <FeedView />
      </div>
    </main>
  );
}
