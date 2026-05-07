"use client";

import { Check } from "lucide-react";
import { getPasswordRequirementState } from "@/lib/validators/auth";
import { cn } from "@/lib/utils/cn";

const ITEMS = [
  { key: "minLength" as const, label: "At least 8 characters" },
  { key: "hasCapital" as const, label: "One capital letter (A–Z)" },
  { key: "hasNumber" as const, label: "One number (0–9)" },
];

export function PasswordRequirements({ password }: { password: string }) {
  const state = getPasswordRequirementState(password);

  return (
    <ul className="mt-1.5 space-y-1.5" aria-live="polite">
      {ITEMS.map(({ key, label }) => {
        const met = state[key];
        return (
          <li
            key={key}
            className="flex items-center gap-2 text-[11px] leading-snug text-muted-foreground"
          >
            <span
              className="flex size-[0.95rem] shrink-0 items-center justify-center"
              aria-hidden
            >
              {met ? (
                <Check
                  className="size-3 text-emerald-400"
                  strokeWidth={3}
                />
              ) : (
                <span className="block size-2.5 rounded-sm border border-white/18 bg-white/[0.02]" />
              )}
            </span>
            <span className={cn(met && "text-foreground/85")}>{label}</span>
          </li>
        );
      })}
    </ul>
  );
}
