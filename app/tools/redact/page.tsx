import { Metadata } from "next";
import PageClient from "./page.client";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Redact PDF Online - Remove Sensitive Information | FluxPDF",
  description: "Redact PDF online for free. Permanently remove sensitive information from your PDF documents. Fast, secure client-side PDF redaction.",
  alternates: {
    canonical: `${siteConfig.url}/tools/redact`,
  },
  openGraph: {
    title: "Redact PDF Online - Remove Sensitive Information | FluxPDF",
    description: "Redact PDF online for free. Permanently remove sensitive information from your PDF documents.",
    url: `${siteConfig.url}/tools/redact`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "Redact PDF Online | FluxPDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Redact PDF Online - Remove Sensitive Information | FluxPDF",
    description: "Redact PDF online for free. Permanently remove sensitive information from your PDF documents.",
    images: [`${siteConfig.url}/opengraph-image.png`],
  },
};

export default function RedactPage() {
  return <PageClient />;
}
