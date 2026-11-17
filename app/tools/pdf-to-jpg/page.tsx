import { Metadata } from "next";
import PageClient from "./page.client";
import { siteConfig } from "@/lib/site-config";
import { StructuredData } from "@/components/ui/structured-data";

export const metadata: Metadata = {
  title: "PDF to JPG Online - Convert PDF to Images | FluxPDF",
  description: "Convert PDF pages to high-quality JPG images online for free. Fast, secure client-side PDF to image conversion.",
  alternates: {
    canonical: `${siteConfig.url}/tools/pdf-to-jpg`,
  },
  openGraph: {
    title: "PDF to JPG Online - Convert PDF to Images | FluxPDF",
    description: "Convert PDF pages to high-quality JPG images online for free.",
    url: `${siteConfig.url}/tools/pdf-to-jpg`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "PDF to JPG Online | FluxPDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF to JPG Online - Convert PDF to Images | FluxPDF",
    description: "Convert PDF pages to high-quality JPG images online for free.",
    images: [`${siteConfig.url}/opengraph-image.png`],
  },
};

export default function PdfToJpgPage() {
  return <PageClient />;
}
