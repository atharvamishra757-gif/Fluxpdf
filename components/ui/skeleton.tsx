"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function SkeletonText({ className }: { className?: string }) {
  return (
    <span
      className={cn("skeleton skeleton-text", className)}
      aria-hidden="true"
    />
  );
}

export function SkeletonTitle({ className }: { className?: string }) {
  return (
    <span
      className={cn("skeleton skeleton-title w-full", className)}
      aria-hidden="true"
    />
  );
}

export function SkeletonAvatar({ className }: { className?: string }) {
  return (
    <span
      className={cn("skeleton skeleton-avatar", className)}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn("skeleton h-full w-full", className)}
      aria-hidden="true"
    />
  );
}

export function SkeletonToolCard({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 rounded-xl", className)} aria-hidden="true">
      <div className="flex gap-4 mb-4">
        <SkeletonAvatar className="h-10 w-10 shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonTitle className="w-3/4" />
          <SkeletonText className="w-full" />
        </div>
      </div>
      <SkeletonText className="w-1/2" />
      <SkeletonText className="w-1/3" />
    </div>
  );
}
