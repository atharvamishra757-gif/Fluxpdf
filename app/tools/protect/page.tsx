import { Metadata } from "next";
import PageClient from "./page.client";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Protect PDF Online - Password Protect PDF | FluxPDF",
  description: "Protect PDF online for free. Add password protection to your PDF documents. Fast, secure client-side PDF protection.",
  alternates: {
    canonical: `${siteConfig.url}/tools/protect`,
  },
  openGraph: {
    title: "Protect PDF Online - Password Protect PDF | FluxPDF",
    description: "Protect PDF online for free. Add password protection to your PDF documents.",
    url: `${siteConfig.url}/tools/protect`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "Protect PDF Online | FluxPDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Protect PDF Online - Password Protect PDF | FluxPDF",
    description: "Protect PDF online for free. Add password protection to your PDF documents.",
    images: [`${siteConfig.url}/opengraph-image.png`],
  },
};

export default function ProtectPage() {
  return <PageClient />;
}
