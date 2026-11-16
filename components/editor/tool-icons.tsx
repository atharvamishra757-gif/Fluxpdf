"use client";

import { 
  MousePointer, Type, PenTool, Highlighter, Square, 
  Image, Signature, Eraser, Circle, Triangle, 
  Minus, Plus
} from "lucide-react";
import type { EditorTool } from "@/types/editor";

interface ToolIconProps {
  tool: EditorTool;
  className?: string;
}

export function ToolIcon({ tool, className }: ToolIconProps) {
  const icons: Record<EditorTool, React.ReactNode> = {
    select: <MousePointer className={className} />,
    text: <Type className={className} />,
    draw: <PenTool className={className} />,
    highlight: <Highlighter className={className} />,
    shape: <Square className={className} />,
    image: <Image className={className} />,
    signature: <Signature className={className} />,
    eraser: <Eraser className={className} />,
  };

  return icons[tool] || <MousePointer className={className} />;
}

interface ShapeIconProps {
  shape: "rectangle" | "circle" | "line" | "arrow";
  className?: string;
}

export function ShapeIcon({ shape, className }: ShapeIconProps) {
  const icons: Record<string, React.ReactNode> = {
    rectangle: <Square className={className} />,
    circle: <Circle className={className} />,
    line: <Minus className={className} />,
    arrow: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>,
  };

  return icons[shape] || <Square className={className} />;
}