"use client";

import {
  AnimatePresence,
  motion,
  type Transition,
  useReducedMotion,
} from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const TRANS: Transition = {
  duration: 0.275,
  ease: [0.4, 0, 0.2, 1],
};

/** Fade + horizontal slide route transitions under the sidebar (transform + opacity). */
export function DashboardMainTransition({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  const variants = reduced
    ? {
        initial: { opacity: 0 },
        animate: {
          opacity: 1,
          transition: TRANS,
        },
        exit: {
          opacity: 0,
          transition: TRANS,
        },
      }
    : {
        initial: { opacity: 0, x: 20, scale: 0.98 },
        animate: {
          opacity: 1,
          x: 0,
          scale: 1,
          transition: TRANS,
        },
        exit: {
          opacity: 0,
          x: -20,
          scale: 0.98,
          transition: TRANS,
        },
      };

  return (
    <div className={cn("relative flex min-h-0 flex-1 flex-col overflow-hidden")}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          role="presentation"
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          layout={false}
          className={cn(
            "absolute inset-0 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain will-change-[transform,opacity]",
          )}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
