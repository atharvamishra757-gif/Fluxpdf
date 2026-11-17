"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChevronRightIcon,
  ArrowRightIcon,
  SparklesIcon,
  ZapIcon,
  FileTextIcon,
  ArchiveIcon,
  ShieldIcon,
} from "@/components/ui/icons";

const features = [
  {
    icon: ZapIcon,
    title: "Lightning fast",
    description: "Processing happens locally in your browser — no uploads, no waiting.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  {
    icon: ShieldIcon,
    title: "Privacy first",
    description: "Your documents never leave your device unless you choose server-side AI features.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: SparklesIcon,
    title: "AI powered",
    description: "Chat with PDFs, summarize, translate, and extract with intelligent tools.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 lg:py-40">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] bg-indigo-500/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[15%] -right-[10%] w-[50vw] h-[50vw] bg-purple-600/20 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] left-[25%] w-[40vw] h-[40vw] bg-pink-500/10 blur-[100px] rounded-full" style={{ animationDelay: "-2s" }} />
        <div className="absolute bottom-[20%] left-[20%] w-[30vw] h-[30vw] bg-orange-500/15 blur-[80px] rounded-full" style={{ animationDelay: "-4s" }} />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 text-[11px] font-medium uppercase tracking-wider mb-8 backdrop-blur-sm">
            <SparklesIcon className="h-3 w-3" />
            FluxPDF — Everything you need to work with PDFs
          </div>
<h1 className="mb-6 text-4xl font-bold tracking-[-0.02em] sm:text-6xl leading-[1.1]">
  Free Online PDF Tools
</h1>
<p className="mb-10 text-lg text-muted-foreground sm:text-xl max-w-xl mx-auto leading-relaxed">
  Merge, split, compress, convert, rotate and edit PDF files. Fast, secure and privacy-free PDF processing.
</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button size="lg" className="w-full sm:w-auto gap-2 btn-premium bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30" asChild>
              <Link href="/fix-document">
                Fix My Document
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto btn-premium" asChild>
              <Link href="/tools">
                Browse All Tools
                <ChevronRightIcon className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <span className="text-[10px] font-bold">100%</span>
              </div>
              <span>Client-side processing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-purple-500/10 flex items-center justify-center text-purple-500">
                <span className="text-[10px] font-bold">🔒</span>
              </div>
              <span>Privacy-first</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-orange-500/10 flex items-center justify-center text-orange-500">
                <span className="text-[10px] font-bold">⚡</span>
              </div>
              <span>Instant preview</span>
            </div>
          </div>
        </div>

        <div className="relative mt-16">
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10 pointer-events-none" />
          <DocumentWorkspacePreview />
        </div>
      </div>
    </section>
  );
}

function DocumentWorkspacePreview() {
  const [floatOffset, setFloatOffset] = React.useState(0);

  React.useEffect(() => {
    const start = Date.now();
    const animation = setInterval(() => {
      const elapsed = Date.now() - start;
      setFloatOffset((elapsed / 20) % 360);
    }, 30);
    return () => clearInterval(animation);
  }, []);

  const documents = [
    { x: 12, y: 22, rotation: -4, color: "bg-indigo-500/25", icon: FileTextIcon },
    { x: 68, y: 18, rotation: 3, color: "bg-emerald-500/25", icon: FileTextIcon },
    { x: 38, y: 65, rotation: -2, color: "bg-purple-500/25", icon: FileTextIcon },
    { x: 78, y: 58, rotation: 1, color: "bg-orange-500/25", icon: FileTextIcon },
  ];

  return (
    <div className="relative aspect-[4/3] max-w-4xl mx-auto rounded-[2rem] border border-border/60 bg-gradient-to-br from-background/90 to-muted/30 overflow-hidden shadow-2xl shadow-indigo-500/10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-indigo-500/10 via-transparent to-transparent" />
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

      {documents.map((doc, index) => (
        <DocumentCard
          key={index}
          {...doc}
          floatOffset={floatOffset + index * 90}
          delay={index * 200}
        />
      ))}

      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between p-5 bg-background/80 backdrop-blur-md rounded-[1.5rem] border border-border/60 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <FileTextIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">FluxPDF Workspace</p>
            <p className="text-xs text-muted-foreground">Drag & drop documents here</p>
          </div>
        </div>
        <Button size="sm" variant="outline" className="btn-prepress gap-1">
          <FileTextIcon className="h-3.5 w-3.5" />
          New Document
        </Button>
      </div>
    </div>
  );
}

function DocumentCard({
  x,
  y,
  rotation,
  color,
  icon: Icon,
  floatOffset,
  delay,
}: {
  x: number;
  y: number;
  rotation: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  floatOffset: number;
  delay: number;
}) {
  const floatY = Math.sin((floatOffset * Math.PI) / 180) * 10;
  const floatX = Math.cos((floatOffset * Math.PI) / 180) * 5;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) translate(${floatX}px, ${floatY}px)`,
        transition: "transform 0.1s linear",
      }}
    >
      <div className={cn("relative w-36 h-44 rounded-2xl border border-border/50 bg-white/85 dark:bg-gray-800/80 backdrop-blur-md shadow-xl", color)}>
        <div className="absolute top-3 left-3 right-3 flex justify-between px-3">
          <span className="text-[8px] font-medium text-muted-foreground">PDF</span>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center pt-6">
          <Icon className="h-12 w-12 text-muted-foreground/40" />
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-2 py-2 bg-background/90 backdrop-blur rounded-lg border border-border/30">
          <span className="text-xs font-medium truncate text-foreground">Document.pdf</span>
          <span className="text-xs text-muted-foreground">12 pages</span>
        </div>
      </div>
      <div className="absolute -bottom-3 -left-3 w-4 h-4 rounded-full bg-indigo-500/30 blur-xl" />
    </div>
  );
}
