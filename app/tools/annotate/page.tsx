import { Metadata } from "next";
import PageClient from "./page.client";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Annotate PDF Online - Highlight & Annotate | FluxPDF",
  description: "Annotate PDF online for free. Highlight, underline, and add comments to your PDF documents. Fast, secure client-side PDF annotation.",
  alternates: {
    canonical: `${siteConfig.url}/tools/annotate`,
  },
  openGraph: {
    title: "Annotate PDF Online - Highlight & Annotate | FluxPDF",
    description: "Annotate PDF online for free. Highlight, underline, and add comments to your PDF documents.",
    url: `${siteConfig.url}/tools/annotate`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "Annotate PDF Online | FluxPDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Annotate PDF Online - Highlight & Annotate | FluxPDF",
    description: "Annotate PDF online for free. Highlight, underline, and add comments.",
    images: [`${siteConfig.url}/opengraph-image.png`],
  },
};

export default function AnnotatePage() {
  return <PageClient />;
}
