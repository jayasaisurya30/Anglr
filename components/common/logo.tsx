import { cn } from "@/lib/utils/cn";

export function Logo({
  className,
  showWordmark = true,
  size = 28,
}: {
  className?: string;
  showWordmark?: boolean;
  size?: number;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden
      >
        <defs>
          <linearGradient id="lg-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7FC4FF" />
            <stop offset="100%" stopColor="#4DA3FF" />
          </linearGradient>
        </defs>
        <rect
          x="1"
          y="1"
          width="30"
          height="30"
          rx="9"
          fill="url(#lg-a)"
          opacity="0.14"
          stroke="url(#lg-a)"
          strokeOpacity="0.5"
        />
        <path
          d="M9 20c3 0 5-3 7-3s4 3 7 3c-2-2-3-4-3-6s1-4 3-6c-3 0-5 3-7 3s-4-3-7-3c2 2 3 4 3 6s-1 4-3 6z"
          fill="url(#lg-a)"
        />
        <circle cx="20.5" cy="13" r="1" fill="#0b0d11" />
      </svg>
      {showWordmark ? (
        <span className="logo-wordmark font-display text-[15px] font-semibold tracking-[0.18em] uppercase">
          ANGLR
        </span>
      ) : null}
    </div>
  );
}
