"use client";

import { motion } from "framer-motion";
import {
  Map,
  Users,
  BarChart3,
  WifiOff,
  Lock,
  Navigation,
} from "lucide-react";

const FEATURES = [
  {
    icon: Navigation,
    title: "Live GPS",
    desc: "Your location updates on the map in real-time while you fish. One tap to save a pin.",
  },
  {
    icon: Map,
    title: "Premium map",
    desc: "A custom dark-themed Mapbox style with water highlighting and age-faded catch pins.",
  },
  {
    icon: BarChart3,
    title: "Stats that matter",
    desc: "Monthly cadence, species breakdown, biggest fish, and a personal heatmap of your spots.",
  },
  {
    icon: Users,
    title: "Social with restraint",
    desc: "Follow friends, share publicly, or keep it private. You control every catch.",
  },
  {
    icon: WifiOff,
    title: "Works offline",
    desc: "Out of service? Catches queue locally and sync automatically the moment you're back.",
  },
  {
    icon: Lock,
    title: "Private by default",
    desc: "New catches are private until you choose otherwise. Row-level security on everything.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.25em] text-anglr-blue/80">
            Built for anglers
          </div>
          <h2 className="mt-3 text-3xl md:text-5xl font-display font-semibold tracking-tight gradient-text text-balance">
            Every detail, designed for the water.
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg">
            Minimal, dark, and fast. ANGLR feels like the tool your favorite
            reel would recommend.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.5,
                delay: i * 0.05,
                ease: [0.2, 0.8, 0.2, 1],
              }}
              className="group relative rounded-3xl border border-white/10 bg-white/[0.025] p-6 hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-anglr-blue/10 text-anglr-blue ring-1 ring-anglr-blue/20 transition-transform group-hover:scale-105">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
