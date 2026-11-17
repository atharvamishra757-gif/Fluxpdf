import { Metadata } from "next";
import PageClient from "./page.client";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Page Numbers PDF Online - Add Page Numbers | FluxPDF",
  description: "Add page numbers to PDF online for free. Add customizable page numbers to your PDF documents. Fast, secure client-side PDF page numbering.",
  alternates: {
    canonical: `${siteConfig.url}/tools/page-numbers`,
  },
  openGraph: {
    title: "Page Numbers PDF Online - Add Page Numbers | FluxPDF",
    description: "Add page numbers to PDF online for free. Add customizable page numbers to your PDF documents.",
    url: `${siteConfig.url}/tools/page-numbers`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "Page Numbers PDF Online | FluxPDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Page Numbers PDF Online - Add Page Numbers | FluxPDF",
    description: "Add page numbers to PDF online for free.",
    images: [`${siteConfig.url}/opengraph-image.png`],
  },
};

export default function PageNumbersPage() {
  return <PageClient />;
}
