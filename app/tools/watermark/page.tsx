import { Metadata } from "next";
import PageClient from "./page.client";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Watermark PDF Online - Add Watermark | FluxPDF",
  description: "Add watermark to PDF online for free. Add text or image watermarks to PDF pages. Fast, secure client-side PDF watermarking.",
  alternates: {
    canonical: `${siteConfig.url}/tools/watermark`,
  },
  openGraph: {
    title: "Watermark PDF Online - Add Watermark | FluxPDF",
    description: "Add watermark to PDF online for free. Add text or image watermarks to PDF pages.",
    url: `${siteConfig.url}/tools/watermark`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "Watermark PDF Online | FluxPDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Watermark PDF Online - Add Watermark | FluxPDF",
    description: "Add watermark to PDF online for free.",
    images: [`${siteConfig.url}/opengraph-image.png`],
  },
};

export default function WatermarkPage() {
  return <PageClient />;
}
