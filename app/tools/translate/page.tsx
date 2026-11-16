"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatFileSize, generateId } from "@/lib/utils";
import { extractTextFromPdf } from "@/lib/extract-text";
import {
  FileText, Upload, X, CheckCircle, Download, ChevronLeft, Languages,
  ArrowRight, Loader2
} from "lucide-react";
import { PDFDocument } from "pdf-lib";

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
}

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "nl", name: "Dutch" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese (Simplified)" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
];

export default function TranslatePage() {
  const [file, setFile] = React.useState<PDFFile | null>(null);
  const [text, setText] = React.useState("");
  const [extracting, setExtracting] = React.useState(false);
  const [targetLanguage, setTargetLanguage] = React.useState("es");
  const [processing, setProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [result, setResult] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    const pdfFile = acceptedFiles.find(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    if (pdfFile) {
      setError(null);
      setResult("");
      setText("");

      try {
        const pdfBytes = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        setFile({
          id: generateId(),
          file: pdfFile,
          name: pdfFile.name,
          size: pdfFile.size,
          pageCount: pdfDoc.getPageCount(),
        });
      } catch {
        setFile({
          id: generateId(),
          file: pdfFile,
          name: pdfFile.name,
          size: pdfFile.size,
          pageCount: 0,
        });
      }

      setExtracting(true);
      try {
        const content = await extractTextFromPdf(pdfFile);
        if (!content) {
          setError("No readable text found in this PDF. It may be scanned or image-only. You can paste the text manually below.");
        } else {
          setText(content);
        }
      } catch (err) {
        console.error("Text extraction failed:", err);
        setError("Failed to extract text automatically. You can paste the text manually below.");
      } finally {
        setExtracting(false);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const handleTranslate = async () => {
    if (!text.trim()) return;

    setProcessing(true);
    setProgress(20);
    setError(null);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "translate",
          text,
          language: targetLanguage,
        }),
      });

      setProgress(70);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Translation failed");
      }

      setResult(data.result || "");
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to translate.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = () => {
    if (result) {
      const lang = LANGUAGES.find((l) => l.code === targetLanguage)?.name || targetLanguage;
      const blob = new Blob([result], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `translation-${lang}-${file?.name.replace(/\.pdf$/i, "")}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <a href="/tools"><ChevronLeft className="h-4 w-4 mr-1" />Back</a>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">AI Translate PDF</h1>
          <p className="text-muted-foreground mt-1">
            Translate PDF documents between languages using AI.
          </p>
        </div>

        {!file ? (
          <Card>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <div className="flex flex-col items-center py-16 px-8 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Languages className="h-10 w-10" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  Upload a PDF to translate
                </h3>
                <p className="text-muted-foreground mb-6">
                  AI will translate your document to the selected language.
                </p>
                <Button size="lg" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />Browse Files
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
                  <Button variant="ghost" size="icon" onClick={() => { setFile(null); setText(""); setResult(""); }}>
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
                    <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{file.pageCount} pages</span>
                      <span>{formatFileSize(file.size)}</span>
                      {extracting ? (
                        <span className="flex items-center text-xs text-primary animate-pulse">
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Extracting text...
                        </span>
                      ) : text ? (
                        <span className="flex items-center text-xs text-green-600 dark:text-green-400">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Text extracted
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardContent className="p-0">
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Source text</Label>
                    <Textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={6}
                      placeholder="Extracted text from PDF will appear here, or you can paste text..."
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Target language</Label>
                    <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {error && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                      {error}
                    </div>
                  )}

                  {processing ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Translating...</span>
                        <span className="text-sm text-muted-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-3" />
                    </div>
                  ) : result ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            Translation ready
                          </span>
                        </div>
                        <Button size="sm" onClick={downloadResult}>
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </Button>
                      </div>
                      <div className="p-4 rounded-lg border bg-muted/50">
                        <Textarea value={result} readOnly rows={8} className="font-sans text-sm leading-relaxed" />
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={handleTranslate}
                      disabled={!text.trim() || extracting || processing}
                      className="w-full gap-2"
                    >
                      {processing ? (
                        <div className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-transparent border-t-current" />
                          <span>Translating...</span>
                        </div>
                      ) : extracting ? (
                        <div className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-transparent border-t-current" />
                          <span>Extracting text from PDF...</span>
                        </div>
                      ) : (
                        <>
                          <Languages className="h-4 w-4" />
                          Translate
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
