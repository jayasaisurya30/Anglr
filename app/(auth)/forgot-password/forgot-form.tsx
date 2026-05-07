"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState } from "react";
import { Mail } from "lucide-react";
import { PremiumGlassButton } from "@/components/common/premium-glass-cta";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotSchema, type ForgotInput } from "@/lib/validators/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toSupabaseError } from "@/lib/supabase/to-error";

export function ForgotForm() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotInput>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotInput) {
    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${
          process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin
        }/reset-password`,
      });
      if (error) throw toSupabaseError(error, "Could not send reset link");
      setSent(true);
      toast.success("If an account exists, a reset link is on the way");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send reset link");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
        Check your inbox for a password reset link. It expires in 1 hour.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@anglr.app"
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        ) : null}
      </div>
      <PremiumGlassButton
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
        className="w-full"
      >
        <Mail
          className="size-[1.05rem] shrink-0 opacity-90 transition-transform duration-500 ease-smooth-out motion-safe:group-hover:translate-x-0.5"
          strokeWidth={2.35}
          aria-hidden
        />
        {submitting ? "Sending..." : "Send reset link"}
      </PremiumGlassButton>
    </form>
  );
}
