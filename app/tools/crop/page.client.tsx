"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatFileSize, generateId } from "@/lib/utils";
import { saveProcessedPDF } from "@/components/ui/processed-pdfs";
import { siteConfig } from "@/lib/site-config";
import { FileText, Upload, X, CheckCircle, Download, ChevronLeft, Crop, RotateCw, Maximize2, Minimize2 } from "lucide-react";
import { PDFDocument } from "pdf-lib";

export const metadata = {
  title: "Crop PDF Online - Crop Pages Interactively | FluxPDF",
  description: "Crop PDF pages online for free. Crop pages with interactive selection. Fast, secure, client-side PDF cropping.",
  alternates: {
    canonical: `${siteConfig.url}/tools/crop`,
  },
  openGraph: {
    title: "Crop PDF Online - Crop Pages Interactively | FluxPDF",
    description: "Crop PDF pages online for free. Crop pages with interactive selection.",
    url: `${siteConfig.url}/tools/crop`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "Crop PDF Online | FluxPDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Crop PDF Online - Crop Pages Interactively | FluxPDF",
    description: "Crop PDF pages online for free. Crop pages with interactive selection.",
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

interface CropBox {
  // Percentage values (0 to 1) relative to page dimensions
  x: number;
  y: number;
  width: number;
  height: number;
}

type CropMode = "all" | "current";

export default function CropPage() {
  const [file, setFile] = React.useState<PDFFile | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [cropMode, setCropMode] = React.useState<CropMode>("all");
  const [cropBoxes, setCropBoxes] = React.useState<Map<number, CropBox>>(new Map());
  const [processing, setProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [resultBlob, setResultBlob] = React.useState<Blob | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [pageRender, setPageRender] = React.useState<{ dataUrl: string; pdfWidth: number; pdfHeight: number } | null>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [startPos, setStartPos] = React.useState<{ x: number; y: number } | null>(null);

  const cropBoxRef = React.useRef<HTMLDivElement>(null);

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    const pdfFile = acceptedFiles.find((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (pdfFile) {
      const pageCount = await getPageCount(pdfFile);
      setFile({ id: generateId(), file: pdfFile, name: pdfFile.name, size: pdfFile.size, pageCount });
      setError(null);
      setResultBlob(null);
      setCurrentPage(1);
      setCropBoxes(new Map());
      setPageRender(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const removeFile = () => {
    setFile(null);
    setResultBlob(null);
    setCurrentPage(1);
    setCropBoxes(new Map());
    setPageRender(null);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const nextPage = () => {
    if (file && currentPage < file.pageCount) setCurrentPage(currentPage + 1);
  };

  const loadPage = async (pageNum: number) => {
    if (!file) return;

    try {
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

      // @ts-expect-error - pdf.js types
      const pdfjs: any = pdfjsLib.default || pdfjsLib;
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

      const pdfBytes = await file.file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: pdfBytes });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      const viewport1 = page.getViewport({ scale: 1 });
      const { width: pdfWidth, height: pdfHeight } = viewport1;

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;

      await page.render({ canvasContext: ctx, viewport }).promise;

      const dataUrl = canvas.toDataURL("image/png");

      // Reset crop box for this page if none exists (full page in percentage)
      const existing = cropBoxes.get(pageNum - 1);
      if (!existing) {
        setCropBoxes((prev) => {
          const next = new Map(prev);
          next.set(pageNum - 1, { x: 0, y: 0, width: 1, height: 1 });
          return next;
        });
      }

      setPageRender({ dataUrl, pdfWidth, pdfHeight });
    } catch (err) {
      console.error(err);
      setError("Failed to render page preview.");
    }
  };

  React.useEffect(() => {
    if (file) {
      loadPage(currentPage);
    }
  }, [file, currentPage]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!cropBoxRef.current || !pageRender) return;
    const rect = cropBoxRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setIsDrawing(true);
    setStartPos({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !startPos || !cropBoxRef.current) return;
    const rect = cropBoxRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const left = Math.min(startPos.x, x);
    const top = Math.min(startPos.y, y);
    const width = Math.abs(x - startPos.x);
    const height = Math.abs(y - startPos.y);

    const newBox: CropBox = {
      x: Math.max(0, Math.min(1, left)),
      y: Math.max(0, Math.min(1, top)),
      width: Math.max(0, Math.min(1 - left, width)),
      height: Math.max(0, Math.min(1 - top, height)),
    };
    setCropBoxes((prev) => {
      const next = new Map(prev);
      next.set(currentPage - 1, newBox);
      return next;
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setStartPos(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const current = cropBoxes.get(currentPage - 1) || { x: 0, y: 0, width: 1, height: 1 };
    const step = e.shiftKey ? 0.05 : 0.01;
    let newBox = { ...current };

    switch (e.key) {
      case "ArrowLeft": newBox.x = Math.max(0, newBox.x - step); break;
      case "ArrowRight": newBox.x = Math.min(1 - newBox.width, newBox.x + step); break;
      case "ArrowUp": newBox.y = Math.max(0, newBox.y - step); break;
      case "ArrowDown": newBox.y = Math.min(1 - newBox.height, newBox.y + step); break;
      default: return;
    }

    e.preventDefault();
    setCropBoxes((prev) => {
      const next = new Map(prev);
      next.set(currentPage - 1, newBox);
      return next;
    });
  };

  const applyCropToAll = () => {
    const currentBox = cropBoxes.get(currentPage - 1);
    if (!currentBox) return;

    setCropBoxes((prev) => {
      const next = new Map();
      for (let i = 0; i < (file?.pageCount || 1); i++) {
        next.set(i, { ...currentBox });
      }
      return next;
    });
  };

  const resetCrop = () => {
    setCropBoxes((prev) => {
      const next = new Map(prev);
      next.set(currentPage - 1, { x: 0, y: 0, width: 1, height: 1 });
      return next;
    });
  };

  const handleCrop = async () => {
    if (!file) return;

    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

      // @ts-expect-error - pdf.js types
      const pdfjs: any = pdfjsLib.default || pdfjsLib;
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

      const pdfBytes = await file.file.arrayBuffer();
      // Make separate copies for both libraries to avoid detached buffer issues
      const pdfJsBytes = pdfBytes.slice(0);
      const pdfLibBytes = pdfBytes.slice(0);

      const loadingTask = pdfjs.getDocument({ data: pdfJsBytes });
      const pdf = await loadingTask.promise;

      // Load with pdf-lib for actual page manipulation
      const pdfDoc = await PDFDocument.load(pdfLibBytes);

      const newPdf = await PDFDocument.create();

      for (let i = 0; i < pdf.numPages; i++) {
        setProgress(10 + Math.round((i / pdf.numPages) * 80));

        const pdfPage = pdfDoc.getPage(i);
        const { width, height } = pdfPage.getSize();

        const cropBox = cropBoxes.get(i);

        if (!cropBox) {
          const copiedPages = await newPdf.copyPages(pdfDoc, [i]);
          copiedPages.forEach((p) => newPdf.addPage(p));
          continue;
        }

        // Convert percentage crop box (0-1, top-down origin) to PDF coordinates (bottom-up origin)
        const finalX = Math.max(0, Math.min(cropBox.x * width, width));
        const finalY = Math.max(0, Math.min((1 - (cropBox.y + cropBox.height)) * height, height));
        const finalW = Math.max(0, Math.min(cropBox.width * width, width - finalX));
        const finalH = Math.max(0, Math.min(cropBox.height * height, height - finalY));

        if (finalW <= 0 || finalH <= 0) {
          const copiedPages = await newPdf.copyPages(pdfDoc, [i]);
          copiedPages.forEach((p) => newPdf.addPage(p));
          continue;
        }

        const newPage = newPdf.addPage([finalW, finalH]);
        const embeddedPage = await newPdf.embedPage(pdfPage);
        newPage.drawPage(embeddedPage, {
          x: -finalX,
          y: -finalY,
          width,
          height,
        });
      }

      setProgress(90);
      const croppedBytes = await newPdf.save({ useObjectStreams: true });
      const blob = new Blob([new Uint8Array(croppedBytes)], { type: "application/pdf" });
      setResultBlob(blob);
      saveProcessedPDF({
        file: file.file,
        name: `cropped-${file.name}`,
        size: croppedBytes.length,
        pageCount: pdf.numPages,
        blob,
        tool: "Crop PDF",
      });
      setProgress(100);
    } catch (err) {
      setError("Failed to crop PDF. Please try again.");
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
      a.download = "cropped.pdf";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const currentBox = cropBoxes.get(currentPage - 1) || { x: 0, y: 0, width: 1, height: 1 };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <a href="/tools"><ChevronLeft className="h-4 w-4 mr-1" /> Back to Tools</a>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Crop PDF</h1>
          <p className="text-muted-foreground mt-1">Visually select the area to keep on each page.</p>
        </div>

        {!file ? (
          <Card className={cn("relative overflow-hidden transition-all duration-300", isDragActive && "border-primary/50 bg-primary/5")}>
            <div {...getRootProps()} className="relative">
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Crop className="h-10 w-10" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  {isDragActive ? "Drop PDF here" : "Drag & drop a PDF file"}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Select a PDF to visually crop its pages.
                </p>
                <Button size="lg" variant="outline" className="w-full max-w-xs">
                  <Upload className="h-4 w-4 mr-2" />
                  Browse Files
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <>
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Selected File</CardTitle>
                  <Button variant="ghost" size="icon" onClick={removeFile}>
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

            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Crop className="h-5 w-5" />
                    Crop Settings
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={cropMode as string} onValueChange={(v) => setCropMode(v as CropMode)}>
                      <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Apply to All Pages</SelectItem>
                        <SelectItem value="current">Current Page Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Preview */}
                    <div className="flex-1 relative bg-gray-900 rounded-xl overflow-hidden border border-border/50">
                      {pageRender ? (
                        <div
                          ref={cropBoxRef}
                          className="relative cursor-crosshair"
                          onMouseDown={handleMouseDown}
                          onMouseMove={handleMouseMove}
                          onMouseUp={handleMouseUp}
                          onKeyDown={handleKeyDown}
                          tabIndex={0}
                          role="img"
                          aria-label="Crop preview"
                        >
                          <img src={pageRender.dataUrl} alt="PDF page preview" className="block max-w-full max-h-[600px] object-contain" />
                          {currentBox && (
                            <div
                              className="absolute border-2 border-red-500 bg-red-500/20"
                              style={{
                                left: `${currentBox.x * 100}%`,
                                top: `${currentBox.y * 100}%`,
                                width: `${currentBox.width * 100}%`,
                                height: `${currentBox.height * 100}%`,
                              }}
                            >
                              <div className="absolute -top-3 -left-3 bg-red-500 text-white text-[10px] font-bold px-1.5 rounded">
                                Crop area
                              </div>
                            </div>
                          )}
                          {!currentBox && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                              <p>Draw a crop area on the preview</p>
                              <p className="text-xs mt-1">Use arrow keys to adjust</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                          <Crop className="h-12 w-12 mb-2 opacity-50" />
                          <p>Loading page preview...</p>
                        </div>
                      )}
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-black/60 text-white px-3 py-2 rounded-lg backdrop-blur">
                        <span className="text-sm font-medium">Page {currentPage} of {file.pageCount}</span>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={prevPage} disabled={currentPage === 1}>
                            <Maximize2 className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={nextPage} disabled={currentPage >= file.pageCount}>
                            <Minimize2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="w-full lg:w-[320px] flex flex-col gap-4">
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Crop Area (%)</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <label className="text-xs text-muted-foreground">X (%)</label>
                            <Input
                              type="number"
                              value={(currentBox.x * 100).toFixed(2)}
                              onChange={(e) => {
                                const val = Math.max(0, Math.min(100, parseFloat(e.target.value)) || 0) / 100;
                                setCropBoxes((prev) => {
                                  const next = new Map(prev);
                                  const cur = next.get(currentPage - 1) || { x: 0, y: 0, width: 1, height: 1 };
                                  next.set(currentPage - 1, { ...cur, x: val });
                                  return next;
                                });
                              }}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="flex flex-col">
                            <label className="text-xs text-muted-foreground">Y (%)</label>
                            <Input
                              type="number"
                              value={(currentBox.y * 100).toFixed(2)}
                              onChange={(e) => {
                                const val = Math.max(0, Math.min(100, parseFloat(e.target.value)) || 0) / 100;
                                setCropBoxes((prev) => {
                                  const next = new Map(prev);
                                  const cur = next.get(currentPage - 1) || { x: 0, y: 0, width: 1, height: 1 };
                                  next.set(currentPage - 1, { ...cur, y: val });
                                  return next;
                                });
                              }}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="flex flex-col">
                            <label className="text-xs text-muted-foreground">Width (%)</label>
                            <Input
                              type="number"
                              value={(currentBox.width * 100).toFixed(2)}
                              onChange={(e) => {
                                const val = Math.max(0, Math.min(100, parseFloat(e.target.value)) || 0) / 100;
                                setCropBoxes((prev) => {
                                  const next = new Map(prev);
                                  const cur = next.get(currentPage - 1) || { x: 0, y: 0, width: 1, height: 1 };
                                  next.set(currentPage - 1, { ...cur, width: val });
                                  return next;
                                });
                              }}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="flex flex-col">
                            <label className="text-xs text-muted-foreground">Height (%)</label>
                            <Input
                              type="number"
                              value={(currentBox.height * 100).toFixed(2)}
                              onChange={(e) => {
                                const val = Math.max(0, Math.min(100, parseFloat(e.target.value)) || 0) / 100;
                                setCropBoxes((prev) => {
                                  const next = new Map(prev);
                                  const cur = next.get(currentPage - 1) || { x: 0, y: 0, width: 1, height: 1 };
                                  next.set(currentPage - 1, { ...cur, height: val });
                                  return next;
                                });
                              }}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Button onClick={resetCrop} variant="outline" className="w-full">
                          <RotateCw className="h-4 w-4 mr-2" />
                          Reset Crop
                        </Button>
                        {cropMode === "all" && (
                          <Button onClick={applyCropToAll} variant="outline" className="w-full">
                            <Crop className="h-4 w-4 mr-2" />
                            Apply to All Pages
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                      <span className="font-medium">Cropping PDF...</span>
                      <span className="text-sm text-muted-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>
                ) : resultBlob ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      <div>
                        <p className="font-semibold text-green-600 dark:text-green-400">PDF cropped successfully!</p>
                        <p className="text-sm text-muted-foreground">{formatFileSize(resultBlob.size)}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button size="lg" onClick={downloadPdf} className="flex-1 gap-2">
                        <Download className="h-4 w-4" />
                        Download Cropped PDF
                      </Button>
                      <Button size="lg" variant="outline" onClick={() => window.location.reload()} className="flex-1">
                        Crop Another
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button size="lg" onClick={handleCrop} className="w-full gap-2">
                    <Crop className="h-4 w-4" />
                    Crop PDF
                  </Button>
                )}
              </CardContent>
            </Card>
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
