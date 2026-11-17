import { Metadata } from "next";
import PageClient from "./page.client";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Free Online PDF Tools - Merge, Split, Compress & Convert | FluxPDF",
  description: "Free online PDF tools to merge, split, compress, convert, rotate and edit PDF files. Fast, secure and privacy-focused PDF processing with FluxPDF.",
  alternates: {
    canonical: `${siteConfig.url}/tools`,
  },
  openGraph: {
    title: "Free Online PDF Tools - Merge, Split, Compress & Convert | FluxPDF",
    description: "Free online PDF tools to merge, split, compress, convert, rotate and edit PDF files. Fast, secure and privacy-focused PDF processing.",
    url: `${siteConfig.url}/tools`,
    type: "website",
    images: [
      {
        url: `${siteConfig.url}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: "Free Online PDF Tools - FluxPDF",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online PDF Tools - Merge, Split, Compress & Convert | FluxPDF",
    description: "Free online PDF tools to merge, split, compress, convert, rotate and edit PDF files.",
    images: [`${siteConfig.url}/opengraph-image.png`],
  },
};

export default function ToolsPage() {
  return <PageClient />;
}
