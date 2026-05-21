"use client";
import React from 'react';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import ContactSection from '@/components/ContactSection';

export default function ContactPage() {
  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen">
      <LandingNavbar />
      <main className="pt-24">
        <ContactSection />
      </main>
      <LandingFooter />
    </div>
  );
}
