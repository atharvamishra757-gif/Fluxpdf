"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link" | "brand";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild = false, variant = "default", size = "default", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const variants = {
      // Ink primary with a subtle top highlight — reads as a physical key
      default:
        "bg-primary text-primary-foreground shadow-[0_1px_2px_rgba(20,21,26,0.24),inset_0_1px_0_rgba(255,255,255,0.10)] hover:bg-primary/92 hover:shadow-[0_4px_14px_-4px_rgba(20,21,26,0.42),inset_0_1px_0_rgba(255,255,255,0.10)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.14)]",
      brand:
        "bg-brand text-brand-foreground shadow-[0_1px_2px_rgba(164,129,61,0.3),inset_0_1px_0_rgba(255,255,255,0.25)] hover:brightness-[1.06] hover:shadow-[0_6px_18px_-6px_rgba(164,129,61,0.55),inset_0_1px_0_rgba(255,255,255,0.3)]",
      outline:
        "border border-border bg-card text-foreground shadow-[0_1px_2px_rgba(20,21,26,0.04)] hover:border-foreground/25 hover:bg-accent/60",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70",
      ghost: "text-muted-foreground hover:bg-accent hover:text-foreground",
      destructive:
        "bg-destructive text-destructive-foreground shadow-[0_1px_2px_rgba(180,35,24,0.25)] hover:bg-destructive/90",
      link: "text-brand underline-offset-4 hover:underline",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-xl px-8",
      icon: "h-10 w-10",
    };

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium tracking-[-0.01em] transition-[background-color,box-shadow,color,border-color,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.985]",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };