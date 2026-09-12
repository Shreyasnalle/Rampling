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
  { name: "Pricing", link: "#pricing" },
  { name: "Contact", link: "#contact" },
];

export default function GlassNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-5 z-50 flex justify-center px-4 pointer-events-none">
      <div className="w-full max-w-5xl pointer-events-auto">
        {/* Desktop Navbar */}
        <div className="hidden md:block w-full">
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
            className="w-full shadow-[0_8px_32px_rgba(0,0,0,0.37)] border border-white/15 backdrop-blur-xl"
          >
            <div className="flex w-full items-center justify-between px-6">
              {/* Logo */}
              <a href="#" className="flex items-center gap-2.5 group">
                <span className="font-semibold text-xl tracking-tight text-white drop-shadow-sm group-hover:text-white/90 transition-colors">
                  Rampling
                </span>
              </a>

              {/* Nav Items */}
              <nav className="flex items-center gap-8">
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

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  Login
                </button>
                <button
                  type="button"
                  className="px-5 py-2 text-sm font-semibold text-neutral-950 bg-white hover:bg-neutral-100 rounded-full transition-all shadow-md shadow-black/20 hover:scale-105 active:scale-95"
                >
                  Book a call
                </button>
              </div>
            </div>
          </GlassSurface>
        </div>

        {/* Mobile Navbar */}
        <div className="md:hidden w-full">
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
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-1.5 text-white/80 hover:text-white"
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? <IconX size={22} /> : <IconMenu2 size={22} />}
                </button>
              </div>

              {isMobileMenuOpen && (
                <div className="flex flex-col gap-4 pt-5 pb-2 border-t border-white/10 mt-3">
                  {navItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.link}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-sm font-medium text-white/80 hover:text-white py-1"
                    >
                      {item.name}
                    </a>
                  ))}
                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      type="button"
                      className="w-full py-2.5 text-sm font-medium text-white/80 border border-white/20 rounded-xl hover:bg-white/10"
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      className="w-full py-2.5 text-sm font-semibold text-neutral-950 bg-white rounded-xl hover:bg-neutral-100"
                    >
                      Book a call
                    </button>
                  </div>
                </div>
              )}
            </div>
          </GlassSurface>
        </div>
      </div>
    </header>
  );
}
