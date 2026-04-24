"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

export interface CurrentUser {
  id: string;
  email: string | null;
  profile: Profile | null;
}

export interface AuthProfileContextValue {
  /** Auth user id + email + full profile row from `profiles`. */
  user: CurrentUser | null;
  /** Convenience: `user?.profile ?? null` */
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  /** Re-fetch session + profile from Supabase (e.g. after profile edits). */
  refreshUser: () => Promise<void>;
}

const AuthProfileContext = createContext<AuthProfileContextValue | null>(null);

export function AuthProfileProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const hydrate = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    setError(null);
    const {
      data: { user: authUser },
      error: authErr,
    } = await supabase.auth.getUser();
    if (!mountedRef.current) return;
    if (authErr) {
      setError(authErr.message);
      setUser(null);
      setLoading(false);
      return;
    }
    if (!authUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    if (!mountedRef.current) return;
    if (profileErr) {
      setError(profileErr.message);
      setUser({
        id: authUser.id,
        email: authUser.email ?? null,
        profile: null,
      });
      setLoading(false);
      return;
    }

    setUser({
      id: authUser.id,
      email: authUser.email ?? null,
      profile: profile as Profile | null,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void hydrate();
    const supabase = createSupabaseBrowserClient();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void hydrate();
      } else {
        if (!mountedRef.current) return;
        setUser(null);
        setLoading(false);
        setError(null);
      }
    });
    return () => {
      mountedRef.current = false;
      sub.subscription.unsubscribe();
    };
  }, [hydrate]);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    await hydrate();
  }, [hydrate]);

  const profile = user?.profile ?? null;

  const value: AuthProfileContextValue = {
    user,
    profile,
    loading,
    error,
    refreshUser,
  };

  return (
    <AuthProfileContext.Provider value={value}>
      {children}
    </AuthProfileContext.Provider>
  );
}

export function useAuthProfile() {
  const ctx = useContext(AuthProfileContext);
  if (!ctx) {
    throw new Error(
      "useAuthProfile must be used within AuthProfileProvider (wrap the app in Providers)."
    );
  }
  return ctx;
}
