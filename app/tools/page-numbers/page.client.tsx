"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatFileSize, generateId } from "@/lib/utils";
import { saveProcessedPDF } from "@/components/ui/processed-pdfs";
import { siteConfig } from "@/lib/site-config";
import { 
  FileText, Upload, X, CheckCircle, Download, 
  ChevronLeft, Hash, Minus, Plus
} from "lucide-react";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

export const metadata = {
  title: "Page Numbers PDF Online - Add Page Numbers | FluxPDF",
  description: "Add page numbers to PDF online for free. Add customizable page numbers to your PDF documents. Fast, secure client-side PDF page numbering.",
  alternates: {
    canonical: `${siteConfig.url}/tools/page-numbers`,
  },
  openGraph: {
    title: "Page Numbers PDF Online - Add Page Numbers | FluxPDF",
    description: "Add page numbers to PDF online for free. Add customizable page numbers to your PDF documents.",
    url: `${siteConfig.url}/tools/page-numbers`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "Page Numbers PDF Online | FluxPDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Page Numbers PDF Online - Add Page Numbers | FluxPDF",
    description: "Add page numbers to PDF online for free.",
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

type Position = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

const positions: { value: Position; label: string }[] = [
  { value: "top-left", label: "Top Left" },
  { value: "top-center", label: "Top Center" },
  { value: "top-right", label: "Top Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-center", label: "Bottom Center" },
  { value: "bottom-right", label: "Bottom Right" },
];

export default function PageNumbersPage() {
  const [file, setFile] = React.useState<PDFFile | null>(null);
  const [position, setPosition] = React.useState<Position>("bottom-center");
  const [fontSize, setFontSize] = React.useState(12);
  const [color, setColor] = React.useState("#000000");
  const [startNumber, setStartNumber] = React.useState(1);
  const [prefix, setPrefix] = React.useState("");
  const [suffix, setSuffix] = React.useState("");
  const [applyTo, setApplyTo] = React.useState<"all" | "range">("all");
  const [pageRange, setPageRange] = React.useState("");
  const [processing, setProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [resultBlob, setResultBlob] = React.useState<Blob | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    const pdfFile = acceptedFiles.find((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (pdfFile) {
      const pageCount = await getPageCount(pdfFile);
      setFile({
        id: generateId(),
        file: pdfFile,
        name: pdfFile.name,
        size: pdfFile.size,
        pageCount,
      });
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

  const handleAddPageNumbers = async () => {
    if (!file) return;

    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const pdfBytes = await file.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const pagesToNumber = getPagesToNumber(file.pageCount);
      setProgress(20);

      for (let i = 0; i < pagesToNumber.length; i++) {
        setProgress(20 + Math.round((i / pagesToNumber.length) * 70));
        
        const pageIndex = pagesToNumber[i];
        const page = pdfDoc.getPage(pageIndex);
        const { width, height } = page.getSize();

        const pageNumber = startNumber + pagesToNumber.indexOf(pageIndex);
        const text = `${prefix}${pageNumber}${suffix}`;
        
        const textWidth = helvetica.widthOfTextAtSize(text, fontSize);
        const margin = 20;
        
        let x: number;
        let y: number;

        switch (position) {
          case "top-left":
            x = margin;
            y = height - margin - fontSize;
            break;
          case "top-center":
            x = width / 2 - textWidth / 2;
            y = height - margin - fontSize;
            break;
          case "top-right":
            x = width - margin - textWidth;
            y = height - margin - fontSize;
            break;
          case "bottom-left":
            x = margin;
            y = margin;
            break;
          case "bottom-center":
            x = width / 2 - textWidth / 2;
            y = margin;
            break;
          case "bottom-right":
            x = width - margin - textWidth;
            y = margin;
            break;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font: helvetica,
          color: hexToRgb(color),
        });
      }

      setProgress(90);
      const numberedBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([new Uint8Array(numberedBytes)], { type: "application/pdf" });
      setResultBlob(blob);
      saveProcessedPDF({
        file: file.file,
        name: `numbered-${file.name}`,
        size: pdfBytes.byteLength,
        pageCount: file.pageCount,
        blob,
        tool: "Page Numbers",
      });
      setProgress(100);
    } catch (err) {
      setError("Failed to add page numbers. Please try again.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const getPagesToNumber = (totalPages: number): number[] => {
    if (applyTo === "all") {
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
      a.download = "numbered.pdf";
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
          <h1 className="text-3xl font-bold tracking-tight">Add Page Numbers</h1>
          <p className="text-muted-foreground mt-1">Add customizable page numbers to your PDF documents.</p>
        </div>

        {!file ? (
          <UploadZone onDrop={onDrop} getRootProps={getRootProps} getInputProps={getInputProps} isDragActive={isDragActive} />
        ) : (
          <>
            <FileInfoCard file={file} onRemove={removeFile} />
            <PageNumbersOptionsCard
              position={position}
              setPosition={setPosition}
              fontSize={fontSize}
              setFontSize={setFontSize}
              color={color}
              setColor={setColor}
              startNumber={startNumber}
              setStartNumber={setStartNumber}
              prefix={prefix}
              setPrefix={setPrefix}
              suffix={suffix}
              setSuffix={setSuffix}
              applyTo={applyTo}
              setApplyTo={setApplyTo}
              pageRange={pageRange}
              setPageRange={setPageRange}
              totalPages={file.pageCount}
            />
            <ActionBar
              processing={processing}
              progress={progress}
              onAddPageNumbers={handleAddPageNumbers}
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

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? rgb(
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255
  ) : rgb(0, 0, 0);
};

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
            <Hash className="h-10 w-10" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">
            {isDragActive ? "Drop PDF here" : "Drag & drop a PDF file"}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Select a PDF file to add page numbers.
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

function PageNumbersOptionsCard({ 
  position, setPosition, fontSize, setFontSize, color, setColor,
  startNumber, setStartNumber, prefix, setPrefix, suffix, setSuffix,
  applyTo, setApplyTo, pageRange, setPageRange, totalPages
}: {
  position: Position;
  setPosition: (p: Position) => void;
  fontSize: number;
  setFontSize: (f: number) => void;
  color: string;
  setColor: (c: string) => void;
  startNumber: number;
  setStartNumber: (s: number) => void;
  prefix: string;
  setPrefix: (p: string) => void;
  suffix: string;
  setSuffix: (s: string) => void;
  applyTo: "all" | "range";
  setApplyTo: (a: "all" | "range") => void;
  pageRange: string;
  setPageRange: (p: string) => void;
  totalPages: number;
}) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Page Number Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label>Position</Label>
            <div className="grid gap-2 sm:grid-cols-3 mt-2">
              {positions.map((pos) => (
                <Button
                  key={pos.value}
                  variant={position === pos.value ? "default" : "outline"}
                  className="h-auto p-3"
                  onClick={() => setPosition(pos.value)}
                >
                  {pos.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Font Size</Label>
              <Input type="number" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} min="8" max="48" />
            </div>
            <div>
              <Label>Color</Label>
              <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-full p-0 cursor-pointer" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Start Number</Label>
              <Input type="number" value={startNumber} onChange={(e) => setStartNumber(parseInt(e.target.value))} min="1" max="9999" />
            </div>
            <div>
              <Label>Prefix (optional)</Label>
              <Input value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="e.g. Page " />
            </div>
            <div>
              <Label>Suffix (optional)</Label>
              <Input value={suffix} onChange={(e) => setSuffix(e.target.value)} placeholder="e.g. /10" />
            </div>
          </div>

          <div>
            <Label>Preview</Label>
            <div className="p-4 rounded-xl border border-border/50 bg-muted/30 text-center font-mono text-lg">
              {prefix}{startNumber}{suffix}
            </div>
          </div>

          <div>
            <Label>Apply To</Label>
            <div className="flex gap-3 mt-2">
              {[
                { id: "all", label: "All Pages", desc: "Every page" },
                { id: "range", label: "Page Range", desc: "Specific pages" },
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
              <Label>Page Range</Label>
              <Input placeholder="e.g. 1-3, 5, 8-10" value={pageRange} onChange={(e) => setPageRange(e.target.value)} />
              <p className="text-xs text-muted-foreground">Total pages: {totalPages}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ActionBar({ processing, progress, onAddPageNumbers, onDownload, resultBlob, disabled, error }: {
  processing: boolean;
  progress: number;
  onAddPageNumbers: () => void;
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
              <span className="font-medium">Adding page numbers...</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-muted-foreground text-center">
              {progress < 30 && "Reading PDF..."}
              {progress >= 30 && progress < 70 && "Adding numbers..."}
              {progress >= 70 && progress < 100 && "Finalizing..."}
              {progress === 100 && "Done!"}
            </p>
          </div>
        ) : resultBlob ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <p className="font-semibold text-green-600 dark:text-green-400">Page numbers added successfully!</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(resultBlob.size)}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button size="lg" onClick={onDownload} className="flex-1 gap-2">
                <Download className="h-4 w-4" />
                Download Numbered PDF
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.reload()} className="flex-1">
                Number Another
              </Button>
            </div>
          </div>
        ) : (
          <Button size="lg" onClick={onAddPageNumbers} disabled={disabled} className="w-full gap-2">
            <Hash className="h-4 w-4" />
            Add Page Numbers
          </Button>
        )}
      </CardContent>
    </Card>
  );
}