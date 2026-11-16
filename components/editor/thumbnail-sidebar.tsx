"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ThumbnailSidebarProps {
  pageCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function ThumbnailSidebar({ pageCount, currentPage, onPageChange }: ThumbnailSidebarProps) {
  if (pageCount === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">No pages</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNum) => (
        <Button
          key={pageNum}
          variant={currentPage === pageNum ? "default" : "ghost"}
          className={cn(
            "w-full h-auto p-2 gap-2 text-left",
            currentPage === pageNum && "shadow-sm"
          )}
          onClick={() => onPageChange(pageNum)}
        >
          <div className="relative w-16 h-20 bg-white border rounded shadow-sm flex-shrink-0 flex items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground">Page {pageNum}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Page {pageNum}</p>
            <p className="text-xs text-muted-foreground">Click to navigate</p>
          </div>
        </Button>
      ))}
    </div>
  );
}