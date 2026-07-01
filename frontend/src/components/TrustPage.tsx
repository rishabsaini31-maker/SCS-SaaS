"use client";

import React from "react";
import Link from "next/link";
import LandingNavbar from "./LandingNavbar";
import LandingFooter from "./LandingFooter";

export default function TrustPage() {
  return (
    <div className="bg-[#F8FAFC] text-on-surface antialiased min-h-screen font-sans">
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
                  <span className="material-symbols-outlined text-sm">security</span>
                  Security & Compliance Hub
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
                  SCS Flow <br className="hidden md:block"/><span className="text-primary">Trust Center</span>
                </h1>
                <p className="font-body-md text-lg text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0">
                  Everything you need to know about how SCS Flow protects your business, your data, and your privacy. Transparency is our foundation.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <Link
                    className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-xl font-bold text-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center flex items-center justify-center gap-2"
                    href="/security"
                  >
                    View Security
                  </Link>
                  <Link
                    className="w-full sm:w-auto px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 hover:-translate-y-1 transition-all duration-300 shadow-sm text-center flex items-center justify-center gap-2"
                    href="/contact"
                  >
                    Contact Support
                  </Link>
                </div>
              </div>

              {/* Right Side - Enterprise Illustration */}
              <div className="flex-1 relative w-full max-w-lg mx-auto lg:max-w-none">
                <div className="relative w-full aspect-square rounded-3xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-xl overflow-hidden flex items-center justify-center p-8">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                   
                   <div className="relative z-10 w-full flex flex-col items-center gap-6">
                      <div className="flex gap-6">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center text-blue-600 transform hover:-translate-y-2 transition-transform duration-300">
                          <span className="material-symbols-outlined text-3xl">shield</span>
                        </div>
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center text-indigo-600 transform translate-y-4 hover:-translate-y-2 transition-transform duration-300">
                          <span className="material-symbols-outlined text-3xl">cloud</span>
                        </div>
                      </div>
                      
                      <div className="w-24 h-24 bg-gradient-to-br from-primary to-blue-600 rounded-full shadow-xl border-4 border-white flex items-center justify-center text-white z-20">
                         <span className="material-symbols-outlined text-4xl">database</span>
                      </div>
                      
                      <div className="flex gap-6">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center text-emerald-600 transform translate-y-4 hover:-translate-y-2 transition-transform duration-300">
                          <span className="material-symbols-outlined text-3xl">enhanced_encryption</span>
                        </div>
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center text-purple-600 transform hover:-translate-y-2 transition-transform duration-300">
                          <span className="material-symbols-outlined text-3xl">vpn_lock</span>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST OVERVIEW */}
        <section className="py-24 bg-[#F8FAFC]">
           <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[
                   { icon: "security", title: "Enterprise Security", desc: "Bank-grade encryption and secure infrastructure.", status: "Verified" },
                   { icon: "bolt", title: "99.9% Availability", desc: "Highly redundant systems with continuous monitoring.", status: "Active" },
                   { icon: "cloud_sync", title: "Daily Backups", desc: "Automated, encrypted, and isolated data backups.", status: "Active" },
                   { icon: "domain", title: "Multi-Tenant Isolation", desc: "Strict logical separation of all customer data.", status: "Verified" },
                   { icon: "privacy_tip", title: "Privacy First", desc: "We never sell your data to third parties.", status: "Compliant" },
                   { icon: "verified", title: "Compliance Ready", desc: "Following GDPR principles and secure practices.", status: "Ready" }
                 ].map((card, idx) => (
                   <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-start hover:shadow-md transition-shadow">
                      <div className="flex justify-between w-full mb-4">
                         <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                           <span className="material-symbols-outlined text-2xl">{card.icon}</span>
                         </div>
                         <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full h-fit border border-green-200">
                           {card.status}
                         </span>
                      </div>
                      <h3 className="font-bold text-xl mb-2 text-gray-900">{card.title}</h3>
                      <p className="text-gray-600 text-sm">{card.desc}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* METRICS & STATUS */}
        <section className="py-24 bg-white border-y border-gray-100">
           <div className="max-w-7xl mx-auto px-6 lg:px-8">
             <div className="flex flex-col lg:flex-row gap-12">
                
                {/* Security Metrics */}
                <div className="flex-[2]">
                   <h2 className="text-3xl font-bold mb-8 text-gray-900">Security & Operational Metrics</h2>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        "JWT Authentication",
                        "Encrypted Connections",
                        "Daily Automated Backups",
                        "Tenant Isolation",
                        "Role-Based Access",
                        "Audit Logging",
                        "JSON Data Export",
                        "Automatic Monitoring"
                      ].map((metric, idx) => (
                         <div key={idx} className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex items-center gap-3">
                            <div className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center shrink-0">
                               <span className="material-symbols-outlined text-sm">check</span>
                            </div>
                            <span className="font-semibold text-gray-800">{metric}</span>
                         </div>
                      ))}
                   </div>
                </div>

                {/* Service Status */}
                <div className="flex-1">
                   <h2 className="text-3xl font-bold mb-8 text-gray-900">Service Status</h2>
                   <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                         <div className="relative flex h-4 w-4">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                         </div>
                         <h3 className="text-xl font-bold text-gray-900">All Systems Operational</h3>
                      </div>
                      
                      <div className="space-y-4">
                         {[
                           { label: "99.9% Uptime Target", status: "Operational" },
                           { label: "API Status", status: "Operational" },
                           { label: "Database Status", status: "Operational" },
                           { label: "Storage Status", status: "Operational" },
                           { label: "Security Monitoring", status: "Active" },
                           { label: "Last Backup", status: "Completed" },
                         ].map((item, idx) => (
                           <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600 font-medium">{item.label}</span>
                              <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{item.status}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

             </div>
           </div>
        </section>

        {/* TRUST RESOURCES */}
        <section className="py-24 bg-[#F8FAFC]">
           <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="text-center mb-16">
                 <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Trust Resources</h2>
                 <p className="text-gray-600 max-w-2xl mx-auto">Access detailed documentation regarding our security practices, privacy policies, and legal terms.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {/* Security */}
                 <div className="bg-white border border-gray-200 p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full group">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-3xl">security</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Security</h3>
                    <p className="text-gray-600 mb-8 flex-1">Learn how we protect your data with encryption, authentication, and infrastructure security.</p>
                    <Link href="/security" className="inline-flex items-center justify-center w-full py-3 bg-gray-50 border border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                      View Security
                    </Link>
                 </div>

                 {/* Privacy Policy */}
                 <div className="bg-white border border-gray-200 p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full group">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-3xl">policy</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Privacy Policy</h3>
                    <p className="text-gray-600 mb-8 flex-1">Understand how we collect, process, and protect your personal and business information.</p>
                    <Link href="/privacy" className="inline-flex items-center justify-center w-full py-3 bg-gray-50 border border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                      Read Privacy Policy
                    </Link>
                 </div>

                 {/* Terms of Service */}
                 <div className="bg-white border border-gray-200 p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full group">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-3xl">gavel</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Terms of Service</h3>
                    <p className="text-gray-600 mb-8 flex-1">Review the legal terms governing the use of the SCS Flow platform and services.</p>
                    <Link href="/terms" className="inline-flex items-center justify-center w-full py-3 bg-gray-50 border border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                      Read Terms
                    </Link>
                 </div>

                 {/* Backup & Disaster Recovery */}
                 <div className="bg-white border border-gray-200 p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full group">
                    <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-3xl">cloud_sync</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Backup & Recovery</h3>
                    <p className="text-gray-600 mb-8 flex-1">Learn how your business data is backed up, retained, and restored in emergencies.</p>
                    <Link href="/security#backup" className="inline-flex items-center justify-center w-full py-3 bg-gray-50 border border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                      Learn More
                    </Link>
                 </div>

                 {/* Compliance */}
                 <div className="bg-white border border-gray-200 p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full group">
                    <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-3xl">verified</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Compliance</h3>
                    <p className="text-gray-600 mb-8 flex-1">See our current compliance practices and future enterprise certifications.</p>
                    <Link href="/security#compliance" className="inline-flex items-center justify-center w-full py-3 bg-gray-50 border border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                      View Compliance
                    </Link>
                 </div>

                 {/* System Status */}
                 <div className="bg-white border border-gray-200 p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full group">
                    <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-3xl">monitor_heart</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">System Status</h3>
                    <p className="text-gray-600 mb-8 flex-1">Check uptime, incidents, scheduled maintenance, and operational status.</p>
                    <Link href="#" className="inline-flex items-center justify-center w-full py-3 bg-gray-50 border border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                      View Status
                    </Link>
                 </div>

                 {/* Cookie Policy */}
                 <div className="bg-white border border-gray-200 p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full group">
                    <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-3xl">cookie</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Cookie Policy</h3>
                    <p className="text-gray-600 mb-8 flex-1">Understand how cookies are used to improve security and your experience.</p>
                    <Link href="/privacy#cookies" className="inline-flex items-center justify-center w-full py-3 bg-gray-50 border border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                      Read Cookie Policy
                    </Link>
                 </div>

                 {/* Responsible Disclosure */}
                 <div className="bg-white border border-gray-200 p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full group">
                    <div className="w-14 h-14 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-3xl">bug_report</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Responsible Disclosure</h3>
                    <p className="text-gray-600 mb-8 flex-1">Security researchers can responsibly report vulnerabilities to help improve SCS Flow.</p>
                    <a href="mailto:security@scsflow.com" className="inline-flex items-center justify-center w-full py-3 bg-gray-50 border border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                      Report Vulnerability
                    </a>
                 </div>

                 {/* Data Processing Agreement */}
                 <div className="bg-gray-50 border border-gray-200 p-8 rounded-3xl shadow-sm flex flex-col h-full relative overflow-hidden opacity-80">
                    <div className="absolute top-6 right-6 bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
                       Coming Soon
                    </div>
                    <div className="w-14 h-14 bg-gray-200 text-gray-500 rounded-2xl flex items-center justify-center mb-6">
                      <span className="material-symbols-outlined text-3xl">contract</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-3">Data Processing Agreement</h3>
                    <p className="text-gray-500 mb-8 flex-1">Enterprise agreement for organizations requiring GDPR-compliant data processing terms.</p>
                    <button disabled className="inline-flex items-center justify-center w-full py-3 bg-gray-200 text-gray-400 font-bold rounded-xl cursor-not-allowed">
                      Not Available
                    </button>
                 </div>
              </div>
           </div>
        </section>

        {/* TRUST TIMELINE */}
        <section className="py-24 bg-white border-t border-gray-100">
           <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold mb-16 text-gray-900">How Your Data is Protected</h2>
              
              <div className="flex flex-col md:flex-row justify-between items-center relative">
                 <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-blue-100 -z-10 -translate-y-1/2"></div>
                 
                 {[
                   { icon: "person", label: "Customer Data" },
                   { icon: "key", label: "Encrypted" },
                   { icon: "lock", label: "Stored Securely" },
                   { icon: "cloud_sync", label: "Backed Up" },
                   { icon: "troubleshoot", label: "Continuously Monitored" },
                   { icon: "settings_backup_restore", label: "Recoverable" },
                 ].map((step, idx) => (
                   <div key={idx} className="flex flex-col items-center gap-4 bg-white p-2">
                     <div className="w-14 h-14 bg-white border-2 border-primary text-primary rounded-full flex items-center justify-center shadow-md">
                        <span className="material-symbols-outlined text-2xl">{step.icon}</span>
                     </div>
                     <span className="font-bold text-sm text-gray-800 w-24 leading-tight">{step.label}</span>
                     {idx < 5 && <span className="material-symbols-outlined text-gray-300 md:hidden my-2">arrow_downward</span>}
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* ENTERPRISE READINESS */}
        <section className="py-24 bg-[#F8FAFC] border-t border-gray-100">
           <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold mb-12 text-gray-900">Enterprise Readiness</h2>
              
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                 {[
                   "GDPR Ready",
                   "Privacy First",
                   "Multi-Tenant",
                   "Secure Infrastructure",
                   "Enterprise Authentication"
                 ].map((badge, idx) => (
                   <div key={idx} className="px-5 py-3 bg-white border border-gray-200 shadow-sm rounded-full font-bold text-gray-800 flex items-center gap-2">
                      <span className="material-symbols-outlined text-green-500">check_circle</span>
                      {badge}
                   </div>
                 ))}
              </div>

              <h3 className="text-xl font-bold text-gray-500 uppercase tracking-widest mb-6">Future Certifications</h3>
              <div className="flex flex-wrap justify-center gap-4">
                 {[
                   "ISO 27001",
                   "SOC 2",
                   "HIPAA"
                 ].map((cert, idx) => (
                   <div key={idx} className="px-5 py-3 bg-gray-100 border border-gray-200 border-dashed rounded-full font-bold text-gray-500 flex items-center gap-2">
                      <span className="material-symbols-outlined text-gray-400">schedule</span>
                      {cert}
                      <span className="ml-2 bg-gray-200 text-gray-600 text-[10px] uppercase px-2 py-0.5 rounded-full">Planned</span>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* CONTACT */}
        <section className="py-24 bg-white border-t border-gray-100">
           <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Need Help?</h2>
              <p className="text-gray-600 mb-12">Reach out to our specialized teams for any inquiries regarding trust, security, or privacy.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                 {[
                   { name: "Support Team", email: "support@scsflow.com", icon: "support_agent" },
                   { name: "Security Team", email: "security@scsflow.com", icon: "security" },
                   { name: "Privacy Team", email: "privacy@scsflow.com", icon: "policy" },
                   { name: "Legal Team", email: "legal@scsflow.com", icon: "gavel" },
                 ].map((team, idx) => (
                   <div key={idx} className="bg-gray-50 border border-gray-200 p-6 rounded-2xl flex flex-col items-center hover:shadow-md transition-shadow">
                      <span className="material-symbols-outlined text-3xl text-gray-400 mb-3">{team.icon}</span>
                      <h4 className="font-bold text-gray-900 mb-1">{team.name}</h4>
                      <a href={`mailto:${team.email}`} className="text-primary text-sm font-semibold hover:underline">{team.email}</a>
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
              
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 relative z-10 leading-tight">
                Your Business Deserves <br className="hidden md:block"/> Enterprise-Level Trust
              </h2>
              <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto relative z-10">
                SCS Flow is committed to protecting your data with modern security, privacy, and operational best practices.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                <Link
                  className="px-10 py-4 bg-white text-primary rounded-xl font-bold text-lg hover:shadow-lg hover:scale-105 transition-all text-center"
                  href="/register"
                >
                  Start Free Trial
                </Link>
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
