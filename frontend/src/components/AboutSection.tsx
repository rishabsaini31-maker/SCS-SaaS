"use client";
import React from 'react';

export default function AboutSection() {
  return (
    <section id="about" className="py-24 bg-surface border-y border-outline-variant">
      <div className="max-w-7xl mx-auto px-container-padding">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-on-surface-variant font-label-caps text-xs uppercase tracking-widest mb-4 block">About Us</span>
            <h2 className="text-4xl font-bold mb-6 text-on-surface tracking-tight">Inventory that scales with your business</h2>
            <p className="text-on-surface-variant mb-10 text-lg leading-relaxed">
              Our mission is to simplify wholesale operations so you can focus on growth. We eliminate manual errors, sync your data across warehouses in real-time, and provide actionable insights in a clean, distraction-free environment.
            </p>
            <div className="space-y-8">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0 border border-outline-variant">
                  <span className="material-symbols-outlined text-on-surface text-sm">timer</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface mb-1">Save Time</h4>
                  <p className="text-on-surface-variant text-sm">Automate billing and inventory updates to save 10+ hours a week.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0 border border-outline-variant">
                  <span className="material-symbols-outlined text-on-surface text-sm">monitoring</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface mb-1">Reduce Errors</h4>
                  <p className="text-on-surface-variant text-sm">Centralized data ensures your stock levels are always perfectly synced.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0 border border-outline-variant">
                  <span className="material-symbols-outlined text-on-surface text-sm">rocket_launch</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface mb-1">Scale Faster</h4>
                  <p className="text-on-surface-variant text-sm">Manage multiple locations and effortlessly 10x your order volume.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
             <div className="bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-outline-variant">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRu8cgLKIQbAnT5aYTDNaHBYionTI5k8Jtt_sn_YITgWQbdHICMK-EQmUktlszblAU3gxy5RzVfxHgVH9QEVOQHVbrkreyWIMKsdXBt1U7IoNThFdRAxlHhPcZ8iMnEEf6TqqE2Bq-D2Sri4hklonaBdyHwjocHmJENcYZDpKGzWDqDan5BXHMAz30X4WuhA3pfOzTTpC7fFDRAQ7ukzP8I7CgLQBYysIAlJX6zo7wjm-95RaYhNIyfQTRo8Ua7spqsT2Dj7GJdOI" alt="Team" className="w-16 h-16 rounded-full object-cover border border-outline-variant"/>
                  <div>
                    <p className="font-bold text-on-surface">Built for Wholesalers</p>
                    <p className="text-sm text-on-surface-variant">Designed alongside industry veterans.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                   <div>
                      <p className="text-4xl font-light text-on-surface tracking-tight mb-2">10M+</p>
                      <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Invoices Processed</p>
                   </div>
                   <div>
                      <p className="text-4xl font-light text-on-surface tracking-tight mb-2">99.9%</p>
                      <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">System Uptime</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
