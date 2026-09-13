'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import Aurora from '@/pages/landingpage/Aurora';
import GlassSurface from '@/components/GlassSurface';

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

interface SocialLink {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const socialLinks: SocialLink[] = [
  { title: 'Github', href: 'https://github.com/Shreyasnalle', icon: GithubIcon },
  { title: 'x', href: 'https://x.com/ShreyasNalle', icon: XIcon },
  { title: 'LinkedIn', href: 'https://www.linkedin.com/in/shreyas-nalle-0697bb371/', icon: LinkedinIcon },
];

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, amount: 0.2 });

  return (
    <footer
      ref={footerRef}
      id="contact"
      className="relative w-full bg-[#060608] overflow-hidden text-neutral-200 min-h-[220px] md:min-h-[250px] flex flex-col justify-between pb-8 md:pb-10"
    >
      {/* Starting divider line placed exactly on the top border of the footer */}
      <div
        className="w-full h-[1.5px] pointer-events-none z-30 shrink-0"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(192, 132, 252, 0.7) 20%, rgba(244, 114, 182, 0.7) 50%, rgba(56, 189, 248, 0.7) 80%, transparent)',
        }}
      />

      {/* 1. First raise the aurora from the bottom */}
      <motion.div
        initial={{ y: 90, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : { y: 90, opacity: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden rotate-180"
      >
        <Aurora
          colorStops={["#7cff67", "#b497cf", "#5227ff"]}
          blend={0.5}
          amplitude={1}
          speed={0.5}
        />
      </motion.div>

      {/* Ambient gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060608] via-[#060608]/40 to-transparent pointer-events-none" />

      {/* Main Footer Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-8 flex flex-col items-center justify-between gap-8 pt-10 md:pt-12">
        {/* 3. Top Row: Display the text with transition from left to right */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-6">
          {/* Logo and Rampling brand name on the left (Rowan Bold) */}
          <motion.div
            initial={{ opacity: 0, x: -16, filter: "blur(8px)" }}
            animate={isInView ? { opacity: 1, x: 0, filter: "blur(0px)" } : { opacity: 0, x: -16, filter: "blur(8px)" }}
            transition={{ delay: 2.15, duration: 0.45, ease: "easeOut" }}
            className="flex items-center gap-3 cursor-default select-none"
          >
            <img
              src="/logo.png"
              alt="Rampling Logo"
              className="size-8 rounded-lg object-contain pointer-events-none"
            />
            <span
              className="text-xl font-bold text-white tracking-tight font-rowan-bold"
              style={{
                fontFamily: "'Rowan-Bold', 'Rowan-Semibold', serif",
                fontWeight: 700,
                fontVariantLigatures: 'none',
                fontFeatureSettings: '"calt" 0, "liga" 0, "dlig" 0',
              }}
            >
              Rampling
            </span>
          </motion.div>

          {/* Social Links on the right rendered with left-to-right transition (White color, Rowan Light) */}
          <div className="flex items-center gap-7">
            {socialLinks.map((link, idx) => (
              <motion.a
                key={link.title}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -14, filter: "blur(8px)" }}
                animate={isInView ? { opacity: 1, x: 0, filter: "blur(0px)" } : { opacity: 0, x: -14, filter: "blur(8px)" }}
                transition={{
                  delay: 2.35 + idx * 0.12,
                  duration: 0.4,
                  ease: "easeOut",
                }}
                className="font-rowan-light text-sm text-white hover:text-white/80 inline-flex items-center gap-2 transition-colors duration-200 group"
                style={{
                  fontFamily: "'Rowan-Light', serif",
                  fontWeight: 300,
                  fontVariantLigatures: 'none',
                  fontFeatureSettings: '"calt" 0, "liga" 0, "dlig" 0',
                }}
              >
                <link.icon className="size-4 shrink-0 transition-transform group-hover:scale-110 duration-200 text-white" />
                <span className="text-white">{link.title}</span>
              </motion.a>
            ))}
          </div>
        </div>

        {/* 2. Then raise the glassbar with heart first to its horizontal position, then expand it to show "Made with ❤️ by Shreyas Nalle" in Rowan Medium */}
        <div className="flex justify-center w-full pt-2">
          <motion.div
            initial={{ y: 45, opacity: 0, width: 44 }}
            animate={isInView ? { y: 0, opacity: 1, width: 252 } : { y: 45, opacity: 0, width: 44 }}
            transition={{
              y: { delay: 0.3, duration: 0.45, ease: "easeOut" },
              opacity: { delay: 0.3, duration: 0.3, ease: "easeOut" },
              width: { delay: 0.75, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
            }}
            className="flex justify-center mx-auto overflow-hidden rounded-[22px] min-w-0 max-w-[92vw]"
          >
            <GlassSurface
              width="100%"
              height={44}
              borderRadius={22}
              displace={0.4}
              distortionScale={-160}
              redOffset={10}
              greenOffset={100}
              blueOffset={50}
              brightness={75}
              opacity={0.92}
              backgroundOpacity={0.08}
              blur={20}
              mixBlendMode="screen"
              className="shadow-[0_8px_32px_rgba(0,0,0,0.37)] border border-white/15 backdrop-blur-xl flex items-center justify-center w-full"
            >
              <div className="flex items-center justify-center whitespace-nowrap select-none font-rowan-medium text-xs sm:text-sm text-white/95">
                {/* Left wing: "Made with" reveals FIRST as the glassbar expands */}
                <motion.div
                  initial={{ opacity: 0, maxWidth: 0, x: -10, filter: "blur(6px)" }}
                  animate={
                    isInView
                      ? { opacity: 1, maxWidth: 85, x: 0, filter: "blur(0px)" }
                      : { opacity: 0, maxWidth: 0, x: -10, filter: "blur(6px)" }
                  }
                  transition={{
                    maxWidth: { delay: 0.75, duration: 0.4, ease: "easeOut" },
                    opacity: { delay: 0.95, duration: 0.35, ease: "easeOut" },
                    x: { delay: 0.95, duration: 0.35, ease: "easeOut" },
                    filter: { delay: 0.95, duration: 0.35, ease: "easeOut" },
                  }}
                  className="overflow-hidden flex items-center justify-end shrink-0"
                >
                  <span
                    className="font-rowan-medium text-xs sm:text-sm text-white/95 whitespace-nowrap pr-1.5 select-none"
                    style={{
                      fontFamily: "'Rowan-Medium', serif",
                      fontWeight: 500,
                      fontVariantLigatures: 'none',
                      fontFeatureSettings: '"calt" 0, "liga" 0, "dlig" 0',
                    }}
                  >
                    Made with
                  </span>
                </motion.div>

                {/* Center: Heart (always centered in compact 44px pill) */}
                <div className="shrink-0 flex items-center justify-center select-none px-1">
                  <span className="text-red-500 text-sm leading-none">
                    ❤️
                  </span>
                </div>

                {/* Right wing: "by Shreyas Nalle" reveals SECOND after "Made with" is settled */}
                <motion.div
                  initial={{ opacity: 0, maxWidth: 0, x: -10, filter: "blur(6px)" }}
                  animate={
                    isInView
                      ? { opacity: 1, maxWidth: 135, x: 0, filter: "blur(0px)" }
                      : { opacity: 0, maxWidth: 0, x: -10, filter: "blur(6px)" }
                  }
                  transition={{
                    maxWidth: { delay: 0.8, duration: 0.4, ease: "easeOut" },
                    opacity: { delay: 1.45, duration: 0.35, ease: "easeOut" },
                    x: { delay: 1.45, duration: 0.35, ease: "easeOut" },
                    filter: { delay: 1.45, duration: 0.35, ease: "easeOut" },
                  }}
                  className="overflow-hidden flex items-center justify-start shrink-0"
                >
                  <span
                    className="font-rowan-medium text-xs sm:text-sm text-white/95 whitespace-nowrap pl-1.5 select-none"
                    style={{
                      fontFamily: "'Rowan-Medium', serif",
                      fontWeight: 500,
                      fontVariantLigatures: 'none',
                      fontFeatureSettings: '"calt" 0, "liga" 0, "dlig" 0',
                    }}
                  >
                    by Shreyas Nalle
                  </span>
                </motion.div>
              </div>
            </GlassSurface>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
