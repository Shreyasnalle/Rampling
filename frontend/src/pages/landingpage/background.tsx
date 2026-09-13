"use client";

import { motion } from "motion/react";
import Aurora from "./Aurora";
import BorderGlow from "@/components/BorderGlow";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { TypewriterWord } from "@/components/ui/typewriter-effect";
import { GooeyInput } from "@/components/ui/gooey-input";

export default function BackgroundHero() {
  return (
    <div className="relative w-full h-full min-h-screen flex items-center justify-center overflow-hidden bg-[#060608]">
      {/* Interactive Aurora WebGL Background Canvas */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <Aurora
          colorStops={["#7cff67", "#b497cf", "#5227ff"]}
          blend={0.5}
          amplitude={1.5}
          speed={0.5}
        />
      </div>

      {/* Centered Hero Content wrapped in BorderGlow */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <motion.div
          initial={{ y: 90, opacity: 0, width: "40%" }}
          animate={{ y: 0, opacity: 1, width: "100%" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex justify-center origin-center"
        >
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
                {[
                  { id: "know", text: "Know" },
                  { id: "how", text: "how" },
                  { id: "your1", text: "your" },
                  { id: "code", text: "code" },
                  { id: "typewriter", isTypewriter: true },
                  { id: "before", text: "before" },
                  { id: "your2", text: "your" },
                  { id: "users", text: "users" },
                  { id: "do", text: "do." },
                ].map((item, idx, arr) => (
                  <motion.span
                    key={item.id}
                    initial={{ opacity: 0, filter: "blur(12px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{
                      duration: 0.5,
                      delay: 0.95 + idx * 0.09,
                      ease: "easeOut",
                    }}
                    className="inline-block"
                  >
                    {item.isTypewriter ? (
                      <span className="inline-block mr-[0.26em]">
                        <TypewriterWord
                          words={["performs", "scales", "breaks", "responds"]}
                          startDelay={1350}
                          className="inline-block text-transparent bg-clip-text"
                          style={{
                            backgroundImage: "linear-gradient(to right, #7cff67, #B497CF, #5227FF)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                          cursorClassName="bg-[#7cff67] shadow-[0_0_8px_#7cff67]"
                        />
                      </span>
                    ) : (
                      <span>
                        {item.text}
                        {idx < arr.length - 1 ? "\u00A0" : ""}
                      </span>
                    )}
                  </motion.span>
                ))}
              </h1>

              {/* Bleak divider matching border color without hover, animating left to right */}
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 1.85, duration: 0.75, ease: "easeOut" }}
                className="my-6 h-[1px] w-full max-w-xs sm:max-w-sm pointer-events-none origin-left"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(192, 132, 252, 0.45) 25%, rgba(244, 114, 182, 0.45) 50%, rgba(56, 189, 248, 0.45) 75%, transparent)',
                }}
              />

              <TextGenerateEffect
                as="p"
                words="Rampling maps every route in your repo, catches architectural bottlenecks, and simulates autonomous agentic load scenarios against staging in minutes. It isolates performance issues down to the exact code lines and prescribes surgical fixes before you ship."
                className="max-w-3xl text-pretty text-sm sm:text-base md:text-lg text-white/85 leading-relaxed font-rowan-regular"
                style={{
                  fontFamily: "'Rowan-Regular', serif",
                  fontVariantLigatures: 'none',
                  fontFeatureSettings: '"calt" 0, "liga" 0, "dlig" 0',
                }}
                duration={0.45}
                delay={2.15}
                staggerDelay={0.028}
              />

              {/* Second divider line matching the one between headline and description */}
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 3.0, duration: 0.75, ease: "easeOut" }}
                className="my-6 h-[1px] w-full max-w-xs sm:max-w-sm pointer-events-none origin-left"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(192, 132, 252, 0.45) 25%, rgba(244, 114, 182, 0.45) 50%, rgba(56, 189, 248, 0.45) 75%, transparent)',
                }}
              />

              {/* In Rowan Medium: Get Notified on Launch and Gooey email input */}
              <motion.div
                initial={{ opacity: 0, y: 16, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 3.35, duration: 0.7, ease: "easeOut" }}
                className="flex flex-col items-center justify-center gap-4 w-full z-20"
              >
                <h3
                  className="text-balance text-base sm:text-lg text-white/90 font-rowan-medium tracking-normal"
                  style={{
                    fontFamily: "'Rowan-Medium', serif",
                    fontVariantLigatures: 'none',
                    fontFeatureSettings: '"calt" 0, "liga" 0, "dlig" 0',
                  }}
                >
                  Get Notified on Launch
                </h3>

                <GooeyInput placeholder="enter your email" />
              </motion.div>
            </div>
          </BorderGlow>
        </motion.div>
      </div>

      {/* Bottom subtle indicator with left-to-right reveal, no rising */}
      <div className="pointer-events-auto absolute bottom-6 inset-x-0 flex select-text items-center justify-center text-center font-mono text-xs tracking-widest text-neutral-400 uppercase gap-x-2 flex-wrap px-4">
        {[
          "Endpoint",
          "Graphing",
          "•",
          "Static",
          "Analysis",
          "•",
          "Load",
          "Simulation",
          "•",
          "Agent",
          "Diagnostics",
        ].map((token, idx) => (
          <motion.span
            key={idx}
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{
              duration: 0.5,
              delay: 3.85 + idx * 0.08,
              ease: "easeOut",
            }}
            className="inline-block"
          >
            {token}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
