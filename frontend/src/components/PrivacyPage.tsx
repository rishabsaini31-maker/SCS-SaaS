"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import LandingNavbar from "./LandingNavbar";
import LandingFooter from "./LandingFooter";

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState<string>("information-we-collect");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const sections = [
    { id: "information-we-collect", title: "1. Information We Collect" },
    { id: "how-we-use-information", title: "2. How We Use Information" },
    { id: "data-sharing", title: "3. Data Sharing" },
    { id: "cookies", title: "4. Cookies" },
    { id: "data-retention", title: "5. Data Retention" },
    { id: "user-rights", title: "6. User Rights" },
    { id: "data-security", title: "7. Data Security" },
    { id: "international-transfers", title: "8. International Transfers" },
    { id: "childrens-privacy", title: "9. Children's Privacy" },
    { id: "policy-updates", title: "10. Policy Updates" },
    { id: "contact", title: "11. Contact" },
  ];

  const faqs = [
    { question: "What information does SCS Flow collect?", answer: "We collect business information (GST, address), owner details (name, email), business data (inventory, invoices), and technical information (IP, cookies) to operate the platform." },
    { question: "Do you sell my data?", answer: "No. We never sell your personal or business data to third parties. We only share information with trusted service providers necessary to operate the platform." },
    { question: "Can I download my business data?", answer: "Yes, you can export your business data and download a full JSON backup at any time from your dashboard." },
    { question: "How can I delete my account?", answer: "You can request account closure and data deletion by contacting our privacy team at privacy@scsflow.com." },
    { question: "How long is my data stored?", answer: "We store your data as long as your subscription is active. Upon deletion, data is removed from active systems immediately and from backups within 30 days." },
    { question: "Are backups encrypted?", answer: "Yes, all daily automated backups are fully encrypted to ensure your business data remains protected." },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // Offset for header

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
          
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              {/* Left Side */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm mb-6 border border-blue-200">
                  <span className="material-symbols-outlined text-sm">policy</span>
                  Legal & Privacy
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
                  Privacy <span className="text-primary">Policy</span>
                </h1>
                <p className="font-body-md text-lg text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0">
                  Your privacy matters to us. Learn how SCS Flow collects, uses, stores, and protects your business information.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <a
                    className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-xl font-bold text-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center flex items-center justify-center gap-2"
                    href="mailto:privacy@scsflow.com"
                  >
                    <span className="material-symbols-outlined">mail</span>
                    Contact Privacy Team
                  </a>
                  <button
                    className="w-full sm:w-auto px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 hover:-translate-y-1 transition-all duration-300 shadow-sm text-center flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined">download</span>
                    Download PDF
                  </button>
                </div>
              </div>

              {/* Right Side - Illustration */}
              <div className="flex-1 relative w-full max-w-lg mx-auto lg:max-w-none">
                <div className="relative w-full aspect-square rounded-3xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-xl overflow-hidden flex flex-col items-center justify-center p-8">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-40 animate-pulse"></div>
                   
                   <div className="relative z-10 w-full">
                      {/* Central Lock */}
                      <div className="w-24 h-24 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center mx-auto mb-8 relative z-20">
                         <span className="material-symbols-outlined text-5xl text-primary">lock</span>
                      </div>
                      
                      {/* Connecting items */}
                      <div className="flex justify-between items-center w-full max-w-sm mx-auto absolute top-8 left-1/2 -translate-x-1/2 px-4 z-10">
                         <div className="w-14 h-14 bg-white rounded-xl shadow border border-gray-100 flex items-center justify-center -translate-x-8 -translate-y-4">
                            <span className="material-symbols-outlined text-blue-500">person</span>
                         </div>
                         <div className="w-14 h-14 bg-white rounded-xl shadow border border-gray-100 flex items-center justify-center translate-x-8 -translate-y-4">
                            <span className="material-symbols-outlined text-emerald-500">database</span>
                         </div>
                      </div>
                      <div className="flex justify-between items-center w-full max-w-sm mx-auto absolute top-28 left-1/2 -translate-x-1/2 px-4 z-10">
                         <div className="w-14 h-14 bg-white rounded-xl shadow border border-gray-100 flex items-center justify-center -translate-x-12 translate-y-2">
                            <span className="material-symbols-outlined text-purple-500">shield</span>
                         </div>
                         <div className="w-14 h-14 bg-white rounded-xl shadow border border-gray-100 flex items-center justify-center translate-x-12 translate-y-2">
                            <span className="material-symbols-outlined text-indigo-500">cloud</span>
                         </div>
                      </div>
                      
                      {/* Dashboard mock */}
                      <div className="w-full h-32 bg-white/80 rounded-t-2xl shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)] border-t border-l border-r border-white mt-12 overflow-hidden flex flex-col p-4 relative z-0">
                         <div className="w-full flex gap-2 mb-3">
                           <div className="w-3 h-3 rounded-full bg-red-400"></div>
                           <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                           <div className="w-3 h-3 rounded-full bg-green-400"></div>
                         </div>
                         <div className="flex gap-4">
                           <div className="w-1/3 h-16 bg-gray-100 rounded-lg"></div>
                           <div className="w-2/3 h-16 bg-gray-100 rounded-lg"></div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LAST UPDATED */}
        <section className="bg-gray-50 border-b border-gray-200 py-6">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600">
             <div className="flex items-center gap-2"><span className="material-symbols-outlined text-gray-400">calendar_today</span> <strong>Last Updated:</strong> July 1, 2026</div>
             <div className="hidden sm:block text-gray-300">|</div>
             <div className="flex items-center gap-2"><span className="material-symbols-outlined text-gray-400">event_available</span> <strong>Effective Date:</strong> July 15, 2026</div>
             <div className="hidden sm:block text-gray-300">|</div>
             <div className="flex items-center gap-2"><span className="material-symbols-outlined text-gray-400">commit</span> <strong>Version:</strong> 2.0.0</div>
          </div>
        </section>

        {/* MAIN CONTENT WITH SIDEBAR */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row gap-12">
            
            {/* Sidebar Navigation */}
            <aside className="lg:w-64 shrink-0">
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
              
              {/* 1. Information We Collect */}
              <div id="information-we-collect" className="scroll-mt-32 mb-16">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">1. Information We Collect</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 mb-4 shadow-sm">
                      <span className="material-symbols-outlined">storefront</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">Business Information</h3>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      <li>Business Name</li>
                      <li>GST Number</li>
                      <li>Address</li>
                      <li>Shop Information</li>
                    </ul>
                  </div>
                  
                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">Owner Information</h3>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      <li>Name</li>
                      <li>Email Address</li>
                      <li>Mobile Number</li>
                    </ul>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
                      <span className="material-symbols-outlined">inventory_2</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">Business Data</h3>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      <li>Products & Inventory</li>
                      <li>Customers & Suppliers</li>
                      <li>Invoices & Payments</li>
                      <li>Reports</li>
                    </ul>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-purple-600 mb-4 shadow-sm">
                      <span className="material-symbols-outlined">devices</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">Technical Information</h3>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      <li>Browser & Device</li>
                      <li>IP Address</li>
                      <li>Login History</li>
                      <li>Cookies</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 2. How We Use Information */}
              <div id="how-we-use-information" className="scroll-mt-32 mb-16">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">2. How We Use Information</h2>
                <div className="relative border-l-2 border-blue-100 ml-4 pl-8 space-y-6">
                  {[
                    { title: "Operate SCS Flow", desc: "To provide, maintain, and deliver the core services of our platform." },
                    { title: "Authenticate Users", desc: "To verify your identity and manage secure access to your tenant." },
                    { title: "Process Billing", desc: "To process subscription payments and generate your account invoices." },
                    { title: "Generate Reports", desc: "To compile analytics and business reports for your usage." },
                    { title: "Customer Support", desc: "To assist you when you encounter issues or have questions." },
                    { title: "Security Monitoring", desc: "To detect, prevent, and address fraud or security vulnerabilities." },
                    { title: "Improve Platform", desc: "To analyze usage patterns and improve platform performance." },
                    { title: "Backup & Recovery", desc: "To ensure your data can be restored in case of emergency." },
                    { title: "Notifications", desc: "To send important service alerts, security notices, and updates." },
                  ].map((item, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-white border-2 border-primary"></div>
                      <h4 className="font-bold text-gray-900">{item.title}</h4>
                      <p className="text-gray-600 text-sm mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Data Sharing */}
              <div id="data-sharing" className="scroll-mt-32 mb-16">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">3. Data Sharing</h2>
                <div className="bg-blue-50 border border-blue-200 p-8 rounded-2xl mb-8 flex items-center gap-6">
                   <div className="bg-white p-3 rounded-full text-blue-600 shadow-sm shrink-0">
                      <span className="material-symbols-outlined text-3xl">verified_user</span>
                   </div>
                   <div>
                     <h3 className="text-2xl font-bold text-gray-900 mb-2">We never sell your data.</h3>
                     <p className="text-gray-700">We only share information with trusted providers when strictly necessary to operate our platform.</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "Payment Gateway", reason: "To process subscription billing securely." },
                    { name: "Email Provider", reason: "To send transactional emails and alerts." },
                    { name: "SMS Provider", reason: "To deliver mobile notifications and alerts." },
                    { name: "Cloud Infrastructure", reason: "To host and process your data securely." },
                    { name: "Backup Services", reason: "To securely store encrypted data backups." },
                  ].map((provider, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50 hover:shadow-md transition-shadow">
                      <span className="material-symbols-outlined text-gray-400">compare_arrows</span>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">{provider.name}</h4>
                        <p className="text-xs text-gray-500">{provider.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Cookies */}
              <div id="cookies" className="scroll-mt-32 mb-16">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">4. Cookies</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "Essential Cookies", desc: "Required for basic site functionality.", icon: "cookie" },
                    { name: "Authentication", desc: "Keeps you securely logged in.", icon: "login" },
                    { name: "Security Cookies", desc: "Helps detect malicious activity.", icon: "security" },
                    { name: "Preference", desc: "Remembers your UI choices.", icon: "settings" },
                    { name: "Analytics Cookies", desc: "Helps us understand platform usage.", icon: "analytics" },
                  ].map((cookie, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-600">
                        <span className="material-symbols-outlined text-xl">{cookie.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{cookie.name}</h4>
                        <p className="text-sm text-gray-500">{cookie.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Data Retention */}
              <div id="data-retention" className="scroll-mt-32 mb-16">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">5. Data Retention</h2>
                <div className="flex flex-col gap-6">
                  <div className="flex gap-4">
                     <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                       <span className="material-symbols-outlined">subscriptions</span>
                     </div>
                     <div>
                       <h4 className="font-bold text-lg">Active Subscription</h4>
                       <p className="text-gray-600 text-sm">Your business data is retained indefinitely as long as your subscription is active.</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                       <span className="material-symbols-outlined">history</span>
                     </div>
                     <div>
                       <h4 className="font-bold text-lg">Backup Retention</h4>
                       <p className="text-gray-600 text-sm">Daily automated backups are securely stored and retained for 30 days before permanent deletion.</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                       <span className="material-symbols-outlined">delete</span>
                     </div>
                     <div>
                       <h4 className="font-bold text-lg">Account Deletion</h4>
                       <p className="text-gray-600 text-sm">Upon account closure, active data is immediately removed. Backup copies are purged within our standard 30-day retention cycle.</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center shrink-0">
                       <span className="material-symbols-outlined">gavel</span>
                     </div>
                     <div>
                       <h4 className="font-bold text-lg">Legal Requirements</h4>
                       <p className="text-gray-600 text-sm">We may retain certain technical or billing records for longer periods if required by law or to resolve disputes.</p>
                     </div>
                  </div>
                </div>
              </div>

              {/* 6. User Rights */}
              <div id="user-rights" className="scroll-mt-32 mb-16">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">6. User Rights</h2>
                <p className="text-gray-600 mb-6">As a user of SCS Flow, you maintain complete control over your business data. You have the right to:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                   {[
                     { name: "Export Data", icon: "file_download" },
                     { name: "Download JSON Backup", icon: "data_object" },
                     { name: "Request Data Deletion", icon: "delete_forever" },
                     { name: "Update Information", icon: "edit_document" },
                     { name: "Request Account Closure", icon: "no_accounts" },
                     { name: "Contact Privacy Team", icon: "contact_support" },
                   ].map((right, idx) => (
                     <div key={idx} className="bg-white border border-gray-200 p-4 rounded-xl text-center hover:border-primary hover:shadow-md transition-all">
                       <span className="material-symbols-outlined text-3xl text-gray-700 mb-2">{right.icon}</span>
                       <h4 className="font-bold text-sm text-gray-900">{right.name}</h4>
                     </div>
                   ))}
                </div>
              </div>

              {/* 7. Data Security */}
              <div id="data-security" className="scroll-mt-32 mb-16">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">7. Data Security</h2>
                <div className="bg-gray-50 border border-gray-200 p-8 rounded-2xl">
                   <p className="text-gray-700 mb-6">We employ enterprise-grade security measures to protect your information from unauthorized access.</p>
                   <div className="flex flex-wrap gap-3 mb-8">
                     <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm font-semibold flex items-center gap-1"><span className="material-symbols-outlined text-sm">lock</span> Encryption</span>
                     <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm font-semibold flex items-center gap-1"><span className="material-symbols-outlined text-sm">security</span> Secure Auth</span>
                     <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm font-semibold flex items-center gap-1"><span className="material-symbols-outlined text-sm">domain</span> Multi-Tenant Isolation</span>
                     <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm font-semibold flex items-center gap-1"><span className="material-symbols-outlined text-sm">cloud_sync</span> Daily Backups</span>
                     <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm font-semibold flex items-center gap-1"><span className="material-symbols-outlined text-sm">list_alt</span> Audit Logs</span>
                   </div>
                   <Link href="/security" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
                     Learn more on our Security Page <span className="material-symbols-outlined">arrow_right_alt</span>
                   </Link>
                </div>
              </div>

              {/* 8. International Transfers */}
              <div id="international-transfers" className="scroll-mt-32 mb-16">
                <h2 className="text-3xl font-bold mb-4 text-gray-900">8. International Transfers</h2>
                <p className="text-gray-600 leading-relaxed">
                  To provide our services, your information may be transferred to, and processed in, countries other than the country in which you reside. These countries may have data protection laws that are different from the laws of your country. However, we have taken appropriate safeguards to require that your personal information will remain protected in accordance with this Privacy Policy.
                </p>
              </div>

              {/* 9. Children's Privacy */}
              <div id="childrens-privacy" className="scroll-mt-32 mb-16">
                <h2 className="text-3xl font-bold mb-4 text-gray-900">9. Children's Privacy</h2>
                <p className="text-gray-600 leading-relaxed">
                  SCS Flow is a B2B enterprise platform intended for businesses. Our services are not directed to, and we do not knowingly collect personal information from, children under the applicable legal age. If we become aware that a child has provided us with personal information, we will take steps to delete such information.
                </p>
              </div>

              {/* 10. Policy Updates */}
              <div id="policy-updates" className="scroll-mt-32 mb-16">
                <h2 className="text-3xl font-bold mb-4 text-gray-900">10. Policy Updates</h2>
                <p className="text-gray-600 leading-relaxed">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or for operational, legal, or regulatory reasons. We will notify customers of any material changes by posting the updated policy on this page and, where appropriate, sending an email notification or an in-app alert before the changes become effective.
                </p>
              </div>

              {/* 11. Contact */}
              <div id="contact" className="scroll-mt-32">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">11. Contact Us</h2>
                <p className="text-gray-600 mb-6">If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 bg-gray-50 border border-gray-200 p-6 rounded-2xl flex items-center gap-4">
                    <span className="material-symbols-outlined text-3xl text-gray-400">shield_person</span>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Privacy Officer</p>
                      <a href="mailto:privacy@scsflow.com" className="font-bold text-primary hover:underline">privacy@scsflow.com</a>
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Privacy FAQs</h2>
              <p className="text-gray-600">Quick answers to your privacy concerns.</p>
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
                Your Data. Your Business. <br className="hidden md:block"/> Your Privacy.
              </h2>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                <a
                  className="px-10 py-4 bg-white text-primary rounded-xl font-bold text-lg hover:shadow-lg hover:scale-105 transition-all text-center"
                  href="mailto:privacy@scsflow.com"
                >
                  Contact Privacy Team
                </a>
                <Link
                  className="px-10 py-4 border-2 border-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all text-center"
                  href="/security"
                >
                  View Security
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
