import { Metadata } from "next";
import PageClient from "./page.client";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Sign PDF Online - Add Electronic Signature | FluxPDF",
  description: "Sign PDF online for free. Add electronic signatures to your PDF documents. Fast, secure client-side PDF signing.",
  alternates: {
    canonical: `${siteConfig.url}/tools/sign`,
  },
  openGraph: {
    title: "Sign PDF Online - Add Electronic Signature | FluxPDF",
    description: "Sign PDF online for free. Add electronic signatures to your PDF documents.",
    url: `${siteConfig.url}/tools/sign`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "Sign PDF Online | FluxPDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign PDF Online - Add Electronic Signature | FluxPDF",
    description: "Sign PDF online for free. Add electronic signatures to your PDF documents.",
    images: [`${siteConfig.url}/opengraph-image.png`],
  },
};

export default function SignPage() {
  return <PageClient />;
}
