"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import { tools, categories, getToolsByCategory, searchTools, type ToolCategory, type Tool } from "@/lib/tools";
import {
  Grid, Gauge, RefreshCw, Pen, Camera,
  Search, X, ChevronRight
} from "lucide-react";

const categoryOrder: ToolCategory[] = ["organize", "optimize", "convert", "edit", "scan"];

const categoryIcons: Record<ToolCategory, React.ComponentType<{ className?: string }>> = {
  organize: Grid,
  optimize: Gauge,
  convert: RefreshCw,
  edit: Pen,
  scan: Camera,
};

function ToolsPageContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") as ToolCategory | null;
  const [query, setQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<ToolCategory | "all">(initialCategory || "all");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  const filteredTools = React.useMemo(() => {
    let result = tools;

    if (selectedCategory !== "all") {
      result = result.filter((tool) => tool.category === selectedCategory);
    }

    if (debouncedQuery) {
      result = searchTools(debouncedQuery);
      if (selectedCategory !== "all") {
        result = result.filter((tool) => tool.category === selectedCategory);
      }
    }

    return result;
  }, [selectedCategory, debouncedQuery]);

  const handleCategoryChange = (category: ToolCategory | "all") => {
    setSelectedCategory(category);
    setQuery("");
  };

  const hasActiveFilters = selectedCategory !== "all" || debouncedQuery;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">All PDF Tools</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Professional PDF tools organized into 6 categories. Find the right tool for your document workflow.
          </p>
        </div>

        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search PDF tools..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectSeparator />
                {categoryOrder.map((category) => {
                  const cat = categories[category];
                  return (
                    <SelectItem key={category} value={category}>
                      {cat.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={() => { setQuery(""); setSelectedCategory("all"); }}>
                <X className="h-4 w-4 mr-1" />
                Clear filters
              </Button>
            )}
          </div>
        </div>

        {selectedCategory !== "all" && (
          <div className="mb-10 flex items-center gap-3 p-4 rounded-xl bg-muted/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {(() => {
                const Icon = categoryIcons[selectedCategory];
                return <Icon className="h-5 w-5" />;
              })()}
            </div>
            <div>
              <h2 className="font-semibold">{categories[selectedCategory].name}</h2>
              <p className="text-sm text-muted-foreground">{categories[selectedCategory].description}</p>
            </div>
          </div>
        )}

        {selectedCategory === "all" ? (
          <div className="space-y-8">
            {categoryOrder.map((category) => {
              const cat = categories[category];
              const catTools = getToolsByCategory(category);
              const Icon = categoryIcons[category];

              return (
                <CategorySection
                  key={category}
                  category={category}
                  cat={cat}
                  catTools={catTools}
                  Icon={Icon}
                />
              );
            })}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}

        {selectedCategory === "all" && filteredTools.length === 0 && (
          <div className="mt-12 flex flex-col items-center justify-center gap-4 rounded-2xl border border-border/50 bg-muted/30 p-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-xl font-semibold">No tools found</h3>
            <p className="text-muted-foreground">Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CategorySection({ category, cat, catTools, Icon }: {
  category: ToolCategory;
  cat: { name: string; description: string };
  catTools: Tool[];
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted/10 overflow-hidden">
      <CardHeader className="pb-3 pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{cat.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{cat.description}</p>
            </div>
          </div>
          <Link
            href={`/tools?category=${category}`}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View all {catTools.length} tools
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {catTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} compact />
          ))}
        </div>
      </CardContent>
    </div>
  );
}

function ToolCard({ tool, compact = false }: { tool: typeof tools[0]; compact?: boolean }) {
  const statusColors = {
    full: "text-green-600 dark:text-green-400",
    partial: "text-amber-600 dark:text-amber-400",
    backend: "text-blue-600 dark:text-blue-400",
  };

  const statusLabels = {
    full: "Implemented",
    partial: "Partial",
    backend: "Requires backend",
  };

  return (
    <Card className={cn("group overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/20", compact ? "h-full" : "")}>
      <CardContent className={cn("p-5", compact ? "p-4" : "")}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <tool.icon className={cn("h-5 w-5", compact ? "h-4 w-4" : "")} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className={cn("font-semibold", compact ? "text-base" : "text-lg")}>{tool.name}</h3>
              {tool.badge && (
                <Badge
                  variant={
                    tool.badge === "AI" ? "ai" :
                    tool.badge === "Popular" ? "popular" :
                    tool.badge === "New" ? "new" :
                    tool.badge === "Beta" ? "beta" :
                    "outline"
                  }
                  className="text-xs"
                >
                  {tool.badge}
                </Badge>
              )}
            </div>
            <p className={cn("text-sm text-muted-foreground mb-3 line-clamp-2", compact ? "text-xs" : "")}>
              {tool.description}
            </p>
            <div className="flex items-center gap-3">
              <span className={cn("text-xs font-medium flex items-center gap-1", statusColors[tool.status])}>
                <span className="relative flex h-1.5 w-1.5 rounded-full" />
                {statusLabels[tool.status]}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={cn("mt-2 gap-1 h-8 px-3 opacity-0 group-hover:opacity-100 transition-opacity w-full justify-center", compact ? "mt-1 h-7 px-2 text-xs" : "")}
            >
              <Link href={tool.href}>
                Open Tool
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ToolsPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading tools...</div>}>
      <ToolsPageContent />
    </React.Suspense>
  );
}
