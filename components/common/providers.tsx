"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { AuthProfileProvider } from "@/components/common/auth-profile-provider";
import { LaunchTransitionProvider } from "@/components/common/launch-transition";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: { retry: 0 },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProfileProvider>
        <LaunchTransitionProvider>{children}</LaunchTransitionProvider>
      </AuthProfileProvider>
    </QueryClientProvider>
  );
}
