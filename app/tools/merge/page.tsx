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
import { formatFileSize, generateId } from "@/lib/utils";
import { saveProcessedPDF } from "@/components/ui/processed-pdfs";
import { 
  FileText, Upload, X, CheckCircle, Download, 
  ChevronLeft, ChevronRight, MoreVertical,
  ArrowUpDown, Plus
} from "lucide-react";
import { PDFDocument } from "pdf-lib";

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  preview: string;
}

export default function MergePage() {
  const [files, setFiles] = React.useState<PDFFile[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [resultBlob, setResultBlob] = React.useState<Blob | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    const newFiles: PDFFile[] = [];
    
    for (const file of pdfFiles) {
      const pageCount = await getPageCount(file);
      newFiles.push({
        id: generateId(),
        file,
        name: file.name,
        size: file.size,
        pageCount,
        preview: URL.createObjectURL(file),
      });
    }
    setFiles((prev) => [...prev, ...newFiles]);
    setError(null);
  }, []);

  const { getRootProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: true,
  });

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
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

  const handleMerge = async () => {
    if (files.length < 2) return;

    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const mergedPdf = await PDFDocument.create();

      for (let i = 0; i < files.length; i++) {
        setProgress(Math.round((i / files.length) * 80));
        
        const file = files[i];
        const pdfBytes = await file.file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      setProgress(90);
      const pdfBytes = await mergedPdf.save({ useObjectStreams: true });
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      setResultBlob(blob);
      saveProcessedPDF({
        file: files[0].file,
        name: `merged-${files.length}-files.pdf`,
        size: pdfBytes.length,
        pageCount: mergedPdf.getPageCount(),
        blob,
        tool: "Merge PDF",
      });
    } catch (err) {
      setError("Failed to merge PDFs. Please try again.");
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
      a.download = "merged.pdf";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const totalPages = files.reduce((acc, f) => acc + f.pageCount, 0);
  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Hidden file input always available for "Add More Files" */}
        <input
          id="merge-file-input"
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={async (e) => {
            const files = Array.from((e.target as HTMLInputElement).files || []);
            if (files.length > 0) {
              await onDrop(files);
              (e.target as HTMLInputElement).value = "";
            }
          }}
        />

        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <a href="/tools"><ChevronLeft className="h-4 w-4 mr-1" /> Back to Tools</a>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Merge PDF</h1>
          <p className="text-muted-foreground mt-1">Combine multiple PDFs into one document. Drag to reorder files.</p>
        </div>

        {files.length === 0 ? (
          <UploadZone onDrop={onDrop} getRootProps={getRootProps} isDragActive={isDragActive} />
        ) : (
          <>
            <FileList
              files={files}
              onRemove={removeFile}
              onMove={moveFile}
              totalPages={totalPages}
              totalSize={totalSize}
            />
            <div className="mt-6 flex justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFiles([]);
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Replace All Files
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  document.getElementById("merge-file-input")?.click();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add More Files
              </Button>
            </div>
            <ActionBar
              processing={processing}
              progress={progress}
              onMerge={handleMerge}
              onDownload={downloadPdf}
              resultBlob={resultBlob}
              disabled={files.length < 2}
              error={error}
              filesCount={files.length}
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

function UploadZone({ onDrop, getRootProps, isDragActive }: {
  onDrop: (files: File[]) => void;
  getRootProps: () => React.HTMLAttributes<HTMLDivElement>;
  isDragActive: boolean;
}) {
  return (
    <Card className={cn("relative overflow-hidden transition-all duration-300", isDragActive && "border-primary/50 bg-primary/5")}>
      <div {...getRootProps()} className="relative">
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileText className="h-10 w-10" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">
            {isDragActive ? "Drop PDFs here" : "Drag & drop PDF files"}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Select 2 or more PDF files to merge. You can reorder them after uploading.
          </p>
          <Button size="lg" variant="outline" className="w-full max-w-xs" onClick={() => document.getElementById("merge-file-input")?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Browse Files
          </Button>
        </div>
      </div>
    </Card>
  );
}

function FileList({ files, onRemove, onMove, totalPages, totalSize }: {
  files: PDFFile[];
  onRemove: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  totalPages: number;
  totalSize: number;
}) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Files to merge ({files.length})</CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{totalPages} pages total</span>
            <span>{formatFileSize(totalSize)}</span>
            <Badge variant="outline">{files.length} files</Badge>
          </div>
        </div>
        <CardDescription>Drag to reorder • Click to remove</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {files.map((file, index) => (
            <div key={file.id} className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-muted/30 group">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{file.pageCount} pages • {formatFileSize(file.size)}</p>
              </div>
              <div className="flex items-center gap-1">
                {index > 0 && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onMove(file.id, "up")}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}
                {index < files.length - 1 && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onMove(file.id, "down")}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive" onClick={() => onRemove(file.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ActionBar({ processing, progress, onMerge, onDownload, resultBlob, disabled, error, filesCount }: {
  processing: boolean;
  progress: number;
  onMerge: () => void;
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
              <span className="font-medium">Merging PDFs...</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-muted-foreground text-center">
              {progress < 30 && "Reading PDFs..."}
              {progress >= 30 && progress < 70 && "Combining pages..."}
              {progress >= 70 && progress < 100 && "Finalizing PDF..."}
              {progress === 100 && "Done!"}
            </p>
          </div>
        ) : resultBlob ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <p className="font-semibold text-green-600 dark:text-green-400">PDFs merged successfully!</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(resultBlob.size)} • {filesCount} files combined</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button size="lg" onClick={onDownload} className="flex-1 gap-2">
                <Download className="h-4 w-4" />
                Download Merged PDF
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.reload()} className="flex-1">
                Merge More
              </Button>
            </div>
          </div>
        ) : (
          <Button size="lg" onClick={onMerge} disabled={disabled} className="w-full gap-2">
            <FileText className="h-4 w-4" />
            Merge {filesCount} PDFs
          </Button>
        )}
      </CardContent>
    </Card>
  );
}