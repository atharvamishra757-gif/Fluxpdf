"use client";

import * as React from "react";
import { Download, FileText, ChevronRight, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ProcessedPDF {
  id: string;
  name: string;
  size: number;
  pageCount: number;
  blobData: string; // base64 string
  createdAt: number;
  tool: string;
}

const STORAGE_KEY = "fluxpdf_processed_pdfs";
const MAX_PDFS = 10;

export function getStoredPDFs(): ProcessedPDF[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return data.map((item: any) => ({
      ...item,
      blob: new Blob([item.blobData], { type: "application/pdf" }),
    }));
  } catch {
    return [];
  }
}

export function saveProcessedPDF(pdf: {
  file: File;
  name: string;
  size: number;
  pageCount: number;
  blob: Blob;
  tool: string;
}) {
  if (typeof window === "undefined") return;
  try {
    const existing = getStoredPDFs();
    const newPDF: ProcessedPDF = {
      id: crypto.randomUUID(),
      name: pdf.name,
      size: pdf.size,
      pageCount: pdf.pageCount,
      blobData: "",
      createdAt: Date.now(),
      tool: pdf.tool,
    };
    // Read blob as base64
    const reader = new FileReader();
    reader.readAsDataURL(pdf.blob);
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(",")[1]; // Remove data URL prefix
      const updated = [newPDF, ...existing].slice(0, MAX_PDFS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.map(p => ({
        ...p,
        blobData: p.id === newPDF.id ? base64Data : p.blobData,
      }))));
    };
  } catch (e) {
    console.error("Failed to save PDF:", e);
  }
}

export function deleteProcessedPDF(id: string) {
  if (typeof window === "undefined") return;
  try {
    const existing = getStoredPDFs();
    const updated = existing.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to delete PDF:", e);
  }
}

export function clearAllPDFs() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear PDFs:", e);
  }
}

export function ProcessedPDFsPanel() {
  const [pdfs, setPDFs] = React.useState<ProcessedPDF[]>([]);

  React.useEffect(() => {
    setPDFs(getStoredPDFs());
  }, []);

  const handleDownload = (pdf: ProcessedPDF) => {
    const blob = new Blob([pdf.blobData], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = pdf.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = (id: string) => {
    deleteProcessedPDF(id);
    setPDFs(getStoredPDFs());
  };

  const handleClearAll = () => {
    clearAllPDFs();
    setPDFs([]);
  };

  if (pdfs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 text-muted-foreground mb-4">
          <FileText className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold">No processed PDFs yet</h3>
        <p className="text-sm text-muted-foreground">
          Process a PDF to see it here. You can download or preview your processed documents.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Processed PDFs</h3>
        <Button variant="outline" size="sm" onClick={handleClearAll} disabled={pdfs.length === 0}>
          Clear All
        </Button>
      </div>
      <div className="space-y-3">
        {pdfs.map((pdf) => (
          <Card key={pdf.id} className="border border-border/60 hover:border-indigo-400 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{pdf.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{pdf.pageCount} pages</span>
                      <span>•</span>
                      <span>{(pdf.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(pdf)}
                    className="gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(pdf.id)}
                    className="p-1.5 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function useProcessedPDFs() {
  return {
    getPDFs: getStoredPDFs,
    savePDF: saveProcessedPDF,
    deletePDF: deleteProcessedPDF,
    clearPDFs: clearAllPDFs,
  };
}
