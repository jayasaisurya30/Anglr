import { FISH_WORDS } from "@/lib/data/fish-in-many-languages";

/** Seamless RTL-style ticker: duplicate strip, CSS translate −50%. */
export function FishMarquee() {
  const strip = FISH_WORDS.join("  ·  ") + "  ·  ";

  return (
    <div className="fish-marquee min-w-0 flex-1 overflow-hidden">
      <div className="fish-marquee__track flex w-max">
        <p className="fish-marquee__strip m-0 shrink-0 whitespace-nowrap pr-6 text-[11px] font-medium leading-tight tracking-normal text-foreground/90">
          {strip}
        </p>
        <p
          className="fish-marquee__strip m-0 shrink-0 whitespace-nowrap pr-6 text-[11px] font-medium leading-tight tracking-normal text-foreground/90"
          aria-hidden
        >
          {strip}
        </p>
      </div>
    </div>
  );
}
