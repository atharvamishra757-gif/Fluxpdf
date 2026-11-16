import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navigation } from "@/components/navigation/navigation";
import { Logo } from "@/components/navigation/logo";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FluxPDF - Everything you need to work with PDFs",
  description: "Convert, edit, organize, protect and understand your documents — all from one powerful workspace. 30+ free PDF tools.",
  keywords: ["PDF", "converter", "editor", "merge", "split", "compress", "sign", "OCR", "AI"],
  authors: [{ name: "FluxPDF" }],
  creator: "FluxPDF",
  publisher: "FluxPDF",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fluxpdf.com",
    title: "FluxPDF - Everything you need to work with PDFs",
    description: "Convert, edit, organize, protect and understand your documents — all from one powerful workspace.",
    siteName: "FluxPDF",
  },
  twitter: {
    card: "summary_large_image",
    title: "FluxPDF - Everything you need to work with PDFs",
    description: "Convert, edit, organize, protect and understand your documents — all from one powerful workspace.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0e" },
  ],
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