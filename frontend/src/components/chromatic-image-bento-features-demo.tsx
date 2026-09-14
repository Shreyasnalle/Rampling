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
    <dl className="flex flex-col h-full relative">
      {features.map((feature, idx) => (
        <div
          key={feature.number}
          className="relative flex flex-1 min-h-0 flex-col justify-between gap-3 p-5 lg:p-6 xl:p-8 overflow-hidden"
        >
          {/* Animated divider line between rows */}
          {idx > 0 && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: bordersVisible ? 1 : 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute top-0 inset-x-0 h-[1px] origin-left pointer-events-none"
              style={{
                background:
                  'linear-gradient(90deg, transparent, #AC896860 15%, #865D3660 50%, #93785B60 85%, transparent)',
              }}
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
            className="font-rowan-light max-w-[40ch] text-pretty text-[13px] xl:text-[14px] leading-relaxed text-neutral-300 font-light line-clamp-4"
            style={{
              fontFamily: "'Rowan-Light', serif",
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

  // Manual scroll listener (desktop only)
  useEffect(() => {
    if (isMobile) return;

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
  }, [isMobile, isAutoPlaying]);

  // Lock user scrolling during auto transition (desktop only)
  useEffect(() => {
    if (!isAutoPlaying || isMobile) return;

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
  }, [isAutoPlaying, isMobile]);

  // Auto transition when user directly clicks "Features"
  useEffect(() => {
    const handleFeaturesTrigger = () => {
      const el = sectionRef.current;
      if (!el) return;

      // On mobile, keep it simple: smoothly scroll directly to the section without transition effects
      if (isMobile) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }

      // On PC and laptop: untouched full 4-phase choreographed scroll sequence
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
  }, [isMobile]);

  // Effective progress from auto play or manual scroll
  const effectiveProgress = isAutoPlaying ? autoProgress : scrollProgress;

  // On PC and laptop: strict 4-phase sequence. On mobile: all elements immediately visible with zero transitions
  const shrinkFactor = isMobile ? 1 : Math.min(Math.max(effectiveProgress / 0.24, 0), 1);
  const bordersVisible = isMobile ? true : effectiveProgress >= 0.24;
  const textVisible = isMobile ? true : effectiveProgress >= 0.48;
  const imageVisible = isMobile ? true : effectiveProgress >= 0.72;
  const isMountedAtFinalSize = isMobile ? true : shrinkFactor >= 0.95;

  // Responsive dimensions:
  // On desktop: Starts at 80% width and 80% height, shrinks to original size (70vw / 70% x 70vh)
  const currentWidth = `calc(80vw - (80vw - min(70vw, 1100px)) * ${shrinkFactor})`;
  const currentHeight = `calc(85vh - (85vh - 75vh) * ${shrinkFactor})`;
  const currentRadius = `${24 + 5.5 * shrinkFactor}px`;
  const innerRadius = 22 + 6 * shrinkFactor;
  const borderOpacity = Math.min(1, 0.7 + 0.3 * shrinkFactor);

  return (
    <div
      ref={sectionRef}
      className="relative w-full bg-white py-8 sm:py-10 lg:py-0 lg:min-h-[320vh] flex items-center justify-center lg:block"
      style={{ backgroundColor: "#ffffff" }}
    >
      {/* Viewport container: simple in-flow on mobile, sticky top-0 on PC/laptop */}
      <div className="relative w-full flex items-center justify-center bg-white lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden">
        {/* Content div: simple static layout on mobile, dynamic shrink on PC/laptop */}
        <div
          className={`relative ${isMobile ? "p-0" : "p-[1.5px]"} transition-all duration-75 flex items-center justify-center ${className ?? ""}`}
          style={{
            width: isMobile ? "92vw" : currentWidth,
            maxWidth: isMobile ? "460px" : undefined,
            height: isMobile ? "auto" : currentHeight,
            borderRadius: isMobile ? "24px" : currentRadius,
            background: isMobile
              ? "transparent"
              : `linear-gradient(135deg, rgba(172, 137, 104, ${borderOpacity}) 0%, rgba(134, 93, 54, ${borderOpacity}) 35%, rgba(147, 120, 91, ${borderOpacity}) 70%, rgba(166, 144, 128, ${borderOpacity}) 100%)`,
            boxShadow: isMobile
              ? "0 12px 36px -8px rgba(0,0,0,0.3)"
              : `0 0 ${25 * borderOpacity}px rgba(172, 137, 104, ${0.35 * borderOpacity}), 0 0 ${55 * borderOpacity}px rgba(134, 93, 54, ${0.25 * borderOpacity}), 0 25px 60px rgba(62, 54, 46, ${0.45 * borderOpacity})`,
          }}
        >
          <BorderGlow
            edgeSensitivity={30}
            glowColor="29 40 55"
            backgroundColor="#000000"
            borderRadius={isMobile ? 24 : innerRadius}
            glowRadius={isMobile ? 20 : 40}
            glowIntensity={isMobile ? 0.8 : borderOpacity}
            coneSpread={25}
            animated={false}
            colors={['#AC8968', '#865D36', '#93785B', '#A69080', '#3E362E']}
            className="w-full h-auto lg:h-full"
          >
            <section
              className="flex flex-col h-auto lg:h-full w-full overflow-hidden text-white bg-black"
              style={{
                backgroundColor: "#000000",
                borderRadius: isMobile ? "24px" : `${innerRadius}px`,
              }}
            >
              {/* Header */}
              <div className="relative shrink-0 px-5 sm:px-6 py-3.5 sm:py-4 bg-black">
                <motion.p
                  initial={isMobile ? { opacity: 1, x: 0, filter: "blur(0px)" } : { opacity: 0, x: -16, filter: "blur(8px)" }}
                  animate={{
                    opacity: textVisible ? 1 : 0,
                    x: textVisible ? 0 : -16,
                    filter: textVisible ? "blur(0px)" : "blur(8px)",
                  }}
                  transition={isMobile ? { duration: 0 } : {
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
                  initial={isMobile ? { opacity: 1, x: 0, filter: "blur(0px)" } : { opacity: 0, x: -16, filter: "blur(8px)" }}
                  animate={{
                    opacity: textVisible ? 1 : 0,
                    x: textVisible ? 0 : -16,
                    filter: textVisible ? "blur(0px)" : "blur(8px)",
                  }}
                  transition={isMobile ? { duration: 0 } : {
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

                {/* Horizontal divider line under header */}
                <motion.div
                  initial={isMobile ? { scaleX: 1 } : { scaleX: 0 }}
                  animate={{ scaleX: bordersVisible ? 1 : 0 }}
                  transition={isMobile ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
                  className="absolute bottom-0 inset-x-0 h-[1px] origin-left pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, #AC896860 15%, #865D3660 50%, #93785B60 85%, transparent)',
                  }}
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
                    className="hidden lg:block absolute right-0 inset-y-0 w-[1px] origin-top pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(180deg, transparent, #AC896860 15%, #865D3660 50%, #93785B60 85%, transparent)',
                    }}
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
                        src="/images/ember-aurora.jpg"
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
                    className="hidden lg:block absolute left-0 inset-y-0 w-[1px] origin-top pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(180deg, transparent, #AC896860 15%, #865D3660 50%, #93785B60 85%, transparent)',
                    }}
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
                <div className="relative h-24 sm:h-32 w-full rounded-xl overflow-hidden border border-[#93785B]/35 bg-black/60 shrink-0">
                  {isMountedAtFinalSize ? (
                    <ChromaticImage
                      src="/images/ember-aurora.jpg"
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
                      src="/images/ember-aurora.jpg"
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
                          ? "bg-[#865D36]/25 text-white border-[#AC8968]/60 shadow-[0_0_12px_rgba(172,137,104,0.35)]"
                          : "bg-white/5 text-neutral-400 border-white/10 hover:text-white"
                      }`}
                      style={{ fontFamily: "'Rowan-Medium', serif" }}
                    >
                      <span className="text-[10px] tracking-wider text-[#AC8968]">
                        {feat.number}
                      </span>
                      <span className="truncate max-w-full text-[10px] sm:text-[11px]">
                        {feat.shortLabel}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Active Feature Details Card (fixed height so card size stays constant) */}
                <div className="relative h-[126px] min-h-[126px] max-h-[126px] shrink-0 flex flex-col justify-start bg-white/[0.03] border border-[#93785B]/30 rounded-xl p-3.5 sm:p-4 overflow-hidden">
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

                {/* Centered navigation dots (arrows removed) */}
                <div className="flex items-center justify-center pt-2 pb-1 shrink-0">
                  <div className="flex items-center gap-2">
                    {allFeatures.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveMobileFeature(idx)}
                        aria-label={`Go to feature ${idx + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          activeMobileFeature === idx
                            ? "w-5 bg-gradient-to-r from-[#AC8968] to-[#865D36]"
                            : "w-1.5 bg-white/25 hover:bg-white/50"
                        }`}
                      />
                    ))}
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
