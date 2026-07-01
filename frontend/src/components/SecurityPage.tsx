"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import LandingNavbar from "./LandingNavbar";
import LandingFooter from "./LandingFooter";

export default function SecurityPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "Is my data encrypted?",
      answer:
        "Yes, all data is encrypted both in transit (using HTTPS/TLS) and at rest using industry-standard AES-256 encryption.",
    },
    {
      question: "Can another shop access my data?",
      answer:
        "No. We enforce strict multi-tenant isolation. Your data is contextually bound to your tenant, meaning no other shop can query or access your information under any circumstances.",
    },
    {
      question: "Are backups performed automatically?",
      answer:
        "Yes, we perform automatic daily encrypted backups to ensure your business data is always safe.",
    },
    {
      question: "How long are backups retained?",
      answer:
        "Daily backups are retained for 30 days, allowing us to restore your data in the event of an emergency.",
    },
    {
      question: "Where is my business data stored?",
      answer:
        "Your data is securely stored in enterprise-grade managed cloud infrastructure (Supabase/PostgreSQL) with multiple redundancies.",
    },
    {
      question: "Can I export my business data?",
      answer:
        "Yes, business owners have the ability to export their core data (like inventory and bills) at any time.",
    },
    {
      question: "How are passwords protected?",
      answer:
        "Passwords are never stored in plain text. They are securely hashed and salted using bcrypt, making them virtually impossible to crack.",
    },
    {
      question: "What happens if my subscription expires?",
      answer:
        "Your data remains safe and securely isolated. You will lose active access to manage the shop until the subscription is renewed, but we do not instantly delete your historical data.",
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="bg-[#F8FAFC] text-on-surface antialiased min-h-screen">
      <LandingNavbar />
      <main className="pt-24 pb-12">
        {/* HERO SECTION */}
        <section className="relative py-24 overflow-hidden">
          {/* Subtle animated background */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent opacity-70"></div>
          
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              {/* Left Side */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm mb-6 border border-blue-200">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  Trust & Security
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-on-surface mb-6 leading-tight">
                  Enterprise-Grade <br/><span className="text-primary">Security</span>
                </h1>
                <p className="font-body-md text-lg text-on-surface-variant mb-10 max-w-2xl mx-auto lg:mx-0">
                  Your business data is protected with industry-standard security, encryption, automated backups, and complete multi-tenant isolation, allowing you to run your business with confidence.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <Link
                    className="w-full sm:w-auto px-8 py-4 bg-primary text-on-primary rounded-xl font-bold text-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center"
                    href="#architecture"
                  >
                    Security Architecture
                  </Link>
                  <Link
                    className="w-full sm:w-auto px-8 py-4 bg-white border border-outline-variant text-on-surface rounded-xl font-bold text-lg hover:bg-surface-container-low hover:-translate-y-1 transition-all duration-300 linear-shadow text-center"
                    href="/contact"
                  >
                    Contact Security Team
                  </Link>
                </div>
              </div>

              {/* Right Side - Abstract Illustration */}
              <div className="flex-1 relative w-full max-w-lg mx-auto lg:max-w-none">
                <div className="relative w-full aspect-square rounded-3xl bg-white/40 backdrop-blur-3xl border border-white/60 shadow-2xl overflow-hidden flex items-center justify-center p-8">
                   {/* Decorative elements */}
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                   
                   <div className="grid grid-cols-2 gap-6 w-full relative z-10">
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 transform hover:scale-105 transition-transform">
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                          <span className="material-symbols-outlined text-2xl">shield_lock</span>
                        </div>
                        <span className="font-semibold text-sm">Secure Network</span>
                      </div>
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 transform translate-y-8 hover:scale-105 transition-transform">
                        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <span className="material-symbols-outlined text-2xl">database</span>
                        </div>
                        <span className="font-semibold text-sm">Encrypted DB</span>
                      </div>
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 transform hover:scale-105 transition-transform">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <span className="material-symbols-outlined text-2xl">cloud_done</span>
                        </div>
                        <span className="font-semibold text-sm">Cloud Nodes</span>
                      </div>
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 transform translate-y-8 hover:scale-105 transition-transform">
                        <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                          <span className="material-symbols-outlined text-2xl">manage_search</span>
                        </div>
                        <span className="font-semibold text-sm">Audit Logs</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECURITY METRICS */}
        <section className="py-24 bg-surface-container-lowest border-b border-outline-variant">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-12 text-center">Security by the Numbers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: "enhanced_encryption", title: "256-bit Encryption", desc: "Industry-standard encryption protects sensitive business information.", status: "Active" },
                { icon: "domain", title: "100% Tenant Isolation", desc: "Every business operates inside its own isolated tenant.", status: "Verified" },
                { icon: "cloud_sync", title: "Daily Automated Backups", desc: "Business information is automatically backed up every day.", status: "Enabled" },
                { icon: "bolt", title: "99.9% Target Availability", desc: "Highly available cloud infrastructure with continuous monitoring.", status: "Operational" },
                { icon: "monitoring", title: "24×7 Security Monitoring", desc: "Infrastructure and applications are continuously monitored.", status: "Active" },
                { icon: "history", title: "Complete Audit Logging", desc: "Critical business activities are securely logged.", status: "Enabled" }
              ].map((card, idx) => (
                <div key={idx} className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-2xl">{card.icon}</span>
                    </div>
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">
                      {card.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">{card.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* OUR SECURITY PRINCIPLES */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Our Security Principles</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                The foundational principles that guide our architecture and engineering decisions.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: "Security by Design", desc: "Security is considered from the beginning of every feature and system architecture decision." },
                { title: "Least Privilege Access", desc: "Every owner and staff member receives only the permissions required for their responsibilities." },
                { title: "Privacy First", desc: "Business information is never sold or shared without authorization." },
                { title: "Continuous Improvement", desc: "Security is regularly improved through monitoring, updates, code reviews, and customer feedback." }
              ].map((principle, idx) => (
                <div key={idx} className="bg-[#F8FAFC] border border-gray-200 p-8 rounded-3xl hover:shadow-md transition-shadow">
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">{principle.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{principle.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECURITY OVERVIEW */}
        <section className="py-24 bg-white" id="architecture">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Security Overview</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto">
                Our infrastructure is built from the ground up to keep your data secure, available, and private.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: "lock", title: "Data Encryption", desc: "Industry-standard encryption protects your data both in transit and at rest." },
                { icon: "domain", title: "Multi-Tenant Isolation", desc: "Every business operates inside its own secure tenant with complete data isolation." },
                { icon: "backup", title: "Daily Backups", desc: "Automatic encrypted backups ensure your business data remains protected." },
                { icon: "security", title: "Secure Authentication", desc: "JWT authentication, role-based permissions, and secure password hashing." },
                { icon: "bolt", title: "99.9% Availability", desc: "Reliable cloud infrastructure with continuous monitoring and high uptime." },
                { icon: "history", title: "Audit Logging", desc: "Critical business actions are securely logged for accountability and traceability." }
              ].map((card, i) => (
                <div key={i} className="p-8 bg-[#F8FAFC] border border-outline-variant rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="w-14 h-14 bg-white text-primary rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-gray-100">
                    <span className="material-symbols-outlined text-3xl">{card.icon}</span>
                  </div>
                  <h3 className="font-bold text-xl mb-3">{card.title}</h3>
                  <p className="text-on-surface-variant leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AUTHENTICATION & ACCESS */}
        <section className="py-24 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              {/* Left Side */}
              <div className="flex-1 w-full">
                <div className="bg-white p-8 rounded-3xl border border-outline-variant shadow-lg relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-primary"></div>
                   <h3 className="text-2xl font-bold mb-10 text-center">Access Flow</h3>
                   
                   <div className="flex flex-col items-center gap-4 relative">
                      {/* Flow Step 1 */}
                      <div className="w-full max-w-xs bg-[#F8FAFC] border border-gray-200 p-4 rounded-xl flex items-center gap-4 z-10 shadow-sm">
                        <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined">shield_person</span>
                        </div>
                        <div>
                          <p className="font-bold">Owner</p>
                          <p className="text-xs text-gray-500">Admin Control</p>
                        </div>
                      </div>
                      
                      {/* Arrow */}
                      <div className="h-8 w-px bg-gray-300 border-l border-dashed border-gray-400 z-0"></div>
                      
                      {/* Flow Step 2 */}
                      <div className="w-full max-w-xs bg-[#F8FAFC] border border-gray-200 p-4 rounded-xl flex items-center gap-4 z-10 shadow-sm">
                        <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined">group</span>
                        </div>
                        <div>
                          <p className="font-bold">Staff</p>
                          <p className="text-xs text-gray-500">Role-based Access</p>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="h-8 w-px bg-gray-300 border-l border-dashed border-gray-400 z-0"></div>

                      {/* Flow Step 3 */}
                      <div className="w-full max-w-xs bg-primary text-white p-4 rounded-xl flex items-center justify-center gap-2 z-10 shadow-md">
                        <span className="material-symbols-outlined">lock_open</span>
                        <span className="font-bold">Secure Access</span>
                      </div>
                   </div>
                </div>
              </div>

              {/* Right Side */}
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-bold mb-8">Authentication & Access</h2>
                <div className="space-y-6">
                  {[
                    { title: "JWT Authentication", desc: "Secure token-based authentication on every request." },
                    { title: "Session Validation", desc: "Automatic session verification on every protected request to ensure validity." },
                    { title: "Owner Authentication", desc: "Business owners have complete administrative control over their organization." },
                    { title: "Staff Role Permissions", desc: "Role-based access limiting staff to only authorized modules." },
                    { title: "Password Hashing", desc: "Passwords are securely hashed using bcrypt (or Argon2 in future)." },
                    { title: "Automatic Session Expiry", desc: "Inactive sessions automatically expire to protect business data." },
                    { title: "Targeted Account Lockout", desc: "Accounts are temporarily locked after repeated failed login attempts to prevent brute-force attacks." },
                    { title: "Future Ready", desc: "Optional Two-Factor Authentication (2FA) coming in the future." },
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="mt-1">
                        <span className="material-symbols-outlined text-primary">check_circle</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{item.title}</h4>
                        <p className="text-on-surface-variant">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECURITY REQUEST FLOW */}
        <section className="py-24 bg-white border-t border-outline-variant overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-16 text-gray-900">Security Request Flow</h2>
            <div className="flex flex-col md:flex-row justify-between items-center relative gap-4 md:gap-0">
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 -translate-y-1/2"></div>
              {[
                { icon: "person", label: "User Request" },
                { icon: "enhanced_encryption", label: "HTTPS/TLS" },
                { icon: "key", label: "JWT Auth" },
                { icon: "verified_user", label: "Session" },
                { icon: "domain", label: "Tenant Check" },
                { icon: "admin_panel_settings", label: "Role Check" },
                { icon: "api", label: "API Auth" },
                { icon: "database", label: "DB Query" },
                { icon: "history", label: "Audit Log" },
                { icon: "check_circle", label: "Secure Response" }
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3 bg-white px-1">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white border-2 border-primary text-primary rounded-full flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-lg md:text-xl">{step.icon}</span>
                  </div>
                  <span className="font-bold text-[10px] md:text-xs text-gray-800 w-16 md:w-20 leading-tight">{step.label}</span>
                  {idx < 9 && <span className="material-symbols-outlined text-gray-300 md:hidden my-1">arrow_downward</span>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* API SECURITY */}
        <section className="py-24 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">API Security</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our APIs are protected by multiple layers of security to ensure data integrity and confidentiality.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: "vpn_key", title: "JWT Authentication", desc: "Stateless, verifiable tokens for all API requests." },
                { icon: "lock", title: "HTTPS Only", desc: "No unencrypted traffic is allowed." },
                { icon: "domain", title: "Tenant-aware Endpoints", desc: "Data is filtered by tenant automatically." },
                { icon: "speed", title: "Rate Limiting", desc: "Protects against brute force and DDoS attacks." },
                { icon: "fact_check", title: "Request Validation", desc: "Strict schema validation for all inputs." },
                { icon: "cleaning_services", title: "Input Sanitization", desc: "Prevents malicious payload injections." },
                { icon: "security", title: "SQL Injection Protection", desc: "Parameterized queries using Prisma ORM." },
                { icon: "shield", title: "CORS Protection", desc: "Strict Cross-Origin Resource Sharing policies." },
                { icon: "verified", title: "Security Headers", desc: "Advanced HTTP response security headers." },
                { icon: "history", title: "API Logging", desc: "Detailed access logs for auditing." }
              ].map((card, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:-translate-y-1 transition-transform">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined">{card.icon}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">{card.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* APPLICATION SECURITY */}
        <section className="py-24 bg-white border-b border-outline-variant">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">Application Security</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Security is built into the core of the SCS Flow application. We utilize modern development frameworks and strict coding standards to mitigate vulnerabilities before they can be exploited.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Server-side Validation",
                  "Input Sanitization",
                  "Output Encoding",
                  "Cross-Site Scripting Protection",
                  "SQL Injection Prevention",
                  "Secure File Upload Validation",
                  "Business Logic Validation",
                  "Audit Logging",
                  "Secure Error Handling",
                  "Role-based Authorization"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                    <span className="font-semibold text-gray-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 w-full bg-gray-50 rounded-3xl p-8 border border-gray-200 shadow-inner flex items-center justify-center">
               <div className="relative w-full aspect-square max-w-sm">
                 <div className="absolute inset-0 border-4 border-dashed border-gray-300 rounded-full animate-[spin_60s_linear_infinite]"></div>
                 <div className="absolute inset-4 border-4 border-blue-200 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl transform rotate-12">
                       <span className="material-symbols-outlined text-6xl">verified_user</span>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </section>

        {/* MULTI-TENANT SECURITY */}
        <section className="py-24 bg-primary text-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Multi-Tenant Security</h2>
              <p className="text-primary-container max-w-2xl mx-auto">
                Our strongest selling point. Your data is strictly yours.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-16 items-center">
              {/* Left Side: Illustration */}
              <div className="flex-1 w-full">
                <div className="bg-white/10 p-8 rounded-3xl border border-white/20 backdrop-blur-md">
                   <div className="space-y-6">
                      {['Shop A', 'Shop B', 'Shop C'].map((shop, i) => (
                        <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                          <div className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center font-bold shadow-lg">
                            {shop.charAt(5)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold">{shop}</h4>
                          </div>
                          <span className="material-symbols-outlined text-white/50">arrow_forward</span>
                          <div className="bg-white/20 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">database</span>
                            Own Database Context
                          </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              {/* Right Side: Features */}
              <div className="flex-1">
                <ul className="space-y-6 mb-10 text-lg">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-green-400 mt-1">verified</span>
                    <span>Every business has complete tenant isolation.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-green-400 mt-1">verified</span>
                    <span>No tenant can access another tenant's data.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-green-400 mt-1">verified</span>
                    <span>Tenant filtering is enforced on every secured API request.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-green-400 mt-1">verified</span>
                    <span>All database queries are tenant-aware.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-green-400 mt-1">verified</span>
                    <span>Business owners only manage their own organization.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-green-400 mt-1">verified</span>
                    <span>Staff access is limited using permissions.</span>
                  </li>
                </ul>

                <div className="flex flex-wrap gap-4">
                  {['Isolated Data', 'Secure APIs', 'Tenant-aware Queries', 'Permission-based Access'].map((badge, idx) => (
                    <div key={idx} className="bg-white/20 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 backdrop-blur-sm border border-white/30">
                      <span className="material-symbols-outlined text-sm">done</span>
                      {badge}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* YOUR DATA BELONGS TO YOU */}
        <section className="py-24 bg-surface-container-lowest overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="bg-gradient-to-br from-primary to-blue-800 rounded-3xl p-10 md:p-16 relative shadow-2xl flex flex-col md:flex-row items-center gap-12">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 backdrop-blur-md"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32 backdrop-blur-md"></div>
              
              <div className="flex-1 relative z-10 text-white">
                <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Your Business Data Always Belongs to You</h2>
                <p className="text-blue-100 text-lg mb-10 leading-relaxed max-w-xl">
                  SCS Flow never claims ownership of customer business data. We provide the secure infrastructure, but the data is yours to control, export, and delete.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Export your data anytime",
                    "Delete your account according to policy",
                    "No selling of customer data",
                    "Full business ownership",
                    "Secure tenant isolation",
                    "Transparent privacy practices"
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-green-400">check_circle</span>
                      <span className="font-semibold text-white">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex-1 relative z-10 w-full flex justify-center">
                 <div className="relative">
                    <div className="w-48 h-48 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/30 shadow-2xl animate-pulse">
                       <span className="material-symbols-outlined text-white text-7xl">database</span>
                    </div>
                    <div className="absolute -top-6 -right-6 w-20 h-20 bg-green-400 rounded-full flex items-center justify-center shadow-lg border-4 border-blue-800">
                       <span className="material-symbols-outlined text-white text-3xl">verified_user</span>
                    </div>
                    <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center shadow-lg border-4 border-blue-800">
                       <span className="material-symbols-outlined text-white text-2xl">lock</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* DATA PROTECTION */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
             <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Data Protection</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto">
                Modern security layers protecting every byte of your business.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {[
                 { title: "HTTPS / TLS Encryption", desc: "All data transfers are encrypted via TLS." },
                 { title: "Encryption at Rest", desc: "Databases and block storage are encrypted at rest." },
                 { title: "Secure Password Hashing", desc: "Salting and hashing for all stored credentials." },
                 { title: "Secure Cookies", desc: "HttpOnly, Secure, and SameSite strict cookies." },
                 { title: "Environment Variables", desc: "Secrets isolated from application code." },
                 { title: "Secret Management", desc: "Secure vaults for all infrastructure keys." },
               ].map((item, idx) => (
                 <div key={idx} className="flex gap-4 p-6 bg-[#F8FAFC] rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-sm shrink-0 border border-gray-200">
                      <span className="material-symbols-outlined">enhanced_encryption</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                      <p className="text-on-surface-variant text-sm">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* DATA LIFECYCLE */}
        <section className="py-24 bg-[#F8FAFC] border-y border-outline-variant">
           <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-16 text-gray-900">Data Lifecycle</h2>
              
              <div className="flex flex-col md:flex-row justify-between items-center relative gap-8 md:gap-0">
                 <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-blue-100 -z-10 -translate-y-1/2"></div>
                 
                 {[
                   { icon: "add_circle", label: "Business Data Created" },
                   { icon: "enhanced_encryption", label: "Encrypted" },
                   { icon: "cloud_done", label: "Stored Securely" },
                   { icon: "backup", label: "Backed Up Daily" },
                   { icon: "admin_panel_settings", label: "Accessible Only to Authorized Users" },
                   { icon: "download", label: "Export Available Anytime" },
                   { icon: "delete_forever", label: "Deleted Securely When Requested" },
                 ].map((step, idx) => (
                   <div key={idx} className="flex flex-col items-center gap-4 bg-[#F8FAFC] px-2 w-32 z-10">
                     <div className="w-12 h-12 md:w-14 md:h-14 bg-white border-2 border-primary text-primary rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-xl md:text-2xl">{step.icon}</span>
                     </div>
                     <span className="font-bold text-xs md:text-sm text-gray-800 leading-tight">{step.label}</span>
                     {idx < 6 && <span className="material-symbols-outlined text-gray-300 md:hidden my-2">arrow_downward</span>}
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* INFRASTRUCTURE */}
        <section className="py-24 bg-surface-container-lowest border-y border-outline-variant">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
             <h2 className="text-3xl md:text-4xl font-bold mb-16">Infrastructure Architecture</h2>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                {[
                  { name: "PostgreSQL", icon: "dns", desc: "Reliable enterprise relational database." },
                  { name: "Supabase", icon: "architecture", desc: "Managed backend infrastructure." },
                  { name: "Cloud Storage", icon: "cloud", desc: "Secure file and backup storage." },
                  { name: "SSL Encryption", icon: "lock", desc: "Encrypted communication." },
                  { name: "CDN", icon: "public", desc: "Fast global content delivery." },
                  { name: "Monitoring", icon: "monitoring", desc: "Continuous health monitoring." },
                  { name: "Automatic Scaling", icon: "stacked_line_chart", desc: "Infrastructure scales as your business grows." },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                     <span className="material-symbols-outlined text-3xl text-primary">{item.icon}</span>
                     <div>
                       <h4 className="font-bold">{item.name}</h4>
                       <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </section>

        {/* INFRASTRUCTURE DIAGRAM */}
        <section className="py-24 bg-white border-b border-outline-variant">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-16 text-gray-900">Enterprise Architecture</h2>
            
            <div className="flex flex-col lg:flex-row justify-center items-center gap-4 lg:gap-2 overflow-x-auto pb-4">
              {[
                { icon: "public", label: "Browser" },
                { icon: "enhanced_encryption", label: "HTTPS" },
                { icon: "language", label: "CDN" },
                { icon: "token", label: "Next.js App" },
                { icon: "vpn_key", label: "Auth Layer" },
                { icon: "domain", label: "Middleware" },
                { icon: "code", label: "Prisma ORM" },
                { icon: "dns", label: "PostgreSQL" },
                { icon: "lock", label: "Storage" },
                { icon: "cloud_sync", label: "Backup" },
              ].map((node, idx) => (
                 <React.Fragment key={idx}>
                   <div className="flex flex-col items-center bg-gray-50 border border-gray-200 p-3 rounded-2xl shadow-sm min-w-[80px] hover:shadow-md transition-all shrink-0">
                      <span className="material-symbols-outlined text-2xl text-primary mb-2">{node.icon}</span>
                      <span className="font-bold text-[10px] text-gray-800 leading-tight">{node.label}</span>
                   </div>
                   {idx < 9 && (
                     <div className="flex flex-col lg:flex-row items-center justify-center text-gray-300 shrink-0">
                        <span className="material-symbols-outlined lg:rotate-[-90deg]">arrow_downward</span>
                     </div>
                   )}
                 </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* TRUSTED TECHNOLOGY STACK */}
        <section className="py-24 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Trusted Technology Stack</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Built on enterprise-grade, battle-tested technologies that prioritize security and reliability.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                 { name: "Next.js", desc: "React framework providing server-side rendering and static generation for secure, fast frontends." },
                 { name: "TypeScript", desc: "Strictly typed language reducing runtime errors and improving codebase stability." },
                 { name: "Prisma ORM", desc: "Type-safe database client that prevents SQL injection attacks." },
                 { name: "PostgreSQL", desc: "Enterprise relational database ensuring ACID compliance and data integrity." },
                 { name: "Supabase", desc: "Secure managed backend infrastructure with Row Level Security." },
                 { name: "JWT", desc: "Stateless, cryptographic JSON Web Tokens for secure session management." },
                 { name: "HTTPS/TLS", desc: "Industry-standard encryption protocols for all data in transit." },
                 { name: "Cloud Infrastructure", desc: "Highly available, compliant, and redundant cloud hosting." },
               ].map((tech, idx) => (
                 <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:-translate-y-1 transition-transform">
                    <h4 className="font-bold text-gray-900 mb-2">{tech.name}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{tech.desc}</p>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* BACKUP & DISASTER RECOVERY & MONITORING */}
        <section className="py-24 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                
                {/* Backup */}
                <div className="w-full">
                   <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                     <span className="material-symbols-outlined text-4xl text-primary">cloud_sync</span>
                     Backup Architecture
                   </h2>
                   
                   <div className="mb-8 p-6 bg-white border border-gray-200 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden">
                      <div className="hidden sm:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10 -translate-y-1/2"></div>
                      {[
                        { icon: "store", label: "Business" },
                        { icon: "layers", label: "Application" },
                        { icon: "dns", label: "PostgreSQL" },
                        { icon: "backup", label: "Daily Backup" },
                        { icon: "lock", label: "Encrypted Storage" },
                        { icon: "settings_backup_restore", label: "Recovery" }
                      ].map((step, idx) => (
                         <div key={idx} className="flex flex-col items-center bg-white px-2 z-10">
                            <span className="material-symbols-outlined text-2xl text-primary mb-1">{step.icon}</span>
                            <span className="text-[10px] font-bold text-gray-700">{step.label}</span>
                         </div>
                      ))}
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                        <h4 className="font-bold text-lg mb-1">Database Backups</h4>
                        <p className="text-gray-600 text-xs">Encrypted daily backups stored in secure locations.</p>
                     </div>
                     <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                        <h4 className="font-bold text-lg mb-1">Uploaded Files</h4>
                        <p className="text-gray-600 text-xs">All media and documents are securely backed up.</p>
                     </div>
                     <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                        <h4 className="font-bold text-lg mb-1">JSON Export</h4>
                        <p className="text-gray-600 text-xs">Every business can download its own backup anytime.</p>
                     </div>
                     <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                        <h4 className="font-bold text-lg mb-1">Disaster Recovery</h4>
                        <p className="text-gray-600 text-xs">Robust policies to restore data during unexpected failures.</p>
                     </div>
                   </div>
                   
                   <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex flex-col">
                         <span className="text-xs text-blue-600 font-bold uppercase mb-1">Retention</span>
                         <span className="font-semibold">30 Days</span>
                      </div>
                      <div className="flex flex-col border-t sm:border-t-0 sm:border-l border-blue-200 pt-3 sm:pt-0 sm:pl-4">
                         <span className="text-xs text-blue-600 font-bold uppercase mb-1">Verification</span>
                         <span className="font-semibold flex items-center gap-1"><span className="material-symbols-outlined text-sm text-green-600">check_circle</span> Automated</span>
                      </div>
                      <div className="flex flex-col border-t sm:border-t-0 sm:border-l border-blue-200 pt-3 sm:pt-0 sm:pl-4">
                         <span className="text-xs text-blue-600 font-bold uppercase mb-1">Future</span>
                         <span className="font-semibold text-xs mt-1">Point-in-Time Recovery</span>
                      </div>
                   </div>
                </div>

                {/* Monitoring */}
                <div>
                   <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                     <span className="material-symbols-outlined text-4xl text-primary">troubleshoot</span>
                     Monitoring & Logging
                   </h2>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { title: "Error Monitoring", desc: "Continuous application monitoring." },
                        { title: "API Monitoring", desc: "Performance monitoring for backend APIs." },
                        { title: "Uptime Monitoring", desc: "24/7 uptime monitoring." },
                        { title: "Security Events", desc: "Continuous monitoring of suspicious activities." },
                        { title: "Audit Logs", desc: "Track important system and user actions." },
                      ].map((m, i) => (
                        <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:-translate-y-1 transition-transform cursor-default">
                           <h4 className="font-bold mb-1">{m.title}</h4>
                           <p className="text-xs text-gray-500">{m.desc}</p>
                        </div>
                      ))}
                   </div>
                </div>

             </div>
          </div>
        </section>

        {/* SECURITY OPERATIONS */}
        <section className="py-24 bg-white border-b border-outline-variant">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Security Operations</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Security is a continuous process. Our operations team works around the clock to ensure your data remains safe from emerging threats.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {[
                 { title: "Dependency Updates", desc: "Automated scanning and updating of software dependencies." },
                 { title: "Patch Management", desc: "Rapid deployment of security patches to infrastructure." },
                 { title: "Infra Monitoring", desc: "Real-time alerts for unusual infrastructure behavior." },
                 { title: "App Monitoring", desc: "Continuous tracking of application errors and anomalies." },
                 { title: "Vulnerability Review", desc: "Periodic reviews of known vulnerabilities." },
                 { title: "Performance Monitoring", desc: "Ensuring high availability under heavy loads." },
                 { title: "Incident Response", desc: "Dedicated playbooks for responding to security events." },
                 { title: "Security Improvements", desc: "Iterative enhancements to our security posture." },
               ].map((op, idx) => (
                 <div key={idx} className="bg-[#F8FAFC] border-l-4 border-primary p-5 rounded-r-xl shadow-sm hover:translate-x-2 transition-transform">
                    <h4 className="font-bold text-gray-900 mb-1">{op.title}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">{op.desc}</p>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* COMPLIANCE & RESPONSIBLE DISCLOSURE */}
        <section className="py-24 bg-white border-t border-outline-variant">
           <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                 
                 {/* Compliance */}
                 <div>
                    <h2 className="text-3xl font-bold mb-8">Compliance & Standards</h2>
                    
                    <h3 className="text-xl font-bold text-gray-400 mb-4 uppercase tracking-wider text-sm">Current</h3>
                    <div className="flex flex-wrap gap-4 mb-10">
                       {["GDPR Ready", "Data Protection Principles", "Secure Development", "Privacy-first Architecture"].map((c, i) => (
                         <div key={i} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">verified</span>
                            {c}
                         </div>
                       ))}
                    </div>

                    <h3 className="text-xl font-bold text-gray-400 mb-4 uppercase tracking-wider text-sm">Future Roadmap</h3>
                    <div className="flex flex-wrap gap-4">
                       {["ISO 27001", "SOC 2", "HIPAA"].map((c, i) => (
                         <div key={i} className="px-4 py-2 bg-white border border-gray-200 border-dashed rounded-full text-sm font-semibold text-gray-400 flex items-center gap-2">
                            <span className="material-symbols-outlined text-gray-400 text-sm">schedule</span>
                            {c}
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Responsible Disclosure */}
                 <div>
                    <div className="bg-primary-container p-8 rounded-3xl relative overflow-hidden">
                       <span className="material-symbols-outlined text-9xl absolute -bottom-4 -right-4 text-primary/10">local_police</span>
                       <h2 className="text-3xl font-bold text-on-primary-container mb-2 relative z-10">Responsible Disclosure</h2>
                       <p className="text-on-primary-container/80 mb-6 relative z-10">
                         Help us improve the security of SCS Flow. If you discover a security vulnerability, please report it responsibly.
                       </p>
                       <div className="bg-white p-4 rounded-xl flex items-center justify-between mb-6 relative z-10 shadow-sm border border-gray-100">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">mail</span>
                            <span className="font-bold text-gray-800">security@scsflow.com</span>
                          </div>
                       </div>
                       <a 
                         href="mailto:security@scsflow.com" 
                         className="inline-block px-6 py-3 bg-primary text-white font-bold rounded-xl hover:shadow-lg transition-all relative z-10"
                       >
                         Report Security Issue
                       </a>
                    </div>
                 </div>

              </div>
           </div>
        </section>

        {/* SECURITY ROADMAP */}
        <section className="py-24 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Security Roadmap</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We are constantly evolving our platform to meet the highest enterprise security standards. Here are the features we are actively working on.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
               {[
                 { icon: "password", title: "Passwordless Login" },
                 { icon: "phonelink_lock", title: "Two-Factor Auth" },
                 { icon: "devices", title: "Device Management" },
                 { icon: "verified", title: "Trusted Devices" },
                 { icon: "notifications_active", title: "Login Notifications" },
                 { icon: "vpn_key", title: "Single Sign-On" },
                 { icon: "api", title: "API Keys" },
                 { icon: "usb", title: "Hardware Security Keys" },
                 { icon: "list_alt", title: "IP Allow Lists" },
                 { icon: "dashboard", title: "Security Dashboard" },
               ].map((item, idx) => (
                 <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-2 right-2">
                       <span className="bg-gray-100 text-gray-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-gray-200">Planned</span>
                    </div>
                    <span className="material-symbols-outlined text-3xl text-gray-400 mb-3 group-hover:text-primary transition-colors">{item.icon}</span>
                    <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 bg-[#F8FAFC]">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Security FAQs</h2>
              <p className="text-gray-600">Common questions about how we handle your data.</p>
            </div>
            
            <div className="space-y-4">
               {faqs.map((faq, index) => (
                 <div key={index} className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300">
                   <button 
                     onClick={() => toggleFaq(index)}
                     className="w-full px-6 py-5 flex items-center justify-between font-bold text-lg text-left hover:bg-gray-50 focus:outline-none"
                   >
                     {faq.question}
                     <span className={`material-symbols-outlined transform transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}>
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

        {/* HOW EVERY REQUEST IS PROTECTED */}
        <section className="py-24 bg-white border-t border-outline-variant">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-16 text-gray-900">How Every Request is Protected</h2>
            
            <div className="relative bg-gray-50 border border-gray-200 rounded-3xl p-8 md:p-16 max-w-4xl mx-auto shadow-sm overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
               <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                  <div className="flex flex-col items-center">
                     <div className="w-16 h-16 bg-white border border-gray-200 shadow-sm rounded-2xl flex items-center justify-center mb-4 text-primary">
                        <span className="material-symbols-outlined text-3xl">language</span>
                     </div>
                     <h4 className="font-bold mb-2">1. The Edge</h4>
                     <p className="text-xs text-gray-500 text-center leading-relaxed">
                        Requests hit our CDN edge nodes. Rate limiting and DDoS protection filter out malicious traffic immediately.
                     </p>
                  </div>
                  <div className="flex flex-col items-center">
                     <div className="w-16 h-16 bg-white border border-gray-200 shadow-sm rounded-2xl flex items-center justify-center mb-4 text-primary relative">
                        <span className="material-symbols-outlined text-3xl">api</span>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                           <span className="material-symbols-outlined text-white text-[10px]">check</span>
                        </div>
                     </div>
                     <h4 className="font-bold mb-2">2. Middleware</h4>
                     <p className="text-xs text-gray-500 text-center leading-relaxed">
                        JWTs are verified. Tenant IDs are extracted and bound to the request scope. Invalid requests are dropped.
                     </p>
                  </div>
                  <div className="flex flex-col items-center">
                     <div className="w-16 h-16 bg-white border border-gray-200 shadow-sm rounded-2xl flex items-center justify-center mb-4 text-primary">
                        <span className="material-symbols-outlined text-3xl">database</span>
                     </div>
                     <h4 className="font-bold mb-2">3. Data Access</h4>
                     <p className="text-xs text-gray-500 text-center leading-relaxed">
                        The ORM injects the tenant ID into every query automatically. All database access is parameterized.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* CONTACT OUR SECURITY TEAM */}
        <section className="py-24 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="bg-white rounded-3xl border border-gray-200 p-10 md:p-16 shadow-lg max-w-4xl mx-auto relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32"></div>
               
               <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                  <div className="flex-1">
                     <h2 className="text-3xl font-bold mb-4 text-gray-900">Contact Security</h2>
                     <p className="text-gray-600 mb-8 leading-relaxed">
                        Have a security question, found a vulnerability, or need to report an incident? Our dedicated security team is available to assist you.
                     </p>
                     
                     <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                           <span className="material-symbols-outlined text-primary">mail</span>
                           <div>
                              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">General Security Inquiries</div>
                              <div className="font-medium text-gray-900">security@scsflow.com</div>
                           </div>
                        </div>
                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                           <span className="material-symbols-outlined text-red-500">bug_report</span>
                           <div>
                              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Vulnerability Reporting</div>
                              <div className="font-medium text-gray-900">bounty@scsflow.com</div>
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  <div className="w-full md:w-auto flex flex-col items-center">
                     <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center text-white mb-4 shadow-xl shadow-primary/30 relative">
                        <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20"></div>
                        <span className="material-symbols-outlined text-5xl">support_agent</span>
                     </div>
                     <span className="font-bold text-gray-900">Security Team</span>
                     <span className="text-xs text-gray-500 flex items-center gap-1 mt-1"><span className="w-2 h-2 bg-green-500 rounded-full block"></span> Available 24/7</span>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* LAST UPDATED */}
        <section className="py-12 bg-white">
           <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
              <div className="inline-flex flex-col md:flex-row items-center gap-4 md:gap-8 bg-gray-50 px-8 py-4 rounded-full border border-gray-200 text-sm">
                 <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-400">calendar_month</span>
                    <span className="text-gray-500">Last Updated: <span className="font-bold text-gray-800">October 15, 2023</span></span>
                 </div>
                 <div className="hidden md:block w-px h-4 bg-gray-300"></div>
                 <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-400">history</span>
                    <span className="text-gray-500">Version: <span className="font-bold text-gray-800">2.4.1</span></span>
                 </div>
                 <div className="hidden md:block w-px h-4 bg-gray-300"></div>
                 <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-400">verified</span>
                    <span className="text-gray-500">Status: <span className="font-bold text-green-600">Current</span></span>
                 </div>
              </div>
           </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-24 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-primary-container rounded-3xl p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
              {/* Abstract Background for CTA */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-300/30 via-transparent to-transparent"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 backdrop-blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32 backdrop-blur-3xl"></div>
              
              <h2 className="text-4xl md:text-5xl font-extrabold text-on-primary-container mb-6 relative z-10 leading-tight">
                Your Business Deserves <br className="hidden md:block"/> Enterprise-Grade Security
              </h2>
              <p className="text-on-primary-container/80 text-lg mb-10 max-w-2xl mx-auto relative z-10">
                Focus on growing your business while SCS Flow protects your data.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                <Link
                  className="px-10 py-4 bg-white text-primary rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all text-center"
                  href="/register"
                >
                  Start Free Trial
                </Link>
                <Link
                  className="px-10 py-4 border-2 border-primary/20 text-on-primary-container rounded-xl font-bold text-lg hover:bg-primary/10 transition-all text-center"
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
