"use client";
import React, { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';

const ContactPageContent = () => {
  const searchParams = useSearchParams();
  const demoSource = searchParams.get('source') === 'demo';

  useEffect(() => {
    document.title = "Contact | SCS";

    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    document.querySelectorAll('.magnetic-btn').forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
            const mouseEvent = e as MouseEvent;
            const target = btn as HTMLElement;
            const rect = target.getBoundingClientRect();
            const x = mouseEvent.clientX - rect.left - rect.width / 2;
            const y = mouseEvent.clientY - rect.top - rect.height / 2;
            target.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.02)`;
        });
        
        btn.addEventListener('mouseleave', () => {
            const target = btn as HTMLElement;
            target.style.transform = `translate(0px, 0px) scale(1)`;
        });
    });

    document.querySelectorAll('.group').forEach((step) => {
        step.addEventListener('mouseenter', () => {
            document.querySelectorAll('.step-node').forEach(node => node.classList.remove('active'));
            const stepNode = step.querySelector('.step-node');
            if(stepNode) stepNode.classList.add('active');
        });
    });
    
    return () => {
        observer.disconnect();
    };
  }, [searchParams]);

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex flex-col">
      <LandingNavbar />
      <main className="pt-24 flex-grow relative overflow-hidden">
        
{/* Hero Section */}
<section className="max-w-[1440px] mx-auto px-8 md:px-12 mb-section-gap-md relative">
<div className="absolute -top-20 -left-20 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>
<div className="max-w-3xl">
<span className="font-label-sm text-label-sm text-secondary uppercase tracking-[0.2em] mb-4 block">Intelligence in Motion</span>
<h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-surface-container-highest mb-6">Let&apos;s build the <span className="text-secondary">future</span> together.</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">Connecting visionary enterprise leaders with technical excellence. Whether you&apos;re scaling a startup or optimizing a legacy infrastructure, we&apos;re here to lead the way.</p>
{demoSource && (
  <div className="mt-8 rounded-3xl border border-secondary/20 bg-secondary/10 p-6 text-secondary shadow-lg">
    <p className="text-lg font-semibold">Thanks for your interest!</p>
    <p className="mt-2 text-sm text-on-surface-variant">To book a demo, please fill out the form below and our SCS Team will reach out shortly.</p>
  </div>
)}
</div>
</section>
{/* Bento Contact Layout */}
<section className="max-w-[1440px] mx-auto px-8 md:px-12">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
{/* Premium Contact Form (Column 1-7) */}
<div className="lg:col-span-7 glass-card rounded-lg p-8 md:p-12 glow-hover transition-all">
<h2 className="font-headline-md text-headline-md mb-8 text-surface-container-highest">Send a Message</h2>
<form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="space-y-2">
<label className="font-label-sm text-label-sm text-on-surface-variant">FULL NAME</label>
<input className="w-full bg-white border border-black/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all" placeholder="John Doe" type="text"/>
</div>
<div className="space-y-2">
<label className="font-label-sm text-label-sm text-on-surface-variant">COMPANY</label>
<input className="w-full bg-white border border-black/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all" placeholder="Acme Corp" type="text"/>
</div>
</div>
<div className="space-y-2">
<label className="font-label-sm text-label-sm text-on-surface-variant">EMAIL ADDRESS</label>
<input className="w-full bg-white border border-black/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all" placeholder="john@acme.com" type="email"/>
</div>
<div className="space-y-2">
<label className="font-label-sm text-label-sm text-on-surface-variant">HOW CAN WE HELP?</label>
<select className="w-full bg-white border border-black/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all">
<option>Cloud Infrastructure</option>
<option>Software Modernization</option>
<option>AI Integration</option>
<option>Strategic Consulting</option>
</select>
</div>
<div className="space-y-2">
<label className="font-label-sm text-label-sm text-on-surface-variant">MESSAGE</label>
<textarea className="w-full bg-white border border-black/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all" placeholder="Tell us about your project goals..." rows={4}></textarea>
</div>
<button className="magnetic-btn w-full bg-secondary text-white font-bold py-4 rounded-lg shadow-lg hover:shadow-cyan-200/50 transition-all text-body-md">Initialize Partnership</button>
</form>
</div>
{/* Info Cards (Column 8-12) */}
<div className="lg:col-span-5 grid grid-cols-1 gap-gutter">
{/* Office Info */}
<div className="glass-card rounded-lg p-8 glow-hover transition-all">
<div className="flex items-start gap-4">
<div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary">
<span className="material-symbols-outlined">location_on</span>
</div>
<div>
<h3 className="font-headline-md text-body-lg font-bold text-surface-container-highest mb-2">Global Headquarters</h3>
<p className="font-body-md text-on-surface-variant">Silicon Valley Hub<br/>450 Innovation Way, Suite 100<br/>Palo Alto, CA 94301</p>
</div>
</div>
</div>
{/* Business Hours */}
<div className="glass-card rounded-lg p-8 glow-hover transition-all">
<div className="flex items-start gap-4">
<div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary">
<span className="material-symbols-outlined">schedule</span>
</div>
<div className="w-full">
<h3 className="font-headline-md text-body-lg font-bold text-surface-container-highest mb-2">Operational Hours</h3>
<div className="space-y-1 font-body-md text-on-surface-variant">
<div className="flex justify-between"><span>Mon - Fri</span><span>08:00 - 18:00 PST</span></div>
<div className="flex justify-between"><span>Saturday</span><span>10:00 - 14:00 PST</span></div>
<div className="flex justify-between text-secondary/60"><span>Sunday</span><span>By Appointment</span></div>
</div>
</div>
</div>
</div>
{/* Contact Details (Email/Phone) */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
<a className="glass-card rounded-lg p-6 glow-hover transition-all group" href="mailto:solutions@scs.tech">
<span className="material-symbols-outlined text-secondary mb-2 block group-hover:scale-110 transition-transform">mail</span>
<span className="font-label-sm text-secondary block mb-1">EMAIL US</span>
<span className="font-body-md font-bold text-surface-container-highest">solutions@scs.tech</span>
</a>
<a className="glass-card rounded-lg p-6 glow-hover transition-all group" href="tel:+18005550192">
<span className="material-symbols-outlined text-secondary mb-2 block group-hover:scale-110 transition-transform">call</span>
<span className="font-label-sm text-secondary block mb-1">CALL US</span>
<span className="font-body-md font-bold text-surface-container-highest">+1 (800) 555-0192</span>
</a>
</div>
</div>
</div>
</section>
{/* Google Maps Placeholder & Schedule Consultation */}
<section className="max-w-[1440px] mx-auto px-8 md:px-12 mt-section-gap-md grid grid-cols-1 lg:grid-cols-2 gap-gutter">
{/* Map */}
<div className="relative rounded-lg overflow-hidden h-[400px] border border-black/5 shadow-xl group">
<div className="absolute inset-0 bg-secondary/5 z-10 pointer-events-none group-hover:bg-transparent transition-colors"></div>
<div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105" data-alt="A sophisticated 3D aerial architectural rendering of a high-tech corporate campus in Palo Alto, California. The building is a minimalist glass and steel structure with lush green terraces, set against a bright, clean daylight sky. The overall aesthetic is professional, modern, and aligned with a premium Silicon Valley tech brand, emphasizing space, light, and innovation." data-location="Palo Alto, California" style={{backgroundImage: "url(\'https://lh3.googleusercontent.com/aida-public/AB6AXuDsRo39RlNQNXMdcXPFTCUS6jbHWCol1mZRC2ZC5qO_FSF1IWiRv3KcWpTJdb9C-Rmj4nobkM_I0MX23J4WGPRI8Oa-jR2fEkxctGY8K-Un-kGmejHEVME4I_-Ug0YTnzcH-m1YMARucmz5gz-K5Ev-tVs484Q9zEvOaF1KZt-iWPHnrV9xofCR1to20EN3uMmpk_dGhqiJUxIDEIcfl2jf8dS5LdSUhvRBXH5MJSjuo5f7EM_bI5wu_0eMYBt9cwRWYWUelLENRQOC\')"}}></div>
<div className="absolute bottom-6 left-6 z-20 bg-white/90 backdrop-blur-md p-4 rounded-lg shadow-lg max-w-xs">
<p className="font-body-md font-bold text-surface-container-highest">Strategic Cloud Solutions HQ</p>
<p className="text-sm text-on-surface-variant">Tap to view in maps</p>
</div>
</div>
{/* Schedule Consultation */}
<div className="glass-card rounded-lg p-12 flex flex-col justify-center border-l-4 border-secondary">
<h3 className="font-headline-md text-headline-md mb-6 text-surface-container-highest">Ready for a Deep Dive?</h3>
<p className="font-body-lg text-body-lg text-on-surface-variant mb-8">Skip the forms and schedule a 30-minute discovery call directly with our technical lead to discuss your specific infrastructure needs.</p>
<div className="flex flex-wrap gap-4">
<button className="magnetic-btn bg-surface-container-highest text-white px-8 py-4 rounded-full font-bold flex items-center gap-3">
<span className="material-symbols-outlined">calendar_today</span>
                        Book Consultation
                    </button>
<div className="flex -space-x-3 items-center ml-4">
<div className="w-10 h-10 rounded-full border-2 border-white bg-secondary/20"></div>
<div className="w-10 h-10 rounded-full border-2 border-white bg-secondary/40"></div>
<div className="w-10 h-10 rounded-full border-2 border-white bg-secondary/60"></div>
<span className="ml-6 font-label-sm text-on-surface-variant">Experts Online</span>
</div>
</div>
</div>
</section>
{/* FAQ Section */}
<section className="max-w-[1440px] mx-auto px-8 md:px-12 mt-section-gap-md">
<h2 className="font-headline-lg text-headline-md md:text-headline-lg text-center mb-section-gap-md text-surface-container-highest">Common Inquiries</h2>
<div className="max-w-4xl mx-auto space-y-4">
<div className="glass-card rounded-lg p-6 cursor-pointer group">
<div className="flex justify-between items-center">
<h4 className="font-body-lg font-bold text-surface-container-highest">What is the typical project onboarding timeline?</h4>
<span className="material-symbols-outlined text-secondary group-hover:rotate-45 transition-transform">add</span>
</div>
<div className="mt-4 hidden font-body-md text-on-surface-variant">We usually move from initial discovery to project kickoff within 10-14 business days.</div>
</div>
<div className="glass-card rounded-lg p-6 cursor-pointer group">
<div className="flex justify-between items-center">
<h4 className="font-body-lg font-bold text-surface-container-highest">Do you offer 24/7 technical support?</h4>
<span className="material-symbols-outlined text-secondary group-hover:rotate-45 transition-transform">add</span>
</div>
</div>
<div className="glass-card rounded-lg p-6 cursor-pointer group">
<div className="flex justify-between items-center">
<h4 className="font-body-lg font-bold text-surface-container-highest">Can you integrate with our existing AWS/Azure stack?</h4>
<span className="material-symbols-outlined text-secondary group-hover:rotate-45 transition-transform">add</span>
</div>
</div>
</div>
</section>
{/* Social Links & Final CTA */}
<section className="max-w-[1440px] mx-auto px-8 md:px-12 mt-section-gap-md">
<div className="flex flex-col md:flex-row justify-between items-center py-12 border-t border-black/5 gap-8">
<div className="text-center md:text-left">
<p className="font-label-sm text-secondary mb-2">STAY CONNECTED</p>
<p className="font-body-md text-on-surface-variant">Follow our journey through technical innovation.</p>
</div>
<div className="flex gap-6">
<a className="w-12 h-12 flex items-center justify-center rounded-full bg-secondary/5 hover:bg-secondary text-secondary hover:text-white transition-all" href="#">
<span className="material-symbols-outlined">share</span>
</a>
<a className="w-12 h-12 flex items-center justify-center rounded-full bg-secondary/5 hover:bg-secondary text-secondary hover:text-white transition-all" href="#">
<span className="material-symbols-outlined">public</span>
</a>
<a className="w-12 h-12 flex items-center justify-center rounded-full bg-secondary/5 hover:bg-secondary text-secondary hover:text-white transition-all" href="#">
<span className="material-symbols-outlined">code</span>
</a>
<a className="w-12 h-12 flex items-center justify-center rounded-full bg-secondary/5 hover:bg-secondary text-secondary hover:text-white transition-all" href="#">
<span className="material-symbols-outlined">terminal</span>
</a>
</div>
</div>
</section>

      </main>
      <LandingFooter />
    </div>
  );
};

const ContactPage = () => {
  return (
    <Suspense fallback={null}>
      <ContactPageContent />
    </Suspense>
  );
};

export default ContactPage;
