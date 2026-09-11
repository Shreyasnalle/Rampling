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

export default function ChromaticImageBentoFeaturesDemo() {
  return (
    <div className="w-full p-6 sm:p-10">
      <section className="overflow-hidden rounded-[min(1.5vw,18px)] bg-white text-neutral-950 outline-1 -outline-offset-1 outline-black/10 dark:bg-neutral-900 dark:text-neutral-50 dark:outline-white/10">
        <div className="border-b border-black/10 p-6 dark:border-white/10 sm:p-8">
          <p className="font-mono text-sm tracking-wide text-neutral-500 dark:text-neutral-400">
            Built for expressive media
          </p>
          <h3 className="max-w-[18ch] pt-3 text-balance text-3xl font-medium tracking-tight sm:text-4xl">
            One image, four useful capabilities
          </h3>
        </div>
        <div className="grid lg:grid-cols-[3fr_4fr_3fr]">
          <div className="order-2 border-black/10 dark:border-white/10 lg:order-1 lg:border-r">
            <FeatureColumn features={leftFeatures} />
          </div>
          <ChromaticImage
            src="https://assets.aceternity.com/screenshots/green-dither-2.webp"
            alt="Green dithered abstract gradient"
            backgroundColor="#9cae65"
            zoom={0.14}
            displacement={0.035}
            chromaticShift={0.009}
            tilt={0.14}
            className="order-1 aspect-[4/5] min-h-96 bg-stone-300 dark:bg-neutral-800 lg:order-2 lg:aspect-auto lg:min-h-[42rem]"
          />
          <div className="order-3 border-t border-black/10 dark:border-white/10 lg:border-t-0 lg:border-l">
            <FeatureColumn features={rightFeatures} />
          </div>
        </div>
      </section>
    </div>
  );
}
