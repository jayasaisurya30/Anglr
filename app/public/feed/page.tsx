import { PageHeader } from "@/components/common/page-header";
import { LandingNav } from "@/components/landing/nav";
import { FeedView } from "./feed-view";

export const metadata = { title: "Public feed" };

export default function PublicFeedPage() {
  return (
    <main>
      <LandingNav />
      <div className="mx-auto max-w-2xl px-6 pt-28 pb-20">
        <PageHeader
          title="Public feed"
          description="Fresh catches from anglers around the world."
        />
        <FeedView />
      </div>
    </main>
  );
}
