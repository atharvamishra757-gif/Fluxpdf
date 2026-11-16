"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { formatFileSize, generateId } from "@/lib/utils";
import { 
  FileImage, Upload, X, CheckCircle, ArrowUpDown, RotateCw, 
  Download, FileText, Settings, ChevronLeft, ChevronRight,
  Minus, Plus, FileMinus, FilePlus
} from "lucide-react";
import { PDFDocument, rgb, degrees } from "pdf-lib";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
  rotation: number;
}

export default function JpgToPdfPage() {
  const [files, setFiles] = React.useState<ImageFile[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [resultBlob, setResultBlob] = React.useState<Blob | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [settings, setSettings] = React.useState({
    pageSize: "a4" as "a4" | "letter" | "auto",
    orientation: "portrait" as "portrait" | "landscape",
    margin: 10,
    imageFit: "contain" as "contain" | "cover" | "fill",
    quality: 0.9,
    pageNumbers: false,
  });

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.filter((f) => f.type.startsWith("image/"));
    const newFiles: ImageFile[] = imageFiles.map((file) => ({
      id: generateId(),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      rotation: 0,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif", ".bmp", ".tiff"],
    },
    multiple: true,
    noClick: false,
    noKeyboard: false,
  });

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const rotateFile = (id: string, degrees: number) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, rotation: (f.rotation + degrees) % 360 } : f
      )
    );
  };

  const moveFile = (id: string, direction: "up" | "down") => {
    setFiles((prev) => {
      const index = prev.findIndex((f) => f.id === id);
      if (index === -1) return prev;
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const newFiles = [...prev];
      [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
      return newFiles;
    });
  };

  const handleConvert = async () => {
    if (files.length === 0) return;

    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const pdfDoc = await PDFDocument.create();

      const pageSizes = {
        a4: { width: 595.28, height: 841.89 },
        letter: { width: 612, height: 792 },
      };

      for (let i = 0; i < files.length; i++) {
        const imageFile = files[i];
        setProgress(Math.round((i / files.length) * 100));

        const imageBytes = await imageFile.file.arrayBuffer();
        let image;
        if (imageFile.file.type === "image/png") {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          image = await pdfDoc.embedJpg(imageBytes);
        }

        const { width: pageWidth, height: pageHeight } = 
          settings.pageSize === "auto" 
            ? { width: image.width, height: image.height }
            : (settings.orientation === "portrait" 
                ? pageSizes[settings.pageSize] 
                : { width: pageSizes[settings.pageSize].height, height: pageSizes[settings.pageSize].width });

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        let drawWidth: number;
        let drawHeight: number;
        let x: number;
        let y: number;

        const margin = settings.margin;
        const availableWidth = pageWidth - margin * 2;
        const availableHeight = pageHeight - margin * 2;

        const imageAspect = image.width / image.height;
        const pageAspect = availableWidth / availableHeight;

        if (settings.imageFit === "contain") {
          if (imageAspect > pageAspect) {
            drawWidth = availableWidth;
            drawHeight = availableWidth / imageAspect;
          } else {
            drawHeight = availableHeight;
            drawWidth = availableHeight * imageAspect;
          }
          x = margin + (availableWidth - drawWidth) / 2;
          y = margin + (availableHeight - drawHeight) / 2;
        } else if (settings.imageFit === "cover") {
          if (imageAspect > pageAspect) {
            drawHeight = availableHeight;
            drawWidth = availableHeight * imageAspect;
          } else {
            drawWidth = availableWidth;
            drawHeight = availableWidth / imageAspect;
          }
          x = margin + (availableWidth - drawWidth) / 2;
          y = margin + (availableHeight - drawHeight) / 2;
        } else {
          drawWidth = availableWidth;
          drawHeight = availableHeight;
          x = margin;
          y = margin;
        }

        if (imageFile.rotation === 90 || imageFile.rotation === 270) {
          const temp = drawWidth;
          drawWidth = drawHeight;
          drawHeight = temp;
        }

        page.drawImage(image, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
          rotate: degrees(imageFile.rotation),
          opacity: 1,
        });

        if (settings.pageNumbers) {
          page.drawText(`${i + 1}`, {
            x: pageWidth / 2 - 5,
            y: 20,
            size: 10,
            color: rgb(0.5, 0.5, 0.5),
          });
        }
      }

      setProgress(90);
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      setResultBlob(blob);
      setProgress(100);
    } catch (err) {
      setError("Failed to create PDF. Please try again.");
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
      a.download = "converted.pdf";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <a href="/tools"><ChevronLeft className="h-4 w-4 mr-1" /> Back to Tools</a>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">JPG to PDF</h1>
          <p className="text-muted-foreground mt-1">Create PDF documents from multiple images with full control over layout and quality.</p>
        </div>

        {files.length === 0 ? (
          <UploadZone onDrop={onDrop} getRootProps={getRootProps} getInputProps={getInputProps} isDragActive={isDragActive} />
        ) : (
          <>
            <FileList
              files={files}
              onRemove={removeFile}
              onRotate={rotateFile}
              onMove={moveFile}
              totalSize={totalSize}
            />
            <SettingsPanel settings={settings} onSettingsChange={setSettings} />
            <ActionBar
              processing={processing}
              progress={progress}
              onConvert={handleConvert}
              onDownload={downloadPdf}
              resultBlob={resultBlob}
              disabled={files.length === 0}
              error={error}
              filesCount={files.length}
            />
          </>
        )}
      </div>
    </div>
  );
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
            <FileImage className="h-10 w-10" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">
            {isDragActive ? "Drop your images here" : "Drag & drop images here"}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Supports JPG, PNG, WebP, GIF, BMP, TIFF. Multiple files allowed.
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

