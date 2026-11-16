"use client";

import * as React from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For individuals getting started",
    features: [
      "Unlimited PDF conversions",
      "Merge & split PDFs",
      "Compress up to 10MB",
      "Basic page organization",
      "Watermark & page numbers",
    ],
    cta: "Get started",
    href: "/dashboard",
    variant: "outline",
    color: "text-slate-500",
    badge: "Free forever",
  },
  {
    name: "Pro",
    price: "$12",
    description: "For professionals and teams",
    features: [
      "Everything in Free, plus:",
      "Unlimited file size",
      "AI chat with PDFs",
      "Summarize & translate",
      "Batch processing",
      "Priority support",
    ],
    cta: "Start free trial",
    href: "/dashboard",
    variant: "default",
    popular: true,
    color: "text-indigo-500",
    badge: "Most popular",
  },
  {
    name: "Business",
    price: "$30",
    description: "For growing organizations",
    features: [
      "Everything in Pro, plus:",
      "Team collaboration",
      "Admin controls",
      "Audit logs",
      "SSO & enterprise security",
      "Dedicated support",
    ],
    cta: "Contact sales",
    href: "#",
    variant: "outline",
    color: "text-rose-500",
    badge: "Enterprise",
  },
];

export function PricingSection() {
  return (
    <section className="py-24 sm:py-28 lg:py-32 stagger-child">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="mb-6 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Start for free. Upgrade when you need more power.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3 lg:grid-cols-3 items-center">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "card-premium p-8 flex flex-col relative",
                plan.popular
                  ? "border-brand ring-1 ring-brand shadow-xl z-10 bg-brand/5"
                  : ""
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default" className="text-xs font-medium bg-brand text-brand-foreground px-3 py-1">
                    Most popular
                  </Badge>
                </div>
              )}
              <div className="mb-4">
                <h3 className={`font-semibold ${plan.color}`}>{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    {feature.startsWith("Everything") || feature.startsWith("Unlimited") || feature.startsWith("AI") || feature.startsWith("Batch") || feature.startsWith("Priority") || feature.startsWith("Team") || feature.startsWith("Admin") || feature.startsWith("SSO") || feature.startsWith("Dedicated") ? (
                      <Check className="h-4 w-4 text-brand mt-0.5 shrink-0" />
                    ) : (
                      <span className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    )}
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button variant={plan.variant as any} size="lg" asChild className="w-full gap-2">
                <Link href={plan.href}>
                  {plan.cta}
                  {plan.variant === "default" && <ArrowRight className="h-4 w-4" />}
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
