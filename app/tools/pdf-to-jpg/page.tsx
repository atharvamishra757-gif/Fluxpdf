"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatFileSize, generateId } from "@/lib/utils";
import { FileText, Upload, X, Download, ChevronLeft, Image } from "lucide-react";
import { PDFDocument } from "pdf-lib";

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
}

interface PageImage {
  pageNum: number;
  dataUrl: string;
}

export default function PdfToJpgPage() {
  const [file, setFile] = React.useState<PDFFile | null>(null);
  const [pageImages, setPageImages] = React.useState<PageImage[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

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
      setPageImages([]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const handleConvert = async () => {
    if (!file) return;

    setProcessing(true);
    setProgress(0);
    setError(null);
    setPageImages([]);

    try {
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

      // @ts-expect-error - pdf.js types
      const pdfjs: any = pdfjsLib.default || pdfjsLib;
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

      const pdfBytes = await file.file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: pdfBytes });
      const pdf = await loadingTask.promise;

      const images: PageImage[] = [];

      for (let i = 0; i < pdf.numPages; i++) {
        setProgress(Math.round((i / pdf.numPages) * 90));

        const page = await pdf.getPage(i + 1);
        const viewport = page.getViewport({ scale: 2 });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;

        await page.render({ canvasContext: ctx, viewport }).promise;

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        images.push({ pageNum: i + 1, dataUrl });
      }

      setPageImages(images);
      setProgress(100);
    } catch (err) {
      setError("Failed to convert PDF to images. Please try again.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const downloadSingle = (pageNum: number, dataUrl: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    const name = file?.name.replace(/\.pdf$/i, "") || "document";
    a.download = `${name}-page-${pageNum}.jpg`;
    a.click();
  };

  const downloadAll = () => {
    if (pageImages.length === 0) return;

    // Create a ZIP-like download - download each image individually
    // Browser doesn't support ZIP natively without a library
    pageImages.forEach((img, index) => {
      setTimeout(() => {
        downloadSingle(img.pageNum, img.dataUrl);
      }, index * 100);
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4"><a href="/tools"><ChevronLeft className="h-4 w-4 mr-1" />Back</a></Button>
          <h1 className="text-3xl font-bold tracking-tight">PDF to JPG</h1>
          <p className="text-muted-foreground mt-1">Convert PDF pages to high-quality JPG images.</p>
        </div>

        {!file ? (
          <Card>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <div className="flex flex-col items-center py-16 px-8 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Image className="h-10 w-10" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Select PDF to convert</h3>
                <p className="text-muted-foreground mb-6">Convert PDF pages to JPG images.</p>
                <Button size="lg" variant="outline"><Upload className="h-4 w-4 mr-2" />Browse Files</Button>
              </div>
            </div>
          </Card>
        ) : (
          <>
            <Card className="mt-6">
              <CardHeader><div className="flex items-center justify-between"><CardTitle>Selected File</CardTitle><Button variant="ghost" size="icon" onClick={() => { setFile(null); setPageImages([]); }}><X className="h-4 w-4" /></Button></div></CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 rounded-xl border">
                  <div className="flex h-16 w-12 items-center justify-center rounded-lg border"><FileText className="h-8 w-8 text-muted-foreground" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <div className="flex gap-4 mt-1 text-sm text-muted-foreground"><span>{file.pageCount} pages</span><span>{formatFileSize(file.size)}</span></div>
                  </div>
                </div>
                {error && <div className="mt-4 p-4 rounded-xl bg-destructive/10 text-destructive text-sm">{error}</div>}
                {processing ? (
                  <div className="mt-4 space-y-4"><div className="flex justify-between"><span>Converting...</span><span>{progress}%</span></div><Progress value={progress} /></div>
                ) : pageImages.length > 0 ? (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Converted Pages ({pageImages.length})</h3>
                      <Button size="sm" onClick={downloadAll} className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download All
                      </Button>
                    </div>
                    <div className="grid gap-4">
                      {pageImages.map((img) => (
                        <div key={img.pageNum} className="border rounded-lg p-2 bg-muted/50">
                          <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-black">
                            <img src={img.dataUrl} alt={`Page ${img.pageNum}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex items-center justify-between mt-2 p-2">
                            <span className="text-sm font-medium">Page {img.pageNum}</span>
                            <Button size="sm" onClick={() => downloadSingle(img.pageNum, img.dataUrl)}>
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Button onClick={handleConvert} className="mt-4 w-full"><Image className="h-4 w-4 mr-2" />Convert to JPG</Button>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
