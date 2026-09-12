"use client";

import { motion } from "motion/react";
import Aurora from "./Aurora";
import BorderGlow from "@/components/BorderGlow";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { TypewriterWord } from "@/components/ui/typewriter-effect";

export default function BackgroundHero() {
  return (
    <div className="relative w-full h-full min-h-screen flex items-center justify-center overflow-hidden bg-neutral-950">
      {/* Interactive Aurora WebGL Background Canvas */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <Aurora
          colorStops={["#7cff67", "#b497cf", "#5227ff"]}
          blend={0.5}
          amplitude={1.0}
          speed={1}
        />
      </div>

      {/* Centered Hero Content wrapped in BorderGlow */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <BorderGlow
          edgeSensitivity={30}
          glowColor="40 80 80"
          backgroundColor="#120F17"
          borderRadius={28}
          glowRadius={40}
          glowIntensity={1}
          coneSpread={25}
          animated={false}
          colors={['#c084fc', '#f472b6', '#38bdf8']}
          className="w-full"
        >
          <div className="p-8 sm:p-12 md:p-14 text-center flex flex-col items-center justify-center">
            <h1
              className="text-balance text-3xl sm:text-5xl lg:text-6xl font-semibold text-white leading-[1.16] sm:leading-[1.14] font-rowan-semibold"
              style={{
                fontFamily: "'Rowan-Semibold', serif",
                fontVariantLigatures: 'none',
                fontFeatureSettings: '"calt" 0, "liga" 0, "dlig" 0',
              }}
            >
              Know how your code{" "}
              <TypewriterWord
                words={["performs", "scales", "breaks", "responds"]}
                className="inline-block text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(to right, #7cff67, #B497CF, #5227FF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
                cursorClassName="bg-[#7cff67] shadow-[0_0_8px_#7cff67]"
              />{" "}
              before your users do.
            </h1>

            {/* Bleak divider matching border color without hover, animating left to right */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.75, duration: 0.55, ease: "easeOut" }}
              className="my-6 h-[1px] w-full max-w-xs sm:max-w-sm pointer-events-none origin-left"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(192, 132, 252, 0.45) 25%, rgba(244, 114, 182, 0.45) 50%, rgba(56, 189, 248, 0.45) 75%, transparent)',
              }}
            />

            <TextGenerateEffect
              as="p"
              words="Rampling automatically maps every route in your repo, catches architectural bottlenecks and simulates autonomous agentic load scenarios of production traffic against staging in minutes. Later mapping with exact code lines, proven bottlenecks with hard empirical data and prescribe surgical code fixes before you ship."
              className="max-w-3xl text-pretty text-sm sm:text-base md:text-lg text-white/85 leading-relaxed font-rowan-regular"
              style={{
                fontFamily: "'Rowan-Regular', serif",
                fontVariantLigatures: 'none',
                fontFeatureSettings: '"calt" 0, "liga" 0, "dlig" 0',
              }}
              duration={0.3}
              delay={0.85}
              staggerDelay={0.025}
            />
          </div>
        </BorderGlow>
      </div>

      {/* Bottom subtle indicator */}
      <div className="pointer-events-auto absolute bottom-6 inset-x-0 flex select-text items-center justify-center text-center font-mono text-xs tracking-widest text-neutral-400 uppercase">
        <span>Endpoint Graphing • Static Analysis • Load Simulation • Agent Diagnostics</span>
      </div>
    </div>
  );
}
