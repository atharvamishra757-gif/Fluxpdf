"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatFileSize, generateId } from "@/lib/utils";
import { extractTextFromPdf } from "@/lib/extract-text";
import {
  FileText, Upload, X, CheckCircle, Download, ChevronLeft, MessageCircle,
  ArrowRight, Send, Loader2
} from "lucide-react";
import { PDFDocument } from "pdf-lib";

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
}

export default function ChatPdfPage() {
  const [file, setFile] = React.useState<PDFFile | null>(null);
  const [extractedText, setExtractedText] = React.useState("");
  const [extracting, setExtracting] = React.useState(false);
  const [text, setText] = React.useState("");
  const [messages, setMessages] = React.useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    const pdfFile = acceptedFiles.find(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    if (pdfFile) {
      setError(null);
      setMessages([]);
      setExtractedText("");

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
          setError("No readable text found in this PDF. It might be a scanned document or image-only.");
        } else {
          setExtractedText(content);
        }
      } catch (err) {
        console.error("Text extraction failed:", err);
        setError("Failed to extract text from PDF. You can still ask questions, but responses may be inaccurate.");
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

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (!extractedText.trim() && !extracting) {
      setError("No readable text found in this PDF to chat with.");
      return;
    }

    const userMessage = text;
    setText("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    setProcessing(true);
    setProgress(30);
    setError(null);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat-pdf",
          document: extractedText,
          message: userMessage,
        }),
      });

      setProgress(70);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Chat failed");
      }

      const assistantReply = data.result || "No response generated.";
      setMessages((prev) => [...prev, { role: "assistant", content: assistantReply }]);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get response.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <a href="/tools"><ChevronLeft className="h-4 w-4 mr-1" />Back</a>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">AI Chat with PDF</h1>
          <p className="text-muted-foreground mt-1">
            Ask questions about your document using AI.
          </p>
        </div>

        {!file ? (
          <Card>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <div className="flex flex-col items-center py-16 px-8 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MessageCircle className="h-10 w-10" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  Upload a PDF to chat
                </h3>
                <p className="text-muted-foreground mb-6">
                  Ask questions and get answers from your document.
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
                  <Button variant="ghost" size="icon" onClick={() => { setFile(null); setMessages([]); setError(null); setExtractedText(""); }}>
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
                      ) : extractedText ? (
                        <span className="flex items-center text-xs text-green-600 dark:text-green-400">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ready to chat
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardContent className="p-0 flex flex-col h-[600px]">
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 max-w-[85%] ${
                        msg.role === "user" ? "ml-auto flex-col-reverse" : ""
                      }`}
                    >
                      {msg.role === "user" && (
                        <div className="text-xs text-muted-foreground mb-1">You</div>
                      )}
                      <div className={`p-3 rounded-lg ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground dark:bg-gray-800 dark:text-gray-200"
                      }`}>
                        {msg.content}
                      </div>
                      {msg.role === "assistant" && (
                        <div className="text-xs text-muted-foreground mb-1">FluxPDF AI</div>
                      )}
                    </div>
                  ))}
                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                      {error}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t">
                  <form onSubmit={handleChat} className="flex gap-2">
                    <Textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Ask a question about this PDF..."
                      rows={1}
                      className="flex-1 resize-none min-h-[44px] max-h-[120px]"
                    />
                    <Button
                      type="submit"
                      disabled={processing || extracting || !text.trim() || !extractedText.trim()}
                      className="gap-2"
                    >
                      {processing ? (
                        <div className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-transparent border-t-current" />
                          <span className="text-xs">Thinking...</span>
                        </div>
                      ) : extracting ? (
                        <div className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-transparent border-t-current" />
                          <span className="text-xs">Reading PDF...</span>
                        </div>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span className="text-xs">Ask</span>
                        </>
                      )}
                    </Button>
                  </form>
                  {processing && (
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Processing...</span>
                      <Progress value={progress} className="h-1.5 w-1/3" />
                    </div>
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
