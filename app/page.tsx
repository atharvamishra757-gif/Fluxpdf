import { Metadata } from "next";
import { Footer } from "@/components/home/footer";
import { Hero } from "@/components/home/hero";
import { ToolsShowcase, PopularTools } from "@/components/home/tools-showcase";
import { FeaturesSection } from "@/components/home/features";
import { PricingSection } from "@/components/home/pricing";
import { FAQSection } from "@/components/home/faq";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Free Online PDF Tools – Merge, Split, Compress & Convert | FluxPDF",
  description: "Free online PDF tools to merge, split, compress, convert, rotate and edit PDF files. Fast, secure and privacy-focused PDF processing with FluxPDF.",
  alternates: {
    canonical: `${siteConfig.url}`,
  },
  openGraph: {
    title: "Free Online PDF Tools – Merge, Split, Compress & Convert | FluxPDF",
    description: "Free online PDF tools to merge, split, compress, convert, rotate and edit PDF files. Fast, secure and privacy-focused PDF processing with FluxPDF.",
    url: siteConfig.url,
    type: "website",
    siteName: "FluxPDF",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "FluxPDF - Free Online PDF Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online PDF Tools – Merge, Split, Compress & Convert | FluxPDF",
    description: "Free online PDF tools to merge, split, compress, convert, rotate and edit PDF files.",
    images: [siteConfig.ogImage],
  },
};

export default function HomePage() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "FluxPDF",
    "url": siteConfig.url,
    "description": siteConfig.description,
    "applicationCategory": "WebApplication",
    "applicationSubCategory": "DocumentManagement",
    "operatingSystem": "Any",
    "browserRequirements": "Modern web browser with JavaScript enabled",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
    },
    "author": {
      "@type": "Organization",
      "name": "FluxPDF",
      "url": siteConfig.url,
    },
    "publisher": {
      "@type": "Organization",
      "name": "FluxPDF",
      "url": siteConfig.url,
      "logo": `${siteConfig.url}/logo.png`,
    },
    "sameAs": [
      process.env.NEXT_PUBLIC_TWITTER_URL || "https://twitter.com/fluxpdf",
      process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/atharva/fluxpdf",
      process.env.NEXT_PUBLIC_LINKEDIN_URL || "https://linkedin.com/company/fluxpdf",
    ].filter(Boolean),
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "FluxPDF",
    "url": siteConfig.url,
    "logo": `${siteConfig.url}/logo.png`,
    "sameAs": [
      process.env.NEXT_PUBLIC_TWITTER_URL || "https://twitter.com/fluxpdf",
      process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/atharva/fluxpdf",
      process.env.NEXT_PUBLIC_LINKEDIN_URL || "https://linkedin.com/company/fluxpdf",
    ].filter(Boolean),
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "",
      "contactType": "customer service",
      "email": "hello@fluxpdf-delta.vercel.app",
      "availableLanguage": ["en"],
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is FluxPDF free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, FluxPDF is completely free to use. All PDF tools are available without registration, subscriptions, or hidden fees.",
        },
      },
      {
        "@type": "Question",
        "name": "How can I merge PDF files online?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Simply upload your PDFs using the Merge PDF tool, arrange them in your desired order, and click Merge. The combined PDF will be ready to download instantly.",
        },
      },
      {
        "@type": "Question",
        "name": "Is it safe to upload PDF files?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Most FluxPDF tools process files directly in your browser using client-side JavaScript. Your documents never leave your device unless you choose to use AI-powered features.",
        },
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <Hero />
        <FeaturesSection />
        <ToolsShowcase />
        <PopularTools />
        <PricingSection />
        <FAQSection />
        <Footer />
        <script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          id="faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </main>
    </div>
  );
}

