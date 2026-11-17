import { Metadata } from "next";
import PageClient from "./page.client";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Rotate PDF Online - Rotate Pages | FluxPDF",
  description: "Rotate PDF pages online for free. Rotate pages 90°, 180°, or 270°. Fast, secure client-side PDF rotation.",
  alternates: {
    canonical: `${siteConfig.url}/tools/rotate`,
  },
  openGraph: {
    title: "Rotate PDF Online - Rotate Pages | FluxPDF",
    description: "Rotate PDF pages online for free. Rotate pages 90°, 180°, or 270°.",
    url: `${siteConfig.url}/tools/rotate`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "Rotate PDF Online | FluxPDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rotate PDF Online - Rotate Pages | FluxPDF",
    description: "Rotate PDF pages online for free.",
    images: [`${siteConfig.url}/opengraph-image.png`],
  },
};

export default function RotatePage() {
  return <PageClient />;
}
