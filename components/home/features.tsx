"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronRightIcon,
  ZapIcon,
  ShieldIcon,
  SparklesIcon,
  FileTextIcon,
  UsersIcon,
  ClockIcon,
  PenToolIcon,
  ArchiveIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

const featureGrid = [
  {
    icon: ZapIcon,
    title: "Lightning fast",
    description: "Processing happens locally in your browser — no uploads, no waiting.",
    href: "/tools/compress",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  {
    icon: ShieldIcon,
    title: "Privacy first",
    description: "Your documents never leave your device unless you choose server-side AI features.",
    href: "/tools/protect",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: SparklesIcon,
    title: "AI powered",
    description: "Chat with PDFs, summarize, translate, and extract with intelligent tools.",
    href: "/tools/chat-pdf",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    icon: FileTextIcon,
    title: "Edit & annotate",
    description: "Highlight, redact, sign, and fill forms directly in the browser.",
    href: "/tools/edit",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: UsersIcon,
    title: "Collaborate",
    description: "Share documents with your team and work together in real time.",
    href: "/dashboard",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
  {
    icon: ClockIcon,
    title: "Organize pages",
    description: "Merge, split, rotate, reorder, and delete pages with drag-and-drop ease.",
    href: "/tools/organize",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="mb-6 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
            Everything you need to work with PDFs
          </h2>
          <p className="text-lg text-muted-foreground">
            From simple conversions to AI-powered document intelligence, FluxPDF handles it all.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featureGrid.map((feature) => (
            <div key={feature.title} className="card-premium p-6 hover:border-brand/40 transition-all duration-300 group">
              <Link href={feature.href} className="block">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 text-white group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{feature.description}</p>
                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-brand">
                  <span>Learn more</span>
                  <ChevronRightIcon className="h-3 w-3" />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ToolCategoryCard({
  category,
  icon: Icon,
  tools,
}: {
  category: { name: string; description: string; icon: React.ComponentType<{ className?: string }> };
  icon: React.ComponentType<{ className?: string }>;
  tools: Array<{ id: string; name: string; description: string; icon: React.ComponentType<{ className?: string }>; href: string; badge?: string }>;
}) {
  return (
    <div className="card-premium p-6 hover:border-brand/40 transition-colors group">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand/10 text-brand">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-semibold">{category.name}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
      <div className="space-y-2">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}
            className="flex items-center gap-2.5 p-2 rounded-md hover:bg-secondary transition-colors"
          >
            <tool.icon className="h-4 w-4 text-muted-foreground group-hover:text-brand flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{tool.name}</p>
            </div>
            <ChevronRightIcon className="h-3 w-3 text-muted-foreground group-hover:text-brand transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
