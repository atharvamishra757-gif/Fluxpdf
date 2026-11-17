import { Metadata } from "next";
import PageClient from "./page.client";
import { siteConfig } from "@/lib/site-config";
import { StructuredData } from "@/components/ui/structured-data";

export const metadata: Metadata = {
  title: "Split PDF Online - Separate Pages | FluxPDF",
  description: "Split PDF online for free. Separate pages or extract page ranges from a PDF document. Fast, secure client-side PDF splitting.",
  alternates: {
    canonical: `${siteConfig.url}/tools/split`,
  },
  openGraph: {
    title: "Split PDF Online - Separate Pages | FluxPDF",
    description: "Split PDF online for free. Separate pages or extract page ranges from a PDF document.",
    url: `${siteConfig.url}/tools/split`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "Split PDF Online | FluxPDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Split PDF Online - Separate Pages | FluxPDF",
    description: "Split PDF online for free. Separate pages or extract page ranges.",
    images: [`${siteConfig.url}/opengraph-image.png`],
  },
};

export default function SplitPage() {
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Split PDF Online - Separate Pages | FluxPDF",
          "applicationCategory": "WebApplication",
          "applicationSubCategory": "DocumentManagement",
          "operatingSystem": "Any",
          "url": `${siteConfig.url}/tools/split`,
          "description": "Split PDF online for free. Separate pages or extract page ranges from a PDF document.",
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
              "name": "Split PDF",
              "item": `${siteConfig.url}/tools/split`,
            },
          ],
        }}
      />
      <PageClient />
    </>
  );
}
