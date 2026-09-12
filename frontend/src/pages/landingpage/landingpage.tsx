"use client";

import { useState } from "react";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import ChromaticImageProductHeroDemo from "@/components/chromatic-image-product-hero-demo";
import ChromaticImageBentoFeaturesDemo from "@/components/chromatic-image-bento-features-demo";
import AppFooter from "@/components/footer";

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Features", link: "#features" },
    { name: "Pricing", link: "#pricing" },
    { name: "Contact", link: "#contact" },
  ];

  return (
    <div className="relative min-h-screen w-full bg-neutral-950 text-neutral-50 overflow-x-hidden">
      {/* 1. In the header tag add the header's nav bar */}
      <header className="fixed inset-x-0 top-4 z-50 w-full px-4">
        <Navbar className="top-0">
          {/* Desktop Navigation */}
          <NavBody>
            <NavbarLogo />
            <NavItems items={navItems} />
            <div className="flex items-center gap-4">
              <NavbarButton variant="secondary">Login</NavbarButton>
              <NavbarButton variant="primary">Book a call</NavbarButton>
            </div>
          </NavBody>

          {/* Mobile Navigation */}
          <MobileNav>
            <MobileNavHeader>
              <NavbarLogo />
              <MobileNavToggle
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </MobileNavHeader>

            <MobileNavMenu
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
            >
              {navItems.map((item, idx) => (
                <a
                  key={`mobile-link-${idx}`}
                  href={item.link}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="relative text-neutral-600 dark:text-neutral-300"
                >
                  <span className="block">{item.name}</span>
                </a>
              ))}
              <div className="flex w-full flex-col gap-4">
                <NavbarButton
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="primary"
                  className="w-full"
                >
                  Login
                </NavbarButton>
                <NavbarButton
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="primary"
                  className="w-full"
                >
                  Book a call
                </NavbarButton>
              </div>
            </MobileNavMenu>
          </MobileNav>
        </Navbar>
      </header>

      {/* Main body content container */}
      <main className="w-full">
        {/* 2. In the body tag make div and inside it use the component chromatic-image-product (occupies whole page) */}
        <div className="relative w-full min-h-screen h-screen flex flex-col justify-center">
          <ChromaticImageProductHeroDemo className="h-full w-full rounded-none outline-none" />
        </div>

        {/* 3. In the second div add the chromatic-image-bento */}
        <div id="features" className="w-full min-h-screen py-16 flex items-center justify-center bg-neutral-900/60">
          <ChromaticImageBentoFeaturesDemo />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full">
        <AppFooter />
      </footer>
    </div>
  );
}
