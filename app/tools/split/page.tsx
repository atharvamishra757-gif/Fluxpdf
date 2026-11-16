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
import { formatFileSize, generateId } from "@/lib/utils";
import { saveProcessedPDF } from "@/components/ui/processed-pdfs";
import { 
  FileText, Upload, X, CheckCircle, Download, 
  ChevronLeft, Scissors, FilePlus
} from "lucide-react";
import { PDFDocument } from "pdf-lib";

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
}

type SplitMode = "every-page" | "page-ranges" | "extract";

export default function SplitPage() {
  const [file, setFile] = React.useState<PDFFile | null>(null);
  const [mode, setMode] = React.useState<SplitMode>("every-page");
  const [pageRanges, setPageRanges] = React.useState("");
  const [processing, setProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [resultBlobs, setResultBlobs] = React.useState<{ name: string; blob: Blob }[]>([]);
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
      setResultBlobs([]);
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
    setResultBlobs([]);
    setPageRanges("");
  };

  const handleSplit = async () => {
    if (!file) return;

    setProcessing(true);
    setProgress(0);
    setError(null);
    setResultBlobs([]);

    try {
      const pdfBytes = await file.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const totalPages = pdfDoc.getPageCount();

      let ranges: { start: number; end: number }[] = [];

      if (mode === "every-page") {
        ranges = Array.from({ length: totalPages }, (_, i) => ({ start: i, end: i }));
      } else if (mode === "page-ranges" || mode === "extract") {
        ranges = parsePageRanges(pageRanges, totalPages);
        if (ranges.length === 0) {
          throw new Error("Invalid page ranges");
        }
      }

      const blobs: { name: string; blob: Blob }[] = [];

      for (let i = 0; i < ranges.length; i++) {
        setProgress(Math.round((i / ranges.length) * 80));
        
        const range = ranges[i];
        const newPdf = await PDFDocument.create();
        const pageIndices = Array.from({ length: range.end - range.start + 1 }, (_, j) => range.start + j);
        const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
        
        copiedPages.forEach((page) => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save({ useObjectStreams: true });
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        
        const name = mode === "every-page" 
          ? `page-${range.start + 1}.pdf`
          : `pages-${range.start + 1}-${range.end + 1}.pdf`;
        
        blobs.push({ name, blob });
      saveProcessedPDF({
        file: file.file,
        name,
        size: pdfBytes.length,
        pageCount: range.end - range.start + 1,
        blob,
        tool: "Split PDF",
      });
      }

      setResultBlobs(blobs);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to split PDF. Please try again.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const downloadAll = () => {
    resultBlobs.forEach(({ name, blob }) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <a href="/tools"><ChevronLeft className="h-4 w-4 mr-1" /> Back to Tools</a>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Split PDF</h1>
          <p className="text-muted-foreground mt-1">Separate pages or extract page ranges from a PDF document.</p>
        </div>

        {!file ? (
          <UploadZone onDrop={onDrop} getRootProps={getRootProps} getInputProps={getInputProps} isDragActive={isDragActive} />
        ) : (
          <>
            <FileInfoCard file={file} onRemove={removeFile} />
            <SplitOptionsCard 
              mode={mode} 
              onModeChange={setMode} 
              pageRanges={pageRanges} 
              onPageRangesChange={setPageRanges}
              totalPages={file.pageCount}
            />
            <ActionBar
              processing={processing}
              progress={progress}
              onSplit={handleSplit}
              onDownload={downloadAll}
              resultBlobs={resultBlobs}
              disabled={!file || (mode !== "every-page" && !pageRanges.trim())}
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

function parsePageRanges(input: string, totalPages: number): { start: number; end: number }[] {
  const ranges: { start: number; end: number }[] = [];
  const parts = input.split(",").map(p => p.trim()).filter(Boolean);
  
  for (const part of parts) {
    if (part.includes("-")) {
      const [start, end] = part.split("-").map(n => parseInt(n.trim(), 10));
      if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= totalPages && start <= end) {
        ranges.push({ start: start - 1, end: end - 1 });
      }
    } else {
      const page = parseInt(part, 10);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        ranges.push({ start: page - 1, end: page - 1 });
      }
    }
  }
  
  return ranges;
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
            Select a PDF file to split into multiple documents.
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

function SplitOptionsCard({ mode, onModeChange, pageRanges, onPageRangesChange, totalPages }: {
  mode: SplitMode;
  onModeChange: (mode: SplitMode) => void;
  pageRanges: string;
  onPageRangesChange: (value: string) => void;
  totalPages: number;
}) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scissors className="h-5 w-5" />
          Split Options
        </CardTitle>
        <CardDescription>Choose how you want to split the PDF</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { id: "every-page", label: "Every Page", desc: "Split each page into separate PDF" },
              { id: "page-ranges", label: "Page Ranges", desc: "Split by custom ranges (e.g. 1-3, 5)" },
              { id: "extract", label: "Extract Pages", desc: "Extract specific pages into one PDF" },
            ].map((opt) => (
              <Button
                key={opt.id}
                variant={mode === opt.id ? "default" : "outline"}
                className="h-auto p-4 text-left justify-start gap-3"
                onClick={() => onModeChange(opt.id as SplitMode)}
              >
                <div>
                  <p className="font-medium">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
              </Button>
            ))}
          </div>

          {(mode === "page-ranges" || mode === "extract") && (
            <div className="space-y-3">
              <Label>Page Ranges</Label>
              <Input
                placeholder="e.g. 1-3, 5, 8-10"
                value={pageRanges}
                onChange={(e) => onPageRangesChange(e.target.value)}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                Enter page numbers or ranges separated by commas. Total pages: {totalPages}
              </p>
              <p className="text-xs text-muted-foreground">
                Examples: <code className="bg-muted px-1 rounded">1-3, 5, 8-10</code> or <code className="bg-muted px-1 rounded">2, 4, 6-8</code>
              </p>
            </div>
          )}

          {mode === "every-page" && (
            <div className="p-4 rounded-xl bg-muted/30 text-center">
              <FilePlus className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">Will create {totalPages} separate PDF files (one per page)</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ActionBar({ processing, progress, onSplit, onDownload, resultBlobs, disabled, error }: {
  processing: boolean;
  progress: number;
  onSplit: () => void;
  onDownload: () => void;
  resultBlobs: { name: string; blob: Blob }[];
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
              <span className="font-medium">Splitting PDF...</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-muted-foreground text-center">
              {progress < 30 && "Reading PDF..."}
              {progress >= 30 && progress < 70 && "Extracting pages..."}
              {progress >= 70 && progress < 100 && "Creating files..."}
              {progress === 100 && "Done!"}
            </p>
          </div>
        ) : resultBlobs.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <p className="font-semibold text-green-600 dark:text-green-400">PDF split successfully!</p>
                <p className="text-sm text-muted-foreground">{resultBlobs.length} file(s) created</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button size="lg" onClick={onDownload} className="flex-1 gap-2">
                <Download className="h-4 w-4" />
                Download All ({resultBlobs.length})
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.reload()} className="flex-1">
                Split Another
              </Button>
            </div>
          </div>
        ) : (
          <Button size="lg" onClick={onSplit} disabled={disabled} className="w-full gap-2">
            <Scissors className="h-4 w-4" />
            Split PDF
          </Button>
        )}
      </CardContent>
    </Card>
  );
}