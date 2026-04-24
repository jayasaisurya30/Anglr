import { PageHeader } from "@/components/common/page-header";
import { SettingsView } from "./settings-view";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <PageHeader
        title="Settings"
        description="Fine-tune privacy, notifications, and your account."
      />
      <SettingsView />
    </div>
  );
}
