"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ScanLine, FileImage, Camera, AlertTriangle } from "lucide-react";
import { formatFileSize, generateId } from "@/lib/utils";
import { saveProcessedPDF } from "@/components/ui/processed-pdfs";
import { siteConfig } from "@/lib/site-config";
import { PDFDocument } from "pdf-lib";

export const metadata = {
  title: "Scan to PDF Online - Camera to PDF | FluxPDF",
  description: "Scan to PDF online for free. Capture images with your camera and convert to PDF. Fast, secure client-side scanning.",
  alternates: {
    canonical: `${siteConfig.url}/tools/scan`,
  },
  openGraph: {
    title: "Scan to PDF Online - Camera to PDF | FluxPDF",
    description: "Scan to PDF online for free. Capture images with your camera and convert to PDF.",
    url: `${siteConfig.url}/tools/scan`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "Scan to PDF Online | FluxPDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Scan to PDF Online - Camera to PDF | FluxPDF",
    description: "Scan to PDF online for free. Capture images with your camera and convert to PDF.",
    images: [`${siteConfig.url}/opengraph-image.png`],
  },
};

export default function ScanPage() {
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [photo, setPhoto] = React.useState<string | null>(null);
  const [photos, setPhotos] = React.useState<string[]>([]);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [processing, setProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [resultBlob, setResultBlob] = React.useState<Blob | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      setStream(mediaStream);
      setCameraError(null);
    } catch (err) {
      setCameraError("Camera access denied or camera not available. Please upload an image instead.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!stream) return;
    const video = document.createElement("video");
    video.srcObject = stream;
    video.play();
    
    video.onloadedmetadata = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setPhoto(dataUrl);
        stopCamera();
      }
    };
  };

  const addPhoto = () => {
    if (photo) {
      setPhotos((prev) => [...prev, photo]);
      setPhoto(null);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const createPdf = async () => {
    if (photos.length === 0) return;

    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const pdfDoc = await PDFDocument.create();
      
      for (let i = 0; i < photos.length; i++) {
        setProgress(Math.round((i / photos.length) * 80));
        
        const imageResponse = await fetch(photos[i]);
        const imageBlob = await imageResponse.blob();
        const imageBytes = await imageBlob.arrayBuffer();
        
        const jpgImage = await pdfDoc.embedJpg(imageBytes);
        const page = pdfDoc.addPage([jpgImage.width, jpgImage.height]);
        page.drawImage(jpgImage, {
          x: 0,
          y: 0,
          width: jpgImage.width,
          height: jpgImage.height,
        });
      }
      
      setProgress(100);
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      setResultBlob(blob);
      saveProcessedPDF({
        file: new File([new Uint8Array(pdfBytes)], "scanned-document.pdf", { type: "application/pdf" }),
        name: `scanned-document.pdf`,
        size: pdfBytes.byteLength,
        pageCount: pdfDoc.getPageCount(),
        blob,
        tool: "Scan to PDF",
      });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = "scanned-document.pdf";
      a.click();
      URL.revokeObjectURL(url);
      
      setProcessing(false);
      setPhotos([]);
    } catch (err) {
      setError("Failed to create PDF from scanned images.");
      console.error(err);
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4"><a href="/tools"><ChevronLeft className="h-4 w-4 mr-1" />Back</a></Button>
          <h1 className="text-3xl font-bold tracking-tight">Scan to PDF</h1>
          <p className="text-muted-foreground mt-1">Capture images with your camera and convert to PDF.</p>
        </div>

        {cameraError && (
          <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-400">{cameraError}</p>
              </div>
            </div>
          </div>
        )}

        {stream ? (
          <Card className="mt-6">
            <CardContent className="p-0">
              <div className="relative w-full aspect-[3/4] bg-black rounded-xl overflow-hidden">
                <video
                  autoPlay
                  playsInline
                  muted
                  ref={(el) => {
                    if (el) {
                      el.srcObject = stream;
                      el.play();
                    }
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button 
                    onClick={capturePhoto} 
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-xl"
                  >
                    <Camera className="h-8 w-8" />
                  </Button>
                </div>
                <Button
                  onClick={stopCamera}
                  className="absolute top-4 right-4 variant-outline bg-white/20 backdrop-blur text-white"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
              <div className="p-4 flex justify-between items-center border-t">
                <Button variant="outline" size="sm" onClick={startCamera} disabled={!!stream}>
                  Retake
                </Button>
                <Button 
                  onClick={addPhoto} 
                  disabled={!photo}
                  className="flex items-center gap-2"
                >
                  <FileImage className="h-4 w-4" />
                  Add to PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : photo && !stream ? (
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="relative aspect-[3/4] bg-black rounded-xl overflow-hidden mb-4">
                <img src={photo} alt="Captured photo" className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => startCamera()} size="sm">
                  Retake
                </Button>
                <Button onClick={addPhoto} className="flex-1">
                  Add to PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center py-16 px-8 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Camera className="h-10 w-10" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Scan documents with your camera</h3>
              <p className="text-muted-foreground mb-6">Capture pages and convert them to a single PDF.</p>
              <Button size="lg" onClick={startCamera} disabled={Boolean(stream)}>
                <Camera className="h-4 w-4 mr-2" />
                {stream ? "Stop Camera" : "Start Camera"}
              </Button>
            </CardContent>
          </Card>
        )}

        {photos.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Captured Pages ({photos.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid gap-2 p-4">
                {photos.map((photo, i) => (
                  <div key={i} className="relative aspect-[3/4] rounded-lg overflow-hidden border">
                    <img src={photo} alt={`Page ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/80 transition-colors"
                    >
                      <span className="text-[10px]">×</span>
                    </button>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPhotos([])}>
                  Clear All
                </Button>
                <Button onClick={createPdf} disabled={processing} className="bg-primary text-primary-foreground">
                  {processing ? <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-transparent border-t-current" /><span>Creating PDF...</span></span> : "Create PDF"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!stream && !photo && photos.length === 0 && (
          <div className="mt-6 p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Note:</span> Camera access requires HTTPS in production. For local development, camera access works on http://localhost.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
