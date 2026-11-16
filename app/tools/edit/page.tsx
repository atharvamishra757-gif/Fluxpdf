"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatFileSize, generateId } from "@/lib/utils";
import { saveProcessedPDF } from "@/components/ui/processed-pdfs";
import { FileText, Upload, ChevronLeft, Edit3, ExternalLink, X, AlertTriangle } from "lucide-react";
import { PDFDocument } from "pdf-lib";

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
}

export default function EditPdfPage() {
  const [file, setFile] = React.useState<PDFFile | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    const pdfFile = acceptedFiles.find((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (pdfFile) {
      try {
        const pdfBytes = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        setFile({ id: generateId(), file: pdfFile, name: pdfFile.name, size: pdfFile.size, pageCount: pdfDoc.getPageCount() });
        setError(null);
      } catch {
        setFile({ id: generateId(), file: pdfFile, name: pdfFile.name, size: pdfFile.size, pageCount: 0 });
        setError("Could not read PDF structure.");
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const openEditor = () => {
    if (file) {
      // Store file as a blob URL in sessionStorage for the editor
      file.file.arrayBuffer().then(bytes => {
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        sessionStorage.setItem("fluxpdf-editing", JSON.stringify({ name: file.name, size: file.size, url }));
        window.location.href = "/editor";
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4"><a href="/tools"><ChevronLeft className="h-4 w-4 mr-1" />Back</a></Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit PDF</h1>
          <p className="text-muted-foreground mt-1">Open your PDF in the full editor to add text, images, annotations, and signatures.</p>
        </div>

        {!file ? (
          <Card>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <div className="flex flex-col items-center py-16 px-8 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Edit3 className="h-10 w-10" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Select PDF to edit</h3>
                <p className="text-muted-foreground mb-6">Opens in the full PDF editor</p>
                <Button size="lg" variant="outline"><Upload className="h-4 w-4 mr-2" />Browse</Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Selected File</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => { setFile(null); setError(null); }}><X className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 rounded-xl border">
                <div className="flex h-16 w-12 items-center justify-center rounded-lg border"><FileText className="h-8 w-8 text-muted-foreground" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{file.name}</p>
                  <div className="flex gap-4 mt-1 text-sm text-muted-foreground"><span>{file.pageCount} pages</span><span>{formatFileSize(file.size)}</span></div>
                </div>
              </div>
              {error && <div className="mt-4 p-4 rounded-xl bg-destructive/10 text-destructive text-sm">{error}</div>}
              <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                    <Edit3 className="h-3 w-3" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-400">Full PDF Editor</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Add text, images, annotations, signatures, watermarks, and more.</p>
                  </div>
                </div>
              </div>
              <Button onClick={openEditor} className="mt-4 w-full"><ExternalLink className="h-4 w-4 mr-2" />Open in Editor</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
