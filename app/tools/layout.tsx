"use client";

import * as React from "react";

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    document.body.style.backgroundColor = "#000";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  return (
    <main className="min-h-screen w-full text-white" data-tools-layout>
      <div className="absolute inset-0 -z-10 bg-[url('https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-[#635BFF] to-[#8B5CF6] opacity-20 mix-blend-overlay"></div>
      <div className="relative z-0">
        {children}
      </div>
    </main>
  );
}
