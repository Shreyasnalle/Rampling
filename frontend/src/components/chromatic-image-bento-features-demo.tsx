"use client";

import React from "react";
import { ChromaticImage } from "@/components/ui/chromatic-image";

const leftFeatures = [
  {
    number: "01",
    title: "Directional color",
    description:
      "The channel split follows pointer movement, so the image responds to intent instead of playing a fixed loop.",
  },
  {
    number: "02",
    title: "Native WebGL",
    description:
      "The shader runs directly on the GPU without a scene library or animation dependency.",
  },
];

const rightFeatures = [
  {
    number: "03",
    title: "Any image source",
    description:
      "Pass a local asset, CDN URL, or CMS image through one small component API.",
  },
  {
    number: "04",
    title: "Responsive by default",
    description:
      "Cover cropping and resize observation keep the treatment stable at every aspect ratio.",
  },
];

function FeatureColumn({
  features,
}: {
  features: typeof leftFeatures;
}) {
  return (
    <dl className="grid h-full grid-rows-2 divide-y divide-white/10">
      {features.map((feature) => (
        <div
          key={feature.number}
          className="flex min-h-36 flex-col justify-between gap-4 p-6 sm:p-8"
        >
          <dt className="flex items-start justify-between gap-4">
            <span className="text-lg font-medium text-white">{feature.title}</span>
            <span className="font-mono text-sm tracking-wide text-neutral-400 tabular-nums">
              {feature.number}
            </span>
          </dt>
          <dd className="max-w-[40ch] text-pretty text-sm/6 text-neutral-400">
            {feature.description}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function ChromaticImageBentoFeaturesDemo({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={`relative w-[70vw] h-[80vh] max-w-[70vw] max-h-[80vh] md:w-[70%] md:h-[80%] rounded-[28px] overflow-hidden shadow-2xl ${className ?? ""}`}
      style={{
        border: "1px solid transparent",
        background: [
          "linear-gradient(#000000, #000000) padding-box",
          "linear-gradient(135deg, rgba(192, 132, 252, 0.75), rgba(244, 114, 182, 0.75), rgba(56, 189, 248, 0.75)) border-box",
        ].join(", "),
        boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.35)",
      }}
    >
      <section
        className="flex flex-col h-full w-full overflow-hidden text-white rounded-[27px] bg-black"
        style={{
          backgroundColor: "#000000",
        }}
      >
        <div className="shrink-0 border-b border-white/10 px-6 py-4 bg-black">
          <p className="font-mono text-xs tracking-wide text-neutral-400 uppercase">
            Built for expressive media
          </p>
          <h3 className="max-w-[30ch] pt-1 text-balance text-xl sm:text-2xl font-semibold text-white tracking-tight">
            One image, four useful capabilities
          </h3>
        </div>
        <div className="grid flex-1 min-h-0 lg:grid-cols-[3fr_4fr_3fr] bg-black">
          <div className="order-2 overflow-y-auto border-white/10 lg:order-1 lg:border-r bg-black">
            <FeatureColumn features={leftFeatures} />
          </div>
          <div className="order-1 flex h-full w-full items-center justify-center bg-black overflow-hidden lg:order-2">
            <ChromaticImage
              src="/images/aurora.webp"
              alt="Aurora"
              backgroundColor="#000000"
              zoom={0}
              displacement={0.02}
              chromaticShift={0.007}
              tilt={0.1}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="order-3 overflow-y-auto border-t border-white/10 lg:border-t-0 lg:border-l bg-black">
            <FeatureColumn features={rightFeatures} />
          </div>
        </div>
      </section>
    </div>
  );
}
