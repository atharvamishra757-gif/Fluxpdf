import { Metadata } from "next";
import PageClient from "./page.client";
import { siteConfig } from "@/lib/site-config";
import { StructuredData } from "@/components/ui/structured-data";

export const metadata: Metadata = {
  title: "Compress PDF Online - Reduce File Size | FluxPDF",
  description: "Compress PDF files online for free. Reduce PDF file size while maintaining quality. Fast, secure client-side PDF compression.",
  alternates: {
    canonical: `${siteConfig.url}/tools/compress`,
  },
  openGraph: {
    title: "Compress PDF Online - Reduce File Size | FluxPDF",
    description: "Compress PDF files online for free. Reduce PDF file size while maintaining quality.",
    url: `${siteConfig.url}/tools/compress`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "Compress PDF Online | FluxPDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compress PDF Online - Reduce File Size | FluxPDF",
    description: "Compress PDF files online for free. Reduce PDF file size while maintaining quality.",
    images: [`${siteConfig.url}/opengraph-image.png`],
  },
};

export default function CompressPage() {
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Compress PDF Online - Reduce File Size | FluxPDF",
          "applicationCategory": "WebApplication",
          "applicationSubCategory": "DocumentManagement",
          "operatingSystem": "Any",
          "url": `${siteConfig.url}/tools/compress`,
          "description": "Compress PDF files online for free. Reduce PDF file size while maintaining quality.",
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
              "name": "Compress PDF",
              "item": `${siteConfig.url}/tools/compress`,
            },
          ],
        }}
      />
      <PageClient />
    </>
  );
}
