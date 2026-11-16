"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToolIcon } from "./tool-icons";
import type { EditorTool } from "@/types/editor";

interface ToolbarProps {
  selectedTool: EditorTool;
  onToolChange: (tool: EditorTool) => void;
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

const tools: { id: EditorTool; label: string; shortcut?: string }[] = [
  { id: "select", label: "Select", shortcut: "V" },
  { id: "text", label: "Text", shortcut: "T" },
  { id: "draw", label: "Draw", shortcut: "D" },
  { id: "highlight", label: "Highlight", shortcut: "H" },
  { id: "shape", label: "Shapes", shortcut: "S" },
  { id: "image", label: "Image", shortcut: "I" },
  { id: "signature", label: "Signature", shortcut: "G" },
  { id: "eraser", label: "Eraser", shortcut: "E" },
];

export function Toolbar({
  selectedTool,
  onToolChange,
  currentPage,
  pageCount,
  onPageChange,
  zoom,
  onZoomChange,
}: ToolbarProps) {
  const handleKeyDown = (e: React.KeyboardEvent, tool: EditorTool) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToolChange(tool);
    }
  };

  return (
    <div className="h-12 border-b bg-background/95 backdrop-blur px-3 flex items-center gap-2">
      <div className="flex items-center gap-1" role="toolbar" aria-label="Editing tools">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant={selectedTool === tool.id ? "default" : "ghost"}
            size="icon"
            className="h-9 w-9"
            onClick={() => onToolChange(tool.id)}
            onKeyDown={(e) => handleKeyDown(e, tool.id)}
            aria-pressed={selectedTool === tool.id}
            title={`${tool.label} (${tool.shortcut})`}
          >
            <ToolIcon tool={tool.id} className="h-5 w-5" />
          </Button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-6 mx-2" />

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1} title="Previous page">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Button>
        <span className="text-sm font-medium min-w-[60px] text-center">
          {currentPage} / {pageCount || "—"}
        </span>
        <Button variant="ghost" size="icon" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= pageCount} title="Next page">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 mx-2" />

      <div className="flex items-center gap-1 ml-auto">
        <Button variant="ghost" size="icon" className="h-9 w-9" title="Search (⌘F)">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9" title="Rotate clockwise">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9" title="Print">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9V2h12v7" />
            <rect x="2" y="9" width="20" height="14" rx="2" />
          </svg>
        </Button>
      </div>
    </div>
  );
}