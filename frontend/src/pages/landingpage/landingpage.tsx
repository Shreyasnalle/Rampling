import GlassNavbar from "@/components/GlassNavbar";
import BackgroundHero from "./background";
import ChromaticImageBentoFeaturesDemo from "@/components/chromatic-image-bento-features-demo";
import AppFooter from "@/components/footer";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#060608] text-neutral-50 overflow-x-hidden">
      {/* Glassmorphism Header */}
      <GlassNavbar />

      {/* Main body content container */}
      <main className="w-full">
        {/* First div: BackgroundHero with Aurora component occupying whole page */}
        <div className="relative w-full min-h-screen h-screen flex flex-col justify-center bg-[#060608]">
          <BackgroundHero />
        </div>

        {/* Second div: Chromatic image bento occupying the whole screen with complete white background */}
        <div
          id="features"
          className="relative w-full min-h-screen h-screen flex items-center justify-center overflow-hidden bg-white"
          style={{ backgroundColor: "#ffffff" }}
        >
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
