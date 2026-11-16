"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" | "ai" | "popular" | "new" | "beta";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring/60 focus:ring-offset-2 focus:ring-offset-background",
          {
            "border-transparent bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
            "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/70": variant === "secondary",
            "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "destructive",
            "border border-border bg-transparent text-muted-foreground hover:border-foreground/25 hover:text-foreground": variant === "outline",
            /* Semantic tags share one quiet treatment; only the tint carries meaning, so the
               card stays calm instead of turning into a rainbow of badges. */
            "border-transparent bg-emerald-600/10 text-emerald-700 hover:bg-emerald-600/15 dark:bg-emerald-400/10 dark:text-emerald-400": variant === "success",
            "border-transparent bg-amber-600/10 text-amber-700 hover:bg-amber-600/15 dark:bg-amber-400/10 dark:text-amber-400": variant === "warning",
            "border-transparent bg-sky-600/10 text-sky-700 hover:bg-sky-600/15 dark:bg-sky-400/10 dark:text-sky-400": variant === "info",
            "border border-brand/25 bg-brand-muted text-brand hover:bg-brand/15": variant === "ai",
            "border-transparent bg-foreground/[0.06] text-foreground/80 hover:bg-foreground/10": variant === "popular",
            "border border-brand/30 bg-transparent text-brand hover:bg-brand/10": variant === "new",
            "border-transparent bg-amber-600/10 text-amber-700 hover:bg-amber-600/15 dark:bg-amber-400/10 dark:text-amber-400 italic": variant === "beta",
          }
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };