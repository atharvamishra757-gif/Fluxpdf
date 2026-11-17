"use client";

import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/navigation/logo";
import { siteConfig } from "@/lib/site-config";

const footerLinks = [
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "Tools", href: "/tools" },
  { name: "Dashboard", href: "/dashboard" },
];

const companyLinks = [
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Privacy", href: "/privacy" },
  { name: "Terms", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 sm:grid-cols-4 md:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <Logo size="md" className="mb-4" />
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              The premium PDF productivity platform for professionals and teams.
            </p>
            <div className="mt-6 flex gap-4">
              <Link href={siteConfig.links.twitter} className="text-sm text-muted-foreground hover:text-brand transition-colors">
                Twitter
              </Link>
              <Link href={siteConfig.links.github} className="text-sm text-muted-foreground hover:text-brand transition-colors">
                GitHub
              </Link>
              <Link href={siteConfig.links.linkedin} className="text-sm text-muted-foreground hover:text-brand transition-colors">
                LinkedIn
              </Link>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Product
            </h3>
            {footerLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-brand transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Company
            </h3>
            {companyLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-brand transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Legal
            </h3>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-brand transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-brand transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
        <div className="mt-12 border-t border-border/40 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 FluxPDF. All rights reserved.
          </p>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <Link href={siteConfig.links.twitter} className="hover:text-brand transition-colors">
              Twitter
            </Link>
            <span className="mx-1">/</span>
            <Link href={siteConfig.links.github} className="hover:text-brand transition-colors">
              GitHub
            </Link>
            <span className="mx-1">/</span>
            <Link href={siteConfig.links.linkedin} className="hover:text-brand transition-colors">
              LinkedIn
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
