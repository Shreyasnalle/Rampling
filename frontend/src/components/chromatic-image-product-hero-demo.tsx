"use client";

import { ChromaticImage } from "@/components/ui/chromatic-image";

export default function ChromaticImageProductHeroDemo({
  className,
}: {
  className?: string;
}) {
  return (
    <article className={`relative isolate w-full h-full overflow-hidden rounded-[min(1.5vw,18px)] bg-[#081d3b] text-white outline-1 -outline-offset-1 outline-black/10 dark:bg-neutral-950 dark:outline-white/10 ${className ?? ""}`}>
      <ChromaticImage
        src="/images/granular.webp"
        alt="Hero background"
        backgroundColor="#000000"
        zoom={0}
        displacement={0}
        chromaticShift={0.003}
        tilt={0}
        className="h-full w-full object-cover"
      >
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-black/30" />
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-center items-center p-6 sm:p-8 lg:p-12">
          {/* Centered Hero Content */}
          <div className="pointer-events-auto flex select-text flex-col items-center justify-center text-center max-w-4xl mx-auto px-4">
            <h1 className="text-balance text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white leading-tight sm:leading-none">
              Know how your code performs before your users do.
            </h1>
            <p className="mt-6 max-w-3xl text-pretty text-base sm:text-lg text-white/80 leading-relaxed">
              Connect your repository. Rampling automatically maps every route, catches architectural bottlenecks, and simulates production traffic against staging in minutes. Autonomous agents dynamically orchestrate targeted k6 load scenarios, correlate latency with exact code lines, prove bottlenecks with hard empirical data, and prescribe surgical code fixes before you ship.
            </p>
          </div>

          {/* Bottom subtle indicator */}
          <div className="pointer-events-auto absolute bottom-6 inset-x-0 flex select-text items-center justify-center text-center font-mono text-xs tracking-widest text-neutral-400 uppercase">
            <span>Autonomous Agents • AST Call-Graph • Empirical Proofs • Code Remediation</span>
          </div>
        </div>
      </ChromaticImage>
    </article>
  );
}
