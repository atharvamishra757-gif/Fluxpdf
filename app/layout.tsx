import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navigation } from "@/components/navigation/navigation";
import { Logo } from "@/components/navigation/logo";
import { Toaster } from "@/components/ui/toaster";
import { siteConfig } from "@/lib/site-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    template: "%s | FluxPDF",
    default: "FluxPDF - Everything you need to work with PDFs",
  },
  description: siteConfig.description,
  keywords: [
    "PDF",
    "PDF converter",
    "PDF editor",
    "merge PDF",
    "split PDF",
    "compress PDF",
    "PDF sign",
    "PDF unlock",
    "PDF watermark",
    "PDF page numbers",
    "PDF to JPG",
    "JPG to PDF",
    "online PDF tools",
    "free PDF tools",
  ],
  authors: [{ name: "FluxPDF", url: siteConfig.url }],
  creator: "FluxPDF",
  publisher: "FluxPDF",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: "FluxPDF - Everything you need to work with PDFs",
    description: siteConfig.description,
    siteName: "FluxPDF",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "FluxPDF - Everything you need to work with PDFs",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FluxPDF - Everything you need to work with PDFs",
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0e" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <Navigation />
          <main className="flex-1">{children}</main>
          <Toaster />
          <footer className="border-t border-border/70 bg-card/40">
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-10 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
              <Logo size="sm" />
              <p className="text-sm text-muted-foreground">
                Everything you need to work with PDFs.
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}