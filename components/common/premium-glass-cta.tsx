import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type PremiumGlassVariant = "hero" | "row";

export const premiumGlassCtaMotion =
  "outline-none ring-offset-2 ring-offset-[#020611] transition-[transform,box-shadow,border-color] duration-500 ease-smooth-out motion-safe:hover:scale-[1.04] motion-safe:hover:-translate-y-px motion-safe:active:scale-[0.985] motion-safe:active:translate-y-0 focus-visible:ring-2 focus-visible:ring-anglr-blue/70";

const PREFIX = "cta-hero-login";

const premiumGlassSizing: Record<PremiumGlassVariant, string> = {
  hero:
    "h-[3.25rem] min-h-[3.25rem] gap-2.5 px-8 text-[0.9375rem] tracking-[0.04em]",
  row:
    "h-10 min-h-10 gap-2 px-[1.375rem] text-[0.8125rem] tracking-[0.03em]",
};

/** Outer shell (+ prefix) shared by hero CTAs and compact row actions. */
export function premiumGlassShell(variant: PremiumGlassVariant = "hero") {
  return cn(
    PREFIX,
    "group relative inline-flex items-center justify-center overflow-hidden rounded-full font-semibold text-[#e8f2fc]",
    premiumGlassSizing[variant],
  );
}

export function PremiumGlassCtaLayers() {
  return (
    <>
      <span className={`${PREFIX}__bloom`} aria-hidden />
      <span className={`${PREFIX}__base`} aria-hidden />
      <span className={`${PREFIX}__glass`} aria-hidden />
      <span className={`${PREFIX}__shine-edge`} aria-hidden />
      <span className={`${PREFIX}__shimmer`} aria-hidden />
    </>
  );
}

export function PremiumGlassLinkCta({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        premiumGlassShell("hero"),
        "no-underline",
        premiumGlassCtaMotion,
        className
      )}
    >
      <PremiumGlassCtaLayers />
      <span className="relative z-10 inline-flex items-center gap-2.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
        {children}
      </span>
    </Link>
  );
}

/** Class string for a native `<button>` with the same chrome as {@link PremiumGlassLinkCta}. */
export function premiumGlassButtonClassName(
  className?: string,
  variant: PremiumGlassVariant = "hero"
) {
  return cn(premiumGlassShell(variant), premiumGlassCtaMotion, className);
}

/** Native button with bloom / glass layers — matches map “Place on map” / header CTAs; use `row` in dense lists. */
export function PremiumGlassButton({
  variant = "hero",
  className,
  children,
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: PremiumGlassVariant;
}) {
  return (
    <button
      type={type}
      {...rest}
      className={cn(
        premiumGlassButtonClassName(undefined, variant),
        "disabled:pointer-events-none disabled:opacity-45 disabled:motion-safe:hover:scale-100 disabled:motion-safe:hover:translate-y-0 disabled:motion-safe:active:scale-100",
        className
      )}
    >
      <PremiumGlassCtaLayers />
      <span
        className={cn(
          "relative z-10 inline-flex items-center justify-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]",
          variant === "hero" ? "gap-2.5" : "gap-2"
        )}
      >
        {children}
      </span>
    </button>
  );
}
