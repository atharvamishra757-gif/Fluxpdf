"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Logo } from "./logo";
import { tools, categories, getToolsByCategory, type ToolCategory } from "@/lib/tools";
import { Menu, LayoutDashboard, ChevronDown, Search, FileText } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { getStoredPDFs } from "@/components/ui/processed-pdfs";

const categoryOrder: ToolCategory[] = ["organize", "optimize", "convert", "edit", "scan"];

function NavDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-brand transition-colors">
          Tools
          <ChevronDown className="h-3 w-3 transition-transform" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80 p-0 border border-border shadow-lg">
        <DropdownMenuLabel className="px-4 py-3">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            PDF Tools
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />
        <div className="grid gap-1">
          {categoryOrder.map((category) => {
            const cat = categories[category];
            const catTools = getToolsByCategory(category);
            return (
              <div key={category}>
                <DropdownMenuLabel className="px-4 py-2 text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <cat.icon className="h-3 w-3 text-brand" />
                  {cat.name}
                </DropdownMenuLabel>
                <div className="grid gap-1">
                  {catTools.slice(0, 3).map((tool) => (
                    <DropdownMenuItem
                      key={tool.id}
                      asChild
                      className="px-4 py-2 text-sm flex items-start gap-3"
                    >
                      <Link
                        href={tool.href}
                        className="flex items-start gap-3 w-full"
                      >
                        <tool.icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{tool.name}</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  {catTools.length > 3 && (
                    <DropdownMenuItem
                      asChild
                      className="px-4 py-2 text-xs text-muted-foreground flex items-center gap-2"
                    >
                      <Link href={`/tools?category=${category}`} className="flex items-center gap-2 w-full">
                        View all {catTools.length} tools
                        <ChevronDown className="h-3 w-3" />
                      </Link>
                    </DropdownMenuItem>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const [pdfCount, setPdfCount] = React.useState(0);

  React.useEffect(() => {
    setPdfCount(getStoredPDFs().length);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center" aria-label="FluxPDF Home">
            <Logo size="md" />
          </Link>
          <NavDropdown />
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/tools"
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-brand transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>Search tools</span>
          </Link>

          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === "/dashboard"
                ? "bg-brand text-brand-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-accent-foreground"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <Link
            href="/tools/processed"
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === "/tools/processed"
                ? "bg-brand text-brand-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-accent-foreground"
            )}
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Processed PDFs</span>
            {pdfCount > 0 && (
              <span className="h-5 w-5 rounded-full bg-brand text-brand-foreground text-[10px] leading-none flex items-center justify-center">
                {pdfCount}
              </span>
            )}
          </Link>

          <ThemeToggle />

          <Button asChild className="px-4 py-2 text-sm font-medium">
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
