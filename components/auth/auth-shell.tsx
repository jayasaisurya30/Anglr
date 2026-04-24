import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { FadeIn } from "@/components/common/motion";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-water-grid overflow-hidden">
      <div className="absolute inset-0 bg-grid-fade pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-[60vh] bg-[radial-gradient(ellipse_at_top,rgba(77,163,255,0.12),transparent_55%)]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="px-8 py-6">
          <Link href="/" className="inline-flex">
            <Logo />
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 pb-20">
          <FadeIn className="w-full max-w-md">
            <div className="glass-strong rounded-3xl p-8 shadow-panel">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight font-display">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {subtitle}
                  </p>
                ) : null}
              </div>
              {children}
            </div>
            {footer ? (
              <div className="mt-6 text-center text-sm text-muted-foreground">
                {footer}
              </div>
            ) : null}
          </FadeIn>
        </main>
      </div>
    </div>
  );
}
