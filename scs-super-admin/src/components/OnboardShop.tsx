"use client";
import React from 'react';
import Link from 'next/link';

export default function OnboardShop() {
  return (
    <div className="bg-background font-body-md text-on-background flex min-h-screen">
      {/* SVG Gradient Definitions */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="line-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#004ac6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#004ac6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      
{/* SideNavBar (Shared Component) */}
<aside className="bg-surface-container-low dark:bg-surface-container-lowest w-sidebar-width h-screen sticky top-0 left-0 border-r border-outline-variant dark:border-outline flex flex-col h-full py-6">
<div className="px-6 mb-8 flex items-center gap-3">
<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-on-primary">
<span className="material-symbols-outlined">storefront</span>
</div>
<div>
<h1 className="font-h1 text-h1 text-primary dark:text-primary-fixed-dim">SCS Admin</h1>
<p className="text-[10px] uppercase tracking-wider text-secondary">Super Admin Panel</p>
</div>
</div>
<nav className="flex-1 px-3 space-y-1">
{/* Navigation Items Mapping */}
<Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors duration-150 ease-in-out font-body-md text-body-md" href="/">
<span className="material-symbols-outlined">dashboard</span>
<span>Dashboard</span>
</Link>
<Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors duration-150 ease-in-out font-body-md text-body-md" href="/tenants">
<span className="material-symbols-outlined">storefront</span>
<span>Tenants / Shops</span>
</Link>
{/* Active State Logic for "Create Shop" */}
<Link className="bg-secondary-container dark:bg-on-primary-fixed-variant text-on-secondary-container dark:text-on-primary-container border-l-4 border-primary flex items-center gap-3 px-3 py-2.5 font-body-md text-body-md active:scale-[0.98] transition-transform duration-150" href="/onboard">
<span className="material-symbols-outlined">add_business</span>
<span>Create Shop</span>
</Link>
<Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors duration-150 ease-in-out font-body-md text-body-md" href="/users">
<span className="material-symbols-outlined">group</span>
<span>Active Users</span>
</Link>
<Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors duration-150 ease-in-out font-body-md text-body-md" href="/reports">
<span className="material-symbols-outlined">analytics</span>
<span>SaaS Reports</span>
</Link>
<Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors duration-150 ease-in-out font-body-md text-body-md" href="/settings">
<span className="material-symbols-outlined">settings</span>
<span>System Settings</span>
</Link>
</nav>
<div className="px-3 mt-auto">
<Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors duration-150 ease-in-out font-body-md text-body-md" href="/">
<span className="material-symbols-outlined">logout</span>
<span>Logout</span>
</Link>
</div>
</aside>
{/* Main Canvas */}
<div className="flex-1 flex flex-col h-screen overflow-y-auto bg-background">
{/* TopAppBar (Shared Component) */}
<header className="bg-surface-container-lowest dark:bg-surface-dim h-header-height w-full sticky top-0 z-50 border-b border-outline-variant dark:border-outline flex items-center justify-between px-container-padding shadow-sm dark:shadow-none">
<div className="flex items-center gap-6 flex-1">
<div className="relative w-full max-w-md">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
<input className="w-full pl-10 pr-4 py-2 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary text-body-md font-body-md" placeholder="Search resources... (Cmd + K)" type="text"/>
</div>
</div>
<div className="flex items-center gap-4">
<button className="w-10 h-10 flex items-center justify-center text-secondary hover:text-primary transition-colors focus:ring-2 focus:ring-primary rounded-full">
<span className="material-symbols-outlined">notifications</span>
</button>
<button className="w-10 h-10 flex items-center justify-center text-secondary hover:text-primary transition-colors focus:ring-2 focus:ring-primary rounded-full">
<span className="material-symbols-outlined">account_tree</span>
</button>
<div className="h-8 w-px bg-outline-variant mx-2"></div>
<div className="flex items-center gap-3">
<img alt="SCS Admin Profile" className="w-9 h-9 rounded-full object-cover border border-outline-variant" data-alt="A professional studio portrait of a corporate administrator in a bright, modern office setting. The lighting is crisp and even, reflecting a high-efficiency tech company aesthetic with soft blue and white tones. The mood is confident and utilitarian, maintaining the minimalist brand identity of a premium SaaS platform." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqZTp3QXjRnarFGWVpctZF8aUJmEKzOBgTyh2rOEVhFLJHo5b24PRjJCiG4L6QoD4sh4jfTTrJLTNYc4nKBhpsITfyed_338bxpvJVWi-kQ8KXwQKPqHe864_1lMl6qlk2pLluYkv77F3jQN9GuUvUskQdtAOsx_BBBKk1CQ5VQvWJpzcrItNnq3348bnlol3p-a9_sU5BZe0OiXYy4FGDvE61QOpHiQ9B2Ty9-bNBIsYUDFu-dBrpz62nDkw_Y7le1bfhqglIV-A"/>
<div className="flex flex-col">
<span className="text-on-surface font-semibold text-body-sm leading-none">Admin User</span>
<span className="text-secondary text-[11px]">System Superuser</span>
</div>
</div>
</div>
</header>
{/* Content Area */}
<main className="flex-1 p-container-padding max-w-5xl mx-auto w-full relative">
{/* Success Toast Hint (Initially hidden) */}
<div className="fixed top-20 right-8 transform translate-x-full transition-transform duration-500 ease-out z-[60]" id="success-toast">
<div className="bg-surface-container-highest border border-outline-variant shadow-lg rounded-xl p-4 flex items-center gap-4">
<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
<span className="material-symbols-outlined" data-weight="fill">check_circle</span>
</div>
<div>
<p className="font-h1 text-body-md text-on-surface">Shop Created Successfully</p>
<p className="text-secondary text-body-sm">Welcome to the SCS ecosystem.</p>
</div>
<button className="ml-4 text-outline hover:text-on-surface transition-colors" onClick={() => {}}>
<span className="material-symbols-outlined">close</span>
</button>
</div>
</div>
{/* Page Header */}
<div className="mb-10">
<h2 className="font-display-sm text-display-sm text-on-surface mb-2">Onboard New Shop</h2>
<p className="text-secondary font-body-md max-w-xl">Configure a new wholesale merchant profile within the SCS Platform. All fields are required for regulatory compliance.</p>
</div>
{/* Form Container */}
<div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
<form className="divide-y divide-outline-variant" id="create-shop-form">
{/* Section: General Information */}
<div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
<div>
<h3 className="font-h1 text-body-md text-on-surface mb-1">Business Identity</h3>
<p className="text-secondary text-body-sm">Legal branding and identification details for the wholesale entity.</p>
</div>
<div className="md:col-span-2 space-y-6">
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="flex flex-col gap-1.5">
<label className="font-label-caps text-label-caps text-secondary uppercase">Business Name</label>
<input className="w-full px-4 py-2.5 bg-surface-bright border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-md" placeholder="e.g. Global Logistics Hub" required type="text"/>
</div>
<div className="flex flex-col gap-1.5">
<label className="font-label-caps text-label-caps text-secondary uppercase">GST Number</label>
<input className="w-full px-4 py-2.5 bg-surface-bright border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all font-mono-data" placeholder="22AAAAA0000A1Z5" required type="text"/>
</div>
</div>
</div>
</div>
{/* Section: Ownership */}
<div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
<div>
<h3 className="font-h1 text-body-md text-on-surface mb-1">Owner &amp; Access</h3>
<p className="text-secondary text-body-sm">Primary administrative contact and security credentials.</p>
</div>
<div className="md:col-span-2 space-y-6">
<div className="flex flex-col gap-1.5">
<label className="font-label-caps text-label-caps text-secondary uppercase">Owner Name</label>
<input className="w-full px-4 py-2.5 bg-surface-bright border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-md" placeholder="Full legal name" required type="text"/>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="flex flex-col gap-1.5">
<label className="font-label-caps text-label-caps text-secondary uppercase">Email</label>
<input className="w-full px-4 py-2.5 bg-surface-bright border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-md" placeholder="owner@business.com" required type="email"/>
</div>
<div className="flex flex-col gap-1.5">
<label className="font-label-caps text-label-caps text-secondary uppercase">Password</label>
<div className="relative flex">
<input className="w-full pl-4 pr-12 py-2.5 bg-surface-bright border border-outline-variant rounded-l-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all font-mono-data" id="password-field" placeholder="••••••••" required type="password"/>
<button className="px-3 border-y border-r border-outline-variant bg-surface-container-high rounded-r-lg hover:bg-primary-container hover:text-on-primary-container transition-colors" onClick={() => {}} title="Generate secure password" type="button">
<span className="material-symbols-outlined text-[18px]">key</span>
</button>
</div>
</div>
</div>
</div>
</div>
{/* Section: Contact Details */}
<div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
<div>
<h3 className="font-h1 text-body-md text-on-surface mb-1">Contact &amp; Location</h3>
<p className="text-secondary text-body-sm">Geographical and telecommunication data for physical operations.</p>
</div>
<div className="md:col-span-2 space-y-6">
<div className="flex flex-col gap-1.5">
<label className="font-label-caps text-label-caps text-secondary uppercase">Phone Number</label>
<div className="flex">
<span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-outline-variant bg-surface-container-high text-secondary text-body-sm">+1</span>
<input className="flex-1 px-4 py-2.5 bg-surface-bright border border-outline-variant rounded-r-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-md" placeholder="555-0123" required type="tel"/>
</div>
</div>
<div className="flex flex-col gap-1.5">
<label className="font-label-caps text-label-caps text-secondary uppercase">Address</label>
<textarea className="w-full px-4 py-2.5 bg-surface-bright border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-md resize-none" placeholder="Full commercial street address, Suite/Unit, City, State, Zip" required rows={3}></textarea>
</div>
</div>
</div>
{/* Actions */}
<div className="p-8 bg-surface-container-low/50 flex items-center justify-end gap-4">
<button className="px-6 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-secondary font-h1 text-body-md hover:bg-surface-container-high transition-all active:scale-95" type="reset">
                            Reset
                        </button>
<button className="px-8 py-2.5 rounded-lg bg-primary text-on-primary font-h1 text-body-md hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 flex items-center gap-2" onClick={() => {}} type="button">
<span>Create Shop</span>
<span className="material-symbols-outlined text-[18px]">chevron_right</span>
</button>
</div>
</form>
</div>
{/* Visual Context Card */}
<div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
<div className="p-6 bg-primary-container/10 border border-primary/20 rounded-xl">
<div className="flex items-center gap-4 mb-4">
<span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
<h4 className="font-h1 text-body-md text-on-primary-fixed-variant">System Security Notice</h4>
</div>
<p className="text-on-primary-fixed-variant text-body-sm leading-relaxed opacity-90">
                        New shops undergo an automated GST verification and security audit. Credentials generated here will be emailed to the owner immediately upon creation.
                    </p>
</div>
<div className="relative group h-40 overflow-hidden rounded-xl border border-outline-variant">
<img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" data-alt="A high-contrast, professional aerial view of a massive, organized logistics warehouse with geometric rows of shelving and bright skylights. The atmosphere is clean, industrious, and high-tech, featuring a palette of cool grays, whites, and corporate blues. This symbolizes the scale and efficiency of the SCS wholesale network." src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7L7rDRElYayKcLPunPmnny8kcbPWpKCSP6BYoS6eBBHJqbcfaYzng5Sl6fg1xOxVHOaMsug0e2wBmxy6-vGilhlFwuuLlCL3NVTzMvSKDORyk46OEaS18TnxWXQ-h08Z8MTglKmGKSeIeVWr6tDjEEApoYJwTIMF0c1fQ2yfuOvPKtq-7ZQ7tODzwv7PsI7gZ-c9xRZcxdg2jONb0LAcrjJA2vAKAmJNwryxGwZn5OwTkbF36kNrhNKkrupIVLND0a4kZQ2euTu4"/>
<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
<p className="text-white text-label-caps uppercase tracking-widest font-semibold">Scale Your Enterprise</p>
</div>
</div>
</div>
</main>
</div>

    </div>
  );
}
