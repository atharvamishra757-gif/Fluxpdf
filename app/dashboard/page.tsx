"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { tools, getPopularTools } from "@/lib/tools";
import {
  FileImage, FileText, Pen, Archive, Signature, Grid,
  History, Star, Plus, MoreHorizontal, Clock, Download, Eye, Edit
} from "lucide-react";

const quickActions = [
  { id: "jpg-to-pdf", name: "JPG to PDF", icon: FileImage, description: "Create PDF from images", href: "/tools/jpg-to-pdf", badge: "Popular" },
  { id: "edit", name: "Edit PDF", icon: Pen, description: "Annotate and modify", href: "/editor", badge: "Popular" },
  { id: "merge", name: "Merge PDF", icon: FileText, description: "Combine multiple PDFs", href: "/tools/merge", badge: "Popular" },
  { id: "compress", name: "Compress PDF", icon: Archive, description: "Reduce file size", href: "/tools/compress", badge: "Popular" },
  { id: "sign", name: "Sign PDF", icon: Signature, description: "Add signatures", href: "/tools/sign", badge: "Popular" },
  { id: "organize", name: "Organize PDF", icon: Grid, description: "Reorder pages", href: "/tools/organize" },
];

const recentDocuments = [
  { id: "1", name: "Q4_Financial_Report.pdf", pages: 42, size: 2.4, lastModified: "2 hours ago", thumbnail: null },
  { id: "2", name: "Project_Proposal_v2.pdf", pages: 18, size: 1.1, lastModified: "Yesterday", thumbnail: null },
  { id: "3", name: "Contract_Signed.pdf", pages: 8, size: 0.8, lastModified: "3 days ago", thumbnail: null },
  { id: "4", name: "Presentation_Slides.pdf", pages: 25, size: 3.2, lastModified: "1 week ago", thumbnail: null },
  { id: "5", name: "Invoice_Template.pdf", pages: 2, size: 0.3, lastModified: "2 weeks ago", thumbnail: null },
];

const recentActivity = [
  { id: "1", action: "Compressed", file: "Q4_Financial_Report.pdf", result: "66% smaller (2.4 MB → 812 KB)", time: "2 hours ago", icon: Archive },
  { id: "2", action: "Merged", file: "3 documents", result: "Combined into Project_Proposal_v2.pdf", time: "Yesterday", icon: FileText },
  { id: "3", action: "Signed", file: "Contract.pdf", result: "Added 2 signatures", time: "3 days ago", icon: Signature },
  { id: "5", action: "Signed", file: "Contract.pdf", result: "Added 2 signatures", time: "2 weeks ago", icon: Signature },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Quick access to your tools and recent documents</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <QuickActionsSection />
            <RecentDocumentsSection />
            <RecentActivitySection />
          </div>

          <div className="space-y-8">
            <FavoriteToolsSection />
            <StatsSection />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionsSection() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quick Actions</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/tools">View All <MoreHorizontal className="h-3.5 w-3.5 ml-1" /></Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.id}
              href={action.href}
              className="group flex items-start gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-accent/50 transition-all duration-200"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <action.icon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm group-hover:text-foreground transition-colors">{action.name}</h4>
                  {action.badge && (
                    <Badge variant={action.badge === "AI" ? "ai" : "popular"} className="text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RecentDocumentsSection() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Documents</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/tools">View All <MoreHorizontal className="h-3.5 w-3.5 ml-1" /></Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentDocuments.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors"
            >
              <div className="flex h-16 w-12 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/50">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{doc.name}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{doc.pages} pages</span>
                  <span>{doc.size} MB</span>
                  <span>{doc.lastModified}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <Link href={`/editor?file=${doc.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <Link href={`/editor?file=${doc.id}`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RecentActivitySection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <activity.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{activity.action}</span>
                  <span className="text-muted-foreground text-sm">{activity.file}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{activity.result}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FavoriteToolsSection() {
  const favoriteTools = getPopularTools().slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Favorite Tools</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {favoriteTools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <tool.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm group-hover:text-foreground transition-colors">{tool.name}</p>
                <p className="text-xs text-muted-foreground truncate">{tool.description}</p>
              </div>
              {tool.badge && (
                <Badge variant={tool.badge === "AI" ? "ai" : "popular"} className="text-xs flex-shrink-0">
                  {tool.badge}
                </Badge>
              )}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StatsSection() {
  const stats = [
    { label: "Documents Processed", value: "142", icon: FileText },
    { label: "Pages Converted", value: "3,847", icon: FileImage },
    { label: "Storage Saved", value: "2.4 GB", icon: Archive },
    { label: "Time Saved", value: "18 hrs", icon: Clock },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}