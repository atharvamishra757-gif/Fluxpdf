import { Metadata } from "next";
import PageClient from "./page.client";
import { siteConfig } from "@/lib/site-config";
import { StructuredData } from "@/components/ui/structured-data";

export const metadata: Metadata = {
  title: "Crop PDF Online - Crop Pages Interactively | FluxPDF",
  description: "Crop PDF pages online for free. Crop pages with interactive selection. Fast, secure client-side PDF cropping.",
  alternates: {
    canonical: `${siteConfig.url}/tools/crop`,
  },
  openGraph: {
    title: "Crop PDF Online - Crop Pages Interactively | FluxPDF",
    description: "Crop PDF pages online for free. Crop pages with interactive selection.",
    url: `${siteConfig.url}/tools/crop`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "Crop PDF Online | FluxPDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Crop PDF Online - Crop Pages Interactively | FluxPDF",
    description: "Crop PDF pages online for free. Crop pages with interactive selection.",
    images: [`${siteConfig.url}/opengraph-image.png`],
  },
};

export default function CropPage() {
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Crop PDF Online - Crop Pages Interactively | FluxPDF",
          "applicationCategory": "WebApplication",
          "applicationSubCategory": "DocumentManagement",
          "operatingSystem": "Any",
          "url": `${siteConfig.url}/tools/crop`,
          "description": "Crop PDF pages online for free. Crop pages with interactive selection.",
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
              "name": "Crop PDF",
              "item": `${siteConfig.url}/tools/crop`,
            },
          ],
        }}
      />
      <PageClient />
    </>
  );
}
