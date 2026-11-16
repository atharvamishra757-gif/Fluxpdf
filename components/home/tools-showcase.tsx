"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { tools, categories, getToolsByCategory, getPopularTools, type ToolCategory } from "@/lib/tools";
import {
  GridIcon,
  GaugeIcon,
  RefreshCwIcon,
  PenIcon,
  CameraIcon,
  ArrowRightIcon,
  ChevronRightIcon,
} from "@/components/ui/icons";

const categoryOrder: ToolCategory[] = ["organize", "optimize", "convert", "edit", "scan"];

const categoryIcons: Record<ToolCategory, React.ComponentType<{ className?: string }>> = {
  organize: GridIcon,
  optimize: GaugeIcon,
  convert: RefreshCwIcon,
  edit: PenIcon,
  scan: CameraIcon,
};

const categoryStyles: Record<ToolCategory, { color: string; bg: string; border: string }> = {
  organize: { color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  optimize: { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  convert: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  edit: { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  scan: { color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
};

export function ToolsShowcase() {
  return (
    <section className="py-24 sm:py-28 lg:py-36 stagger-child">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="mb-6 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
            All PDF Tools
          </h2>
          <p className="text-lg text-muted-foreground">
            Simple, fast, and reliable PDF tools for all your needs
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categoryOrder.map((category) => {
            const cat = categories[category];
            const catTools = getToolsByCategory(category);
            const Icon = categoryIcons[category];
            const style = categoryStyles[category];

            return (
              <Card key={category} className="card-premium border border-border/60 hover:border-brand/40 transition-all duration-300 group overflow-hidden relative">
                <CardHeader className="pb-3 pt-5 z-10 relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-md ${style.bg} ${style.color} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold">{cat.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <span>{catTools.length}</span>
                      <span>/ 18 tools</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 z-10 relative">
                  <div className="space-y-2">
                    {catTools.slice(0, 5).map((tool) => (
                      <Link
                        key={tool.id}
                        href={tool.href}
                        className="flex items-center gap-2.5 p-2.5 rounded-md hover:bg-secondary transition-colors group"
                      >
                        <tool.icon className="h-4 w-4 text-muted-foreground group-hover:text-brand flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{tool.name}</p>
                        </div>
                        {tool.badge && (
                          <Badge variant="secondary" className="text-[10px] flex-shrink-0 h-5 px-1.5">
                            {tool.badge}
                          </Badge>
                        )}
                      </Link>
                    ))}
                    {catTools.length > 5 && (
                      <Link
                        href={`/tools?category=${category}`}
                        className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:text-brand transition-colors"
                      >
                        View all {catTools.length} tools
                        <ChevronRightIcon className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-24 text-center">
          <Button size="lg" asChild className="gap-2 btn-premium bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30">
            <Link href="/tools">
              Browse All Tools
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function PopularTools() {
  const popularTools = getPopularTools();

  return (
    <section className="py-24 sm:py-28 lg:py-32 stagger-child">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="mb-6 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
            Most Popular Tools
          </h2>
          <p className="text-lg text-muted-foreground">
            The tools our users rely on every day for their PDF workflows.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {popularTools.slice(0, 8).map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ToolCard({ tool }: { tool: typeof tools[0] }) {
  return (
    <Card className="card-premium border border-border/60 group h-full overflow-hidden transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand group-hover:scale-110 transition-transform duration-300">
            <tool.icon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{tool.name}</h3>
              {tool.badge && (
                <Badge variant="secondary" className="text-[10px] flex-shrink-0 h-6 px-2">
                  {tool.badge}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{tool.description}</p>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-1 h-8 px-3 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Link href={tool.href}>
                Open Tool
                <ArrowRightIcon className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CTASection() {
  return (
    <section className="py-24 sm:py-28 lg:py-36 relative overflow-hidden">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="relative rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-rose-500 p-8 sm:p-12 shadow-lg shadow-indigo-500/30">
          <div className="relative rounded-md bg-background/10 backdrop-blur-md p-8 sm:p-16 border border-white/10">
            <h2 className="mb-4 text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl">
              Ready to Transform Your PDF Workflow?
            </h2>
            <p className="mb-8 text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              Join thousands of professionals who use FluxPDF for all their document needs.
              No registration required. Completely free.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="default" asChild className="gap-2 btn-premium w-full sm:w-auto bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg shadow-indigo-500/30">
                <Link href="/fix-document">
                  Start with Fix My Document
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 text-white hover:bg-white/20 btn-premium w-full sm:w-auto border-white/20" asChild>
                <Link href="/dashboard">Open Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
