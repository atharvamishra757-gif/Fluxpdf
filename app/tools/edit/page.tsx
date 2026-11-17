import { Metadata } from "next";
import PageClient from "./page.client";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Edit PDF Online - Add Text & Images | FluxPDF",
  description: "Edit PDF online for free. Add text and images to your PDF documents. Fast, secure client-side PDF editing.",
  alternates: {
    canonical: `${siteConfig.url}/tools/edit`,
  },
  openGraph: {
    title: "Edit PDF Online - Add Text & Images | FluxPDF",
    description: "Edit PDF online for free. Add text and images to your PDF documents.",
    url: `${siteConfig.url}/tools/edit`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "Edit PDF Online | FluxPDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Edit PDF Online - Add Text & Images | FluxPDF",
    description: "Edit PDF online for free. Add text and images to your PDF documents.",
    images: [`${siteConfig.url}/opengraph-image.png`],
  },
};

export default function EditPage() {
  return <PageClient />;
}
