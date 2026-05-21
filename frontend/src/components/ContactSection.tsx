"use client";
import React, { useState } from 'react';

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-24 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-container-padding">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-4xl font-bold mb-4 text-on-surface tracking-tight">Questions? We'd love to help — get in touch.</h2>
            <p className="text-on-surface-variant mb-12 text-lg">
              Whether you need a custom enterprise plan or have questions about features, our team is ready to assist.
            </p>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-on-surface mt-1">mail</span>
                <div>
                  <h4 className="font-bold text-on-surface mb-1">Email Support</h4>
                  <p className="text-on-surface-variant text-sm">support@wholesalepro.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-on-surface mt-1">call</span>
                <div>
                  <h4 className="font-bold text-on-surface mb-1">Sales Inquiries</h4>
                  <p className="text-on-surface-variant text-sm">+1 (800) 123-4567</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-on-surface mt-1">location_on</span>
                <div>
                  <h4 className="font-bold text-on-surface mb-1">Office Location</h4>
                  <p className="text-on-surface-variant text-sm">123 Tech Avenue, Suite 400<br/>San Francisco, CA 94105</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl p-8 border border-outline-variant shadow-sm">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 bg-surface-container text-on-surface rounded-full flex items-center justify-center mb-6 border border-outline-variant">
                  <span className="material-symbols-outlined text-2xl">check</span>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-on-surface">Message Sent!</h3>
                <p className="text-on-surface-variant mb-8">We'll get back to you within 24 hours.</p>
                <button onClick={() => setSubmitted(false)} className="text-on-surface font-semibold text-sm hover:underline underline-offset-4">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">Name</label>
                    <input required type="text" className="w-full p-3 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:border-on-surface transition-colors text-sm" placeholder="John Doe" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">Company (Optional)</label>
                    <input type="text" className="w-full p-3 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:border-on-surface transition-colors text-sm" placeholder="Acme Corp" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">Email</label>
                  <input required type="email" className="w-full p-3 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:border-on-surface transition-colors text-sm" placeholder="john@example.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">Reason</label>
                  <select className="w-full p-3 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:border-on-surface transition-colors text-sm appearance-none cursor-pointer">
                    <option>Sales Inquiry</option>
                    <option>Support Request</option>
                    <option>Partnership</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">Message</label>
                  <textarea required rows={4} className="w-full p-3 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:border-on-surface transition-colors text-sm resize-none" placeholder="How can we help?"></textarea>
                </div>
                <div className="flex items-start gap-3 pt-2">
                  <input required type="checkbox" id="consent" className="mt-0.5 accent-on-surface" />
                  <label htmlFor="consent" className="text-[11px] text-on-surface-variant leading-relaxed">
                    I agree to the privacy policy and consent to being contacted by SCS Flow regarding this inquiry.
                  </label>
                </div>
                <button type="submit" className="w-full py-3 mt-4 bg-on-surface text-surface rounded-lg font-semibold hover:bg-on-surface/90 transition-colors text-sm">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
