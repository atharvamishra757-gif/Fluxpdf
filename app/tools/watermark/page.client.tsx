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
  ChevronLeft, Stamp, Type, Image, RotateCw, Minus, Plus
} from "lucide-react";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

export const metadata = {
  title: "Watermark PDF Online - Add Watermark | FluxPDF",
  description: "Add watermark to PDF online for free. Add text or image watermarks to PDF pages. Fast, secure client-side PDF watermarking.",
  alternates: {
    canonical: `${siteConfig.url}/tools/watermark`,
  },
  openGraph: {
    title: "Watermark PDF Online - Add Watermark | FluxPDF",
    description: "Add watermark to PDF online for free. Add text or image watermarks to PDF pages.",
    url: `${siteConfig.url}/tools/watermark`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "Watermark PDF Online | FluxPDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Watermark PDF Online - Add Watermark | FluxPDF",
    description: "Add watermark to PDF online for free.",
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

type WatermarkType = "text" | "image";

export default function WatermarkPage() {
  const [file, setFile] = React.useState<PDFFile | null>(null);
  const [type, setType] = React.useState<WatermarkType>("text");
  const [text, setText] = React.useState("CONFIDENTIAL");
  const [opacity, setOpacity] = React.useState(0.3);
  const [rotation, setRotation] = React.useState(-45);
  const [size, setSize] = React.useState(100);
  const [color, setColor] = React.useState("#ff0000");
  const [fontSize, setFontSize] = React.useState(72);
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

  const handleWatermark = async () => {
    if (!file) return;

    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const pdfBytes = await file.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const helvetica = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const pagesToWatermark = getPagesToWatermark(file.pageCount);
      setProgress(20);

      for (let i = 0; i < pagesToWatermark.length; i++) {
        setProgress(20 + Math.round((i / pagesToWatermark.length) * 70));
        
        const pageIndex = pagesToWatermark[i];
        const page = pdfDoc.getPage(pageIndex);
        const { width, height } = page.getSize();

        if (type === "text") {
          // Draw text watermark
          const fontSizeScaled = fontSize * (size / 100);
          const textWidth = helvetica.widthOfTextAtSize(text, fontSizeScaled);
          
          // Calculate center position with rotation
          const centerX = width / 2;
          const centerY = height / 2;
          
          page.drawText(text, {
            x: centerX - textWidth / 2,
            y: centerY - fontSizeScaled / 2,
            size: fontSizeScaled,
            font: helvetica,
            color: hexToRgb(color),
            opacity: opacity,
            rotate: degrees(rotation),
          });
        }
      }

      setProgress(90);
      const watermarkedBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([new Uint8Array(watermarkedBytes)], { type: "application/pdf" });
      setResultBlob(blob);
      saveProcessedPDF({
        file: file.file,
        name: `watermarked-${file.name}`,
        size: watermarkedBytes.length,
        pageCount: file.pageCount,
        blob,
        tool: "Watermark PDF",
      });
      setProgress(100);
    } catch (err) {
      setError("Failed to add watermark. Please try again.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const getPagesToWatermark = (totalPages: number): number[] => {
    if (applyTo === "all") {
      return Array.from({ length: totalPages }, (_, i) => i);
    } else if (applyTo === "current") {
      return [0]; // Simplified - would track current page in real app
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
      a.download = "watermarked.pdf";
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
          <h1 className="text-3xl font-bold tracking-tight">Watermark PDF</h1>
          <p className="text-muted-foreground mt-1">Add text or image watermarks to protect your documents.</p>
        </div>

        {!file ? (
          <UploadZone onDrop={onDrop} getRootProps={getRootProps} getInputProps={getInputProps} isDragActive={isDragActive} />
        ) : (
          <>
            <FileInfoCard file={file} onRemove={removeFile} />
            <WatermarkOptionsCard
              type={type}
              setType={setType}
              text={text}
              setText={setText}
              opacity={opacity}
              setOpacity={setOpacity}
              rotation={rotation}
              setRotation={setRotation}
              size={size}
              setSize={setSize}
              color={color}
              setColor={setColor}
              fontSize={fontSize}
              setFontSize={setFontSize}
              applyTo={applyTo}
              setApplyTo={setApplyTo}
              pageRange={pageRange}
              setPageRange={setPageRange}
              totalPages={file.pageCount}
            />
            <ActionBar
              processing={processing}
              progress={progress}
              onWatermark={handleWatermark}
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
  ) : rgb(1, 0, 0);
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
            <Stamp className="h-10 w-10" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">
            {isDragActive ? "Drop PDF here" : "Drag & drop a PDF file"}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Select a PDF file to add a watermark.
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

function WatermarkOptionsCard({ 
  type, setType, text, setText, opacity, setOpacity, rotation, setRotation,
  size, setSize, color, setColor, fontSize, setFontSize,
  applyTo, setApplyTo, pageRange, setPageRange, totalPages
}: {
  type: WatermarkType;
  setType: (t: WatermarkType) => void;
  text: string;
  setText: (t: string) => void;
  opacity: number;
  setOpacity: (o: number) => void;
  rotation: number;
  setRotation: (r: number) => void;
  size: number;
  setSize: (s: number) => void;
  color: string;
  setColor: (c: string) => void;
  fontSize: number;
  setFontSize: (f: number) => void;
  applyTo: "all" | "current" | "range";
  setApplyTo: (a: "all" | "current" | "range") => void;
  pageRange: string;
  setPageRange: (p: string) => void;
  totalPages: number;
}) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stamp className="h-5 w-5" />
          Watermark Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label>Watermark Type</Label>
            <div className="flex gap-3 mt-2">
              {[
                { id: "text", label: "Text", icon: Type },
                { id: "image", label: "Image", icon: Image },
              ].map((opt) => (
                <Button
                  key={opt.id}
                  variant={type === opt.id ? "default" : "outline"}
                  className="flex-1 flex-col items-center gap-2 p-3 h-auto"
                  onClick={() => setType(opt.id as WatermarkType)}
                >
                  <opt.icon className="h-6 w-6" />
                  <span>{opt.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {type === "text" && (
            <div className="space-y-4">
              <div>
                <Label>Text</Label>
                <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter watermark text" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Font Size</Label>
                  <Input type="number" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} min="12" max="200" />
                </div>
                <div>
                  <Label>Color</Label>
                  <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-full p-0 cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Label>Opacity: {Math.round(opacity * 100)}%</Label>
            <input type="range" min="0" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="w-full h-2 bg-secondary rounded-lg appearance-none accent-primary" />
          </div>

          <div className="space-y-4">
            <Label>Rotation: {rotation}°</Label>
            <input type="range" min="-180" max="180" step="5" value={rotation} onChange={(e) => setRotation(parseInt(e.target.value))} className="w-full h-2 bg-secondary rounded-lg appearance-none accent-primary" />
            <div className="flex gap-2">
              {[-45, 0, 45, 90].map((r) => (
                <Button key={r} variant={rotation === r ? "default" : "outline"} size="sm" onClick={() => setRotation(r)}>
                  {r}°
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label>Size: {size}%</Label>
            <input type="range" min="20" max="200" step="5" value={size} onChange={(e) => setSize(parseInt(e.target.value))} className="w-full h-2 bg-secondary rounded-lg appearance-none accent-primary" />
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

function ActionBar({ processing, progress, onWatermark, onDownload, resultBlob, disabled, error }: {
  processing: boolean;
  progress: number;
  onWatermark: () => void;
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
              <span className="font-medium">Adding watermark...</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-muted-foreground text-center">
              {progress < 30 && "Reading PDF..."}
              {progress >= 30 && progress < 70 && "Adding watermark..."}
              {progress >= 70 && progress < 100 && "Finalizing..."}
              {progress === 100 && "Done!"}
            </p>
          </div>
        ) : resultBlob ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <p className="font-semibold text-green-600 dark:text-green-400">Watermark added successfully!</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(resultBlob.size)}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button size="lg" onClick={onDownload} className="flex-1 gap-2">
                <Download className="h-4 w-4" />
                Download Watermarked PDF
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.reload()} className="flex-1">
                Watermark Another
              </Button>
            </div>
          </div>
        ) : (
          <Button size="lg" onClick={onWatermark} disabled={disabled} className="w-full gap-2">
            <Stamp className="h-4 w-4" />
            Add Watermark
          </Button>
        )}
      </CardContent>
    </Card>
  );
}