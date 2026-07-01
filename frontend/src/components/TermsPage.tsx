"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import LandingNavbar from "./LandingNavbar";
import LandingFooter from "./LandingFooter";

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState<string>("acceptance-of-terms");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const sections = [
    { id: "acceptance-of-terms", title: "1. Acceptance of Terms" },
    { id: "eligibility", title: "2. Eligibility" },
    { id: "accounts", title: "3. Accounts" },
    { id: "subscription-billing", title: "4. Subscription & Billing" },
    { id: "installation-charges", title: "5. Installation Charges" },
    { id: "annual-renewal", title: "6. Annual Renewal" },
    { id: "user-responsibilities", title: "7. User Responsibilities" },
    { id: "acceptable-use", title: "8. Acceptable Use" },
    { id: "data-ownership", title: "9. Data Ownership" },
    { id: "intellectual-property", title: "10. Intellectual Property" },
    { id: "account-suspension", title: "11. Account Suspension" },
    { id: "service-availability", title: "12. Service Availability" },
    { id: "refund-policy", title: "13. Refund Policy" },
    { id: "limitation-of-liability", title: "14. Limitation of Liability" },
    { id: "termination", title: "15. Termination" },
    { id: "changes-to-terms", title: "16. Changes to Terms" },
    { id: "governing-law", title: "17. Governing Law" },
    { id: "contact", title: "18. Contact" },
  ];

  const faqs = [
    { question: "Can I cancel anytime?", answer: "Yes, you can cancel your subscription at any time. However, annual subscriptions are non-refundable after the initial grace period." },
    { question: "Who owns my business data?", answer: "You do. You retain full ownership of all business data uploaded to SCS Flow. We only process it to provide our services." },
    { question: "Can my subscription be suspended?", answer: "Yes, your account may be suspended for non-payment, fraud, illegal activities, or violations of these Terms." },
    { question: "What happens after cancellation?", answer: "Your active access will be revoked. We will retain your encrypted data backups for 30 days before permanent deletion, unless you request immediate deletion." },
    { question: "How do renewals work?", answer: "Subscriptions are billed annually. You will receive an invoice prior to your renewal date." },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 250; // Offset for header

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="bg-[#F8FAFC] text-on-surface antialiased min-h-screen">
      <LandingNavbar />
      
      <main className="pt-24 pb-12">
        {/* HERO SECTION */}
        <section className="relative py-24 overflow-hidden bg-white border-b border-gray-100">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-transparent to-transparent opacity-80"></div>
          
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm mb-6 border border-blue-200">
               <span className="material-symbols-outlined text-sm">gavel</span>
               Legal Agreement
             </div>
             <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
               Terms of <span className="text-primary">Service</span>
             </h1>
             <p className="font-body-md text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
               Please read these Terms carefully before using SCS Flow. These Terms govern your access to and use of our platform and services.
             </p>
             <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
               <button className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-xl font-bold text-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center flex items-center justify-center gap-2 cursor-pointer">
                 <span className="material-symbols-outlined">download</span>
                 Download PDF
               </button>
               <a href="mailto:legal@scsflow.com" className="w-full sm:w-auto px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 hover:-translate-y-1 transition-all duration-300 shadow-sm text-center flex items-center justify-center gap-2">
                 <span className="material-symbols-outlined">mail</span>
                 Contact Legal Team
               </a>
             </div>
          </div>
        </section>

        {/* LAST UPDATED */}
        <section className="bg-gray-50 border-b border-gray-200 py-6">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600">
             <div className="flex items-center gap-2"><span className="material-symbols-outlined text-gray-400">event_available</span> <strong>Effective Date:</strong> July 15, 2026</div>
             <div className="hidden sm:block text-gray-300">|</div>
             <div className="flex items-center gap-2"><span className="material-symbols-outlined text-gray-400">commit</span> <strong>Version:</strong> 1.5.0</div>
          </div>
        </section>

        {/* MAIN CONTENT WITH SIDEBAR */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row gap-12">
            
            {/* Sidebar Navigation */}
            <aside className="lg:w-72 shrink-0 hidden lg:block">
              <div className="sticky top-28 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-h-[calc(100vh-140px)] overflow-y-auto">
                <h3 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-wider">Table of Contents</h3>
                <nav className="flex flex-col gap-1 text-sm">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        activeSection === section.id
                          ? "bg-blue-50 text-primary font-semibold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" });
                        setActiveSection(section.id);
                      }}
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
              
              {/* 1. Acceptance of Terms */}
              <div id="acceptance-of-terms" className="scroll-mt-32 mb-16">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">1. Acceptance of Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  By accessing, registering for, or using the SCS Flow platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.
                </p>
              </div>

              {/* 2. Eligibility */}
              <div id="eligibility" className="scroll-mt-32 mb-16">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">2. Eligibility</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  SCS Flow is an enterprise B2B platform. To use the Service, you must:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Be a legally recognized business entity or an authorized representative of a business.</li>
                  <li>Provide accurate, current, and complete business information during registration.</li>
                  <li>Have the legal authority to bind your organization to these Terms.</li>
                </ul>
              </div>

              {/* 3. Accounts */}
              <div id="accounts" className="scroll-mt-32 mb-16">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">3. Account Responsibilities</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  You are responsible for maintaining the security of your account and all activities that occur under it.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {[
                     { title: "Protect Password", icon: "password" },
                     { title: "Keep Information Updated", icon: "manage_accounts" },
                     { title: "Notify Security Issues", icon: "warning" },
                     { title: "Manage Staff Accounts", icon: "groups" },
                   ].map((item, idx) => (
                     <div key={idx} className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">{item.icon}</span>
                        <span className="font-bold text-gray-900 text-sm">{item.title}</span>
                     </div>
                   ))}
                </div>
              </div>

              {/* 4. Subscription & Billing */}
              <div id="subscription-billing" className="scroll-mt-32 mb-16">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">4. Subscription & Billing</h2>
                <div className="flex flex-col md:flex-row items-center justify-between bg-blue-50 border border-blue-200 p-6 rounded-2xl mb-8">
                   <div className="text-center mb-4 md:mb-0">
                     <span className="material-symbols-outlined text-blue-600 text-3xl">build</span>
                     <p className="font-bold text-sm mt-2">Installation</p>
                   </div>
                   <span className="material-symbols-outlined text-blue-300 hidden md:block">arrow_forward</span>
                   <div className="text-center mb-4 md:mb-0">
                     <span className="material-symbols-outlined text-blue-600 text-3xl">check_circle</span>
                     <p className="font-bold text-sm mt-2">Activation</p>
                   </div>
                   <span className="material-symbols-outlined text-blue-300 hidden md:block">arrow_forward</span>
                   <div className="text-center mb-4 md:mb-0">
                     <span className="material-symbols-outlined text-blue-600 text-3xl">calendar_month</span>
                     <p className="font-bold text-sm mt-2">Annual Subscription</p>
                   </div>
                   <span className="material-symbols-outlined text-blue-300 hidden md:block">arrow_forward</span>
                   <div className="text-center">
                     <span className="material-symbols-outlined text-blue-600 text-3xl">autorenew</span>
                     <p className="font-bold text-sm mt-2">Renewal</p>
                   </div>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our services are billed on a subscription basis. You will be billed in advance on a recurring, annual schedule. Payment due dates are clearly indicated on your invoice.
                </p>
              </div>

              {/* 5. Installation Charges */}
              <div id="installation-charges" className="scroll-mt-32 mb-16">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">5. Installation Charges</h2>
                <p className="text-gray-700 leading-relaxed">
                  Depending on the selected plan and custom requirements, a one-time non-refundable installation fee may apply to set up your isolated database tenant, migrate initial data, and configure the software for your specific wholesale operations.
                </p>
              </div>

              {/* 6. Annual Renewal */}
              <div id="annual-renewal" className="scroll-mt-32 mb-16">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">6. Annual Renewal</h2>
                <p className="text-gray-700 leading-relaxed">
                  Your subscription will automatically renew at the end of each annual billing cycle unless you cancel it before the renewal date. We will notify you at least 30 days prior to the renewal charge.
                </p>
              </div>

              {/* 7. User Responsibilities */}
              <div id="user-responsibilities" className="scroll-mt-32 mb-16">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">7. User Responsibilities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: "Maintain Accurate Data", desc: "Ensure your billing and tax data is correct." },
                    { title: "Use Licensed Software", desc: "Use the software only as permitted." },
                    { title: "Follow Applicable Laws", desc: "Comply with local taxation and business laws." },
                    { title: "Protect Credentials", desc: "Do not share staff passwords publicly." }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
                      <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 8. Acceptable Use */}
              <div id="acceptable-use" className="scroll-mt-32 mb-16">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">8. Acceptable Use</h2>
                <p className="text-gray-700 leading-relaxed mb-6">Users must strictly adhere to the following acceptable use policies. You must <strong>NOT</strong>:</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Attempt unauthorized access",
                    "Reverse engineer the software",
                    "Upload malware or malicious code",
                    "Abuse or overwhelm our APIs",
                    "Perform illegal business activities",
                    "Interfere with other tenants"
                  ].map((rule, idx) => (
                     <li key={idx} className="flex items-center gap-2 text-gray-700 bg-red-50 text-red-800 border border-red-100 p-3 rounded-lg text-sm font-semibold">
                       <span className="material-symbols-outlined text-red-500">block</span>
                       {rule}
                     </li>
                  ))}
                </ul>
              </div>

              {/* 9. Data Ownership */}
              <div id="data-ownership" className="scroll-mt-32 mb-16">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">9. Data Ownership</h2>
                <div className="bg-primary-fixed/30 border border-primary p-6 rounded-2xl relative overflow-hidden">
                   <span className="material-symbols-outlined absolute top-4 right-4 text-6xl text-primary/10">verified</span>
                   <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10">Customers own all business data.</h3>
                   <p className="text-gray-700 relative z-10 mb-4">
                     SCS Flow claims no ownership over your inventory, customer records, bills, or proprietary business data. We only process it to provide the service. Customers may export their data at any time.
                   </p>
                </div>
              </div>

              {/* 10. Intellectual Property */}
              <div id="intellectual-property" className="scroll-mt-32 mb-16">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">10. Intellectual Property</h2>
                <p className="text-gray-700 leading-relaxed">
                  The SCS Flow software, branding, logos, designs, user interface, and underlying source code remain the exclusive intellectual property of SCS Flow. These Terms do not grant you any right, title, or interest in the Service or our trademarks.
                </p>
              </div>

              {/* 11. Account Suspension */}
              <div id="account-suspension" className="scroll-mt-32 mb-16">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">11. Account Suspension</h2>
                <p className="text-gray-700 leading-relaxed mb-4">We reserve the right to suspend or terminate your account immediately, without prior notice, for the following reasons:</p>
                <div className="flex flex-wrap gap-3">
                   {["Non-payment of fees", "Illegal Activities", "Security Violations", "Fraud", "Terms Violations"].map((reason, idx) => (
                     <span key={idx} className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-sm font-semibold text-gray-800">
                       {reason}
                     </span>
                   ))}
                </div>
              </div>

              {/* 12. Service Availability */}
              <div id="service-availability" className="scroll-mt-32 mb-16">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">12. Service Availability</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                   <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center">
                      <h4 className="text-4xl font-black text-emerald-600 mb-2">99.9%</h4>
                      <p className="text-sm font-bold text-emerald-800">Target Uptime</p>
                   </div>
                   <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                      <span className="material-symbols-outlined text-3xl text-gray-500 mb-2">schedule</span>
                      <p className="text-sm font-bold text-gray-700">Scheduled Maintenance</p>
                   </div>
                   <div className="bg-orange-50 border border-orange-200 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                      <span className="material-symbols-outlined text-3xl text-orange-500 mb-2">warning</span>
                      <p className="text-sm font-bold text-orange-800">Emergency Maintenance</p>
                   </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  We strive to maintain a 99.9% uptime. However, we do not guarantee that the Service will be uninterrupted or error-free. We will provide advance notice for scheduled maintenance whenever possible.
                </p>
              </div>

              {/* 13. Refund Policy */}
              <div id="refund-policy" className="scroll-mt-32 mb-16">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">13. Refund Policy</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
                      <h4 className="font-bold mb-1">Installation Fee</h4>
                      <p className="text-sm text-gray-600">Strictly non-refundable once the setup process has begun.</p>
                   </div>
                   <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
                      <h4 className="font-bold mb-1">Annual Subscription</h4>
                      <p className="text-sm text-gray-600">Non-refundable. Billed in advance for the year.</p>
                   </div>
                   <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
                      <h4 className="font-bold mb-1">Cancellation</h4>
                      <p className="text-sm text-gray-600">You may cancel anytime, but no pro-rated refunds are provided.</p>
                   </div>
                   <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
                      <h4 className="font-bold mb-1">Renewal</h4>
                      <p className="text-sm text-gray-600">Must be cancelled before the renewal date to avoid charges.</p>
                   </div>
                </div>
              </div>

              {/* 14. Limitation of Liability */}
              <div id="limitation-of-liability" className="scroll-mt-32 mb-16">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">14. Limitation of Liability</h2>
                <div className="bg-gray-100 p-6 rounded-2xl text-gray-700 text-sm leading-relaxed border border-gray-200">
                  <p className="mb-4">
                    TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SCS FLOW, ITS AFFILIATES, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, THAT RESULT FROM THE USE OF, OR INABILITY TO USE, THIS SERVICE.
                  </p>
                  <p>
                    UNDER NO CIRCUMSTANCES WILL SCS FLOW BE RESPONSIBLE FOR ANY DAMAGE, LOSS, OR INJURY RESULTING FROM HACKING, TAMPERING, OR OTHER UNAUTHORIZED ACCESS OR USE OF THE SERVICE OR YOUR ACCOUNT OR THE INFORMATION CONTAINED THEREIN.
                  </p>
                </div>
              </div>

              {/* 15. Termination */}
              <div id="termination" className="scroll-mt-32 mb-16">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">15. Termination</h2>
                <div className="flex flex-col md:flex-row items-center justify-between bg-white border border-gray-200 p-6 rounded-2xl mb-6 shadow-sm">
                   <div className="text-center mb-4 md:mb-0">
                     <span className="material-symbols-outlined text-gray-600 text-3xl">cancel</span>
                     <p className="font-bold text-sm mt-2">Customer Requests</p>
                   </div>
                   <span className="material-symbols-outlined text-gray-300 hidden md:block">arrow_forward</span>
                   <div className="text-center mb-4 md:mb-0">
                     <span className="material-symbols-outlined text-gray-600 text-3xl">no_accounts</span>
                     <p className="font-bold text-sm mt-2">Account Closure</p>
                   </div>
                   <span className="material-symbols-outlined text-gray-300 hidden md:block">arrow_forward</span>
                   <div className="text-center mb-4 md:mb-0">
                     <span className="material-symbols-outlined text-gray-600 text-3xl">inventory</span>
                     <p className="font-bold text-sm mt-2">Backup Retention</p>
                   </div>
                   <span className="material-symbols-outlined text-gray-300 hidden md:block">arrow_forward</span>
                   <div className="text-center">
                     <span className="material-symbols-outlined text-red-500 text-3xl">delete_forever</span>
                     <p className="font-bold text-sm mt-2">Data Deletion</p>
                   </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Upon termination, your right to use the Service will immediately cease. All provisions of the Terms which by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
                </p>
              </div>

              {/* 16. Changes to Terms */}
              <div id="changes-to-terms" className="scroll-mt-32 mb-16">
                <h2 className="text-3xl font-bold mb-4 text-gray-900">16. Changes to Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect via email or platform notification.
                </p>
              </div>

              {/* 17. Governing Law */}
              <div id="governing-law" className="scroll-mt-32 mb-16">
                <h2 className="text-3xl font-bold mb-4 text-gray-900">17. Governing Law</h2>
                <p className="text-gray-700 leading-relaxed">
                  These Terms shall be governed and construed in accordance with the laws of <strong>India</strong>, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                </p>
              </div>

              {/* 18. Contact */}
              <div id="contact" className="scroll-mt-32">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">18. Contact Us</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 bg-gray-50 border border-gray-200 p-6 rounded-2xl flex items-center gap-4">
                    <span className="material-symbols-outlined text-3xl text-gray-400">gavel</span>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Legal Team</p>
                      <a href="mailto:legal@scsflow.com" className="font-bold text-primary hover:underline">legal@scsflow.com</a>
                    </div>
                  </div>
                  <div className="flex-1 bg-gray-50 border border-gray-200 p-6 rounded-2xl flex items-center gap-4">
                    <span className="material-symbols-outlined text-3xl text-gray-400">support_agent</span>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Support Team</p>
                      <a href="mailto:support@scsflow.com" className="font-bold text-primary hover:underline">support@scsflow.com</a>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-24 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Frequently Asked Questions</h2>
              <p className="text-gray-600">Quick answers regarding our terms and policies.</p>
            </div>
            
            <div className="space-y-4">
               {faqs.map((faq, index) => (
                 <div key={index} className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300">
                   <button 
                     onClick={() => toggleFaq(index)}
                     className="w-full px-6 py-5 flex items-center justify-between font-bold text-lg text-left text-gray-900 hover:bg-gray-100 focus:outline-none"
                   >
                     {faq.question}
                     <span className={`material-symbols-outlined text-gray-500 transform transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}>
                       expand_more
                     </span>
                   </button>
                   <div className={`px-6 overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                     <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-24 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-blue-900 to-primary rounded-3xl p-12 md:p-16 text-center relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32"></div>
              
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-8 relative z-10">
                Questions About Our Terms?
              </h2>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                <a
                  className="px-10 py-4 bg-white text-primary rounded-xl font-bold text-lg hover:shadow-lg hover:scale-105 transition-all text-center"
                  href="mailto:legal@scsflow.com"
                >
                  Contact Legal Team
                </a>
                <Link
                  className="px-10 py-4 border-2 border-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all text-center"
                  href="/contact"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
      <LandingFooter />
    </div>
  );
}
