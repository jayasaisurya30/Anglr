"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function CTA() {
  return (
    <section id="social" className="relative py-24">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-10 md:p-16 text-center"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(77,163,255,0.18),transparent_60%)] pointer-events-none" />
          <h2 className="relative text-3xl md:text-5xl font-display font-semibold tracking-tight gradient-text">
            Your next trophy starts here.
          </h2>
          <p className="relative mt-4 text-muted-foreground max-w-xl mx-auto">
            Create a free account and log your first catch in under a minute.
          </p>
          <div className="relative mt-8 flex flex-wrap gap-3 justify-center">
            <Button asChild size="xl" variant="primary">
              <Link href="/signup">Sign up free</Link>
            </Button>
            <Button asChild size="xl" variant="secondary">
              <Link href="/login">Log in</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
