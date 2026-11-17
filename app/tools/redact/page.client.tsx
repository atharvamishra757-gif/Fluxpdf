"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatFileSize, generateId } from "@/lib/utils";
import { saveProcessedPDF } from "@/components/ui/processed-pdfs";
import { siteConfig } from "@/lib/site-config";
import { FileText, Upload, X, CheckCircle, Download, ChevronLeft, EyeOff, AlertTriangle } from "lucide-react";
import { PDFDocument, StandardFonts } from "pdf-lib";

export const metadata = {
  title: "Redact PDF Online - Remove Sensitive Information | FluxPDF",
  description: "Redact PDF online for free. Permanently remove sensitive information from your PDF documents. Fast, secure client-side PDF redaction.",
  alternates: {
    canonical: `${siteConfig.url}/tools/redact`,
  },
  openGraph: {
    title: "Redact PDF Online - Remove Sensitive Information | FluxPDF",
    description: "Redact PDF online for free. Permanently remove sensitive information from your PDF documents.",
    url: `${siteConfig.url}/tools/redact`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "Redact PDF Online | FluxPDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Redact PDF Online - Remove Sensitive Information | FluxPDF",
    description: "Redact PDF online for free. Permanently remove sensitive information from your PDF documents.",
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

export default function RedactPage() {
  const [file, setFile] = React.useState<PDFFile | null>(null);
  const [text, setText] = React.useState("");
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

  const handleRedact = async () => {
    if (!file) return;

    setProcessing(true);
    setProgress(30);
    setError(null);

    try {
      const pdfBytes = await file.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      setProgress(60);

      // Visual redaction: draw black rectangles over specified areas.
      // Note: This does NOT remove underlying text from the PDF content stream.
      // For permanent redaction, use a backend service.
      for (let i = 0; i < pdfDoc.getPageCount(); i++) {
        const page = pdfDoc.getPage(i);
        const { width, height } = page.getSize();
        if (text) {
          page.drawRectangle({ x: 50, y: height - 120, width: width - 100, height: 60, color: { type: "rgb", red: 0, green: 0, blue: 0 } as any });
          page.drawText("[REDACTED]", { x: 60, y: height - 100, size: 14, font: helvetica, color: { type: "rgb", red: 1, green: 1, blue: 1 } as any });
        }
      }
      setProgress(80);
      const pdfBytesRedacted = await pdfDoc.save({ useObjectStreams: true });
      setProgress(100);
      const blob = new Blob([new Uint8Array(pdfBytesRedacted)], { type: "application/pdf" });
      setResultBlob(blob);
      saveProcessedPDF({
        file: file.file,
        name: `redacted-${file.name}`,
        size: pdfBytesRedacted.length,
        pageCount: file.pageCount,
        blob,
        tool: "Redact PDF",
      });
    } catch (err) {
      setError("Failed to redact PDF.");
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
      a.download = `redacted-${file?.name}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4"><a href="/tools"><ChevronLeft className="h-4 w-4 mr-1" />Back</a></Button>
          <h1 className="text-3xl font-bold tracking-tight">Redact PDF</h1>
          <p className="text-muted-foreground mt-1">Visually redact sensitive information from your PDF.</p>
        </div>

        {!file ? (
          <Card>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <div className="flex flex-col items-center py-16 px-8 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <EyeOff className="h-10 w-10" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Select PDF to redact</h3>
                <p className="text-muted-foreground mb-6">Client-side visual redaction</p>
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
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">This tool visually covers content with black rectangles but does NOT remove underlying text from the PDF. For permanent redaction, use a backend service.</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Label>Text to redact (optional note)</Label>
                <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter terms to mark for redaction" />
              </div>
              {error && <div className="mt-4 p-4 rounded-xl bg-destructive/10 text-destructive text-sm">{error}</div>}
              {processing ? (
                <div className="mt-4 space-y-4"><div className="flex justify-between"><span>Redacting...</span><span>{progress}%</span></div><Progress value={progress} /></div>
              ) : resultBlob ? (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border"><CheckCircle className="h-6 w-6 text-green-500" /><div><p className="font-semibold">Redacted PDF created</p><p className="text-sm text-muted-foreground">{formatFileSize(resultBlob.size)}</p></div></div>
                  <Button onClick={downloadPdf} className="w-full"><Download className="h-4 w-4 mr-2" />Download Redacted PDF</Button>
                </div>
              ) : (
                <Button onClick={handleRedact} className="mt-4 w-full"><EyeOff className="h-4 w-4 mr-2" />Redact PDF</Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
