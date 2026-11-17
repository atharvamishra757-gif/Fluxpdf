import { Metadata } from "next";
import PageClient from "./page.client";
import { siteConfig } from "@/lib/site-config";
import { StructuredData } from "@/components/ui/structured-data";

export const metadata: Metadata = {
  title: "Merge PDF Online - Combine Multiple PDFs | FluxPDF",
  description: "Merge PDF online for free. Combine multiple PDFs into one document. Fast, secure client-side PDF merging.",
  alternates: {
    canonical: `${siteConfig.url}/tools/merge`,
  },
  openGraph: {
    title: "Merge PDF Online - Combine Multiple PDFs | FluxPDF",
    description: "Merge PDF online for free. Combine multiple PDFs into one document.",
    url: `${siteConfig.url}/tools/merge`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "Merge PDF Online | FluxPDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Merge PDF Online - Combine Multiple PDFs | FluxPDF",
    description: "Merge PDF online for free. Combine multiple PDFs into one document.",
    images: [`${siteConfig.url}/opengraph-image.png`],
  },
};

export default function MergePage() {
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Merge PDF Online - Combine Multiple PDFs | FluxPDF",
          "applicationCategory": "WebApplication",
          "applicationSubCategory": "DocumentManagement",
          "operatingSystem": "Any",
          "url": `${siteConfig.url}/tools/merge`,
          "description": "Merge PDF online for free. Combine multiple PDFs into one document. Fast, secure client-side PDF merging.",
          "author": {
            "@type": "Organization",
            "name": "FluxPDF",
            "url": siteConfig.url,
          },
          "publisher": {
            "@type": "Organization",
            "name": "FluxPDF",
            "url": siteConfig.url,
          },
        }}
      />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": siteConfig.url,
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Tools",
              "item": `${siteConfig.url}/tools`,
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Merge PDF",
              "item": `${siteConfig.url}/tools/merge`,
            },
          ],
        }}
      />
      <PageClient />
    </>
  );
}
