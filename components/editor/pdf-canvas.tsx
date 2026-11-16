"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Document, Page, pdfjs } from "react-pdf";
import type { EditorTool } from "@/types/editor";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

interface PdfCanvasProps {
  currentPage: number;
  zoom: number;
  selectedTool: EditorTool;
  onPageCountChange: (count: number) => void;
  fileUrl?: string | null;
}

export function PdfCanvas({ currentPage, zoom, selectedTool, onPageCountChange, fileUrl }: PdfCanvasProps) {
  const [numPages, setNumPages] = React.useState(0);
  const [scale, setScale] = React.useState(zoom);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [pdfUrl] = React.useState<string | null>(fileUrl ?? null);

  React.useEffect(() => {
    setScale(zoom);
  }, [zoom]);

  const onDocumentLoadSuccess = (doc: { numPages: number }) => {
    setNumPages(doc.numPages);
    onPageCountChange(doc.numPages);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.25, Math.min(scale * delta, 4));
      setScale(newScale);
    }
  };

  if (!pdfUrl) {
    return (
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center bg-muted/30"
        onWheel={handleWheel}
      >
        <div className="text-center p-8">
          <svg className="h-16 w-16 mx-auto text-muted-foreground/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <p className="mt-4 text-lg font-medium text-muted-foreground">Drop a PDF to start editing</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Or use the file picker from the dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900 overflow-auto"
      onWheel={handleWheel}
      style={{ background: "linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)", backgroundSize: "20px 20px", backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px" }}
    >
      <div className="relative" style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}>
        <div className="shadow-2xl bg-white">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(error) => console.error("Load error:", error)}
          >
            <Page
              pageNumber={currentPage}
              width={800}
              scale={1}
            />
          </Document>
        </div>
      </div>
    </div>
  );
}