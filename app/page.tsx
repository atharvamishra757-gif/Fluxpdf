import { Footer } from "@/components/home/footer";
import { Hero } from "@/components/home/hero";
import { ToolsShowcase, PopularTools } from "@/components/home/tools-showcase";
import { FeaturesSection } from "@/components/home/features";
import { PricingSection } from "@/components/home/pricing";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <Hero />
        <FeaturesSection />
        <ToolsShowcase />
        <PopularTools />
        <PricingSection />
        <Footer />
      </main>
    </div>
  );
}
