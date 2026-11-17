import { Metadata } from "next";
import PageClient from "./page.client";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
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
  return <PageClient />;
}
