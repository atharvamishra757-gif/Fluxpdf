"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQS = [
  {
    question: "Is FluxPDF free to use?",
    answer: "Yes, FluxPDF is completely free to use. All PDF tools are available without registration, subscriptions, or hidden fees.",
  },
  {
    question: "How can I merge PDF files online?",
    answer: "Simply upload your PDFs using the Merge PDF tool, arrange them in your desired order, and click Merge. The combined PDF will be ready to download instantly.",
  },
  {
    question: "How do I compress a PDF without losing quality?",
    answer: "Use our Compress PDF tool with adjustable compression levels. You can choose between extreme, recommended, or low compression based on your quality preferences.",
  },
  {
    question: "Is it safe to upload PDF files?",
    answer: "Yes. Most FluxPDF tools process files directly in your browser using client-side JavaScript. Your documents never leave your device unless you choose to use AI-powered features.",
  },
  {
    question: "Does FluxPDF store my documents?",
    answer: "No. Client-side processing means your files stay on your device. Processed PDFs are stored temporarily in your browser's local storage and can be deleted anytime.",
  },
  {
    question: "Can I use FluxPDF on mobile devices?",
    answer: "Yes. FluxPDF is fully responsive and works on any device with a modern web browser, including smartphones and tablets.",
  },
  {
    question: "Which browsers are supported?",
    answer: "FluxPDF works on all modern browsers including Chrome, Firefox, Safari, Edge, and Opera. For best results, keep your browser updated.",
  },
  {
    question: "Are there file size limitations?",
    answer: "Client-side processing handles most file sizes efficiently. For very large files, performance may depend on your device's memory and processing power.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <section className="py-24 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="mb-6 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Have questions about FluxPDF? Here are answers to common questions.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="rounded-md border border-border"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between py-4 px-4 text-left text-lg font-medium transition-colors"
                  aria-expanded={isOpen}
                  aria-controls={`faq-${index}`}
                >
                  {faq.question}
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
                {isOpen && (
                  <div className="border-t border-border pt-4 pb-6 text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
