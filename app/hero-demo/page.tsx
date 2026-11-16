"use client"

import { GlassReveal21st } from "@/components/ui/liquid-glass-logo-reveal"

export default function GlassReveal21stDemo() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <GlassReveal21st
        className="w-full max-w-[600px] h-[600px]"
        logoColor="#635BFF"
        plateColor="#ffffff"
        tileSize={320}
        logoScale={0.55}
        finalScale={0.8}
      />
    </div>
  )
}
