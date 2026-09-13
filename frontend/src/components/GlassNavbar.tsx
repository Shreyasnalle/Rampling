"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import GlassSurface from "@/components/GlassSurface";
import { IconMenu2, IconX } from "@tabler/icons-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

interface NavItem {
  name: string;
  link: string;
}

const navItems: NavItem[] = [
  { name: "Features", link: "#features" },
  { name: "Contact", link: "#contact" },
];

export default function GlassNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-5 z-50 flex justify-center px-4 pointer-events-none">
      <div className="w-full max-w-5xl pointer-events-auto flex justify-center">
        {/* Desktop Navbar */}
        <div className="hidden md:flex justify-center w-full">
          <motion.div
            initial={{ y: -80, opacity: 0, width: "20%" }}
            animate={{ y: 0, opacity: 1, width: "70%" }}
            transition={{
              y: { duration: 0.5, ease: "easeOut" },
              opacity: { duration: 0.35, ease: "easeOut" },
              width: { delay: 1.0, duration: 1.5, ease: [0.22, 1, 0.36, 1] },
            }}
            className="flex justify-center mx-auto min-w-0 overflow-hidden rounded-[20px]"
          >
            <GlassSurface
              width="100%"
              height={68}
              borderRadius={20}
              displace={0.5}
              distortionScale={-180}
              redOffset={10}
              greenOffset={100}
              blueOffset={50}
              brightness={80}
              opacity={0.92}
              backgroundOpacity={0.08}
              blur={25}
              mixBlendMode="screen"
              className="shadow-[0_8px_32px_rgba(0,0,0,0.37)] border border-white/15 backdrop-blur-xl mx-auto w-full"
            >
              <div className="flex w-full items-center justify-between px-6 whitespace-nowrap">
                {/* Rampling Logo & Name (comes down directly with the navbar in 0.5s) */}
                <div className="flex-1 flex justify-start">
                  <div className="flex items-center gap-3 cursor-default select-none shrink-0">
                    <img
                      src="/logo.png"
                      alt="Rampling Logo"
                      className="size-8 rounded-lg object-contain pointer-events-none shrink-0"
                    />
                    <span
                      className="font-semibold text-xl tracking-tight text-white drop-shadow-sm font-rowan-semibold cursor-default select-none shrink-0"
                      style={{
                        fontFamily: "'Rowan-Semibold', serif",
                        fontVariantLigatures: 'none',
                        fontFeatureSettings: '"calt" 0, "liga" 0, "dlig" 0',
                      }}
                    >
                      Rampling
                    </span>
                  </div>
                </div>

                {/* Features and Contact revealed after width reaches original size (2.5s+) */}
                <nav className="flex items-center justify-center gap-8">
                  {navItems.map((item, idx) => (
                    <motion.a
                      key={item.name}
                      href={item.link}
                      initial={{ opacity: 0, filter: "blur(12px)", x: -14 }}
                      animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: 2.5 + idx * 0.2,
                        ease: "easeOut",
                      }}
                      className="relative py-1 text-sm font-rowan-light text-white/80 hover:text-white transition-colors drop-shadow-sm tracking-wide group"
                      style={{
                        fontFamily: "'Rowan-Light', serif",
                        fontVariantLigatures: 'none',
                        fontFeatureSettings: '"calt" 0, "liga" 0, "dlig" 0',
                      }}
                    >
                      <span>{item.name}</span>
                      {/* Divider line moving from left to right in 0.5s on hover, keeping constant uniform width */}
                      <span
                        className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out pointer-events-none transform-gpu"
                        style={{
                          background:
                            'linear-gradient(90deg, #c084fc 0%, #f472b6 50%, #38bdf8 100%)',
                        }}
                      />
                    </motion.a>
                  ))}
                </nav>

                {/* White Github Button revealed after navbar reaches original size */}
                <motion.div
                  initial={{ opacity: 0, filter: "blur(12px)", x: -14 }}
                  animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
                  transition={{ duration: 0.5, delay: 2.95, ease: "easeOut" }}
                  className="flex-1 flex justify-end"
                >
                  <a
                    href="https://github.com/Shreyasnalle/Rampling"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1.5 bg-white text-black hover:bg-neutral-100 rounded-full transition-all duration-200 shadow-sm inline-flex items-center gap-1 group"
                  >
                    <GithubIcon className="size-4 shrink-0 text-black stroke-[2.5]" />
                    <span
                      className="text-sm font-medium text-black tracking-widest font-rowan-medium"
                      style={{
                        fontFamily: "'Rowan-Medium', serif",
                        fontVariantLigatures: 'none',
                        fontFeatureSettings: '"calt" 0, "liga" 0, "dlig" 0',
                      }}
                    >
                      Github
                    </span>
                  </a>
                </motion.div>
              </div>
            </GlassSurface>
          </motion.div>
        </div>

        {/* Mobile Navbar */}
        <div className="md:hidden w-full flex justify-center">
          <GlassSurface
            width="100%"
            height={isMobileMenuOpen ? "auto" : 60}
            borderRadius={24}
            displace={0.4}
            distortionScale={-140}
            brightness={60}
            opacity={0.92}
            backgroundOpacity={0.12}
            blur={14}
            mixBlendMode="screen"
            className="w-full shadow-lg border border-white/15 backdrop-blur-xl"
          >
            <div className="flex flex-col w-full px-5 py-3">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5 cursor-default select-none">
                  <img
                    src="/logo.png"
                    alt="Rampling Logo"
                    className="size-7 rounded-lg object-contain pointer-events-none"
                  />
                  <span
                    className="font-semibold text-lg text-white font-rowan-semibold cursor-default select-none"
                    style={{
                      fontFamily: "'Rowan-Semibold', serif",
                      fontVariantLigatures: 'none',
                      fontFeatureSettings: '"calt" 0, "liga" 0, "dlig" 0',
                    }}
                  >
                    Rampling
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href="https://github.com/Shreyasnalle/Rampling"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-white text-black hover:bg-neutral-100 rounded-full transition-all duration-200 shadow-sm inline-flex items-center gap-1.5"
                  >
                    <GithubIcon className="size-3.5 shrink-0 text-black stroke-[2.5]" />
                    <span
                      className="text-xs font-medium text-black tracking-widest font-rowan-medium"
                      style={{
                        fontFamily: "'Rowan-Medium', serif",
                        fontVariantLigatures: 'none',
                        fontFeatureSettings: '"calt" 0, "liga" 0, "dlig" 0',
                      }}
                    >
                      Github
                    </span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-1.5 text-white/80 hover:text-white"
                    aria-label="Toggle menu"
                  >
                    {isMobileMenuOpen ? <IconX size={22} /> : <IconMenu2 size={22} />}
                  </button>
                </div>
              </div>

              {isMobileMenuOpen && (
                <div className="flex flex-col gap-3 pt-4 pb-2 border-t border-white/10 mt-3">
                  {navItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.link}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="relative text-sm font-rowan-light text-white/80 hover:text-white py-1 transition-colors tracking-wide group w-fit"
                      style={{
                        fontFamily: "'Rowan-Light', serif",
                        fontVariantLigatures: 'none',
                        fontFeatureSettings: '"calt" 0, "liga" 0, "dlig" 0',
                      }}
                    >
                      <span>{item.name}</span>
                      <span
                        className="absolute bottom-0 left-0 h-[1.5px] w-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 ease-out pointer-events-none"
                        style={{
                          background:
                            'linear-gradient(90deg, transparent, rgba(192, 132, 252, 0.85) 25%, rgba(244, 114, 182, 0.85) 50%, rgba(56, 189, 248, 0.85) 75%, transparent)',
                        }}
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </GlassSurface>
        </div>
      </div>
    </header>
  );
}
