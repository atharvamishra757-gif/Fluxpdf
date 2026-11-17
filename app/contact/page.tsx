import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/app/components/contact-form";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact FluxPDF - Get in Touch",
  description: "Contact FluxPDF support. Have questions or feedback about our free online PDF tools? We'd love to hear from you.",
  alternates: {
    canonical: `${siteConfig.url}/contact`,
  },
  openGraph: {
    title: "Contact FluxPDF - Get in Touch",
    description: "Contact FluxPDF support. Have questions or feedback about our free online PDF tools?",
    url: `${siteConfig.url}/contact`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "Contact FluxPDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact FluxPDF - Get in Touch",
    description: "Contact FluxPDF support. Have questions or feedback about our free online PDF tools?",
    images: [`${siteConfig.url}/opengraph-image.png`],
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/">← Back to Home</Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Have questions or feedback? We&apos;d love to hear from you.
          </p>
        </div>

        <ContactForm />

        <div className="mt-8 flex flex-col sm:flex-row gap-6 items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <p className="font-medium">hello@fluxpdf-delta.vercel.app</p>
              <p className="text-sm text-muted-foreground">General inquiries & support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
