import GlassNavbar from "@/components/GlassNavbar";
import BackgroundHero from "./background";
import ChromaticImageBentoFeaturesDemo from "@/components/chromatic-image-bento-features-demo";
import AppFooter from "@/components/footer";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#060608] text-neutral-50 overflow-x-clip">
      {/* Glassmorphism Header */}
      <GlassNavbar />

      {/* Main body content container */}
      <main className="w-full">
        {/* First div: BackgroundHero with Aurora component occupying whole page */}
        <div className="relative w-full min-h-[100dvh] lg:h-screen flex flex-col justify-center bg-[#060608] py-8 sm:py-12 lg:py-0">
          <BackgroundHero />
        </div>

        {/* Second div: Chromatic image bento occupying the whole screen with complete white background */}
        <div
          id="features"
          className="relative w-full bg-white"
          style={{ backgroundColor: "#ffffff" }}
        >
          <ChromaticImageBentoFeaturesDemo />
        </div>
      </main>

      {/* Footer */}
      <AppFooter />
    </div>
  );
}
