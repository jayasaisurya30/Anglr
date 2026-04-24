import { AuthShell } from "@/components/auth/auth-shell";
import { ResetForm } from "./reset-form";

export const metadata = { title: "Set new password" };

export default function ResetPage() {
  return (
    <AuthShell
      title="Set a new password"
      subtitle="You're one step away from being back in."
    >
      <ResetForm />
    </AuthShell>
  );
}
