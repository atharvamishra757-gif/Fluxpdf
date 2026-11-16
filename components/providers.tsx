"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/ui/use-toast";

export function Providers({ children, ...props }: React.ComponentProps<typeof ThemeProvider>) {
  return (
    <ThemeProvider {...props} attribute="class" defaultTheme="system" enableSystem>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
