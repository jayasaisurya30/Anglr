import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "sonner/dist/styles.css";
import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/common/providers";
import { AnglrCursor } from "@/components/common/anglr-cursor";
import { cn } from "@/lib/utils/cn";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ANGLR — Track every catch",
    template: "%s · ANGLR",
  },
  description:
    "ANGLR is a premium fishing tracker. Log catches, map your spots, share with friends. Built for anglers who love the craft.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    title: "ANGLR",
    description: "Track every catch.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#08090B",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          sans.variable,
          mono.variable,
          "font-sans antialiased min-h-screen bg-background text-foreground"
        )}
      >
        <Providers>
          <AnglrCursor />
          {children}
          <Toaster
            theme="dark"
            richColors
            position="bottom-right"
            closeButton
            duration={4800}
            gap={12}
            offset={{
              bottom: "max(1.25rem, env(safe-area-inset-bottom))",
              right: "max(1.25rem, env(safe-area-inset-right))",
            }}
            toastOptions={{
              classNames: {
                toast: "toast-anglr",
                title: "toast-anglr__title",
                description: "toast-anglr__description",
                closeButton: "toast-anglr__close",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
