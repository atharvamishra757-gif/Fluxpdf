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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatFileSize, generateId } from "@/lib/utils";
import { saveProcessedPDF } from "@/components/ui/processed-pdfs";
import { 
  FileText, Upload, X, CheckCircle, Download, 
  ChevronLeft, PenTool, Signature, MousePointer
} from "lucide-react";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
}

export default function SignPage() {
  const [file, setFile] = React.useState<PDFFile | null>(null);
  const [processing, setProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [resultBlob, setResultBlob] = React.useState<Blob | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  
  const [signatureType, setSignatureType] = React.useState<"draw" | "type" | "upload">("type");
  const [typedSignature, setTypedSignature] = React.useState("John Smith");
  const [signatureImage, setSignatureImage] = React.useState<string | null>(null);
  const [x, setX] = React.useState(100);
  const [y, setY] = React.useState(100);
  const [page, setPage] = React.useState(1);
  const [scale, setScale] = React.useState(0.5);

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
      setResultBlob(null);
      setPage(Math.min(1, pageCount));
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
  };

  const handleSign = async () => {
    if (!file) return;

    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const pdfBytes = await file.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      setProgress(30);
      
      const targetPage = pdfDoc.getPage(page - 1);
      const { width, height } = targetPage.getSize();
      
      if (signatureType === "type" && typedSignature) {
        const fontSize = 30 * scale;
        const textWidth = helvetica.widthOfTextAtSize(typedSignature, fontSize);
        targetPage.drawText(typedSignature, {
          x: x,
          y: height - y - fontSize,
          size: fontSize,
          font: helvetica,
          color: rgb(0, 0, 0),
        });
      }
      
      setProgress(90);
      const signedBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([new Uint8Array(signedBytes)], { type: "application/pdf" });
      setResultBlob(blob);
      saveProcessedPDF({
        file: file.file,
        name: `signed-${file.name}`,
        size: signedBytes.length,
        pageCount: file.pageCount,
        blob,
        tool: "Sign PDF",
      });
      setProgress(100);
    } catch (err) {
      setError("Failed to sign PDF. Please try again.");
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
      a.download = "signed.pdf";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <a href="/tools"><ChevronLeft className="h-4 w-4 mr-1" /> Back to Tools</a>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Sign PDF</h1>
          <p className="text-muted-foreground mt-1">Add signatures to your PDF documents.</p>
        </div>

        {!file ? (
          <UploadZone onDrop={onDrop} getRootProps={getRootProps} getInputProps={getInputProps} isDragActive={isDragActive} />
        ) : (
          <>
            <FileInfoCard file={file} onRemove={removeFile} />
            <SignatureOptionsCard
              signatureType={signatureType}
              setSignatureType={setSignatureType}
              typedSignature={typedSignature}
              setTypedSignature={setTypedSignature}
              x={x}
              setX={setX}
              y={y}
              setY={setY}
              page={page}
              setPage={setPage}
              scale={scale}
              setScale={setScale}
              totalPages={file.pageCount}
            />
            <ActionBar
              processing={processing}
              progress={progress}
              onSign={handleSign}
              onDownload={downloadPdf}
              resultBlob={resultBlob}
              disabled={!file}
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

function UploadZone({ onDrop, getRootProps, getInputProps, isDragActive }: any) {
  return (
    <Card className={cn("relative overflow-hidden transition-all duration-300", isDragActive && "border-primary/50 bg-primary/5")}>
      <div {...getRootProps()} className="relative">
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PenTool className="h-10 w-10" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">
            {isDragActive ? "Drop PDF here" : "Drag & drop a PDF file"}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Select a PDF file to add a signature.
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

function SignatureOptionsCard({ 
  signatureType, setSignatureType, typedSignature, setTypedSignature,
  x, setX, y, setY, page, setPage, scale, setScale, totalPages
}: any) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Signature className="h-5 w-5" />
          Signature Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={signatureType} onValueChange={(v) => setSignatureType(v as any)} className="space-y-6">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="type">Type</TabsTrigger>
            <TabsTrigger value="draw">Draw</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>
          
          <TabsContent value="type" className="space-y-4">
            <div>
              <Label>Signature Text</Label>
              <Input value={typedSignature} onChange={(e) => setTypedSignature(e.target.value)} placeholder="Enter your name" />
            </div>
          </TabsContent>
          
          <TabsContent value="draw" className="space-y-4">
            <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground">
              <MousePointer className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Drawing signature (not implemented - basic preview)</p>
            </div>
          </TabsContent>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground">
              <Upload className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Upload signature image (not implemented - basic preview)</p>
            </div>
          </TabsContent>
          
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>X Position</Label>
              <Input type="number" value={x} onChange={(e) => setX(parseInt(e.target.value))} min="0" />
            </div>
            <div>
              <Label>Y Position</Label>
              <Input type="number" value={y} onChange={(e) => setY(parseInt(e.target.value))} min="0" />
            </div>
            <div>
              <Label>Page</Label>
              <Input type="number" value={page} onChange={(e) => setPage(parseInt(e.target.value))} min="1" max={totalPages} />
            </div>
          </div>
          <div>
            <Label>Scale: {scale}</Label>
            <input type="range" min="0.1" max="2" step="0.1" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="w-full h-2 bg-secondary rounded-lg appearance-none accent-primary" />
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function ActionBar({ processing, progress, onSign, onDownload, resultBlob, disabled, error }: any) {
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
              <span className="font-medium">Adding signature...</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-muted-foreground text-center">
              {progress < 30 && "Reading PDF..."}
              {progress >= 30 && progress < 70 && "Adding signature..."}
              {progress >= 70 && progress < 100 && "Finalizing..."}
              {progress === 100 && "Done!"}
            </p>
          </div>
        ) : resultBlob ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <p className="font-semibold text-green-600 dark:text-green-400">Signature added successfully!</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(resultBlob.size)}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button size="lg" onClick={onDownload} className="flex-1 gap-2">
                <Download className="h-4 w-4" />
                Download Signed PDF
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.reload()} className="flex-1">
                Sign Another
              </Button>
            </div>
          </div>
        ) : (
          <Button size="lg" onClick={onSign} disabled={disabled} className="w-full gap-2">
            <PenTool className="h-4 w-4" />
            Add Signature
          </Button>
        )}
      </CardContent>
    </Card>
  );
}