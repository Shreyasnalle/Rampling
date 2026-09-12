import GlassNavbar from "@/components/GlassNavbar";
import BackgroundHero from "./background";
import ChromaticImageBentoFeaturesDemo from "@/components/chromatic-image-bento-features-demo";
import AppFooter from "@/components/footer";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full bg-neutral-950 text-neutral-50 overflow-x-hidden">
      {/* Glassmorphism Header */}
      <GlassNavbar />

      {/* Main body content container */}
      <main className="w-full">
        {/* First div: BackgroundHero with Aurora component occupying whole page */}
        <div className="relative w-full min-h-screen h-screen flex flex-col justify-center">
          <BackgroundHero />
        </div>

        {/* 3. In the second div add the chromatic-image-bento */}
        <div id="features" className="w-full min-h-screen py-16 flex items-center justify-center bg-neutral-900/60">
          <ChromaticImageBentoFeaturesDemo />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full">
        <AppFooter />
      </footer>
    </div>
  );
}
