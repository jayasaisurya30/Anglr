"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils/cn";

const defaultEase = [0.2, 0.8, 0.2, 1] as const;

/** Premium ease — Vision-Pro–style deceleration */
const smoothEase = [0.22, 1, 0.36, 1] as const;

export function FadeIn({
  className,
  delay = 0,
  y = 12,
  duration = 0.5,
  ease = defaultEase,
  scale,
  ...props
}: HTMLMotionProps<"div"> & {
  delay?: number;
  y?: number;
  duration?: number;
  ease?: readonly [number, number, number, number];
  /** If set, animates from this scale to 1 (subtle “panel opens” feel). */
  scale?: number;
}) {
  const reduceMotion = useReducedMotion();
  const d = reduceMotion ? 0.01 : duration;
  const del = reduceMotion ? 0 : delay;

  const initial =
    scale != null
      ? { opacity: 0, y, scale }
      : { opacity: 0, y };
  const animate =
    scale != null
      ? { opacity: 1, y: 0, scale: 1 }
      : { opacity: 1, y: 0 };

  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={{
        duration: d,
        ease: reduceMotion ? "linear" : ease,
        delay: del,
      }}
      className={cn(className)}
      {...props}
    />
  );
}

export { smoothEase };

export function StaggerList({
  className,
  stagger = 0.06,
  children,
  ...props
}: HTMLMotionProps<"div"> & { stagger?: number }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  className,
  y = 10,
  ...props
}: HTMLMotionProps<"div"> & { y?: number }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.45, ease: defaultEase },
        },
      }}
      className={cn(className)}
      {...props}
    />
  );
}

export function HoverLift({
  className,
  children,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25, ease: defaultEase }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
