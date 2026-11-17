"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ClipboardList } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: "Fill PDF Forms Online - Fill Interactive PDF Forms | FluxPDF",
  description: "Fill PDF forms online for free. Fill interactive PDF form fields. Fast, secure client-side PDF form filling.",
  alternates: {
    canonical: `${siteConfig.url}/tools/fill-forms`,
  },
  openGraph: {
    title: "Fill PDF Forms Online - Fill Interactive PDF Forms | FluxPDF",
    description: "Fill PDF forms online for free. Fill interactive PDF form fields.",
    url: `${siteConfig.url}/tools/fill-forms`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "Fill PDF Forms Online | FluxPDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fill PDF Forms Online - Fill Interactive PDF Forms | FluxPDF",
    description: "Fill PDF forms online for free.",
    images: [`${siteConfig.url}/opengraph-image.png`],
  },
};

export default function FillFormsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4"><a href="/tools"><ChevronLeft className="h-4 w-4 mr-1" />Back</a></Button>
          <h1 className="text-3xl font-bold tracking-tight">Fill PDF Forms</h1>
          <p className="text-muted-foreground mt-1">Fill interactive PDF form fields.</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center py-16 px-8 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ClipboardList className="h-10 w-10" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Form filling</h3>
            <p className="text-muted-foreground mb-6">Upload a PDF with interactive form fields to fill them in.</p>
            <Button variant="outline" asChild><a href="/tools">Back to Tools</a></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
