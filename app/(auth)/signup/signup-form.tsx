"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupSchema, type SignupInput } from "@/lib/validators/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toSupabaseError } from "@/lib/supabase/to-error";

export function SignupForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", username: "", handle: "" },
  });

  async function onSubmit(values: SignupInput) {
    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();

      // Optimistic handle availability check (RLS allows public profile reads).
      const { data: taken } = await supabase
        .from("profiles")
        .select("id")
        .or(
          `handle.eq.${values.handle.toLowerCase()},username.eq.${values.username}`
        )
        .limit(1);
      if (taken && taken.length > 0) {
        toast.error("Username or @handle already in use");
        setSubmitting(false);
        return;
      }

      // `raw_user_meta_data` is read by `handle_new_user` to insert `profiles`.
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${
            process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin
          }/auth/callback`,
          data: {
            username: values.username.trim(),
            handle: values.handle.toLowerCase().trim(),
            display_name: values.username.trim(),
          },
        },
      });
      if (error) throw toSupabaseError(error, "Could not sign up");

      toast.success("Check your email to confirm your account", {
        description: "Then come back and log in.",
      });
      router.replace("/login");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not sign up");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            autoComplete="username"
            placeholder="riverwolf"
            {...register("username")}
          />
          {errors.username ? (
            <p className="text-xs text-destructive">
              {errors.username.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="handle">Handle</Label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
              @
            </span>
            <Input
              id="handle"
              className="pl-7"
              placeholder="riverwolf"
              {...register("handle")}
            />
          </div>
          {errors.handle ? (
            <p className="text-xs text-destructive">{errors.handle.message}</p>
          ) : null}
        </div>
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

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={submitting}
      >
        {submitting ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
