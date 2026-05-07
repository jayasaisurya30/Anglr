"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils/cn";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(
      "peer relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-[background,box-shadow,border-color] duration-300 ease-smooth-out ring-focus disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=unchecked]:border-white/12 data-[state=unchecked]:bg-white/[0.05]",
      "data-[state=checked]:border-white/[0.22] data-[state=checked]:bg-[linear-gradient(145deg,rgba(127,196,255,0.42)_0%,rgba(77,163,255,0.26)_42%,rgba(55,130,210,0.2)_100%)] data-[state=checked]:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_0_22px_-10px_rgba(77,163,255,0.55)]",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.35)] ring-0 transition-transform duration-300 ease-smooth-out",
        "data-[state=checked]:translate-x-5 data-[state=checked]:shadow-[0_0_0_1px_rgba(255,255,255,0.35),0_2px_8px_rgba(77,163,255,0.35)]",
        "data-[state=unchecked]:translate-x-0.5"
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
