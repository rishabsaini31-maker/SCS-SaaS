"use client";
import React from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import PricingSection from '@/components/PricingSection';

export default function PricingPage() {
  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen">
      <LandingNavbar />
      <main className="pt-24">
        <PricingSection />
      </main>
      <LandingFooter />
    </div>
  );
}
