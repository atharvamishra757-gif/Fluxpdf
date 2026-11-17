import { Metadata } from "next";
import PageClient from "./page.client";
import { siteConfig } from "@/lib/site-config";
import { StructuredData } from "@/components/ui/structured-data";

export const metadata: Metadata = {
  title: "Organize PDF Online - Reorder, Delete, Rotate Pages | FluxPDF",
  description: "Organize PDF online for free. Reorder, delete, rotate, and insert pages. Fast, secure client-side PDF organization.",
  alternates: {
    canonical: `${siteConfig.url}/tools/organize`,
  },
  openGraph: {
    title: "Organize PDF Online - Reorder, Delete, Rotate Pages | FluxPDF",
    description: "Organize PDF online for free. Reorder, delete, rotate, and insert pages.",
    url: `${siteConfig.url}/tools/organize`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "Organize PDF Online | FluxPDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Organize PDF Online - Reorder, Delete, Rotate Pages | FluxPDF",
    description: "Organize PDF online for free. Reorder, delete, rotate, and insert pages.",
    images: [`${siteConfig.url}/opengraph-image.png`],
  },
};

export default function OrganizePage() {
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Organize PDF Online - Reorder, Delete, Rotate Pages | FluxPDF",
          "applicationCategory": "WebApplication",
          "applicationSubCategory": "DocumentManagement",
          "operatingSystem": "Any",
          "url": `${siteConfig.url}/tools/organize`,
          "description": "Organize PDF online for free. Reorder, delete, rotate, and insert pages.",
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
              "name": "Organize PDF",
              "item": `${siteConfig.url}/tools/organize`,
            },
          ],
        }}
      />
      <PageClient />
    </>
  );
}
