import { Metadata } from "next";
import PageClient from "./page.client";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Unlock PDF Online - Remove Password Protection | FluxPDF",
  description: "Unlock PDF online for free. Remove password protection from your PDF documents. Fast, secure client-side PDF unlocking.",
  alternates: {
    canonical: `${siteConfig.url}/tools/unlock`,
  },
  openGraph: {
    title: "Unlock PDF Online - Remove Password Protection | FluxPDF",
    description: "Unlock PDF online for free. Remove password protection from your PDF documents.",
    url: `${siteConfig.url}/tools/unlock`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "Unlock PDF Online | FluxPDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Unlock PDF Online - Remove Password Protection | FluxPDF",
    description: "Unlock PDF online for free. Remove password protection from your PDF documents.",
    images: [`${siteConfig.url}/opengraph-image.png`],
  },
};

export default function UnlockPage() {
  return <PageClient />;
}
