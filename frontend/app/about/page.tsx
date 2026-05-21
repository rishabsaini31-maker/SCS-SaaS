"use client";
import React from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import AboutSection from '@/components/AboutSection';

export default function AboutPage() {
  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen">
      <LandingNavbar />
      <main className="pt-24">
        <AboutSection />
      </main>
      <LandingFooter />
    </div>
  );
}
