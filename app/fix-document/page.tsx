"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Search, Sparkles, ArrowRight, CheckCircle, Zap, FileText, Archive, PenTool, Scissors, Camera } from "lucide-react";
import { tools } from "@/lib/tools";

interface Suggestion {
  tool: typeof tools[0];
  reason: string;
  confidence: number;
}

const keywordMap: Record<string, string[]> = {
  merge: ["merge", "combine", "join", "multiple pdfs", "combine pdfs"],
  split: ["split", "separate", "extract", "page range"],
  "page-numbers": ["page number", "numbering", "pagination"],
  crop: ["crop", "trim", "margins"],
  compress: ["compress", "reduce size", "smaller", "shrink"],
  "pdf-to-jpg": ["pdf to jpg", "pdf to image", "convert to jpg", "jpg"],
  "jpg-to-pdf": ["jpg to pdf", "image to pdf", "photo to pdf"],
  edit: ["edit pdf", "add text", "add image", "modify pdf"],
  annotate: ["highlight", "annotate", "comment", "underline"],
  sign: ["sign", "signature", "electronic signature", "esign"],
  watermark: ["watermark", "stamp", "brand"],
  "fill-forms": ["fill form", "interactive form", "form fields"],
  protect: ["protect", "password", "lock"],
  unlock: ["unlock", "remove password"],
  redact: ["redact", "remove sensitive", "black out"],
  scan: ["scan", "camera", "mobile"],
};

function matchTool(input: string): Suggestion[] {
  const lower = input.toLowerCase();
  const matches: Suggestion[] = [];

  for (const [toolId, keywords] of Object.entries(keywordMap)) {
    const score = keywords.filter((kw) => lower.includes(kw)).length;
    if (score > 0) {
      const tool = tools.find((t) => t.id === toolId);
      if (tool) {
        matches.push({
          tool,
          reason: `Matches: ${keywords.filter((kw) => lower.includes(kw)).join(", ")}`,
          confidence: Math.min(score / keywords.length + 0.3, 1),
        });
      }
    }
  }

  return matches.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}

const exampleCards = [
  { title: "Merge PDFs", desc: "Combine several PDFs into one file", icon: Archive, query: "merge multiple pdfs" },
  { title: "Compress PDF", desc: "Reduce file size for email or upload", icon: FileText, query: "compress pdf to under 1 mb" },
  { title: "Convert to JPG", desc: "Turn PDF into image files", icon: Zap, query: "convert pdf to jpg" },
  { title: "Add Signature", desc: "Electronically sign a document", icon: PenTool, query: "add signature to pdf" },
  { title: "Remove Pages", desc: "Delete unwanted pages from PDF", icon: Scissors, query: "delete pages from pdf" },
  { title: "Scan to PDF", desc: "Capture images with camera", icon: Camera, query: "scan document to pdf" },
];

export default function FixMyDocumentPage() {
  const router = useRouter();
  const [input, setInput] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [showExamples, setShowExamples] = React.useState(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setShowExamples(false);
    if (e.target.value.trim()) {
      const matches = matchTool(e.target.value);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
      setShowExamples(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setProcessing(true);
    setSubmitted(true);

    setTimeout(() => {
      setProcessing(false);
      if (suggestions.length > 0) {
        router.push(suggestions[0].tool.href);
      }
    }, 800);
  };

  const goToTool = (toolId: string) => {
    const tool = tools.find((t) => t.id === toolId);
    if (tool) router.push(tool.href);
  };

  const handleExampleClick = (query: string) => {
    setInput(query);
    setSuggestions(matchTool(query));
    setShowExamples(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary via-primary/80 to-purple-600 py-20 sm:py-32 overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/3 -left-1/3 w-full h-full bg-white/10 blur-[120px] rounded-full" />
          <div className="absolute -bottom-1/3 -right-1/3 w-full h-full bg-purple-600/20 blur-[120px] rounded-full" />
        </div>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-medium mb-6 backdrop-blur-sm">
            <Zap className="h-3 w-3" />
            <span>Fix My Document</span>
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-7xl leading-tight">
            Describe what you need done
          </h1>
          <p className="mb-10 text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
            Just tell us in plain language. No searching, no guessing &mdash; we&apos;ll find the right tool instantly.
          </p>

          <form onSubmit={handleSubmit} className="relative">
            <div className="relative z-10">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-foreground/60">
                <Search className="h-5 w-5" />
              </div>
              <Textarea
                placeholder="e.g., &quot;Merge 3 PDFs and add page numbers&quot; or &quot;Compress this to under 2 MB for email&quot;"
                className="pl-14 h-40 text-lg font-medium resize-none focus:ring-2 focus-ring-white focus:ring-offset-2 focus:ring-offset-primary"
                value={input}
                onChange={handleInputChange}
                rows={6}
              />
            </div>

            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-16 text-lg font-bold flex items-center justify-center gap-2 btn-press disabled:opacity-60 disabled:cursor-not-allowed shadow-xl shadow-purple-500/25"
              disabled={processing || !input.trim()}
            >
              {processing ? (
                <>
                  <Progress value={100} className="h-1 w-12 shrink-0" />
                  <span className="flex items-center gap-2">Finding your tool&hellip;</span>
                  <ArrowRight className="h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Fix My Document
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          {!processing && input.trim() && suggestions.length > 0 && (
            <div className="mt-8 animate-in">
              <p className="text-sm text-white/70 mb-3 font-medium">Suggested tools:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 3).map((s) => (
                  <Button
                    key={s.tool.id}
                    variant="outline"
                    size="sm"
                    className="border-white/30 text-white hover:bg-white hover:text-primary btn-press"
                    onClick={() => goToTool(s.tool.id)}
                  >
                    {s.tool.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {!input.trim() && showExamples && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-10 text-center">
            <h2 className="mb-2 text-2xl font-bold tracking-tight">Popular tasks</h2>
            <p className="text-muted-foreground">Click any example to try it out</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 stagger-child">
            {exampleCards.map((ex) => (
              <Card
                key={ex.title}
                className="group cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => handleExampleClick(ex.query)}
              >
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <ex.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{ex.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ex.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="bg-muted/30 py-16 border-y">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="mb-2 text-2xl font-bold tracking-tight">How Fix My Document works</h2>
            <p className="text-muted-foreground">Just describe your task in plain language</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 stagger-child">
            {[
              { num: "01", title: "Describe", desc: "Tell us what you need done in your own words" },
              { num: "02", title: "Match", desc: "We find the right tool for your request" },
              { num: "03", title: "Fix", desc: "Open the tool and complete your task" },
            ].map((step) => (
              <Card key={step.num} className="p-6">
                <CardContent className="pt-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                    <span className="font-bold">{step.num}</span>
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
