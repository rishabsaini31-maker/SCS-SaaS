"use client";
import React, { useState } from 'react';

export default function PricingSection() {
  const [annual, setAnnual] = useState(true);
  
  return (
    <section id="pricing" className="py-24 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-container-padding">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-on-surface tracking-tight">Simple pricing for growing stores</h2>
          <p className="text-on-surface-variant mt-4 max-w-2xl mx-auto text-lg">
            Start free — upgrade anytime. 
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm font-medium ${!annual ? 'text-on-surface' : 'text-on-surface-variant'}`}>Monthly</span>
            <button 
              onClick={() => setAnnual(!annual)}
              className="w-14 h-7 rounded-full bg-surface-container-highest flex items-center p-1 transition-colors"
            >
              <div className={`w-5 h-5 rounded-full bg-primary transition-transform ${annual ? 'translate-x-7' : ''}`} />
            </button>
            <span className={`text-sm font-medium ${annual ? 'text-on-surface' : 'text-on-surface-variant'}`}>
              Annually <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-1 font-bold uppercase tracking-wider">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-center">
          {/* Starter */}
          <div className="p-8 bg-white border border-outline-variant rounded-2xl md:rounded-r-none md:border-r-0 hover:shadow-sm transition-shadow">
            <h3 className="text-xl font-bold mb-2 text-on-surface">Starter</h3>
            <p className="text-on-surface-variant text-sm mb-6 h-10">Perfect for new businesses getting off the ground.</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-on-surface">${annual ? '0' : '0'}</span>
              <span className="text-on-surface-variant text-sm">/mo</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-sm text-on-surface-variant"><span className="material-symbols-outlined text-on-surface text-sm">check</span> Up to 100 Invoices/mo</li>
              <li className="flex items-center gap-3 text-sm text-on-surface-variant"><span className="material-symbols-outlined text-on-surface text-sm">check</span> Basic Inventory</li>
              <li className="flex items-center gap-3 text-sm text-on-surface-variant"><span className="material-symbols-outlined text-on-surface text-sm">check</span> 1 User Account</li>
            </ul>
            <button className="w-full py-3 rounded-lg border border-outline-variant font-semibold text-on-surface hover:bg-surface-container-low transition-colors text-sm">Start Free</button>
          </div>

          {/* Business */}
          <div className="p-8 bg-surface border border-outline-variant rounded-2xl relative shadow-xl z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-on-surface text-surface text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Most Popular</div>
            <h3 className="text-xl font-bold mb-2 text-on-surface">Business</h3>
            <p className="text-on-surface-variant text-sm mb-6 h-10">For growing wholesalers with consistent volume.</p>
            <div className="mb-6">
              <span className="text-5xl font-bold text-on-surface">${annual ? '39' : '49'}</span>
              <span className="text-on-surface-variant text-sm">/mo</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-sm text-on-surface"><span className="material-symbols-outlined text-primary text-sm">check</span> Unlimited Invoices</li>
              <li className="flex items-center gap-3 text-sm text-on-surface"><span className="material-symbols-outlined text-primary text-sm">check</span> Advanced Inventory & Barcodes</li>
              <li className="flex items-center gap-3 text-sm text-on-surface"><span className="material-symbols-outlined text-primary text-sm">check</span> Up to 5 User Accounts</li>
              <li className="flex items-center gap-3 text-sm text-on-surface"><span className="material-symbols-outlined text-primary text-sm">check</span> Priority Support</li>
            </ul>
            <button className="w-full py-3 rounded-lg bg-on-surface text-surface font-semibold hover:bg-on-surface/90 transition-colors text-sm">Start Free Trial</button>
          </div>

          {/* Scale */}
          <div className="p-8 bg-white border border-outline-variant rounded-2xl md:rounded-l-none md:border-l-0 hover:shadow-sm transition-shadow">
            <h3 className="text-xl font-bold mb-2 text-on-surface">Scale</h3>
            <p className="text-on-surface-variant text-sm mb-6 h-10">Advanced features for high-volume operations.</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-on-surface">${annual ? '99' : '119'}</span>
              <span className="text-on-surface-variant text-sm">/mo</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-sm text-on-surface-variant"><span className="material-symbols-outlined text-on-surface text-sm">check</span> Multi-warehouse Support</li>
              <li className="flex items-center gap-3 text-sm text-on-surface-variant"><span className="material-symbols-outlined text-on-surface text-sm">check</span> Custom API Integrations</li>
              <li className="flex items-center gap-3 text-sm text-on-surface-variant"><span className="material-symbols-outlined text-on-surface text-sm">check</span> Unlimited Users</li>
              <li className="flex items-center gap-3 text-sm text-on-surface-variant"><span className="material-symbols-outlined text-on-surface text-sm">check</span> Dedicated Account Manager</li>
            </ul>
            <button className="w-full py-3 rounded-lg border border-outline-variant font-semibold text-on-surface hover:bg-surface-container-low transition-colors text-sm">Contact Sales</button>
          </div>
        </div>
      </div>
    </section>
  );
}
