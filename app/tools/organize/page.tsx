"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatFileSize, generateId } from "@/lib/utils";
import { saveProcessedPDF } from "@/components/ui/processed-pdfs";
import { 
  FileText, Upload, X, CheckCircle, Download, 
  ChevronLeft, ChevronRight, RotateCw, Trash2, Copy, 
  Plus, GripVertical, ArrowUpDown
} from "lucide-react";
import { PDFDocument, degrees } from "pdf-lib";

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
}

interface OrganizedPage {
  id: string;
  fileId: string;
  fileName: string;
  pageIndex: number;
  pageNumber: number;
  rotation: number;
}

export default function OrganizePage() {
  const [file, setFile] = React.useState<PDFFile | null>(null);
  const [pages, setPages] = React.useState<OrganizedPage[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [resultBlob, setResultBlob] = React.useState<Blob | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    const pdfFile = acceptedFiles.find((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (pdfFile) {
      const pageCount = await getPageCount(pdfFile);
      const newFile: PDFFile = {
        id: generateId(),
        file: pdfFile,
        name: pdfFile.name,
        size: pdfFile.size,
        pageCount,
      };
      setFile(newFile);
      
      // Initialize pages
      const organizedPages: OrganizedPage[] = Array.from({ length: pageCount }, (_, i) => ({
        id: generateId(),
        fileId: newFile.id,
        fileName: newFile.name,
        pageIndex: i,
        pageNumber: i + 1,
        rotation: 0,
      }));
      setPages(organizedPages);
      setError(null);
      setResultBlob(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  const removeFile = () => {
    setFile(null);
    setPages([]);
    setResultBlob(null);
  };

  const removePage = (pageId: string) => {
    setPages((prev) => prev.filter((p) => p.id !== pageId));
  };

  const duplicatePage = (pageId: string) => {
    setPages((prev) => {
      const page = prev.find((p) => p.id === pageId);
      if (!page) return prev;
      const index = prev.indexOf(page);
      const newPage: OrganizedPage = {
        ...page,
        id: generateId(),
        pageNumber: page.pageNumber,
      };
      const newPages = [...prev];
      newPages.splice(index + 1, 0, newPage);
      return newPages;
    });
  };

  const rotatePage = (pageId: string, degrees: number) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === pageId ? { ...p, rotation: (p.rotation + degrees) % 360 } : p
      )
    );
  };

  const movePage = (pageId: string, direction: "up" | "down") => {
    setPages((prev) => {
      const index = prev.findIndex((p) => p.id === pageId);
      if (index === -1) return prev;
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const newPages = [...prev];
      [newPages[index], newPages[newIndex]] = [newPages[newIndex], newPages[index]];
      return newPages;
    });
  };

  const handleOrganize = async () => {
    if (!file || pages.length === 0) return;

    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const pdfBytes = await file.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const newPdf = await PDFDocument.create();

      for (let i = 0; i < pages.length; i++) {
        setProgress(Math.round((i / pages.length) * 80));
        
        const page = pages[i];
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [page.pageIndex]);
        
        if (page.rotation !== 0) {
          copiedPage.setRotation(degrees(page.rotation));
        }
        
        newPdf.addPage(copiedPage);
      }

      setProgress(90);
      const mergedPdfBytes = await newPdf.save({ useObjectStreams: true });
      const blob = new Blob([new Uint8Array(mergedPdfBytes)], { type: "application/pdf" });
      setResultBlob(blob);
      saveProcessedPDF({
        file: files[0].file,
        name: `organized-${files[0]?.name}`,
        size: mergedPdfBytes.length,
        pageCount: mergedPdf.getPageCount(),
        blob,
        tool: "Organize PDF",
      });
      setProgress(100);
    } catch (err) {
      setError("Failed to organize PDF. Please try again.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const downloadPdf = () => {
    if (resultBlob) {
      const url = URL.createObjectURL(resultBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "organized.pdf";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <a href="/tools"><ChevronLeft className="h-4 w-4 mr-1" /> Back to Tools</a>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Organize PDF</h1>
          <p className="text-muted-foreground mt-1">Reorder, delete, rotate, and duplicate pages with drag-and-drop.</p>
        </div>

        {!file ? (
          <UploadZone onDrop={onDrop} getRootProps={getRootProps} getInputProps={getInputProps} isDragActive={isDragActive} />
        ) : (
          <>
            <FileInfoCard file={file} onRemove={removeFile} pageCount={pages.length} />
            <PageGrid
              pages={pages}
              onRemove={removePage}
              onDuplicate={duplicatePage}
              onRotate={rotatePage}
              onMove={movePage}
            />
            <ActionBar
              processing={processing}
              progress={progress}
              onOrganize={handleOrganize}
              onDownload={downloadPdf}
              resultBlob={resultBlob}
              disabled={!file || pages.length === 0}
              error={error}
              pageCount={pages.length}
            />
          </>
        )}
      </div>
    </div>
  );
}

async function getPageCount(file: File): Promise<number> {
  try {
    const pdfBytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    return pdfDoc.getPageCount();
  } catch {
    return 0;
  }
}

function UploadZone({ onDrop, getRootProps, getInputProps, isDragActive }: {
  onDrop: (files: File[]) => void;
  getRootProps: () => React.HTMLAttributes<HTMLDivElement>;
  getInputProps: () => React.InputHTMLAttributes<HTMLInputElement>;
  isDragActive: boolean;
}) {
  return (
    <Card className={cn("relative overflow-hidden transition-all duration-300", isDragActive && "border-primary/50 bg-primary/5")}>
      <div {...getRootProps()} className="relative">
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileText className="h-10 w-10" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">
            {isDragActive ? "Drop PDF here" : "Drag & drop a PDF file"}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Select a PDF to organize its pages.
          </p>
          <Button size="lg" variant="outline" className="w-full max-w-xs">
            <Upload className="h-4 w-4 mr-2" />
            Browse Files
          </Button>
        </div>
      </div>
    </Card>
  );
}

function FileInfoCard({ file, onRemove, pageCount }: { file: PDFFile; onRemove: () => void; pageCount: number }) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Selected File</CardTitle>
          <Button variant="ghost" size="icon" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-muted/30">
          <div className="flex h-16 w-12 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-white dark:bg-gray-800">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{file.name}</p>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span>{pageCount} pages</span>
              <span>{formatFileSize(file.size)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PageGrid({ pages, onRemove, onDuplicate, onRotate, onMove }: {
  pages: OrganizedPage[];
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRotate: (id: string, degrees: number) => void;
  onMove: (id: string, direction: "up" | "down") => void;
}) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pages ({pages.length})</CardTitle>
          <p className="text-sm text-muted-foreground">Drag to reorder • Hover for actions</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-h-96 overflow-y-auto">
          {pages.map((page, index) => (
            <PageCard
              key={page.id}
              page={page}
              index={index}
              total={pages.length}
              onRemove={onRemove}
              onDuplicate={onDuplicate}
              onRotate={onRotate}
              onMove={onMove}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PageCard({ page, index, total, onRemove, onDuplicate, onRotate, onMove }: {
  page: OrganizedPage;
  index: number;
  total: number;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRotate: (id: string, degrees: number) => void;
  onMove: (id: string, direction: "up" | "down") => void;
}) {
  const rotationClass = page.rotation ? `rotate-${page.rotation}` : "";

  return (
    <div className="relative group border border-border/50 rounded-xl overflow-hidden bg-white dark:bg-gray-800 transition-all duration-200 hover:shadow-lg hover:border-primary/30">
      <div className="aspect-[3/4] relative bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <span className="text-4xl font-bold text-muted-foreground/30 {rotationClass}">{page.pageNumber}</span>
        {page.rotation && (
          <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-xs px-1.5 py-0.5 rounded">
            Rotated {page.rotation}°
          </div>
        )}
      </div>
      
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 p-2">
        <Button variant="ghost" size="icon" className="h-7 w-7 bg-white/90" onClick={() => onRotate(page.id, -90)} title="Rotate left">
          <RotateCw className="h-4 w-4 -rotate-90" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 bg-white/90" onClick={() => onRotate(page.id, 90)} title="Rotate right">
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 bg-white/90" onClick={() => onDuplicate(page.id)} title="Duplicate">
          <Copy className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 bg-white/90 text-destructive" onClick={() => onRemove(page.id)} title="Delete">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute top-2 left-2 flex gap-1">
        {index > 0 && (
          <Button variant="ghost" size="icon" className="h-7 w-7 bg-white/90" onClick={() => onMove(page.id, "up")} title="Move up">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        {index < total - 1 && (
          <Button variant="ghost" size="icon" className="h-7 w-7 bg-white/90" onClick={() => onMove(page.id, "down")} title="Move down">
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="p-3 bg-background/95 backdrop-blur border-t border-border/50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Page {page.pageNumber}</span>
          <div className="flex items-center gap-1">
            {index > 0 && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onMove(page.id, "up")}>
                <ArrowUpDown className="h-3.5 w-3.5 rotate-180" />
              </Button>
            )}
            {index < total - 1 && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onMove(page.id, "down")}>
                <ArrowUpDown className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">From: {page.fileName}</p>
      </div>
    </div>
  );
}

function ActionBar({ processing, progress, onOrganize, onDownload, resultBlob, disabled, error, pageCount }: {
  processing: boolean;
  progress: number;
  onOrganize: () => void;
  onDownload: () => void;
  resultBlob: Blob | null;
  disabled: boolean;
  error: string | null;
  pageCount: number;
}) {
  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        {processing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Organizing PDF...</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-muted-foreground text-center">
              {progress < 30 && "Reading PDF..."}
              {progress >= 30 && progress < 70 && "Processing pages..."}
              {progress >= 70 && progress < 100 && "Finalizing PDF..."}
              {progress === 100 && "Done!"}
            </p>
          </div>
        ) : resultBlob ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <p className="font-semibold text-green-600 dark:text-green-400">PDF organized successfully!</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(resultBlob.size)} • {pageCount} pages</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button size="lg" onClick={onDownload} className="flex-1 gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.reload()} className="flex-1">
                Organize Another
              </Button>
            </div>
          </div>
        ) : (
          <Button size="lg" onClick={onOrganize} disabled={disabled} className="w-full gap-2">
            <FileText className="h-4 w-4" />
            Organize {pageCount} Pages
          </Button>
        )}
      </CardContent>
    </Card>
  );
}