"use client";

import * as React from "react";
import { ToastAction, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 4000;

type ToasterProps = {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
};

export function Toaster({ position = "top-right" }: ToasterProps) {
  return (
    <ToastProvider>
      <ToastViewport
        position={position}
        className={cn(
          "fixed top-0 z-[100] max-h-[85dvh] w-full sm:max-w-[420px]",
          position === "top-right" && "right-0",
          position === "top-left" && "left-0",
          position === "bottom-right" && "bottom-0 right-0 top-auto",
          position === "bottom-left" && "bottom-0 left-0 top-auto"
        )}
      />
    </ToastProvider>
  );
}
