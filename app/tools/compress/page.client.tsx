"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatFileSize, generateId } from "@/lib/utils";
import { saveProcessedPDF } from "@/components/ui/processed-pdfs";
import { siteConfig } from "@/lib/site-config";
import { 
  FileText, Upload, X, CheckCircle, Download, 
  ChevronLeft, Archive, ArrowDownUp
} from "lucide-react";
import { PDFDocument } from "pdf-lib";

export const metadata = {
  title: "Compress PDF Online - Reduce File Size | FluxPDF",
  description: "Compress PDF files online for free. Reduce PDF file size while maintaining quality. Fast, secure, client-side PDF compression.",
  alternates: {
    canonical: `${siteConfig.url}/tools/compress`,
  },
  openGraph: {
    title: "Compress PDF Online - Reduce File Size | FluxPDF",
    description: "Compress PDF files online for free. Reduce PDF file size while maintaining quality.",
    url: `${siteConfig.url}/tools/compress`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "Compress PDF Online | FluxPDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compress PDF Online - Reduce File Size | FluxPDF",
    description: "Compress PDF files online for free. Reduce PDF file size while maintaining quality.",
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

type CompressionLevel = "extreme" | "recommended" | "low";

const compressionSettings: Record<CompressionLevel, { quality: number; dpi: number; description: string }> = {
  extreme: { quality: 0.4, dpi: 72, description: "Maximum size reduction (lower quality)" },
  recommended: { quality: 0.7, dpi: 150, description: "Balanced size and quality" },
  low: { quality: 0.9, dpi: 300, description: "Minimal size reduction (higher quality)" },
};

export default function CompressPage() {
  const [file, setFile] = React.useState<PDFFile | null>(null);
  const [level, setLevel] = React.useState<CompressionLevel>("recommended");
  const [processing, setProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [resultBlob, setResultBlob] = React.useState<Blob | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [originalSize, setOriginalSize] = React.useState(0);

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    const pdfFile = acceptedFiles.find(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    if (pdfFile) {
      const pageCount = await getPageCount(pdfFile);
      setFile({
        id: generateId(),
        file: pdfFile,
        name: pdfFile.name,
        size: pdfFile.size,
        pageCount,
      });
      setOriginalSize(pdfFile.size);
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
    setResultBlob(null);
  };

  const handleCompress = async () => {
    if (!file) return;

    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      // Dynamically import pdf.js (not SSR-safe)
      const pdfjsLibModule = await import("pdfjs-dist/legacy/build/pdf.mjs");

      // @ts-expect-error - pdf.js types
      const pdfjsLib: any = pdfjsLibModule.default || pdfjsLibModule;
      // Worker served from public folder
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

      const pdfBytes = await file.file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
      const pdf = await loadingTask.promise;

      const settings = compressionSettings[level];
      const newPdf = await PDFDocument.create();

      for (let i = 0; i < pdf.numPages; i++) {
        setProgress(10 + Math.round((i / pdf.numPages) * 80));

        const page = await pdf.getPage(i + 1);
        const viewport = page.getViewport({ scale: settings.dpi / 72 });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;

        await page.render({
          canvas,
          viewport,
        }).promise;

        // Convert canvas to compressed JPEG blob
        const imgBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob(
            (blob) => resolve(blob!),
            "image/jpeg",
            settings.quality
          );
        });

        const imgBytes = await imgBlob.arrayBuffer();
        const img = await newPdf.embedJpg(new Uint8Array(imgBytes));

        const newPage = newPdf.addPage([img.width, img.height]);
        newPage.drawImage(img, {
          x: 0,
          y: 0,
          width: img.width,
          height: img.height,
        });
      }

      setProgress(90);

      const compressedBytes = await newPdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      setProgress(100);

      const blob = new Blob([new Uint8Array(compressedBytes)], { type: "application/pdf" });
      setResultBlob(blob);
      saveProcessedPDF({
        file: file.file,
        name: `compressed-${file.name}`,
        size: compressedBytes.length,
        pageCount: pdf.numPages,
        blob,
        tool: "Compress PDF",
      });
    } catch (err) {
      console.error(err);
      setError("Failed to compress PDF. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const downloadPdf = () => {
    if (resultBlob) {
      const url = URL.createObjectURL(resultBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "compressed.pdf";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const savings = originalSize > 0 && resultBlob
    ? Math.round((1 - resultBlob.size / originalSize) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <a href="/tools"><ChevronLeft className="h-4 w-4 mr-1" /> Back to Tools</a>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Compress PDF</h1>
          <p className="text-muted-foreground mt-1">
            Reduce PDF file size by compressing embedded images.
          </p>
        </div>

        {!file ? (
          <UploadZone onDrop={onDrop} getRootProps={getRootProps} getInputProps={getInputProps} isDragActive={isDragActive} />
        ) : (
          <>
            <FileInfoCard file={file} onRemove={removeFile} />
            <CompressionOptionsCard level={level} onLevelChange={setLevel} />
            <ActionBar
              processing={processing}
              progress={progress}
              onCompress={handleCompress}
              onDownload={downloadPdf}
              resultBlob={resultBlob}
              disabled={!file}
              error={error}
              originalSize={originalSize}
              savings={savings}
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
            <Archive className="h-10 w-10" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">
            {isDragActive ? "Drop PDF here" : "Drag & drop a PDF file"}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Select a PDF file to compress its images and reduce file size.
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

function CompressionOptionsCard({ level, onLevelChange }: {
  level: CompressionLevel;
  onLevelChange: (level: CompressionLevel) => void;
}) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5" />
          Compression Level
        </CardTitle>
        <CardDescription>Choose image quality and DPI for compression</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { id: "extreme", label: "Extreme", icon: Archive },
            { id: "recommended", label: "Recommended", icon: ArrowDownUp },
            { id: "low", label: "Low Compression", icon: FileText },
          ].map((opt) => (
            <Button
              key={opt.id}
              variant={level === opt.id ? "default" : "outline"}
              className="flex flex-col items-start gap-3 p-4 h-auto"
              onClick={() => onLevelChange(opt.id as CompressionLevel)}
            >
              <opt.icon className={`h-6 w-6 ${level === opt.id ? "text-primary-foreground" : "text-muted-foreground"}`} />
              <div>
                <p className="font-medium">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{compressionSettings[opt.id as CompressionLevel].description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ActionBar({ processing, progress, onCompress, onDownload, resultBlob, disabled, error, originalSize, savings }: {
  processing: boolean;
  progress: number;
  onCompress: () => void;
  onDownload: () => void;
  resultBlob: Blob | null;
  disabled: boolean;
  error: string | null;
  originalSize: number;
  savings: number;
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
              <span className="font-medium">Compressing PDF...</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-muted-foreground text-center">
              {progress < 30 && "Rendering pages..."}
              {progress >= 30 && progress < 70 && "Compressing images..."}
              {progress >= 70 && progress < 100 && "Finalizing PDF..."}
              {progress === 100 && "Done!"}
            </p>
          </div>
        ) : resultBlob ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <p className="font-semibold text-green-600 dark:text-green-400">PDF compressed successfully!</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(originalSize)} → {formatFileSize(resultBlob.size)}
                  <span className="font-semibold text-green-600 dark:text-green-400 ml-2">({savings}% smaller)</span>
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button size="lg" onClick={onDownload} className="flex-1 gap-2">
                <Download className="h-4 w-4" />
                Download Compressed PDF
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.reload()} className="flex-1">
                Compress Another
              </Button>
            </div>
          </div>
        ) : (
          <Button size="lg" onClick={onCompress} disabled={disabled} className="w-full gap-2">
            <Archive className="h-4 w-4" />
            Compress PDF
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
