"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { PremiumGlassButton } from "@/components/common/premium-glass-cta";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupSchema, type SignupInput } from "@/lib/validators/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toSupabaseError } from "@/lib/supabase/to-error";
import { useLaunchTransition } from "@/components/common/launch-transition";
import { useAuthProfile } from "@/components/common/auth-profile-provider";

export function SignupForm() {
  const router = useRouter();
  const launch = useLaunchTransition();
  const { refreshUser } = useAuthProfile();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", username: "" },
  });

  async function onSubmit(values: SignupInput) {
    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();

      const username = values.username.trim();
      const handle = username.toLowerCase();

      // Optimistic availability — username doubles as citext-uniqueness for both columns.
      const { data: taken } = await supabase
        .from("profiles")
        .select("id")
        .or(`handle.eq.${handle},username.eq.${username}`)
        .limit(1);
      if (taken && taken.length > 0) {
        toast.error("That username is already taken");
        setSubmitting(false);
        return;
      }

      // `raw_user_meta_data` is read by `handle_new_user` to insert `profiles`.
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${
            process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin
          }/auth/callback`,
          data: {
            username,
            handle,
            display_name: username,
          },
        },
      });
      if (error) throw toSupabaseError(error, "Could not sign up");

      if (data.session) {
        await refreshUser();
        toast.success("Welcome to ANGLR");
        router.refresh();
        launch("/catches", {
          replace: true,
          panelLine1: "Welcome aboard",
        });
        return;
      }

      toast.success("Check your email to confirm your account", {
        description: "Then come back and log in.",
      });
      launch("/login", {
        replace: true,
        panelLine1: "Continue to sign in",
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not sign up");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          autoComplete="username"
          placeholder="riverwolf"
          {...register("username")}
        />
        <p className="text-[11px] text-muted-foreground leading-snug">
          This is also your profile @handle — only letters, numbers, . and _.
        </p>
        {errors.username ? (
          <p className="text-xs text-destructive">
            {errors.username.message}
          </p>
        ) : null}
      </div>
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
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      <PremiumGlassButton
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
        className="w-full"
      >
        <UserPlus
          className="size-[1.05rem] shrink-0 opacity-90 transition-transform duration-500 ease-smooth-out motion-safe:group-hover:translate-x-0.5"
          strokeWidth={2.35}
          aria-hidden
        />
        {submitting ? "Creating account..." : "Create account"}
      </PremiumGlassButton>
    </form>
  );
}
