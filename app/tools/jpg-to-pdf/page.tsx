import { Metadata } from "next";
import PageClient from "./page.client";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "JPG to PDF Online - Convert Images to PDF | FluxPDF",
  description: "Convert JPG images to PDF online for free. Create PDF from multiple images. Fast, secure client-side image to PDF conversion.",
  alternates: {
    canonical: `${siteConfig.url}/tools/jpg-to-pdf`,
  },
  openGraph: {
    title: "JPG to PDF Online - Convert Images to PDF | FluxPDF",
    description: "Convert JPG images to PDF online for free. Create PDF from multiple images.",
    url: `${siteConfig.url}/tools/jpg-to-pdf`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "JPG to PDF Online | FluxPDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "JPG to PDF Online - Convert Images to PDF | FluxPDF",
    description: "Convert JPG images to PDF online for free.",
    images: [`${siteConfig.url}/opengraph-image.png`],
  },
};

export default function JpgToPdfPage() {
  return <PageClient />;
}
