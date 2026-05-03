import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DashboardMainTransition } from "@/components/layout/dashboard-main-transition";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { OfflineSyncer } from "@/components/common/offline-syncer";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen" data-launch-target="dashboard">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <DashboardMainTransition>{children}</DashboardMainTransition>
        </main>
      </div>
      <OfflineSyncer />
    </div>
  );
}
