"use client";

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
    <dl className="grid h-full grid-rows-2 divide-y divide-black/10 dark:divide-white/10">
      {features.map((feature) => (
        <div
          key={feature.number}
          className="flex min-h-48 flex-col justify-between gap-8 p-6 sm:p-8"
        >
          <dt className="flex items-start justify-between gap-4">
            <span className="text-lg font-medium">{feature.title}</span>
            <span className="font-mono text-sm tracking-wide text-neutral-400 tabular-nums dark:text-neutral-500">
              {feature.number}
            </span>
          </dt>
          <dd className="max-w-[40ch] text-pretty text-base/7 text-neutral-600 dark:text-neutral-400 sm:text-sm/6">
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
    <div className={`w-[60vw] max-w-[60%] h-[60vh] max-h-[60%] flex items-center justify-center p-2 ${className ?? ""}`}>
      <section className="flex flex-col h-full w-full overflow-hidden rounded-[min(1.5vw,18px)] bg-white text-neutral-950 outline-1 -outline-offset-1 outline-black/10 dark:bg-neutral-900 dark:text-neutral-50 dark:outline-white/10 shadow-xl">
        <div className="shrink-0 border-b border-black/10 px-5 py-3 dark:border-white/10 sm:px-6 sm:py-3.5">
          <p className="font-mono text-xs tracking-wide text-neutral-500 dark:text-neutral-400">
            Built for expressive media
          </p>
          <h3 className="max-w-[24ch] pt-0.5 text-balance text-xl font-medium tracking-tight sm:text-2xl">
            One image, four useful capabilities
          </h3>
        </div>
        <div className="grid flex-1 min-h-0 lg:grid-cols-[3fr_4fr_3fr]">
          <div className="order-2 overflow-y-auto border-black/10 dark:border-white/10 lg:order-1 lg:border-r">
            <FeatureColumn features={leftFeatures} />
          </div>
          <div className="order-1 flex h-full w-full items-center justify-center bg-stone-950 lg:order-2">
            <ChromaticImage
              src="/images/cold-light-blurry-horizon.webp"
              alt="Cold Light Blurry Horizon"
              backgroundColor="#0a0a14"
              zoom={0}
              displacement={0.02}
              chromaticShift={0.007}
              tilt={0.1}
              className="h-full w-full"
            />
          </div>
          <div className="order-3 overflow-y-auto border-t border-black/10 dark:border-white/10 lg:border-t-0 lg:border-l">
            <FeatureColumn features={rightFeatures} />
          </div>
        </div>
      </section>
    </div>
  );
}
