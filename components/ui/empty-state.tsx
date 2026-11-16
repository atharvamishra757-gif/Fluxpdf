"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactElement;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border/50 bg-muted/30 p-12 text-center">
      {icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 text-muted-foreground/40">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold">{title}</h3>
      {description && <p className="text-muted-foreground">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
