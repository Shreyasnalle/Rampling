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
        src="/images/background.webp"
        alt="Hero background"
        backgroundColor="#081d3b"
        zoom={0}
        displacement={0.015}
        chromaticShift={0.006}
        tilt={0.08}
        className="h-full w-full object-cover"
      >
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-black/5 to-black/20" />
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between gap-12 p-6 sm:p-8 lg:p-10">
          <div className="pointer-events-auto flex select-text items-start justify-between gap-6 font-mono text-sm tracking-wide">
            <p>Studio sessions</p>
            <p className="tabular-nums">Edition / 01</p>
          </div>
          <div className="pointer-events-auto flex select-text flex-col items-start gap-6">
            <div className="flex flex-col gap-3">
              <p className="text-base/7 sm:text-sm/6">After hours at Northline</p>
              <h3 className="max-w-[10ch] text-balance text-5xl font-medium tracking-tight sm:text-6xl lg:text-7xl">
                Ideas look different after dark
              </h3>
              <p className="max-w-[42ch] text-pretty text-base/7 text-white/75 sm:text-sm/6">
                Flexible studios for small teams that need room to think, test, and make together.
              </p>
            </div>
            <button
              type="button"
              className="pointer-events-auto rounded-full bg-white px-4 py-3 text-sm font-medium text-neutral-950 ring-1 ring-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Book a studio tour
            </button>
          </div>
        </div>
      </ChromaticImage>
    </article>
  );
}
