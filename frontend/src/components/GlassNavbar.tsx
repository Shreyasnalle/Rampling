"use client";

import React, { useState } from "react";
import GlassSurface from "@/components/GlassSurface";
import { IconMenu2, IconX } from "@tabler/icons-react";

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
          <GlassSurface
            width="80%"
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
            className="shadow-[0_8px_32px_rgba(0,0,0,0.37)] border border-white/15 backdrop-blur-xl mx-auto"
          >
            <div className="flex w-full items-center justify-between px-6">
              {/* Rampling Logo at extreme left */}
              <div className="flex-1 flex justify-start">
                <a href="#" className="flex items-center gap-2.5 group">
                  <span className="font-semibold text-xl tracking-tight text-white drop-shadow-sm group-hover:text-white/90 transition-colors">
                    Rampling
                  </span>
                </a>
              </div>

              {/* Features and Contact exactly at the center of the navbar */}
              <nav className="flex items-center justify-center gap-8">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.link}
                    className="text-sm font-medium text-white/75 hover:text-white transition-colors drop-shadow-sm"
                  >
                    {item.name}
                  </a>
                ))}
              </nav>

              {/* White Github Button with black text and div border effect */}
              <div className="flex-1 flex justify-end">
                <a
                  href="https://github.com/Shreyasnalle/Rampling"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 text-sm font-semibold text-neutral-950 hover:bg-neutral-100 rounded-full transition-colors shadow-sm"
                  style={{
                    border: "1px solid transparent",
                    background: [
                      "linear-gradient(#ffffff, #ffffff) padding-box",
                      "linear-gradient(135deg, #c084fc88, #f472b688, #38bdf888) border-box",
                    ].join(", "),
                  }}
                >
                  Github
                </a>
              </div>
            </div>
          </GlassSurface>
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
                <a href="#" className="flex items-center gap-2">
                  <span className="font-semibold text-lg text-white">Rampling</span>
                </a>
                <div className="flex items-center gap-3">
                  <a
                    href="https://github.com/Shreyasnalle/Rampling"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-xs font-semibold text-neutral-950 hover:bg-neutral-100 rounded-full transition-colors"
                    style={{
                      border: "1px solid transparent",
                      background: [
                        "linear-gradient(#ffffff, #ffffff) padding-box",
                        "linear-gradient(135deg, #c084fc88, #f472b688, #38bdf888) border-box",
                      ].join(", "),
                    }}
                  >
                    Github
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
                      className="text-sm font-medium text-white/80 hover:text-white py-1 transition-colors"
                    >
                      {item.name}
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
