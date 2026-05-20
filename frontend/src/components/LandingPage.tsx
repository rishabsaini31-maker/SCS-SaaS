"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen">
      {/* TopNavBar */}
      <header
        className={`fixed top-0 w-full z-50 border-b border-outline-variant bg-surface/80 backdrop-blur-md shadow-sm ${isScrolled ? "shadow-md bg-surface/95" : ""}`}
      >
        <nav className="flex justify-between items-center h-header-height px-container-padding max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="font-h1 text-h1 text-primary tracking-tight">
              WholesalePro
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
              href="#features"
            >
              Features
            </a>
            <a
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
              href="#pricing"
            >
              Pricing
            </a>
            <a
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
              href="#about"
            >
              About
            </a>
            <a
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
              href="#contact"
            >
              Contact
            </a>
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
      <main className="pt-header-height">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,#dbe1ff_0%,transparent_100%)] opacity-30"></div>
          <div className="max-w-7xl mx-auto px-container-padding text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-on-surface mb-6 max-w-4xl mx-auto leading-[1.1]">
              Smart Inventory &amp; Billing Software for Modern Businesses
            </h1>
            <p className="font-body-md text-lg text-on-surface-variant mb-10 max-w-2xl mx-auto">
              Manage billing, stock, purchases, payments, barcode labels, and
              reports in one powerful SaaS platform designed for high-efficiency
              wholesale operations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                className="w-full sm:w-auto px-8 py-4 bg-primary text-on-primary rounded-xl font-bold text-lg hover:shadow-lg active:scale-95 transition-all text-center"
                href="/login"
              >
                Login
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 bg-white border border-outline-variant text-on-surface rounded-xl font-bold text-lg hover:bg-surface-container-low active:scale-95 transition-all linear-shadow">
                Book Demo
              </button>
            </div>
            <div className="relative max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-outline-variant bg-white p-2">
              <img
                alt="WholesalePro Dashboard Overview"
                className="w-full rounded-xl"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2EhC_f7dnDzsemHF894lULl73NFDqkeOAk4_0M-aoXfEJ406PRr9NWXEDGAHTeR6111KB-EBgi-bmKIT7R5NJHKUKGFER_maEOa1LX8Q5pJV2bX3NUHUyx-t3qGW5QFfxl6fcyqIxTeBn3cnInOWZO9R45o5ytNX9FYwy-pLKxfhoskp090i79ZJXUv-m8CDYeuv5jKA4He8VI0mh8w-H5fMPVogxuBR8ZJYytq1oWUGBgcLO1EaGl2xi0FNOhKdxa7AtXwoRTfI"
              />
            </div>
          </div>
        </section>
        {/* Features Bento Grid */}
        <section className="py-24 bg-surface-container-lowest" id="features">
          <div className="max-w-7xl mx-auto px-container-padding">
            <div className="text-center mb-16">
              <span className="text-primary font-label-caps text-label-caps uppercase tracking-widest">
                Capabilities
              </span>
              <h2 className="text-4xl font-bold mt-4">
                Everything you need to scale
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature Cards */}
              <div className="p-6 bg-white border border-outline-variant rounded-xl hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-primary-fixed text-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">
                    receipt_long
                  </span>
                </div>
                <h3 className="font-h1 text-h1 mb-2">GST Billing</h3>
                <p className="text-on-surface-variant font-body-sm text-body-sm">
                  Compliant invoicing with automated tax calculations for
                  stress-free filing.
                </p>
              </div>
              <div className="p-6 bg-white border border-outline-variant rounded-xl hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-primary-fixed text-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">inventory_2</span>
                </div>
                <h3 className="font-h1 text-h1 mb-2">Inventory Tracking</h3>
                <p className="text-on-surface-variant font-body-sm text-body-sm">
                  Real-time stock monitoring with low-inventory alerts and
                  multi-warehouse support.
                </p>
              </div>
              <div className="p-6 bg-white border border-outline-variant rounded-xl hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-primary-fixed text-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">
                    shopping_cart
                  </span>
                </div>
                <h3 className="font-h1 text-h1 mb-2">Purchase Management</h3>
                <p className="text-on-surface-variant font-body-sm text-body-sm">
                  Streamline vendor orders, GRNs, and purchase returns in one
                  unified view.
                </p>
              </div>
              <div className="p-6 bg-white border border-outline-variant rounded-xl hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-primary-fixed text-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">groups</span>
                </div>
                <h3 className="font-h1 text-h1 mb-2">
                  Customer &amp; Supplier
                </h3>
                <p className="text-on-surface-variant font-body-sm text-body-sm">
                  Maintain detailed ledgers and credit history for all your
                  business relations.
                </p>
              </div>
              <div className="p-6 bg-white border border-outline-variant rounded-xl hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-primary-fixed text-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">
                    barcode_scanner
                  </span>
                </div>
                <h3 className="font-h1 text-h1 mb-2">Barcode Generator</h3>
                <p className="text-on-surface-variant font-body-sm text-body-sm">
                  Generate and print custom barcode labels for easy product
                  identification.
                </p>
              </div>
              <div className="p-6 bg-white border border-outline-variant rounded-xl hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-primary-fixed text-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <h3 className="font-h1 text-h1 mb-2">Payment Tracking</h3>
                <p className="text-on-surface-variant font-body-sm text-body-sm">
                  Monitor all incoming and outgoing payments with multi-mode
                  reconciliation.
                </p>
              </div>
              <div className="p-6 bg-white border border-outline-variant rounded-xl hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-primary-fixed text-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">analytics</span>
                </div>
                <h3 className="font-h1 text-h1 mb-2">
                  Reports &amp; Analytics
                </h3>
                <p className="text-on-surface-variant font-body-sm text-body-sm">
                  Deep insights into sales, profits, and taxes with visual data
                  charts.
                </p>
              </div>
              <div className="p-6 bg-white border border-outline-variant rounded-xl hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-primary-fixed text-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">
                    pending_actions
                  </span>
                </div>
                <h3 className="font-h1 text-h1 mb-2">Outstanding Tracking</h3>
                <p className="text-on-surface-variant font-body-sm text-body-sm">
                  Automated reminders for pending bills to maintain healthy cash
                  flow.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Workflow Section */}
        <section className="py-24 bg-surface">
          <div className="max-w-7xl mx-auto px-container-padding">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold">Efficient Workflow</h2>
              <p className="text-on-surface-variant mt-4">
                From warehouse to customer in 5 simple steps
              </p>
            </div>
            <div className="flex flex-col lg:flex-row justify-between items-start gap-8 relative">
              {/* Progress Line */}
              <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-outline-variant -z-10"></div>
              {/* Steps */}
              <div className="flex-1 flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center text-xl font-bold mb-6 ring-8 ring-surface shadow-lg transition-transform group-hover:scale-110">
                  1
                </div>
                <h4 className="font-bold mb-2">Add Products</h4>
                <p className="text-on-surface-variant font-body-sm px-4">
                  Import or manually enter your catalog items.
                </p>
              </div>
              <div className="flex-1 flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center text-xl font-bold mb-6 ring-8 ring-surface shadow-lg transition-transform group-hover:scale-110">
                  2
                </div>
                <h4 className="font-bold mb-2">Create Bills</h4>
                <p className="text-on-surface-variant font-body-sm px-4">
                  Generate professional GST invoices instantly.
                </p>
              </div>
              <div className="flex-1 flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center text-xl font-bold mb-6 ring-8 ring-surface shadow-lg transition-transform group-hover:scale-110">
                  3
                </div>
                <h4 className="font-bold mb-2">Track Inventory</h4>
                <p className="text-on-surface-variant font-body-sm px-4">
                  Watch stocks update in real-time as you sell.
                </p>
              </div>
              <div className="flex-1 flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center text-xl font-bold mb-6 ring-8 ring-surface shadow-lg transition-transform group-hover:scale-110">
                  4
                </div>
                <h4 className="font-bold mb-2">Manage Payments</h4>
                <p className="text-on-surface-variant font-body-sm px-4">
                  Record payments and manage credit limits.
                </p>
              </div>
              <div className="flex-1 flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center text-xl font-bold mb-6 ring-8 ring-surface shadow-lg transition-transform group-hover:scale-110">
                  5
                </div>
                <h4 className="font-bold mb-2">Print Barcodes</h4>
                <p className="text-on-surface-variant font-body-sm px-4">
                  Tag items for rapid scanning and checkout.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Why Choose Us */}
        <section className="py-24 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-container-padding">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-8">
                  Why wholesalers choose us
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4 p-4 rounded-xl bg-white linear-shadow">
                    <div className="w-10 h-10 shrink-0 bg-secondary-container text-primary rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined">bolt</span>
                    </div>
                    <div>
                      <h4 className="font-bold">Lightning Fast Performance</h4>
                      <p className="text-on-surface-variant text-sm">
                        Our platform is optimized for high-volume transactions
                        without lag.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-xl bg-white linear-shadow">
                    <div className="w-10 h-10 shrink-0 bg-secondary-container text-primary rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined">
                        business
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold">Multi-Business Support</h4>
                      <p className="text-on-surface-variant text-sm">
                        Manage multiple branches or businesses under one
                        account.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-xl bg-white linear-shadow">
                    <div className="w-10 h-10 shrink-0 bg-secondary-container text-primary rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined">sync</span>
                    </div>
                    <div>
                      <h4 className="font-bold">Real-time Cloud Sync</h4>
                      <p className="text-on-surface-variant text-sm">
                        Access your data from any device, anywhere, instantly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-8 bg-primary rounded-2xl text-on-primary flex flex-col justify-center items-center text-center">
                  <span className="text-4xl font-extrabold mb-2">99.9%</span>
                  <span className="text-sm font-medium opacity-80 uppercase tracking-wider">
                    Uptime
                  </span>
                </div>
                <div className="p-8 bg-white border border-outline-variant rounded-2xl flex flex-col justify-center items-center text-center">
                  <span className="text-4xl font-extrabold mb-2 text-primary">
                    10k+
                  </span>
                  <span className="text-sm font-medium text-on-surface-variant uppercase tracking-wider">
                    Users
                  </span>
                </div>
                <div className="p-8 bg-white border border-outline-variant rounded-2xl flex flex-col justify-center items-center text-center">
                  <span className="text-4xl font-extrabold mb-2 text-primary">
                    24/7
                  </span>
                  <span className="text-sm font-medium text-on-surface-variant uppercase tracking-wider">
                    Support
                  </span>
                </div>
                <div className="p-8 bg-inverse-surface rounded-2xl text-inverse-on-surface flex flex-col justify-center items-center text-center">
                  <span className="text-4xl font-extrabold mb-2">AES</span>
                  <span className="text-sm font-medium opacity-80 uppercase tracking-wider">
                    Security
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Testimonials */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-container-padding">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold">Loved by business owners</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 bg-white border border-outline-variant rounded-2xl linear-shadow">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    alt="Customer Profile"
                    className="w-12 h-12 rounded-full object-cover"
                    data-alt="A professional headshot of a middle-aged male business owner with a friendly and confident expression. He is wearing a smart-casual blazer in a modern, brightly lit office environment. The lighting is soft and natural, emphasizing a high-fidelity light-mode aesthetic with clean white backgrounds and subtle blue accents. The style is minimalist and corporate-chic."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAKQgLAfZKWzIbWtUihXTVlgyXysNYk15MWkqFK9SYbt9Y2fkAT0-y61zCW4hyd1BLd9fyE6uFbTavgBmB8ekG9wxblWxIdBIbc-OEfKywLUOyt7PeOtCsB5VVES9CMRbpEmXS-ee480QOIxuKtdPhAkHqmM7weGLfVwW7g9BHqbGr1XNEngUZUqjLyvNF5RxMtXrYndVxXWqC8YuDNKkvLOjuCuH4NA855w8N9Dgoi-nnrSyMR5txc3G3XlyWWTFqIhustH0O_X8"
                  />
                  <div>
                    <h4 className="font-bold">David Chen</h4>
                    <span className="text-xs text-on-surface-variant">
                      Metro Wholesalers
                    </span>
                  </div>
                </div>
                <p className="text-on-surface-variant font-body-md italic">
                  "WholesalePro transformed our billing process. What used to
                  take hours now takes minutes. The inventory tracking is
                  pinpoint accurate."
                </p>
              </div>
              <div className="p-8 bg-white border border-outline-variant rounded-2xl linear-shadow">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    alt="Customer Profile"
                    className="w-12 h-12 rounded-full object-cover"
                    data-alt="A professional headshot of a confident female entrepreneur in her early 30s. She is smiling naturally, wearing a crisp white shirt against a minimalist, high-key studio background with soft primary blue highlights. The image quality is crisp, mirroring the high-performance SaaS platform's aesthetic, with a clean and sophisticated corporate lighting setup."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlsr0yc19IiJR5gCxGDXozjerK-so1wSOz0thVx3WZdapkf6hedjKT9mzC7GLF-_VOi5l15BwHSt4utb31ZUtM6GNfy8kyggjnnjNcVa0m3g53r8YX_4gRHtpiVO_CnCZ6J5Z9yOjJqpqSi45OxR53c3r8KUMgqLs5v3XekQo-YrB__5QeW0z5aVdXRX6Tm4Ld0DsSK1Bacj48GwWW1DKulTB-zX_lEAcslGkooA6HopthiWo5-GdlqgkSOM5gYpGmPDhXKGAAqQo"
                  />
                  <div>
                    <h4 className="font-bold">Sarah Miller</h4>
                    <span className="text-xs text-on-surface-variant">
                      Global Supplies Ltd
                    </span>
                  </div>
                </div>
                <p className="text-on-surface-variant font-body-md italic">
                  "Managing three branches was a nightmare before WholesalePro.
                  Now I have a unified view of all my stock and sales from my
                  home office."
                </p>
              </div>
              <div className="p-8 bg-white border border-outline-variant rounded-2xl linear-shadow">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    alt="Customer Profile"
                    className="w-12 h-12 rounded-full object-cover"
                    data-alt="A portrait of a male tech-savvy entrepreneur with a modern, sharp aesthetic. He is standing in a sleek architectural space with glass and steel elements. The lighting is bright and clean, consistent with a premium SaaS brand palette of white, slate, and vibrant blue. The mood is visionary and reliable, captured in a high-definition, minimalist photography style."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRu8cgLKIQbAnT5aYTDNaHBYionTI5k8Jtt_sn_YITgWQbdHICMK-EQmUktlszblAU3gxy5RzVfxHgVH9QEVOQHVbrkreyWIMKsdXBt1U7IoNThFdRAxlHhPcZ8iMnEEf6TqqE2Bq-D2Sri4hklonaBdyHwjocHmJENcYZDpKGzWDqDan5BXHMAz30X4WuhA3pfOzTTpC7fFDRAQ7ukzP8I7CgLQBYysIAlJX6zo7wjm-95RaYhNIyfQTRo8Ua7spqsT2Dj7GJdOI"
                  />
                  <div>
                    <h4 className="font-bold">James Wilson</h4>
                    <span className="text-xs text-on-surface-variant">
                      TechHub Distribution
                    </span>
                  </div>
                </div>
                <p className="text-on-surface-variant font-body-md italic">
                  "The barcode generation feature saved us thousands in hardware
                  costs. It's truly an all-in-one tool for modern businesses."
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* CTA Section */}
        <section className="py-24 px-container-padding">
          <div className="max-w-7xl mx-auto">
            <div className="bg-primary-container rounded-4xl p-12 md:p-20 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32"></div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-on-primary-container mb-6 relative z-10">
                Ready to simplify your business operations?
              </h2>
              <p className="text-on-primary-container/80 text-lg mb-10 max-w-2xl mx-auto relative z-10">
                Join 10,000+ businesses who trust WholesalePro for their daily
                operations.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                <Link
                  className="px-10 py-4 bg-white text-primary rounded-xl font-bold text-lg hover:bg-surface-container-low transition-all text-center"
                  href="/login"
                >
                  Login
                </Link>
                <button className="px-10 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* Footer */}
      <footer className="border-t border-outline-variant bg-surface-container-lowest py-16">
        <div className="max-w-7xl mx-auto px-container-padding">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <span className="font-h1 text-h1 text-on-surface tracking-tight mb-4 block">
                WholesalePro
              </span>
              <p className="text-on-surface-variant font-body-sm mb-6">
                The ultimate management platform for modern wholesalers and
                distributors.
              </p>
              <div className="flex gap-4">
                <a
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-primary-fixed transition-all"
                  href="/"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    share
                  </span>
                </a>
                <a
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-primary-fixed transition-all"
                  href="/"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    hub
                  </span>
                </a>
              </div>
            </div>
            <div>
              <h5 className="font-label-caps text-label-caps text-primary uppercase mb-6">
                Product
              </h5>
              <ul className="space-y-4 font-body-sm text-on-surface-variant">
                <li>
                  <a
                    className="hover:text-primary hover:underline underline-offset-4 decoration-primary transition-colors"
                    href="/"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-primary hover:underline underline-offset-4 decoration-primary transition-colors"
                    href="/"
                  >
                    Integrations
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-primary hover:underline underline-offset-4 decoration-primary transition-colors"
                    href="/"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-primary hover:underline underline-offset-4 decoration-primary transition-colors"
                    href="/"
                  >
                    Changelog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-label-caps text-label-caps text-primary uppercase mb-6">
                Company
              </h5>
              <ul className="space-y-4 font-body-sm text-on-surface-variant">
                <li>
                  <a
                    className="hover:text-primary hover:underline underline-offset-4 decoration-primary transition-colors"
                    href="/"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-primary hover:underline underline-offset-4 decoration-primary transition-colors"
                    href="/"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-primary hover:underline underline-offset-4 decoration-primary transition-colors"
                    href="/"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-primary hover:underline underline-offset-4 decoration-primary transition-colors"
                    href="/"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-label-caps text-label-caps text-primary uppercase mb-6">
                Support
              </h5>
              <ul className="space-y-4 font-body-sm text-on-surface-variant">
                <li>
                  <a
                    className="hover:text-primary hover:underline underline-offset-4 decoration-primary transition-colors"
                    href="/"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-primary hover:underline underline-offset-4 decoration-primary transition-colors"
                    href="/"
                  >
                    API Docs
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-primary hover:underline underline-offset-4 decoration-primary transition-colors"
                    href="/"
                  >
                    Security
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-primary hover:underline underline-offset-4 decoration-primary transition-colors"
                    href="/"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-body-sm text-on-surface-variant">
              © 2024 WholesalePro Inc. All rights reserved.
            </p>
            <div className="flex gap-6 font-body-sm text-on-surface-variant">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Security</span>
              <span>Help Center</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
