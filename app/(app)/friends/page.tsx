import { PageHeader } from "@/components/common/page-header";
import { FriendsView } from "./friends-view";

export const metadata = { title: "Friends" };

export default function FriendsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <PageHeader
        title="Friends"
        description="Discover anglers, send follow requests, and manage your circle."
      />
      <FriendsView />
    </div>
  );
}
