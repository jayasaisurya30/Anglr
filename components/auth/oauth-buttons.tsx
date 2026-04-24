"use client";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toSupabaseError } from "@/lib/supabase/to-error";
import { useState } from "react";
import { toast } from "sonner";

export function GoogleButton({ next }: { next?: string }) {
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const redirect = new URL(
        "/auth/callback",
        process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin
      );
      if (next) redirect.searchParams.set("next", next);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirect.toString() },
      });
      if (error) throw toSupabaseError(error, "Could not sign in");
    } catch (e) {
      setLoading(false);
      toast.error(e instanceof Error ? e.message : "Could not sign in");
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="lg"
      className="w-full"
      onClick={onClick}
      disabled={loading}
    >
      <GoogleIcon />
      {loading ? "Redirecting..." : "Continue with Google"}
    </Button>
  );
}

function GoogleIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 48 48"
      width={18}
      height={18}
      className="-ml-0.5"
    >
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.2 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1 7.4 2.8l5.7-5.7C33.6 7.1 29 5 24 5 13.5 5 5 13.5 5 24s8.5 19 19 19c9.5 0 18-7 18-19 0-1.3-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.1l6.6 4.8C14.6 15.2 18.9 13 24 13c2.8 0 5.4 1 7.4 2.8l5.7-5.7C33.6 7.1 29 5 24 5 16.3 5 9.7 9.3 6.3 14.1z"
      />
      <path
        fill="#4CAF50"
        d="M24 43c5 0 9.4-1.9 12.8-5l-5.9-4.8C28.9 34.5 26.5 35 24 35c-5.3 0-9.7-2.8-11.3-7l-6.5 5C9.6 38.7 16.2 43 24 43z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2 3.7-3.6 4.9l5.9 4.8c.4-.4 6.4-4.7 6.4-13.7 0-1.3-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}
