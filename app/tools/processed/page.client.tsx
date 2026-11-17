"use client";

import * as React from "react";
import { ProcessedPDFsPanel } from "@/components/ui/processed-pdfs";
import { ChevronLeft } from "lucide-react";

export default function ProcessedPDFsPage() {
  return (
    <div className="min-h-screen bg-background py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <a href="/tools" className="text-sm font-medium text-muted-foreground hover:text-indigo-600 transition-colors">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Tools
            </a>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground border-r border-border/50 pr-4" />
        </div>
        <h1 className="text-3xl font-bold mb-8">Processed PDFs</h1>
        <ProcessedPDFsPanel />
      </div>
    </div>
  );
}