function FileList({ files, onRemove, onRotate, onMove, totalSize }: {
  files: ImageFile[];
  onRemove: (id: string) => void;
  onRotate: (id: string, degrees: number) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  totalSize: number;
}) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Images ({files.length})</CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{formatFileSize(totalSize)}</span>
            <Badge variant="outline">{files.length} files</Badge>
          </div>
        </div>
        <CardDescription>Drag to reorder • Click rotate buttons to adjust orientation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {files.map((file, index) => (
            <div key={file.id} className="relative group">
              <div className="aspect-[3/4] rounded-xl border border-border/50 overflow-hidden bg-muted/50">
                <img
                  src={file.preview}
                  alt={file.name}
                  className="w-full h-full object-cover"
                  style={{ transform: `rotate(${file.rotation}deg)` }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button variant="ghost" size="icon" className="bg-white/90" onClick={() => onRotate(file.id, -90)}>
                    <RotateCw className="h-4 w-4 -rotate-90" />
                  </Button>
                  <Button variant="ghost" size="icon" className="bg-white/90" onClick={() => onRotate(file.id, 90)}>
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="bg-white/90" onClick={() => onRemove(file.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute top-2 left-2 flex gap-1">
                  {index > 0 && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 bg-white/90" onClick={() => onMove(file.id, "up")}>
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {index < files.length - 1 && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 bg-white/90" onClick={() => onMove(file.id, "down")}>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <div className="absolute bottom-2 right-2">
                  <Badge variant="outline" className="text-xs">{file.rotation > 0 ? `Rotated ${file.rotation}°` : "Original"}</Badge>
                </div>
              </div>
              <p className="mt-2 text-xs text-center truncate text-muted-foreground">{file.name}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SettingsPanel({ settings, onSettingsChange }: {
  settings: {
    pageSize: "a4" | "letter" | "auto";
    orientation: "portrait" | "landscape";
    margin: number;
    imageFit: "contain" | "cover" | "fill";
    quality: number;
    pageNumbers: boolean;
  };
  onSettingsChange: React.Dispatch<React.SetStateAction<typeof settings>>;
}) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Output Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label>Page Size</Label>
            <Select value={settings.pageSize} onValueChange={(v) => onSettingsChange((s) => ({ ...s, pageSize: v as any }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="a4">A4 (210 × 297 mm)</SelectItem>
                <SelectItem value="letter">Letter (8.5 × 11 in)</SelectItem>
                <SelectItem value="auto">Auto (match image)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Orientation</Label>
            <Select value={settings.orientation} onValueChange={(v) => onSettingsChange((s) => ({ ...s, orientation: v as any }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="portrait">Portrait</SelectItem>
                <SelectItem value="landscape">Landscape</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Margin</Label>
            <Select value={settings.margin.toString()} onValueChange={(v) => onSettingsChange((s) => ({ ...s, margin: parseInt(v) }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">None (0mm)</SelectItem>
                <SelectItem value="5">Small (5mm)</SelectItem>
                <SelectItem value="10">Medium (10mm)</SelectItem>
                <SelectItem value="20">Large (20mm)</SelectItem>
                <SelectItem value="30">Extra Large (30mm)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Image Fit</Label>
            <Select value={settings.imageFit} onValueChange={(v) => onSettingsChange((s) => ({ ...s, imageFit: v as any }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="contain">Fit (contain)</SelectItem>
                <SelectItem value="cover">Fill (cover)</SelectItem>
                <SelectItem value="fill">Stretch (fill)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label>Quality</Label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={settings.quality}
              onChange={(e) => onSettingsChange((s) => ({ ...s, quality: parseFloat(e.target.value) }))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none accent-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">{Math.round(settings.quality * 100)}%</p>
          </div>
          <div className="sm:col-span-2 flex items-center">
            <input
              type="checkbox"
              id="pageNumbers"
              checked={settings.pageNumbers}
              onChange={(e) => onSettingsChange((s) => ({ ...s, pageNumbers: e.target.checked }))}
              className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-primary"
            />
            <Label htmlFor="pageNumbers" className="ml-2 cursor-pointer">Add page numbers</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionBar({ processing, progress, onConvert, onDownload, resultBlob, disabled, error, filesCount }: {
  processing: boolean;
  progress: number;
  onConvert: () => void;
  onDownload: () => void;
  resultBlob: Blob | null;
  disabled: boolean;
  error: string | null;
  filesCount: number;
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
              <span className="font-medium">Creating PDF...</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-muted-foreground text-center">
              {progress < 30 && "Reading images..."}
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
                <p className="font-semibold text-green-600 dark:text-green-400">PDF created successfully!</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(resultBlob.size)} • {filesCount} page(s)</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button size="lg" onClick={onDownload} className="flex-1 gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.reload()} className="flex-1">
                Create Another
              </Button>
            </div>
          </div>
        ) : (
          <Button size="lg" onClick={onConvert} disabled={disabled} className="w-full gap-2">
            <FileText className="h-4 w-4" />
            Create PDF ({filesCount} image{filesCount !== 1 ? "s" : ""})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}