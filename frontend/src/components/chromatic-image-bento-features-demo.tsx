"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  bordersVisible,
  textVisible,
  baseDelay = 0.1,
}: {
  features: typeof leftFeatures;
  bordersVisible: boolean;
  textVisible: boolean;
  baseDelay?: number;
}) {
  return (
    <dl className="grid h-full grid-rows-2 relative">
      {features.map((feature, idx) => (
        <div
          key={feature.number}
          className="relative flex min-h-36 flex-col justify-between gap-4 p-6 sm:p-8"
        >
          {/* Animated divider line between rows */}
          {idx > 0 && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: bordersVisible ? 1 : 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute top-0 inset-x-0 h-[1px] bg-white/25 origin-left pointer-events-none"
            />
          )}

          {/* Title and Number with left to right reveal */}
          <motion.dt
            initial={{ opacity: 0, x: -16, filter: "blur(8px)" }}
            animate={{
              opacity: textVisible ? 1 : 0,
              x: textVisible ? 0 : -16,
              filter: textVisible ? "blur(0px)" : "blur(8px)",
            }}
            transition={{
              duration: 0.45,
              delay: textVisible ? baseDelay + idx * 0.12 : 0,
              ease: "easeOut",
            }}
            className="flex items-start justify-between gap-4"
          >
            <span
              className="font-rowan-semibold text-lg font-semibold text-white tracking-tight"
              style={{
                fontFamily: "'Rowan-Semibold', serif",
                fontVariantLigatures: "none",
                fontFeatureSettings: '"calt" 0, "liga" 0, "dlig" 0',
              }}
            >
              {feature.title}
            </span>
            <span
              className="font-rowan-light text-sm tracking-widest text-neutral-400 select-none"
              style={{
                fontFamily: "'Rowan-Light', serif",
                fontVariantLigatures: "none",
                fontFeatureSettings: '"calt" 0, "liga" 0, "dlig" 0',
                fontVariantNumeric: "normal",
              }}
            >
              {feature.number}
            </span>
          </motion.dt>

          {/* Description with left to right reveal */}
          <motion.dd
            initial={{ opacity: 0, x: -16, filter: "blur(8px)" }}
            animate={{
              opacity: textVisible ? 1 : 0,
              x: textVisible ? 0 : -16,
              filter: textVisible ? "blur(0px)" : "blur(8px)",
            }}
            transition={{
              duration: 0.45,
              delay: textVisible ? baseDelay + idx * 0.12 + 0.06 : 0,
              ease: "easeOut",
            }}
            className="font-rowan-light max-w-[40ch] text-pretty text-[15px] leading-relaxed text-neutral-300 font-light"
            style={{
              fontFamily: "'Rowan-Light', serif",
              fontSize: "14px",
              fontVariantLigatures: "none",
              fontFeatureSettings: '"calt" 0, "liga" 0, "dlig" 0',
            }}
          >
            {feature.description}
          </motion.dd>
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
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoProgress, setAutoProgress] = useState(0);

  // Responsive mobile state
  const [isMobile, setIsMobile] = useState(false);
  const [activeMobileFeature, setActiveMobileFeature] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const allFeatures = useMemo(
    () => [
      {
        ...leftFeatures[0],
        shortLabel: "AST Graph",
      },
      {
        ...leftFeatures[1],
        shortLabel: "Semgrep",
      },
      {
        ...rightFeatures[0],
        shortLabel: "k6 Load",
      },
      {
        ...rightFeatures[1],
        shortLabel: "Insights",
      },
    ],
    []
  );

  // Auto-cycle mobile active feature every 4s
  useEffect(() => {
    if (!isMobile) return;
    const timer = setInterval(() => {
      setActiveMobileFeature((prev) => (prev + 1) % allFeatures.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [isMobile, allFeatures.length]);

  // Manual scroll listener
  useEffect(() => {
    let ticking = false;

    const updateScroll = () => {
      if (isAutoPlaying) return;
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;

      const totalScrollDistance = windowH * 2.2;
      const scrolled = -rect.top;

      const p = Math.min(Math.max(scrolled / totalScrollDistance, 0), 1);
      setScrollProgress(p);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [isAutoPlaying]);

  // Lock user scrolling during auto transition
  useEffect(() => {
    if (!isAutoPlaying) return;

    const preventDefault = (e: Event) => {
      e.preventDefault();
    };

    const preventKeys = (e: KeyboardEvent) => {
      const keys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
      if (keys.includes(e.key)) {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", preventDefault, { passive: false });
    window.addEventListener("touchmove", preventDefault, { passive: false });
    window.addEventListener("keydown", preventKeys, { passive: false });

    return () => {
      window.removeEventListener("wheel", preventDefault);
      window.removeEventListener("touchmove", preventDefault);
      window.removeEventListener("keydown", preventKeys);
    };
  }, [isAutoPlaying]);

  // Auto transition when user directly clicks "Features"
  useEffect(() => {
    const handleFeaturesTrigger = () => {
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      const windowH = window.innerHeight;
      const totalScrollDistance = windowH * 2.2;

      // Smoothly scroll window to section top
      window.scrollTo({ top: sectionTop, behavior: "smooth" });

      setIsAutoPlaying(true);
      setAutoProgress(0);

      // Start automatic progression briskly after window scroll initiates (~120ms)
      const startTime = performance.now() + 120;
      const duration = 2500; // 2.5s total smooth sequence

      const step = (now: number) => {
        if (now < startTime) {
          requestAnimationFrame(step);
          return;
        }
        const elapsed = now - startTime;
        const rawP = Math.min(elapsed / duration, 1);

        // Fast, snappy shrink in 550ms, matching the pace of following borders (550-1150ms), text (1150-1800ms), and image (1800-2500ms)
        let p = 0;
        if (elapsed <= 550) {
          const t = elapsed / 550;
          // easeOutCubic: snappy, responsive shrink
          p = (1 - Math.pow(1 - t, 3)) * 0.26;
        } else {
          const remainingT = (elapsed - 550) / (duration - 550);
          p = 0.26 + remainingT * 0.74;
        }

        setAutoProgress(p);

        if (rawP < 1) {
          requestAnimationFrame(step);
        } else {
          // Finished auto-playing: align window scroll position and unlock scrolling
          window.scrollTo({
            top: sectionTop + totalScrollDistance,
            behavior: "instant" as ScrollBehavior,
          });
          setScrollProgress(1);
          setIsAutoPlaying(false);
        }
      };

      requestAnimationFrame(step);
    };

    window.addEventListener("rampling:features-clicked", handleFeaturesTrigger);
    return () => {
      window.removeEventListener("rampling:features-clicked", handleFeaturesTrigger);
    };
  }, []);

  // Effective progress from auto play or manual scroll
  const effectiveProgress = isAutoPlaying ? autoProgress : scrollProgress;

  // Strict 4-phase sequence:
  // Phase 1 (0.00 -> 0.24): Div shrinks from 80% to original size.
  const shrinkFactor = Math.min(Math.max(effectiveProgress / 0.24, 0), 1);

  // Phase 2 (0.24 -> 0.48): Internal borders appear from left to right.
  const bordersVisible = effectiveProgress >= 0.24;

  // Phase 3 (0.48 -> 0.72): Texts & numbers appear from left to right.
  const textVisible = effectiveProgress >= 0.48;

  // Phase 4 (0.72 -> 1.00): Center image slowly and smoothly fades in last!
  const imageVisible = effectiveProgress >= 0.72;

  // Mount ChromaticImage once card reaches its original size (shrinkFactor >= 0.95)
  // so WebGL canvas is never subjected to dimension distortion or crash
  const isMountedAtFinalSize = shrinkFactor >= 0.95;

  // Responsive dimensions:
  // On desktop: Starts at 80% width and 80% height, shrinks to original size (70vw / 70% x 70vh)
  // On mobile: adapts smoothly to 94vw -> 92vw and 84vh -> 78vh for full mobile comfort
  const currentWidth = isMobile
    ? `calc(94vw - (94vw - 92vw) * ${shrinkFactor})`
    : `calc(80vw - (80vw - min(70vw, 1100px)) * ${shrinkFactor})`;
  const currentHeight = isMobile
    ? `calc(84vh - (84vh - 78vh) * ${shrinkFactor})`
    : `calc(80vh - (80vh - 70vh) * ${shrinkFactor})`;
  const currentRadius = `${24 + 5.5 * shrinkFactor}px`;
  const innerRadius = 22 + 6 * shrinkFactor;
  const borderOpacity = Math.min(1, 0.7 + 0.3 * shrinkFactor);

  return (
    <div
      ref={sectionRef}
      className="relative w-full min-h-[320vh] bg-white"
      style={{ backgroundColor: "#ffffff" }}
    >
      {/* Sticky viewport container - keeps screen locked in place while transition takes place */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-white">
        {/* Content div that shrinks from 80% width/height to original size */}
        <div
          className={`relative p-[1.5px] transition-all duration-75 flex items-center justify-center ${className ?? ""}`}
          style={{
            width: currentWidth,
            height: currentHeight,
            borderRadius: currentRadius,
            background: `linear-gradient(135deg, rgba(192, 132, 252, ${borderOpacity}) 0%, rgba(244, 114, 182, ${borderOpacity}) 50%, rgba(56, 189, 248, ${borderOpacity}) 100%)`,
            boxShadow: `0 0 ${25 * borderOpacity}px rgba(192,132,252,${0.35 * borderOpacity}), 0 0 ${50 * borderOpacity}px rgba(56,189,248,${0.2 * borderOpacity}), 0 20px 50px rgba(0,0,0,${0.35 * borderOpacity})`,
          }}
        >
          <BorderGlow
            edgeSensitivity={30}
            glowColor="40 80 80"
            backgroundColor="#000000"
            borderRadius={innerRadius}
            glowRadius={40}
            glowIntensity={borderOpacity}
            coneSpread={25}
            animated={false}
            colors={["#c084fc", "#f472b6", "#38bdf8"]}
            className="w-full h-full"
          >
            <section
              className="flex flex-col h-full w-full overflow-hidden text-white bg-black"
              style={{
                backgroundColor: "#000000",
                borderRadius: `${innerRadius}px`,
              }}
            >
              {/* Header */}
              <div className="relative shrink-0 px-5 sm:px-6 py-3.5 sm:py-4 bg-black">
                <motion.p
                  initial={{ opacity: 0, x: -16, filter: "blur(8px)" }}
                  animate={{
                    opacity: textVisible ? 1 : 0,
                    x: textVisible ? 0 : -16,
                    filter: textVisible ? "blur(0px)" : "blur(8px)",
                  }}
                  transition={{
                    duration: 0.45,
                    delay: textVisible ? 0.05 : 0,
                    ease: "easeOut",
                  }}
                  className="font-rowan-medium text-xs tracking-wider text-neutral-400 uppercase"
                  style={{
                    fontFamily: "'Rowan-Medium', serif",
                    fontVariantLigatures: "none",
                    fontFeatureSettings: '"calt" 0, "liga" 0, "dlig" 0',
                  }}
                >
                  This is how Rampling works
                </motion.p>
                <motion.h3
                  initial={{ opacity: 0, x: -16, filter: "blur(8px)" }}
                  animate={{
                    opacity: textVisible ? 1 : 0,
                    x: textVisible ? 0 : -16,
                    filter: textVisible ? "blur(0px)" : "blur(8px)",
                  }}
                  transition={{
                    duration: 0.45,
                    delay: textVisible ? 0.12 : 0,
                    ease: "easeOut",
                  }}
                  className="font-rowan-semibold max-w-[30ch] pt-1 text-balance text-xl sm:text-2xl font-semibold text-white tracking-tight"
                  style={{
                    fontFamily: "'Rowan-Semibold', serif",
                    fontVariantLigatures: "none",
                    fontFeatureSettings: '"calt" 0, "liga" 0, "dlig" 0',
                  }}
                >
                  Workflow
                </motion.h3>

                {/* Horizontal divider line under header (Step 1: Lines from left to right) */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: bordersVisible ? 1 : 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute bottom-0 inset-x-0 h-[1px] bg-white/25 origin-left pointer-events-none"
                />
              </div>

              {/* Desktop Bento Grid: 3-column [3fr_4fr_3fr] (strictly preserved for desktop) */}
              <div className="hidden lg:grid flex-1 min-h-0 grid-cols-[3fr_4fr_3fr] bg-black relative">
                {/* Left Features Column */}
                <div className="order-2 overflow-y-auto relative bg-black lg:order-1">
                  <FeatureColumn
                    features={leftFeatures}
                    bordersVisible={bordersVisible}
                    textVisible={textVisible}
                    baseDelay={0.15}
                  />

                  {/* Vertical divider line right of left column */}
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: bordersVisible ? 1 : 0 }}
                    transition={{
                      duration: 0.5,
                      delay: bordersVisible ? 0.1 : 0,
                      ease: "easeOut",
                    }}
                    className="hidden lg:block absolute right-0 inset-y-0 w-[1px] bg-white/25 origin-top pointer-events-none"
                  />
                </div>

                {/* Center Image Column (Step 3: Slow, smooth cinematic fade in) */}
                <div className="order-1 flex h-full w-full items-center justify-center bg-black overflow-hidden lg:order-2 relative">
                  <motion.div
                    initial={{ opacity: 0, filter: "blur(16px)", scale: 0.94 }}
                    animate={{
                      opacity: imageVisible ? 1 : 0,
                      filter: imageVisible ? "blur(0px)" : "blur(16px)",
                      scale: imageVisible ? 1 : 0.94,
                    }}
                    transition={{
                      duration: imageVisible ? 1.3 : 0.85,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="h-full w-full flex items-center justify-center transform-gpu"
                  >
                    {isMountedAtFinalSize && (
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
                    )}
                  </motion.div>
                </div>

                {/* Right Features Column */}
                <div className="order-3 overflow-y-auto relative bg-black lg:order-3">
                  {/* Vertical divider line left of right column */}
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: bordersVisible ? 1 : 0 }}
                    transition={{
                      duration: 0.5,
                      delay: bordersVisible ? 0.2 : 0,
                      ease: "easeOut",
                    }}
                    className="hidden lg:block absolute left-0 inset-y-0 w-[1px] bg-white/25 origin-top pointer-events-none"
                  />

                  <FeatureColumn
                    features={rightFeatures}
                    bordersVisible={bordersVisible}
                    textVisible={textVisible}
                    baseDelay={0.35}
                  />
                </div>
              </div>

              {/* Mobile View: Clean tabbed showcase with image preview & active feature (no nested scrollbars!) */}
              <div className="flex flex-col flex-1 min-h-0 lg:hidden justify-between p-3.5 sm:p-5 bg-black gap-2">
                {/* Compact Image Banner */}
                <div className="relative h-24 sm:h-32 w-full rounded-xl overflow-hidden border border-white/15 bg-black/60 shrink-0">
                  {isMountedAtFinalSize ? (
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
                  ) : (
                    <img
                      src="/images/aurora.webp"
                      alt="Aurora Preview"
                      className="h-full w-full object-cover opacity-60"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-2 left-3 text-[10px] font-rowan-medium tracking-widest text-white/70 uppercase">
                    Autonomous Analysis
                  </span>
                </div>

                {/* Feature Tabs (01, 02, 03, 04) */}
                <div className="grid grid-cols-4 gap-1.5 py-1">
                  {allFeatures.map((feat, idx) => (
                    <button
                      key={feat.number}
                      type="button"
                      onClick={() => setActiveMobileFeature(idx)}
                      className={`py-1.5 px-1.5 rounded-lg text-xs font-rowan-medium transition-all duration-200 flex flex-col items-center justify-center gap-0.5 border ${
                        activeMobileFeature === idx
                          ? "bg-white/15 text-white border-white/30 shadow-[0_0_12px_rgba(192,132,252,0.3)]"
                          : "bg-white/5 text-neutral-400 border-white/10 hover:text-white"
                      }`}
                      style={{ fontFamily: "'Rowan-Medium', serif" }}
                    >
                      <span className="text-[10px] tracking-wider text-purple-300">
                        {feat.number}
                      </span>
                      <span className="truncate max-w-full text-[10px] sm:text-[11px]">
                        {feat.shortLabel}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Active Feature Details Card */}
                <div className="relative flex-1 min-h-[110px] flex flex-col justify-center bg-white/[0.03] border border-white/10 rounded-xl p-3.5 sm:p-4 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeMobileFeature}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <h4
                          className="font-rowan-semibold text-sm sm:text-base font-semibold text-white tracking-tight"
                          style={{ fontFamily: "'Rowan-Semibold', serif" }}
                        >
                          {allFeatures[activeMobileFeature].title}
                        </h4>
                        <span
                          className="font-rowan-light text-xs tracking-widest text-neutral-400"
                          style={{ fontFamily: "'Rowan-Light', serif" }}
                        >
                          {allFeatures[activeMobileFeature].number} / 04
                        </span>
                      </div>
                      <p
                        className="font-rowan-light text-xs sm:text-[13px] text-neutral-300 leading-relaxed"
                        style={{ fontFamily: "'Rowan-Light', serif" }}
                      >
                        {allFeatures[activeMobileFeature].description}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Next / Prev Navigation dots & button */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    {allFeatures.map((_, idx) => (
                      <span
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          activeMobileFeature === idx
                            ? "w-4 bg-gradient-to-r from-purple-400 to-pink-400"
                            : "w-1.5 bg-white/20"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMobileFeature((prev) =>
                          prev === 0 ? allFeatures.length - 1 : prev - 1
                        )
                      }
                      className="p-1 rounded-md bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs px-2"
                      aria-label="Previous feature"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMobileFeature((prev) =>
                          prev === allFeatures.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="p-1 rounded-md bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs px-2"
                      aria-label="Next feature"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </BorderGlow>
        </div>
      </div>
    </div>
  );
}
