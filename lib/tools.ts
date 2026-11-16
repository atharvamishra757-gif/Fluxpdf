import type { Tool, ToolCategory } from "@/types";
import {
  FileText, Scissors, Grid, RotateCw, Hash, Crop,
  Archive,
  Image, FileImage,
  Pen, ClipboardList, PenTool, Stamp,
  Lock, Unlock, EyeOff,
  Camera, Gauge, RefreshCw,
} from "lucide-react";

export const tools: Tool[] = [
  // ===== A. ORGANIZE PDF =====
  {
    id: "merge",
    name: "Merge PDF",
    description: "Combine multiple PDFs into one document",
    category: "organize",
    icon: FileText,
    badge: "Popular",
    href: "/tools/merge",
    status: "full",
    tags: ["combine", "join", "multiple"],
  },
  {
    id: "split",
    name: "Split PDF",
    description: "Separate pages or extract page ranges",
    category: "organize",
    icon: Scissors,
    badge: "Popular",
    href: "/tools/split",
    status: "full",
    tags: ["separate", "extract", "pages"],
  },
  {
    id: "organize",
    name: "Organize PDF",
    description: "Reorder, delete, rotate, and insert pages",
    category: "organize",
    icon: Grid,
    href: "/tools/organize",
    status: "full",
    tags: ["reorder", "delete", "rotate", "insert"],
  },
  {
    id: "rotate",
    name: "Rotate PDF",
    description: "Rotate pages 90°, 180°, or 270°",
    category: "organize",
    icon: RotateCw,
    href: "/tools/rotate",
    status: "full",
    tags: ["rotate", "orientation"],
  },
  {
    id: "page-numbers",
    name: "Page Numbers",
    description: "Add customizable page numbers to PDF",
    category: "organize",
    icon: Hash,
    href: "/tools/page-numbers",
    status: "full",
    tags: ["numbering", "pagination"],
  },
  {
    id: "crop",
    name: "Crop PDF",
    description: "Crop pages with interactive selection",
    category: "organize",
    icon: Crop,
    href: "/tools/crop",
    status: "full",
    tags: ["crop", "margins", "trim"],
  },

  // ===== B. OPTIMIZE PDF =====
  {
    id: "compress",
    name: "Compress PDF",
    description: "Reduce file size while maintaining quality",
    category: "optimize",
    icon: Archive,
    badge: "Popular",
    href: "/tools/compress",
    status: "full",
    tags: ["reduce", "optimize", "size"],
  },
  // ===== C. CONVERT FILES =====
  {
    id: "pdf-to-jpg",
    name: "PDF to JPG",
    description: "Convert PDF pages to high-quality images",
    category: "convert",
    icon: Image,
    badge: "Popular",
    href: "/tools/pdf-to-jpg",
    status: "full",
    tags: ["images", "export", "pages"],
  },
  {
    id: "jpg-to-pdf",
    name: "JPG to PDF",
    description: "Create PDF from multiple images",
    category: "convert",
    icon: FileImage,
    badge: "Popular",
    href: "/tools/jpg-to-pdf",
    status: "full",
    tags: ["images", "create", "photos"],
  },

  // ===== D. EDIT & SIGN =====
  {
    id: "edit",
    name: "Edit PDF",
    description: "Open PDF in the full editor",
    category: "edit",
    icon: Pen,
    href: "/tools/edit",
    status: "full",
    tags: ["edit"],
  },
  {
    id: "annotate",
    name: "Highlight & Annotate",
    description: "Highlight, underline, and add comments",
    category: "edit",
    icon: Pen,
    href: "/tools/annotate",
    status: "full",
    tags: ["highlight", "annotate"],
  },
  {
    id: "sign",
    name: "Sign PDF",
    description: "Add electronic signatures to documents",
    category: "edit",
    icon: PenTool,
    badge: "Popular",
    href: "/tools/sign",
    status: "full",
    tags: ["signature", "sign", "electronic"],
  },
  {
    id: "watermark",
    name: "Watermark PDF",
    description: "Add text or image watermarks to pages",
    category: "edit",
    icon: Stamp,
    href: "/tools/watermark",
    status: "full",
    tags: ["watermark", "stamp", "brand"],
  },
  {
    id: "fill-forms",
    name: "Fill PDF Forms",
    description: "Fill interactive PDF form fields",
    category: "edit",
    icon: ClipboardList,
    href: "/tools/fill-forms",
    status: "full",
    tags: ["forms", "fill", "interactive"],
  },
  {
    id: "protect",
    name: "Protect PDF",
    description: "Process your document for protection",
    category: "edit",
    icon: Lock,
    href: "/tools/protect",
    status: "full",
    tags: ["protect", "security"],
  },
  {
    id: "unlock",
    name: "Unlock PDF",
    description: "Remove password protection from PDFs",
    category: "edit",
    icon: Unlock,
    href: "/tools/unlock",
    status: "full",
    tags: ["unlock", "password", "remove"],
  },
  {
    id: "redact",
    name: "Redact PDF",
    description: "Visually redact sensitive information",
    category: "edit",
    icon: EyeOff,
    href: "/tools/redact",
    status: "full",
    tags: ["redact", "remove", "sensitive"],
  },

  // ===== E. SCAN =====
  {
    id: "scan",
    name: "Scan to PDF",
    description: "Capture images with your camera and convert to PDF",
    category: "scan",
    icon: Camera,
    href: "/tools/scan",
    status: "full",
    tags: ["scan", "camera", "mobile"],
  },
];

export const categories: Record<ToolCategory, { name: string; description: string; icon: React.ComponentType<{ className?: string }> }> = {
  organize: {
    name: "Organize PDF",
    description: "Merge, split, delete, rotate, and manage pages",
    icon: Grid,
  },
  optimize: {
    name: "Optimize PDF",
    description: "Compress PDFs",
    icon: Gauge,
  },
  convert: {
    name: "Convert Files",
    description: "Convert PDF to and from images",
    icon: RefreshCw,
  },
  edit: {
    name: "Edit & Sign",
    description: "Edit, annotate, sign, watermark, and secure",
    icon: Pen,
  },
  scan: {
    name: "Scan to PDF",
    description: "Scan documents using your camera",
    icon: Camera,
  },
};

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return tools.filter((tool) => tool.category === category);
}

export function getToolById(id: string): Tool | undefined {
  return tools.find((tool) => tool.id === id);
}

export function getPopularTools(): Tool[] {
  return tools.filter((tool) => tool.badge === "Popular");
}

export function getNewTools(): Tool[] {
  return tools.filter((tool) => tool.badge === "New");
}

export function getAITools(): Tool[] {
  return tools.filter((tool) => tool.badge === "AI");
}

export function searchTools(query: string): Tool[] {
  const lowerQuery = query.toLowerCase();
  return tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

export type { ToolCategory, Tool } from "@/types";
