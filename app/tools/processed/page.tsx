import { Metadata } from "next";
import PageClient from "./page.client";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Processed PDFs - FluxPDF",
  description: "View and download your processed PDFs. Your processed documents are stored locally in your browser.",
  alternates: {
    canonical: `${siteConfig.url}/tools/processed`,
  },
  openGraph: {
    title: "Processed PDFs - FluxPDF",
    description: "View and download your processed PDFs.",
    url: `${siteConfig.url}/tools/processed`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "Processed PDFs | FluxPDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Processed PDFs - FluxPDF",
    description: "View and download your processed PDFs.",
    images: [`${siteConfig.url}/opengraph-image.png`],
  },
};

export default function ProcessedPDFsPage() {
  return (
    <>
      <meta name="robots" content="noindex" />
      <PageClient />
    </>
  );
}
