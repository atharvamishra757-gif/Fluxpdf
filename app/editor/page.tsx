"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Toolbar } from "@/components/editor/toolbar";
import { ThumbnailSidebar } from "@/components/editor/thumbnail-sidebar";
import { PropertiesPanel } from "@/components/editor/properties-panel";
import { Logo } from "@/components/navigation/logo";
import { 
  FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  RotateCw, Download, Undo2, Redo2, Search, Save
} from "lucide-react";
import type { EditorTool, EditorAction, Annotation } from "@/types/editor";

const PdfCanvas = dynamic(
  () => import("@/components/editor/pdf-canvas").then((mod) => mod.PdfCanvas),
  { ssr: false, loading: () => <div className="flex-1 flex items-center justify-center bg-muted/30">Loading PDF canvas...</div> }
);

function EditorPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileId = searchParams.get("file");

  const [pageCount, setPageCount] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [zoom, setZoom] = React.useState(1);
  const [selectedTool, setSelectedTool] = React.useState<EditorTool>("select");
  const [history, setHistory] = React.useState<EditorAction[]>([]);
  const [historyIndex, setHistoryIndex] = React.useState(-1);
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const stored = sessionStorage.getItem("fluxpdf-editing");
      if (stored) {
        const data = JSON.parse(stored);
        if (data.url) {
          setPdfUrl(data.url);
        }
      }
    } catch {
      // Ignore parse errors
    }

    return () => {
      try {
        const stored = sessionStorage.getItem("fluxpdf-editing");
        if (stored) {
          const data = JSON.parse(stored);
          if (data.url) {
            URL.revokeObjectURL(data.url);
          }
        }
        sessionStorage.removeItem("fluxpdf-editing");
      } catch {
        // Ignore errors
      }
    };
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, pageCount)));
  };

  const handleZoomChange = (newZoom: number) => {
    setZoom(Math.max(0.25, Math.min(newZoom, 4)));
  };

  const handleZoomIn = () => handleZoomChange(zoom * 1.2);
  const handleZoomOut = () => handleZoomChange(zoom / 1.2);
  const handleZoomReset = () => handleZoomChange(1);

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = () => {
    if (canUndo) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleSave = async () => {
    // Save logic would go here
  };

  const handleDownload = async () => {
    // Download logic would go here
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canUndo, canRedo]);

  return (
    <div className="flex h-screen w-full bg-background">
      <header className="flex h-14 w-full items-center justify-between border-b px-4 bg-background/95 backdrop-blur">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Logo size="md" />
          <span className="text-sm font-medium text-muted-foreground">
            {fileId ? `Editing: ${fileId}` : "New Document"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border rounded-xl px-2">
            <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoom <= 0.25}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="px-2 text-sm font-mono w-20 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={zoom >= 4}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleZoomReset}>
              <span className="text-xs font-medium">100%</span>
            </Button>
          </div>
          <Separator orientation="vertical" className="h-6 mx-2" />
          <Button variant="ghost" size="icon" onClick={handleUndo} disabled={!canUndo} title="Undo (⌘Z)">
            <Undo2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleRedo} disabled={!canRedo} title="Redo (⌘⇧Z)">
            <Redo2 className="h-5 w-5" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-2" />
          <Button variant="ghost" size="icon" onClick={handleDownload} title="Download">
            <Download className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSave} title="Save">
            <Save className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <Toolbar
        selectedTool={selectedTool}
        onToolChange={setSelectedTool}
        currentPage={currentPage}
        pageCount={pageCount}
        onPageChange={handlePageChange}
        zoom={zoom}
        onZoomChange={handleZoomChange}
      />

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 border-r bg-muted/30 flex flex-col">
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="font-medium text-sm">Pages ({pageCount})</h3>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <FileText className="h-4 w-4" />
            </Button>
          </div>
          <ThumbnailSidebar
            pageCount={pageCount}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden relative">
          <PdfCanvas
            currentPage={currentPage}
            zoom={zoom}
            selectedTool={selectedTool}
            onPageCountChange={setPageCount}
            fileUrl={pdfUrl}
          />
        </main>

        <aside className="w-80 border-l bg-muted/30 flex flex-col">
          <div className="p-3 border-b">
            <h3 className="font-medium text-sm">Properties</h3>
          </div>
          <PropertiesPanel
            selectedTool={selectedTool}
            currentPage={currentPage}
          />
        </aside>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading editor...</div>}>
      <EditorPageContent />
    </React.Suspense>
  );
}