"use client";

import { motion } from "framer-motion";
import { Fish, MapPin } from "lucide-react";

/**
 * A stylized device frame showing a fake catch map. Purely decorative;
 * no external assets required.
 */
export function AppMockup() {
  return (
    <div className="relative mx-auto max-w-5xl">
      <div className="pointer-events-none absolute inset-x-0 -top-20 h-40 bg-[radial-gradient(ellipse_at_center,rgba(77,163,255,0.25),transparent_65%)]" />

      <div className="relative rounded-[28px] border border-white/10 bg-white/[0.02] backdrop-blur-xl p-3 shadow-[0_60px_120px_-40px_rgba(0,0,0,0.8)]">
        <div className="rounded-[22px] overflow-hidden border border-white/[0.06] bg-anglr-ink">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-anglr-panel/70">
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="ml-4 text-xs text-muted-foreground">
              anglr.app / map
            </span>
          </div>

          <div className="relative h-[460px]">
            <FakeMap />
            <FloatingPin top="18%" left="22%" delay={0.2} species="Largemouth" weight="4.8" />
            <FloatingPin top="38%" left="56%" delay={0.35} species="Bluegill" weight="1.2" />
            <FloatingPin top="62%" left="34%" delay={0.5} species="Walleye" weight="3.1" aged />
            <FloatingPin top="30%" left="78%" delay={0.65} species="Striper" weight="6.4" />
            <PulseMarker top="50%" left="48%" />
            <CatchCard />
          </div>
        </div>
      </div>
    </div>
  );
}

function FakeMap() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#0b1220_0%,#0a1830_40%,#0b1220_100%)]" />
      <svg
        className="absolute inset-0 w-full h-full opacity-60"
        viewBox="0 0 800 460"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="water" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#1e4b88" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0b1220" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path
          d="M0 240 C 120 180 220 300 340 260 S 560 180 680 240 L 800 240 L 800 460 L 0 460 Z"
          fill="url(#water)"
        />
        {Array.from({ length: 14 }).map((_, i) => (
          <path
            key={i}
            d={`M0 ${80 + i * 26} Q 200 ${70 + i * 26} 400 ${82 + i * 26} T 800 ${80 + i * 26}`}
            stroke="rgba(127,196,255,0.05)"
            strokeWidth="1"
            fill="none"
          />
        ))}
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.35),transparent_60%)]" />
    </div>
  );
}

function FloatingPin({
  top,
  left,
  delay = 0,
  species,
  weight,
  aged,
}: {
  top: string;
  left: string;
  delay?: number;
  species: string;
  weight: string;
  aged?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      style={{ top, left }}
      className="absolute -translate-x-1/2 -translate-y-1/2"
    >
      <div className="group relative flex items-center">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full shadow-glow ${
            aged ? "bg-[#7FC4FF]/50" : "bg-anglr-blue"
          }`}
        >
          <Fish className="h-4 w-4 text-white" />
        </div>
        <div className="ml-2 hidden md:block glass rounded-full px-3 py-1 text-xs whitespace-nowrap">
          <span className="font-medium">{species}</span>{" "}
          <span className="text-muted-foreground">· {weight} lbs</span>
        </div>
      </div>
    </motion.div>
  );
}

function PulseMarker({ top, left }: { top: string; left: string }) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ top, left }}
    >
      <span className="relative flex h-4 w-4">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-anglr-blue opacity-70" />
        <span className="relative inline-flex h-4 w-4 rounded-full bg-anglr-blue ring-4 ring-anglr-blue/30" />
      </span>
    </div>
  );
}

function CatchCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      className="absolute bottom-5 right-5 w-64 glass-strong rounded-2xl p-4"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-anglr-blue/15 text-anglr-blue">
          <MapPin className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-medium">New catch</div>
          <div className="text-xs text-muted-foreground">Auto-filled GPS</div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-white/[0.03] px-2 py-1.5">
          <div className="text-muted-foreground">Species</div>
          <div>Largemouth</div>
        </div>
        <div className="rounded-lg bg-white/[0.03] px-2 py-1.5">
          <div className="text-muted-foreground">Weight</div>
          <div>4.8 lbs</div>
        </div>
      </div>
    </motion.div>
  );
}
