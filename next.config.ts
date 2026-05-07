import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
let supabaseHost = "";
try {
  if (supabaseUrl) supabaseHost = new URL(supabaseUrl).host;
} catch {}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
            },
          ]
        : []),
      {
        protocol: "https" as const,
        hostname: "**.supabase.co",
      },
      {
        protocol: "https" as const,
        hostname: "api.mapbox.com",
      },
      {
        protocol: "https" as const,
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    // framer-motion omitted: optimizePackageImports can emit missing server vendor chunks
    // (e.g. Cannot find module './vendor-chunks/framer-motion.js') for RSC pages.
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

export default nextConfig;
