"use client";
import React from "react";
import Link from "next/link";

export default function LandingFooter() {
  return (
    <footer className="border-t border-outline-variant bg-surface-container-lowest py-16">
      <div className="max-w-7xl mx-auto px-container-padding">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <span className="font-h1 text-h1 text-on-surface tracking-tight mb-4 block font-bold text-xl flex items-center gap-2">
              <img src="/scs-logo.jpeg" alt="SCS Flow Logo" className="h-12 w-auto rounded-md object-contain" />
              SCS Flow
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
            <h5 className="font-label-caps text-label-caps text-primary uppercase mb-6 font-bold text-xs tracking-wider">
              Product
            </h5>
            <ul className="space-y-4 font-body-sm text-on-surface-variant">
              <li>
                <Link
                  className="hover:text-primary hover:underline underline-offset-4 decoration-primary transition-colors"
                  href="/pricing"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary hover:underline underline-offset-4 decoration-primary transition-colors"
                  href="/#features"
                >
                  Features
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-label-caps text-label-caps text-primary uppercase mb-6 font-bold text-xs tracking-wider">
              Help Center
            </h5>
            <ul className="space-y-4 font-body-sm text-on-surface-variant">
              <li>
                <Link
                  className="hover:text-primary hover:underline underline-offset-4 decoration-primary transition-colors font-bold"
                  href="/trust"
                >
                  Trust Center
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary hover:underline underline-offset-4 decoration-primary transition-colors"
                  href="/security"
                >
                  Security
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary hover:underline underline-offset-4 decoration-primary transition-colors"
                  href="/privacy"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary hover:underline underline-offset-4 decoration-primary transition-colors"
                  href="/terms"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary hover:underline underline-offset-4 decoration-primary transition-colors"
                  href="/contact"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body-sm text-on-surface-variant text-sm">
            © 2024 SCS Flow Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
