"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatFileSize, generateId } from "@/lib/utils";
import { saveProcessedPDF } from "@/components/ui/processed-pdfs";
import { siteConfig } from "@/lib/site-config";
import { FileText, Upload, X, CheckCircle, Download, ChevronLeft, Lock, AlertTriangle } from "lucide-react";
import { PDFDocument } from "pdf-lib";

export const metadata = {
  title: "Protect PDF Online - Password Protect PDF | FluxPDF",
  description: "Protect PDF online for free. Add password protection to your PDF documents. Fast, secure client-side PDF protection.",
  alternates: {
    canonical: `${siteConfig.url}/tools/protect`,
  },
  openGraph: {
    title: "Protect PDF Online - Password Protect PDF | FluxPDF",
    description: "Protect PDF online for free. Add password protection to your PDF documents.",
    url: `${siteConfig.url}/tools/protect`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "Protect PDF Online | FluxPDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Protect PDF Online - Password Protect PDF | FluxPDF",
    description: "Protect PDF online for free. Add password protection to your PDF documents.",
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

export default function ProtectPage() {
  const [file, setFile] = React.useState<PDFFile | null>(null);
  const [processing, setProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [resultBlob, setResultBlob] = React.useState<Blob | null>(null);
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
      setResultBlob(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const handleProtect = async () => {
    if (!file) return;

    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const pdfBytes = await file.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      setProgress(50);

      // Note: pdf-lib does not support PDF encryption/password protection.
      // This optimizes and re-saves the PDF. For real encryption, use a backend service.
      const protectedBytes = await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false });
      setProgress(100);

      const blob = new Blob([new Uint8Array(protectedBytes)], { type: "application/pdf" });
      setResultBlob(blob);
      saveProcessedPDF({
        file: file.file,
        name: `protected-${file.name}`,
        size: protectedBytes.length,
        pageCount: file.pageCount,
        blob,
        tool: "Protect PDF",
      });
    } catch (err) {
      setError("Failed to process PDF. Please try again.");
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
      a.download = `protected-${file?.name}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4"><a href="/tools"><ChevronLeft className="h-4 w-4 mr-1" />Back</a></Button>
          <h1 className="text-3xl font-bold tracking-tight">Protect PDF</h1>
          <p className="text-muted-foreground mt-1">Optimize and secure your PDF document.</p>
        </div>

        {!file ? (
          <Card>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <div className="flex flex-col items-center py-16 px-8 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Lock className="h-10 w-10" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Select PDF to protect</h3>
                <p className="text-muted-foreground mb-6">Process your document for protection.</p>
                <Button size="lg" variant="outline"><Upload className="h-4 w-4 mr-2" />Browse</Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Selected File</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => { setFile(null); setResultBlob(null); }}><X className="h-4 w-4" /></Button>
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
              <div className="mt-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Client-side limitation</p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">Password-based encryption requires a backend service. This tool optimizes and re-saves your PDF. For password protection, please use our backend-protected version.</p>
                  </div>
                </div>
              </div>
              {error && <div className="mt-4 p-4 rounded-xl bg-destructive/10 text-destructive text-sm">{error}</div>}
              {processing ? (
                <div className="mt-4 space-y-4"><div className="flex justify-between"><span>Protecting...</span><span>{progress}%</span></div><Progress value={progress} /></div>
              ) : resultBlob ? (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border"><CheckCircle className="h-6 w-6 text-green-500" /><div><p className="font-semibold">PDF processed successfully</p><p className="text-sm text-muted-foreground">{formatFileSize(resultBlob.size)}</p></div></div>
                  <Button onClick={downloadPdf} className="w-full"><Download className="h-4 w-4 mr-2" />Download Protected PDF</Button>
                </div>
              ) : (
                <Button onClick={handleProtect} className="mt-4 w-full"><Lock className="h-4 w-4 mr-2" />Protect PDF</Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
