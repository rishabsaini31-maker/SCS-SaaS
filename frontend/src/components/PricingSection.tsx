"use client";
import React, { useState } from 'react';

const plans = [
  {
    name: 'Basic',
    description: 'Essential features for small shops looking to get started.',
    firstYearPrice: 15000,
    renewalPrice: 8500,
    features: [
      'Unlimited invoices',
      '1 user account',
      'Core billing & inventory',
    ],
    popular: false,
    buttonText: 'Contact Team',
  },
  {
    name: 'Pro',
    description: 'Advanced features and priority support for growing teams.',
    firstYearPrice: 25000,
    renewalPrice: 15000,
    features: [
      'Unlimited invoices',
      '7 user accounts',
      'Priority support response',
      'Barcoding',
      'Advanced reports & insights',
    ],
    popular: true,
    buttonText: 'Contact Team',
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-container-padding">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-on-surface tracking-tight">Simple pricing for growing stores</h2>
          <p className="text-on-surface-variant mt-4 max-w-2xl mx-auto text-lg">
            Choose the plan that fits your business stage. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {plans.map((plan) => {
            return (
              <div
                key={plan.name}
                className={`flex flex-col p-8 rounded-2xl border transition-all duration-300 ${
                  plan.popular
                    ? 'bg-surface border-2 border-primary relative shadow-md hover:shadow-xl hover:-translate-y-1.5'
                    : 'bg-white border-outline-variant hover:border-primary/50 hover:shadow-lg hover:-translate-y-1'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-on-surface text-surface text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2 text-on-surface">{plan.name}</h3>
                <p className="text-on-surface-variant text-sm mb-6 h-12 flex items-start">
                  {plan.description}
                </p>

                <div className="mb-6 h-24 flex flex-col justify-end">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-on-surface">
                      ₹{plan.firstYearPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-on-surface-variant text-sm font-normal">/1st yr</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-xs text-on-surface-variant/70 italic">
                      Then ₹{plan.renewalPrice.toLocaleString('en-IN')}/yr
                    </span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-on-surface-variant">
                      <span className={`material-symbols-outlined text-sm mt-0.5 ${plan.popular ? 'text-primary' : 'text-on-surface'}`}>
                        check
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#contact"
                  className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer text-center block ${
                    plan.popular
                      ? 'bg-on-surface text-surface hover:bg-on-surface/90'
                      : 'border border-outline-variant text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  {plan.buttonText}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}