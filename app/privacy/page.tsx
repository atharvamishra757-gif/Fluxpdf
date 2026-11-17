import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy - FluxPDF",
  description: "FluxPDF Privacy Policy - Learn how we handle your data and privacy when you use our online PDF tools.",
  alternates: {
    canonical: `${siteConfig.url}/privacy`,
  },
  openGraph: {
    title: "Privacy Policy - FluxPDF",
    description: "FluxPDF Privacy Policy - Learn how we handle your data and privacy.",
    url: `${siteConfig.url}/privacy`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "FluxPDF Privacy Policy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy - FluxPDF",
    description: "FluxPDF Privacy Policy - Learn how we handle your data and privacy.",
    images: [`${siteConfig.url}/opengraph-image.png`],
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/">← Back to Home</Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: October 2024</p>
        </div>

        <div className="prose prose-lg text-muted-foreground max-w-none">
          <h2>Introduction</h2>
          <p>
            FluxPDF ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we
            collect, use, disclose, and protect your information when you use our website and services.
          </p>

          <h2>Client-Side Processing</h2>
          <p>
            Most of FluxPDF&rsquo;s tools operate entirely in your web browser using client-side JavaScript. This means
            your PDF files are processed locally on your device and are never uploaded to our servers. We cannot see,
            access, or store your PDF content unless you explicitly choose to use a server-side feature.
          </p>

          <h2>AI Features</h2>
          <p>
            Some features (such as AI summarization, translation, and chat) may require sending document content to
            third-party AI providers (such as OpenRouter). These features are optional and only process documents you
            explicitly submit for AI processing. By using these features, you consent to your document content being
            sent to the respective AI provider for processing.
          </p>

          <h2>Data We Collect</h2>
          <p>
            We may collect the following types of information:
          </p>
          <ul className="list-disc pl-6 my-4">
            <li>Information you voluntarily provide (such as your email when contacting us)</li>
            <li>Usage data (such as which tools you use, anonymized and aggregated)</li>
            <li>Technical information (such as browser type, IP address, and referring URL)</li>
          </ul>

          <h2>Data Retention</h2>
          <p>
            Processed PDFs generated through our tools are temporarily stored in your browser&rsquo;s local storage.
            They are not stored on our servers. You can delete them at any time using the "Clear All" button in the
            Processed PDFs section.
          </p>

          <h2>Third-Party Services</h2>
          <p>
            We may use third-party services for analytics, error tracking, and hosting. These services may collect
            information as described in their own privacy policies.
          </p>

          <h2>Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal data. To exercise these rights, please
            contact us at hello@fluxpdf-delta.vercel.app.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at hello@fluxpdf-delta.vercel.app.
          </p>
        </div>
      </div>
    </div>
  );
}
