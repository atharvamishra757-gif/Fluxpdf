"use client";

import * as React from "react";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ size = "md", className }: LogoProps) {
  const sizes = {
    sm: { icon: 4.5, text: "text-sm", gap: 1 },
    md: { icon: 5, text: "text-base", gap: 1.5 },
    lg: { icon: 6, text: "text-lg", gap: 2 },
  };

  const s = sizes[size];

  return (
    <span
      className={cn(
        "flex items-center gap-2 font-semibold tracking-tight",
        className
      )}
    >
      <span className="relative flex items-center justify-center">
        <FileText
          className={cn(
            "text-foreground",
            `h-${s.icon} w-${s.icon}`,
            "stroke-[1.5] stroke-current fill-transparent"
          )}
        />
      </span>
      <span className={cn(s.text)}>Flux<span className="text-primary">PDF</span></span>
    </span>
  );
}

export function LogoIcon({ size = 5, className }: { size?: number; className?: string }) {
  return (
    <span className={cn("flex items-center justify-center", className)}>
      <FileText className={cn("text-foreground", `h-${size} w-${size}`, "stroke-[1.5] stroke-current fill-transparent")} />
    </span>
  );
}
