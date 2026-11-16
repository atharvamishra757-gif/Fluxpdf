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
import { FileText, Upload, X, CheckCircle, Download, ChevronLeft, Highlighter, RotateCw, Trash2, Maximize2 } from "lucide-react";
import { PDFDocument } from "pdf-lib";

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
}

interface HighlightBox {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface PageHighlights {
  [pageIndex: number]: HighlightBox[];
}

type HighlightColor = "yellow" | "green" | "blue" | "pink" | "orange";

const HIGHLIGHT_COLORS: Record<HighlightColor, { label: string; hex: string }> = {
  yellow: { label: "Yellow", hex: "#ffff00" },
  green: { label: "Green", hex: "#00ff00" },
  blue: { label: "Blue", hex: "#0000ff" },
  pink: { label: "Pink", hex: "#ff69b4" },
  orange: { label: "Orange", hex: "#ffa500" },
};

export default function AnnotatePage() {
  const [file, setFile] = React.useState<PDFFile | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedColor, setSelectedColor] = React.useState<HighlightColor>("yellow");
  const [processing, setProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [resultBlob, setResultBlob] = React.useState<Blob | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [pageRender, setPageRender] = React.useState<{ dataUrl: string; pdfWidth: number; pdfHeight: number } | null>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [startPos, setStartPos] = React.useState<{ x: number; y: number } | null>(null);

  const highlightBoxRef = React.useRef<HTMLDivElement>(null);

  const [highlights, setHighlights] = React.useState<PageHighlights>({});

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    const pdfFile = acceptedFiles.find((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (pdfFile) {
      try {
        const pdfBytes = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        setFile({ id: generateId(), file: pdfFile, name: pdfFile.name, size: pdfFile.size, pageCount: pdfDoc.getPageCount() });
      } catch {
        setFile({ id: generateId(), file: pdfFile, name: pdfFile.name, size: pdfFile.size, pageCount: 0 });
      }
      setError(null);
      setResultBlob(null);
      setHighlights({});
      setCurrentPage(1);
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
    setHighlights({});
    setCurrentPage(1);
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
      const pdfjs: any = pdfjsLib;
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

      const pdfBytes = await file.file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: pdfBytes });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      const pdfViewport = page.getViewport({ scale: 1 });
      const { width: pdfWidth, height: pdfHeight } = pdfViewport;

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;

      await page.render({ canvasContext: ctx, viewport }).promise;

      const dataUrl = canvas.toDataURL("image/png");

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
    if (!highlightBoxRef.current || !pageRender) return;
    e.preventDefault();
    const rect = highlightBoxRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const startX = Math.max(0, Math.min(1, x));
    const startY = Math.max(0, Math.min(1, y));
    setIsDrawing(true);
    setStartPos({ x: startX, y: startY });
    setHighlights((prev) => {
      const pageHighlights = prev[currentPage - 1] || [];
      const newBox: HighlightBox = {
        x: startX,
        y: startY,
        width: 0,
        height: 0,
        color: HIGHLIGHT_COLORS[selectedColor].hex,
      };
      return {
        ...prev,
        [currentPage - 1]: [...pageHighlights, newBox],
      };
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !startPos || !highlightBoxRef.current) return;
    const rect = highlightBoxRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const left = Math.min(startPos.x, x);
    const top = Math.min(startPos.y, y);
    const width = Math.abs(x - startPos.x);
    const height = Math.abs(y - startPos.y);

    const newBox: HighlightBox = {
      x: Math.max(0, Math.min(1 - width, left)),
      y: Math.max(0, Math.min(1 - height, top)),
      width: Math.max(0, Math.min(1 - left, width)),
      height: Math.max(0, Math.min(1 - top, height)),
      color: HIGHLIGHT_COLORS[selectedColor].hex,
    };
    setHighlights((prev) => {
      const pageHighlights = prev[currentPage - 1] || [];
      const next = [...pageHighlights];
      next[next.length - 1] = newBox;
      return {
        ...prev,
        [currentPage - 1]: next,
      };
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setStartPos(null);
  };

  const removeHighlight = (index: number) => {
    setHighlights((prev) => {
      const pageHighlights = prev[currentPage - 1] || [];
      const next = [...pageHighlights];
      next.splice(index, 1);
      return {
        ...prev,
        [currentPage - 1]: next,
      };
    });
  };

  const clearHighlights = () => {
    setHighlights((prev) => {
      const next = { ...prev };
      delete next[currentPage - 1];
      return next;
    });
  };

  const currentPageHighlights = highlights[currentPage - 1] || [];
  const hasHighlights = Object.values(highlights).some((h) => h.length > 0);

  const handleSave = async () => {
    if (!file) return;

    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const pdfjs: any = pdfjsLib;
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

      const pdfBytes = await file.file.arrayBuffer();
      const pdfJsBytes = pdfBytes.slice(0);
      const pdfLibBytes = pdfBytes.slice(0);

      const loadingTask = pdfjs.getDocument({ data: pdfJsBytes });
      const pdf = await loadingTask.promise;

      const pdfDoc = await PDFDocument.load(pdfLibBytes);
      const newPdf = await PDFDocument.create();

      for (let i = 0; i < pdf.numPages; i++) {
        setProgress(10 + Math.round((i / pdf.numPages) * 80));

        const pdfPage = pdfDoc.getPage(i);
        const { width, height } = pdfPage.getSize();

        const pageHighlights = highlights[i] || [];

        if (pageHighlights.length > 0) {
          for (const h of pageHighlights) {
            const drawX = h.x * width;
            const drawY = (1 - (h.y + h.height)) * height;
            const drawW = h.width * width;
            const drawH = h.height * height;

            pdfPage.drawRectangle({
              x: drawX,
              y: drawY,
              width: drawW,
              height: drawH,
              color: {
                type: "RGB" as any,
                red: parseInt(h.color.slice(1, 3), 16) / 255,
                green: parseInt(h.color.slice(3, 5), 16) / 255,
                blue: parseInt(h.color.slice(5, 7), 16) / 255,
              },
              opacity: 0.3,
            });
          }
        }

        newPdf.addPage(pdfPage);
      }

      setProgress(90);
      const savedBytes = await newPdf.save({ useObjectStreams: true });
      const blob = new Blob([new Uint8Array(savedBytes)], { type: "application/pdf" });
      setResultBlob(blob);
      saveProcessedPDF({
        file: file.file,
        name: `annotated-${file.name}`,
        size: savedBytes.length,
        pageCount: file.pageCount,
        blob,
        tool: "Annotate PDF",
      });
      setProgress(100);
    } catch (err) {
      setError("Failed to annotate PDF. Please try again.");
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
      a.download = `annotated-${file?.name}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <a href="/tools"><ChevronLeft className="h-4 w-4 mr-1" />Back</a>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Highlight & Annotate</h1>
          <p className="text-muted-foreground mt-1">Draw highlight boxes over text to mark important sections.</p>
        </div>

        {!file ? (
          <Card>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <div className="flex flex-col items-center py-16 px-8 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Highlighter className="h-10 w-10" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Select PDF</h3>
                <p className="text-muted-foreground mb-6">Upload a PDF to highlight text.</p>
                <Button size="lg" variant="outline"><Upload className="h-4 w-4 mr-2" />Browse Files</Button>
              </div>
            </div>
          </Card>
        ) : (
          <>
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Selected File</CardTitle>
                  <Button variant="ghost" size="icon" onClick={removeFile}><X className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-muted/30">
                  <div className="flex h-16 w-12 items-center justify-center rounded-lg border border-border/50 bg-white dark:bg-gray-800">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <div className="flex gap-4 mt-1 text-sm text-muted-foreground"><span>{file.pageCount} pages</span><span>{formatFileSize(file.size)}</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Highlighter className="h-5 w-5" />
                    Highlight Settings
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Label>Color</Label>
                    <Select value={selectedColor} onValueChange={(v) => setSelectedColor(v as HighlightColor)}>
                      <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(HIGHLIGHT_COLORS).map(([key, val]) => (
                          <SelectItem key={key} value={key as HighlightColor}>
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded" style={{ backgroundColor: val.hex }} />
                              {val.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 relative bg-gray-900 rounded-xl overflow-hidden border border-border/50">
                      {pageRender ? (
                        <div
                          ref={highlightBoxRef}
                          className="relative cursor-crosshair"
                          onMouseDown={handleMouseDown}
                          onMouseMove={handleMouseMove}
                          onMouseUp={handleMouseUp}
                          tabIndex={0}
                          role="img"
                          aria-label="PDF preview"
                        >
                          <img src={pageRender.dataUrl} alt="PDF page preview" className="block max-w-full max-h-[600px] object-contain" />
                          {currentPageHighlights.map((h, idx) => (
                            <div
                              key={idx}
                              className="absolute border-2 border-red-500 bg-red-500/20 cursor-pointer"
                              style={{
                                left: `${h.x * 100}%`,
                                top: `${h.y * 100}%`,
                                width: `${h.width * 100}%`,
                                height: `${h.height * 100}%`,
                              }}
                              onClick={() => removeHighlight(idx)}
                            >
                              <div className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-bold px-1.5 rounded cursor-pointer hover:bg-red-600 transition-colors">
                                ✕
                              </div>
                            </div>
                          ))}
                          {currentPageHighlights.length === 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                              <p>Drag to draw a highlight box</p>
                              <p className="text-xs mt-1">Click a highlight to remove it</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                          <Highlighter className="h-12 w-12 mb-2 opacity-50" />
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
                            <Maximize2 className="h-3 w-3 rotate-180" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="w-full lg:w-[320px] flex flex-col gap-4">
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Highlights on this page</p>
                        {currentPageHighlights.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No highlights yet. Draw a box on the preview.</p>
                        ) : (
                          <div className="space-y-2">
                            {currentPageHighlights.map((h, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded" style={{ backgroundColor: h.color }} />
                                  <span className="truncate">Highlight {idx + 1}</span>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeHighlight(idx)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Button onClick={clearHighlights} variant="outline" className="w-full text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear All Highlights on This Page
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardContent className="pt-6">
                {error && (
                  <div className="mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>
                )}

                {processing ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between"><span className="font-medium">Saving annotated PDF...</span><span className="text-sm text-muted-foreground">{progress}%</span></div>
                    <Progress value={progress} className="h-3" />
                  </div>
                ) : resultBlob ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      <div>
                        <p className="font-semibold text-green-600 dark:text-green-400">PDF annotated successfully!</p>
                        <p className="text-sm text-muted-foreground">{formatFileSize(resultBlob.size)}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button size="lg" onClick={downloadPdf} className="flex-1 gap-2"><Download className="h-4 w-4" />Download Annotated PDF</Button>
                      <Button size="lg" variant="outline" onClick={() => window.location.reload()} className="flex-1">Annotate Another</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Button onClick={handleSave} disabled={!hasHighlights} className="w-full gap-2">
                      <Highlighter className="h-4 w-4 mr-2" />
                      Save Annotated PDF
                    </Button>
                    {!hasHighlights && (
                      <p className="text-xs text-center text-muted-foreground mt-2">Draw at least one highlight before saving.</p>
                    )}
                  </>
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
