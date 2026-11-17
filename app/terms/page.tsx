import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Terms of Service - FluxPDF",
  description: "FluxPDF Terms of Service - Terms and conditions for using our free online PDF tools.",
  alternates: {
    canonical: `${siteConfig.url}/terms`,
  },
  openGraph: {
    title: "Terms of Service - FluxPDF",
    description: "FluxPDF Terms of Service - Terms and conditions for using our free online PDF tools.",
    url: `${siteConfig.url}/terms`,
    type: "website",
    images: [{ url: `${siteConfig.url}/opengraph-image.png`, width: 1200, height: 630, alt: "FluxPDF Terms of Service" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service - FluxPDF",
    description: "FluxPDF Terms of Service - Terms and conditions for using our free online PDF tools.",
    images: [`${siteConfig.url}/opengraph-image.png`],
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/">← Back to Home</Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last updated: October 2024</p>
        </div>

        <div className="prose prose-lg text-muted-foreground max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using FluxPDF ("we", "us", "our"), you agree to these Terms of Service. If you do not
            agree, you may not use our services.
          </p>

          <h2>2. Use of Service</h2>
          <p>
            FluxPDF provides free online PDF tools. You may use these tools for lawful purposes only. You agree not to
            use the service for any illegal purpose or in any way that could damage, disable, overburden, or impair our
            servers.
          </p>

          <h2>3. User Content</h2>
          <p>
            You retain all rights to any documents you upload or process using our tools. We do not claim ownership of
            your content. Files processed through client-side tools remain on your device and are not stored on our
            servers.
          </p>

          <h2>4. AI Features</h2>
          <p>
            Some features use third-party AI services. By using these features, you agree to the terms of service of
            the respective AI providers. We do not guarantee the accuracy of AI-generated content.
          </p>

          <h2>5. Disclaimer of Warranties</h2>
          <p>
            FluxPDF is provided on an "as is" and "as available" basis. We make no warranties, express or implied,
            regarding the accuracy, reliability, or completeness of our services.
          </p>

          <h2>6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, FluxPDF shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages arising from your use of our service.
          </p>

          <h2>7. Termination</h2>
          <p>
            We reserve the right to terminate or suspend your access to our service at any time, without notice, for
            any reason.
          </p>

          <h2>8. Changes to Terms</h2>
          <p>
            We may update these Terms of Service from time to time. We will notify you of any changes by posting the
            new terms on this page.
          </p>

          <h2>9. Governing Law</h2>
          <p>
            These terms are governed by and construed in accordance with the laws of the jurisdiction in which FluxPDF
            operates.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions about these Terms, please contact us at hello@fluxpdf-delta.vercel.app.
          </p>
        </div>
      </div>
    </div>
  );
}
