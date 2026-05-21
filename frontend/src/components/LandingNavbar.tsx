"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 border-b border-outline-variant bg-surface/80 backdrop-blur-md shadow-sm transition-all ${isScrolled ? "shadow-md bg-surface/95" : ""}`}
    >
      <nav className="flex justify-between items-center h-header-height px-container-padding max-w-7xl mx-auto h-16">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-h1 text-h1 text-primary tracking-tight font-bold text-xl">
            <img src="/scs-logo.jpeg" alt="SCS Flow Logo" className="h-12 w-auto rounded-md object-contain" />
            SCS Flow
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <Link
            className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
            href="/#features"
          >
            Features
          </Link>
          <Link
            className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
            href="/pricing"
          >
            Pricing
          </Link>
          <Link
            className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
            href="/about"
          >
            About
          </Link>
          <Link
            className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
            href="/contact"
          >
            Contact
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link
            className="px-6 py-2 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/90 active:scale-95 transition-all duration-150 shadow-sm"
            href="/login"
          >
            Login
          </Link>
        </div>
      </nav>
    </header>
  );
}
