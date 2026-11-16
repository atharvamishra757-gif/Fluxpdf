export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: React.ComponentType<{ className?: string }>;
  badge?: "AI" | "Popular" | "New" | "Beta";
  href: string;
  status: "full" | "partial" | "backend";
  tags: string[];
}

export type ToolCategory =
  | "organize"
  | "optimize"
  | "convert"
  | "edit"
  | "scan";

export interface ToolCategoryInfo {
  id: ToolCategory;
  name: string;
  description: string;
  icon: string;
  tools: Tool[];
}

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  pages?: number;
  thumbnail?: string;
  url?: string;
}

export interface Document {
  id: string;
  name: string;
  size: number;
  pageCount: number;
  lastModified: Date;
  thumbnail: string;
  url: string;
  isFavorite?: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStep {
  id: string;
  toolId: string;
  order: number;
  config?: Record<string, unknown>;
}

export interface ProcessingState {
  status: "idle" | "processing" | "success" | "error";
  progress?: number;
  message?: string;
  error?: string;
}

export interface EditorState {
  pages: EditorPage[];
  currentPage: number;
  zoom: number;
  selectedTool: EditorTool;
  history: EditorAction[];
  historyIndex: number;
}

export interface EditorPage {
  pageNumber: number;
  width: number;
  height: number;
  annotations: Annotation[];
}

export type EditorTool =
  | "select"
  | "text"
  | "draw"
  | "highlight"
  | "shape"
  | "image"
  | "signature"
  | "eraser";

export interface Annotation {
  id: string;
  type: "text" | "draw" | "highlight" | "shape" | "image" | "signature";
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  data: Record<string, unknown>;
  color?: string;
  opacity?: number;
}

export interface EditorAction {
  type: "add" | "update" | "delete";
  annotationId: string;
  annotation?: Annotation;
  previousAnnotation?: Annotation;
}

export interface SignatureData {
  type: "draw" | "type" | "upload";
  data: string;
}

export interface WatermarkConfig {
  type: "text" | "image";
  text?: string;
  imageUrl?: string;
  opacity: number;
  rotation: number;
  size: number;
  position: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "custom";
  color?: string;
  font?: string;
  pages: "all" | "current" | "range";
  pageRange?: string;
}

export interface PageNumberConfig {
  position: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
  font: string;
  size: number;
  color: string;
  startNumber: number;
  pageRange: string;
  prefix?: string;
  suffix?: string;
}

export interface CropConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  pages: "current" | "all" | "range";
  pageRange?: string;
}

export interface CompressConfig {
  level: "extreme" | "recommended" | "low";
}

export interface MergeConfig {
  files: FileInfo[];
  order: string[];
}

export interface SplitConfig {
  mode: "every-page" | "page-ranges" | "extract";
  pageRanges?: string;
}

export interface RedactConfig {
  areas: RedactArea[];
}

export interface RedactArea {
  id: string;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ProtectConfig {
  password: string;
  permissions?: {
    printing?: boolean;
    copying?: boolean;
    modifying?: boolean;
    annotating?: boolean;
  };
}

export interface JpgToPdfConfig {
  pageSize: "a4" | "letter" | "auto";
  orientation: "portrait" | "landscape";
  margin: number;
  imageFit: "contain" | "cover" | "fill";
  quality: number;
  pageNumbers: boolean;
  files: FileInfo[];
  order: string[];
}

export interface ScanConfig {
  enhance: boolean;
  crop: boolean;
  rotate: number;
}