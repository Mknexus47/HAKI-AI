"use client";

import * as React from "react";
import AnimatedLogo from "@/components/layout/AnimatedLogo";
import { cn } from "@/lib/utils";

export default function SplashScreen() {
  const [visible, setVisible] = React.useState(true);
  const [leaving, setLeaving] = React.useState(false);

  React.useEffect(() => {
    const hideTimer = setTimeout(() => setLeaving(true), 1500);
    const removeTimer = setTimeout(() => setVisible(false), 2000);
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "splash-screen fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#f7f8f9]",
        leaving && "splash-leaving"
      )}
    >
      <div className="splash-logo">
        <AnimatedLogo size={96} />
      </div>
      <p className="mt-5 text-sm font-medium tracking-wide text-slate-500">
        Access to Justice, Simplified
      </p>
      <div className="splash-bar mt-6 h-1 w-40 overflow-hidden rounded-full bg-slate-200">
        <div className="splash-bar-fill h-full rounded-full" />
      </div>
    </div>
  );
}
