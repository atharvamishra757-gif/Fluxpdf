import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About FluxPDF - Free Online PDF Tools",
  description: "Learn about FluxPDF - the free online PDF platform. Simple, fast, and privacy-focused PDF tools for everyone.",
  alternates: {
    canonical: `${siteConfig.url}/about`,
  },
  openGraph: {
    title: "About FluxPDF - Free Online PDF Tools",
    description: "Learn about FluxPDF - the free online PDF platform.",
    url: `${siteConfig.url}/about`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "About FluxPDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About FluxPDF - Free Online PDF Tools",
    description: "Learn about FluxPDF - the free online PDF platform.",
    images: [`${siteConfig.url}/opengraph-image.png`],
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/">← Back to Home</Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">About FluxPDF</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Everything you need to work with PDFs.
          </p>
        </div>

        <div className="space-y-8">
          <div className="prose prose-lg text-muted-foreground max-w-none">
            <p>
              FluxPDF is a free, all-in-one PDF platform built for anyone who needs to work with PDFs.
              Whether you need to merge multiple documents, compress a large file, convert pages to images,
              or add a signature — FluxPDF makes it simple, fast, and private.
            </p>
            <p>
              Unlike many online PDF tools that require you to upload your files to a remote server,
              FluxPDF processes most operations directly in your browser. This means your documents
              never leave your computer, keeping your sensitive information private and secure.
            </p>
            <p>
              Our mission is to make PDF tools accessible to everyone — no registration, no
              subscriptions, and no hidden fees. Just open your browser and start working.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Key Features</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-brand">✓</span>
                <span>Completely free — no subscriptions or hidden fees</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand">✓</span>
                <span>Client-side processing — your files stay on your device</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand">✓</span>
                <span>No registration required — start using immediately</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand">✓</span>
                <span>Works on any device with a web browser</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand">✓</span>
                <span>18+ PDF tools in one place</span>
              </li>
            </ul>
          </div>

          <div className="flex justify-center pt-8">
            <Button variant="default" asChild className="px-8 py-3">
              <Link href="/tools">Start Using FluxPDF</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
