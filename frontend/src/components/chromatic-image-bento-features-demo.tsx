"use client";

import React from "react";
import { ChromaticImage } from "@/components/ui/chromatic-image";
import BorderGlow from "@/components/BorderGlow";

const leftFeatures = [
  {
    number: "01",
    title: "AST Graph Construction",
    description:
      "Parses your codebase to construct a complete abstract syntax tree graph, mapping route handlers, controller dependencies, and execution flows.",
  },
  {
    number: "02",
    title: "Context-Aware Semgrep",
    description:
      "Unlike standard Semgrep that only runs static rule checks, our engine leverages AST context to pinpoint performance sinks, heavy operations, and bottleneck patterns.",
  },
];

const rightFeatures = [
  {
    number: "03",
    title: "Agentic k6 Automation",
    description:
      "Autonomous AI agents generate and execute realistic k6 load-testing scripts against discovered endpoints, stress-testing latency, concurrency, and breaking thresholds.",
  },
  {
    number: "04",
    title: "Unified Reports & Insights",
    description:
      "Combines AST structures, contextual static findings, and real-time k6 load metrics into calculated latency percentiles, throughput scores, and prioritized performance suggestions.",
  },
];

function FeatureColumn({
  features,
}: {
  features: typeof leftFeatures;
}) {
  return (
    <dl className="grid h-full grid-rows-2 divide-y divide-white/25">
      {features.map((feature) => (
        <div
          key={feature.number}
          className="flex min-h-36 flex-col justify-between gap-4 p-6 sm:p-8"
        >
          <dt className="flex items-start justify-between gap-4">
            <span
              className="font-rowan-semibold text-lg font-semibold text-white tracking-tight"
              style={{
                fontFamily: "'Rowan-Semibold', serif",
                fontVariantLigatures: 'none',
                fontFeatureSettings: '"calt" 0, "liga" 0, "dlig" 0',
              }}
            >
              {feature.title}
            </span>
            <span
              className="font-rowan-light text-sm tracking-widest text-neutral-400 select-none"
              style={{
                fontFamily: "'Rowan-Light', serif",
                fontVariantLigatures: 'none',
                fontFeatureSettings: '"calt" 0, "liga" 0, "dlig" 0',
                fontVariantNumeric: 'normal',
              }}
            >
              {feature.number}
            </span>
          </dt>
          <dd
            className="font-rowan-light max-w-[40ch] text-pretty text-[15px] leading-relaxed text-neutral-300 font-light"
            style={{
              fontFamily: "'Rowan-Light', serif",
              fontSize: '14px',
              fontVariantLigatures: 'none',
              fontFeatureSettings: '"calt" 0, "liga" 0, "dlig" 0',
            }}
          >
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
      className={`relative p-[1.5px] rounded-[29.5px] transition-all duration-300 shadow-[0_0_25px_rgba(192,132,252,0.35),0_0_50px_rgba(56,189,248,0.2),0_20px_50px_rgba(0,0,0,0.35)] w-[70vw] h-[80vh] max-w-[70vw] max-h-[80vh] md:w-[70%] md:h-[80%] ${className ?? ""}`}
      style={{
        background: 'linear-gradient(135deg, #c084fc 0%, #f472b6 50%, #38bdf8 100%)',
      }}
    >
      <BorderGlow
        edgeSensitivity={30}
        glowColor="40 80 80"
        backgroundColor="#000000"
        borderRadius={28}
        glowRadius={40}
        glowIntensity={1}
        coneSpread={25}
        animated={false}
        colors={['#c084fc', '#f472b6', '#38bdf8']}
        className="w-full h-full"
      >
        <section
          className="flex flex-col h-full w-full overflow-hidden text-white rounded-[28px] bg-black"
          style={{
            backgroundColor: "#000000",
          }}
        >
          <div className="shrink-0 border-b border-white/25 px-6 py-4 bg-black">
            <p
              className="font-rowan-medium text-xs tracking-wider text-neutral-400 uppercase"
              style={{
                fontFamily: "'Rowan-Medium', serif",
                fontVariantLigatures: 'none',
                fontFeatureSettings: '"calt" 0, "liga" 0, "dlig" 0',
              }}
            >
              This is how Rampling works
            </p>
            <h3
              className="font-rowan-semibold max-w-[30ch] pt-1 text-balance text-xl sm:text-2xl font-semibold text-white tracking-tight"
              style={{
                fontFamily: "'Rowan-Semibold', serif",
                fontVariantLigatures: 'none',
                fontFeatureSettings: '"calt" 0, "liga" 0, "dlig" 0',
              }}
            >
              Workflow
            </h3>
          </div>
          <div className="grid flex-1 min-h-0 lg:grid-cols-[3fr_4fr_3fr] bg-black">
            <div className="order-2 overflow-y-auto border-white/25 lg:order-1 lg:border-r bg-black">
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
            <div className="order-3 overflow-y-auto border-t border-white/25 lg:border-t-0 lg:border-l bg-black">
              <FeatureColumn features={rightFeatures} />
            </div>
          </div>
        </section>
      </BorderGlow>
    </div>
  );
}
