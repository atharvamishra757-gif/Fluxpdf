export type EditorTool = "select" | "text" | "draw" | "highlight" | "shape" | "image" | "signature" | "eraser";

export interface EditorAction {
  type: "add" | "update" | "delete";
  annotationId: string;
  annotation?: Annotation;
  previousAnnotation?: Annotation;
}

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