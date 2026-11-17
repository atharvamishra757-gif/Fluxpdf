import { Metadata } from "next";
import PageClient from "./page.client";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Fill PDF Forms Online - Fill Interactive PDF Forms | FluxPDF",
  description: "Fill PDF forms online for free. Fill interactive PDF form fields. Fast, secure client-side PDF form filling.",
  alternates: {
    canonical: `${siteConfig.url}/tools/fill-forms`,
  },
  openGraph: {
    title: "Fill PDF Forms Online - Fill Interactive PDF Forms | FluxPDF",
    description: "Fill PDF forms online for free. Fill interactive PDF form fields.",
    url: `${siteConfig.url}/tools/fill-forms`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "Fill PDF Forms Online | FluxPDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fill PDF Forms Online - Fill Interactive PDF Forms | FluxPDF",
    description: "Fill PDF forms online for free.",
    images: [`${siteConfig.url}/opengraph-image.png`],
  },
};

export default function FillFormsPage() {
  return <PageClient />;
}
