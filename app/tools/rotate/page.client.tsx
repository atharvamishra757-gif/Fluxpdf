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
import { siteConfig } from "@/lib/site-config";
import { 
  FileText, Upload, X, CheckCircle, Download, 
  ChevronLeft, RotateCw, RotateCcw, Minus, Plus
} from "lucide-react";
import { PDFDocument, degrees } from "pdf-lib";

export const metadata = {
  title: "Rotate PDF Online - Rotate Pages | FluxPDF",
  description: "Rotate PDF pages online for free. Rotate pages 90°, 180°, or 270°. Fast, secure client-side PDF rotation.",
  alternates: {
    canonical: `${siteConfig.url}/tools/rotate`,
  },
  openGraph: {
    title: "Rotate PDF Online - Rotate Pages | FluxPDF",
    description: "Rotate PDF pages online for free. Rotate pages 90°, 180°, or 270°.",
    url: `${siteConfig.url}/tools/rotate`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "Rotate PDF Online | FluxPDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rotate PDF Online - Rotate Pages | FluxPDF",
    description: "Rotate PDF pages online for free.",
    images: [`${siteConfig.url}/opengraph-image.png`],
  },
};

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
}

type Rotation = 0 | 90 | 180 | 270;

export default function RotatePage() {
  const [file, setFile] = React.useState<PDFFile | null>(null);
  const [pageRotations, setPageRotations] = React.useState<Record<number, Rotation>>({});
  const [globalRotation, setGlobalRotation] = React.useState<Rotation>(0);
  const [applyTo, setApplyTo] = React.useState<"all" | "current" | "range">("all");
  const [pageRange, setPageRange] = React.useState("");
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
      setPageRotations({});
      setGlobalRotation(0);
      setPageRange("");
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
    setPageRotations({});
    setResultBlob(null);
  };

  const rotatePage = (pageIndex: number, rotation: Rotation) => {
    setPageRotations((prev) => ({ ...prev, [pageIndex]: rotation }));
  };

  const rotateAllPages = (rotation: Rotation) => {
    if (!file) return;
    const newRotations: Record<number, Rotation> = {};
    for (let i = 0; i < file.pageCount; i++) {
      newRotations[i] = rotation;
    }
    setPageRotations(newRotations);
    setGlobalRotation(rotation);
  };

  const applyGlobalRotation = () => {
    if (!file) return;
    rotateAllPages(globalRotation);
  };

  const handleRotate = async () => {
    if (!file) return;

    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const pdfBytes = await file.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const newPdf = await PDFDocument.create();

      const pagesToRotate = getPagesToRotate(file.pageCount);

      for (let i = 0; i < pagesToRotate.length; i++) {
        setProgress(Math.round((i / pagesToRotate.length) * 80));
        
        const pageIndex = pagesToRotate[i];
        const rotation = pageRotations[pageIndex] || 0;
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIndex]);
        
        if (rotation !== 0) {
          copiedPage.setRotation(degrees(rotation));
        }
        
        newPdf.addPage(copiedPage);
      }

      setProgress(90);
      const rotatedPdfBytes = await newPdf.save({ useObjectStreams: true });
      const blob = new Blob([new Uint8Array(rotatedPdfBytes)], { type: "application/pdf" });
      setResultBlob(blob);
      saveProcessedPDF({
        file: file.file,
        name: `rotated-${file.name}`,
        size: rotatedPdfBytes.length,
        pageCount: file.pageCount,
        blob,
        tool: "Rotate PDF",
      });
      setProgress(100);
    } catch (err) {
      setError("Failed to rotate PDF. Please try again.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const getPagesToRotate = (totalPages: number): number[] => {
    if (applyTo === "all") {
      return Array.from({ length: totalPages }, (_, i) => i);
    } else if (applyTo === "current") {
      // For simplicity, we'll rotate all pages when "current" is selected
      // In a real implementation, you'd track the current page
      return Array.from({ length: totalPages }, (_, i) => i);
    } else if (applyTo === "range" && pageRange.trim()) {
      return parsePageRanges(pageRange, totalPages);
    }
    return Array.from({ length: totalPages }, (_, i) => i);
  };

  const downloadPdf = () => {
    if (resultBlob) {
      const url = URL.createObjectURL(resultBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rotated.pdf";
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
          <h1 className="text-3xl font-bold tracking-tight">Rotate PDF</h1>
          <p className="text-muted-foreground mt-1">Rotate pages 90°, 180°, or 270°. Apply to all pages or specific ranges.</p>
        </div>

        {!file ? (
          <UploadZone onDrop={onDrop} getRootProps={getRootProps} getInputProps={getInputProps} isDragActive={isDragActive} />
        ) : (
          <>
            <FileInfoCard file={file} onRemove={removeFile} />
            <RotationControls
              file={file}
              globalRotation={globalRotation}
              setGlobalRotation={setGlobalRotation}
              applyTo={applyTo}
              setApplyTo={setApplyTo}
              pageRange={pageRange}
              setPageRange={setPageRange}
              pageRotations={pageRotations}
              onRotatePage={rotatePage}
              onRotateAll={rotateAllPages}
              onApplyGlobal={applyGlobalRotation}
            />
            <ActionBar
              processing={processing}
              progress={progress}
              onRotate={handleRotate}
              onDownload={downloadPdf}
              resultBlob={resultBlob}
              disabled={!file}
              error={error}
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

function parsePageRanges(input: string, totalPages: number): number[] {
  const pages: number[] = [];
  const parts = input.split(",").map(p => p.trim()).filter(Boolean);
  
  for (const part of parts) {
    if (part.includes("-")) {
      const [start, end] = part.split("-").map(n => parseInt(n.trim(), 10));
      if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= totalPages && start <= end) {
        for (let i = start - 1; i < end; i++) {
          if (!pages.includes(i)) pages.push(i);
        }
      }
    } else {
      const page = parseInt(part, 10);
      if (!isNaN(page) && page >= 1 && page <= totalPages && !pages.includes(page - 1)) {
        pages.push(page - 1);
      }
    }
  }
  
  return pages.sort((a, b) => a - b);
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
            Select a PDF file to rotate its pages.
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

function FileInfoCard({ file, onRemove }: { file: PDFFile; onRemove: () => void }) {
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
              <span>{file.pageCount} pages</span>
              <span>{formatFileSize(file.size)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RotationControls({ 
  file, 
  globalRotation, 
  setGlobalRotation, 
  applyTo, 
  setApplyTo, 
  pageRange, 
  setPageRange,
  pageRotations,
  onRotatePage,
  onRotateAll,
  onApplyGlobal
}: {
  file: PDFFile;
  globalRotation: Rotation;
  setGlobalRotation: (r: Rotation) => void;
  applyTo: "all" | "current" | "range";
  setApplyTo: (a: "all" | "current" | "range") => void;
  pageRange: string;
  setPageRange: (v: string) => void;
  pageRotations: Record<number, Rotation>;
  onRotatePage: (pageIndex: number, rotation: Rotation) => void;
  onRotateAll: (rotation: Rotation) => void;
  onApplyGlobal: () => void;
}) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RotateCw className="h-5 w-5" />
          Rotation Controls
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-3 block">Apply To</label>
            <div className="flex gap-3">
              {[
                { id: "all", label: "All Pages", desc: "Rotate every page" },
                { id: "range", label: "Page Range", desc: "Rotate specific pages" },
              ].map((opt) => (
                <Button
                  key={opt.id}
                  variant={applyTo === opt.id ? "default" : "outline"}
                  className="flex-1 flex-col items-start text-left p-3 h-auto"
                  onClick={() => setApplyTo(opt.id as "all" | "range")}
                >
                  <p className="font-medium">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </Button>
              ))}
            </div>
          </div>

          {applyTo === "range" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Page Range</label>
              <Input
                placeholder="e.g. 1-3, 5, 8-10"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                Enter page numbers or ranges. Total pages: {file.pageCount}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <label className="text-sm font-medium">Quick Rotate All Pages</label>
            <div className="flex gap-3">
              {[
                { rotation: 0, label: "Reset (0°)" },
                { rotation: 90, label: "90° CW" },
                { rotation: 180, label: "180°" },
                { rotation: 270, label: "90° CCW" },
              ].map((opt) => (
                <Button
                  key={opt.rotation}
                  variant={globalRotation === opt.rotation ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => {
                    setGlobalRotation(opt.rotation as Rotation);
                    onRotateAll(opt.rotation as Rotation);
                  }}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium">Per-Page Rotation</label>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 max-h-64 overflow-y-auto">
              {Array.from({ length: file.pageCount }, (_, i) => i).map((pageIndex) => {
                const rotation = pageRotations[pageIndex] || 0;
                return (
                  <div key={pageIndex} className="p-3 rounded-xl border border-border/50 bg-muted/30 text-center">
                    <p className="text-sm font-medium mb-2">Page {pageIndex + 1}</p>
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onRotatePage(pageIndex, ((rotation + 270) % 360) as Rotation)} title="Rotate left">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-mono text-sm">
                        {rotation > 0 ? `${rotation}°` : "0°"}
                      </span>
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onRotatePage(pageIndex, ((rotation + 90) % 360) as Rotation)} title="Rotate right">
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Button onClick={onApplyGlobal} className="w-full gap-2" variant="secondary">
            <RotateCw className="h-4 w-4" />
            Apply Rotation to All Pages
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionBar({ processing, progress, onRotate, onDownload, resultBlob, disabled, error }: {
  processing: boolean;
  progress: number;
  onRotate: () => void;
  onDownload: () => void;
  resultBlob: Blob | null;
  disabled: boolean;
  error: string | null;
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
              <span className="font-medium">Rotating PDF...</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-muted-foreground text-center">
              {progress < 30 && "Reading PDF..."}
              {progress >= 30 && progress < 70 && "Rotating pages..."}
              {progress >= 70 && progress < 100 && "Finalizing PDF..."}
              {progress === 100 && "Done!"}
            </p>
          </div>
        ) : resultBlob ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <p className="font-semibold text-green-600 dark:text-green-400">PDF rotated successfully!</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(resultBlob.size)}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button size="lg" onClick={onDownload} className="flex-1 gap-2">
                <Download className="h-4 w-4" />
                Download Rotated PDF
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.reload()} className="flex-1">
                Rotate Another
              </Button>
            </div>
          </div>
        ) : (
          <Button size="lg" onClick={onRotate} disabled={disabled} className="w-full gap-2">
            <RotateCw className="h-4 w-4" />
            Rotate PDF
          </Button>
        )}
      </CardContent>
    </Card>
  );
}