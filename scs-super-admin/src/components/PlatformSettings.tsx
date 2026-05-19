"use client";
import React from 'react';
import Link from 'next/link';

export default function PlatformSettings() {
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
      
<div className="flex min-h-screen">
{/* SideNavBar */}
<aside className="w-sidebar-width h-screen sticky top-0 left-0 bg-surface-container-low dark:bg-surface-container-lowest border-r border-outline-variant dark:border-outline flex flex-col py-6 transition-all duration-300">
<div className="px-6 mb-8">
<h1 className="font-h1 text-h1 text-primary dark:text-primary-fixed-dim">SCS Admin</h1>
<p className="text-[12px] text-secondary opacity-70">Super Admin Panel</p>
</div>
<nav className="flex-1 space-y-1">
{/* Dashboard */}
<Link className="flex items-center px-6 py-3 text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors duration-150 ease-in-out" href="/">
<span className="material-symbols-outlined mr-3" data-icon="dashboard">dashboard</span>
<span className="font-body-md">Dashboard</span>
</Link>
{/* Tenants / Shops */}
<Link className="flex items-center px-6 py-3 text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors duration-150 ease-in-out" href="/tenants">
<span className="material-symbols-outlined mr-3" data-icon="storefront">storefront</span>
<span className="font-body-md">Tenants / Shops</span>
</Link>
{/* Create Shop */}
<Link className="flex items-center px-6 py-3 text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors duration-150 ease-in-out" href="/onboard">
<span className="material-symbols-outlined mr-3" data-icon="add_business">add_business</span>
<span className="font-body-md">Create Shop</span>
</Link>
{/* Active Users */}
<Link className="flex items-center px-6 py-3 text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors duration-150 ease-in-out" href="/users">
<span className="material-symbols-outlined mr-3" data-icon="group">group</span>
<span className="font-body-md">Active Users</span>
</Link>
{/* SaaS Reports */}
<Link className="flex items-center px-6 py-3 text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors duration-150 ease-in-out" href="/reports">
<span className="material-symbols-outlined mr-3" data-icon="analytics">analytics</span>
<span className="font-body-md">SaaS Reports</span>
</Link>
{/* System Settings (Active) */}
<Link className="flex items-center px-6 py-3 bg-secondary-container dark:bg-on-primary-fixed-variant text-on-secondary-container dark:text-on-primary-container border-l-4 border-primary transition-colors duration-150 ease-in-out" href="/settings">
<span className="material-symbols-outlined mr-3" data-icon="settings">settings</span>
<span className="font-body-md">System Settings</span>
</Link>
</nav>
<div className="px-6 pt-4 border-t border-outline-variant">
<Link className="flex items-center py-3 text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high transition-colors duration-150 ease-in-out" href="/">
<span className="material-symbols-outlined mr-3" data-icon="logout">logout</span>
<span className="font-body-md">Logout</span>
</Link>
</div>
</aside>
{/* Main Content Area */}
<main className="flex-1 flex flex-col min-w-0 bg-surface-bright">
{/* TopAppBar */}
<header className="h-header-height w-full sticky top-0 z-50 bg-surface-container-lowest dark:bg-surface-dim border-b border-outline-variant dark:border-outline shadow-sm dark:shadow-none flex items-center justify-between px-container-padding">
<div className="flex items-center gap-4 flex-1">
<div className="relative w-full max-w-md group">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" data-icon="search">search</span>
<input className="w-full bg-surface-container-low border-none rounded-lg pl-10 pr-4 py-2 text-body-md focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" placeholder="Search settings (Cmd+K)" type="text"/>
</div>
</div>
<div className="flex items-center gap-6">
<button className="text-secondary hover:text-primary transition-colors focus:ring-2 ring-primary ring-offset-2 rounded-full p-1">
<span className="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
<button className="text-secondary hover:text-primary transition-colors focus:ring-2 ring-primary ring-offset-2 rounded-full p-1">
<span className="material-symbols-outlined" data-icon="account_tree">account_tree</span>
</button>
<div className="h-8 w-8 rounded-full bg-primary-fixed overflow-hidden border border-outline-variant">
<img alt="SCS Admin Profile" className="w-full h-full object-cover" data-alt="Professional headshot of a corporate executive in a sharp navy suit, looking directly at the camera with a confident and approachable expression. The background is a blurred high-end office interior with clean lines and soft, neutral lighting, matching the minimalist and high-efficiency brand identity of the SCS Platform." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbjTZrZssfpLltJB06FbfMSPcZathMXcbqTxIxfzQGQ_jN7qRisHH69Aht5zVF5--reG5xb4czV8FvGDm2wO6Xx1o4ZyM3qjtyjeUM7kv5ndhYETs1ARKEdVLBKELvDJnMGWN5mI1r2jnOcuvVjIxndscYkwwR0g30AAhsmYGDCfxuRsrCixiKlKVV9RDzPHeHTqIIVnirr7L9WJimztRu6Zp9TIRZw1pr3psQ26WU6ARBy6kEANmVwXkhjmIIxK5HRVbyFD8NPOU"/>
</div>
</div>
</header>
{/* Content Canvas */}
<div className="p-container-padding max-w-7xl mx-auto w-full">
{/* Page Header */}
<div className="mb-8">
<h2 className="font-display-sm text-display-sm text-on-surface mb-2">System Settings</h2>
<p className="text-body-md text-secondary">Configure the core parameters of the SCS Platform infrastructure.</p>
</div>
<div className="settings-grid">
{/* Platform Branding Card */}
<section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
<div className="flex items-center gap-3 mb-6">
<span className="material-symbols-outlined text-primary" data-icon="palette">palette</span>
<h3 className="font-h1 text-h1">Platform Branding</h3>
</div>
<div className="space-y-6">
<div>
<label className="block text-label-caps font-label-caps text-outline mb-2">PLATFORM LOGO</label>
<div className="flex items-center gap-4">
<div className="w-20 h-20 rounded-lg border-2 border-dashed border-outline-variant flex items-center justify-center bg-surface-container-low">
<span className="material-symbols-outlined text-outline" data-icon="upload">upload</span>
</div>
<div className="flex-1">
<p className="text-body-sm text-on-surface-variant mb-2">Upload a high-resolution logo (PNG/SVG, max 2MB).</p>
<button className="text-primary font-bold text-body-sm hover:underline">Change Logo</button>
</div>
</div>
</div>
<div>
<label className="block text-label-caps font-label-caps text-outline mb-2 uppercase">BRAND NAME</label>
<input className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-body-md focus:ring-2 focus:ring-primary focus:border-primary" type="text" value="SCS"/>
</div>
<div>
<label className="block text-label-caps font-label-caps text-outline mb-2 uppercase">FAVICON URL</label>
<input className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-body-md focus:ring-2 focus:ring-primary" placeholder="https://cdn.scs.com/favicon.ico" type="text"/>
</div>
</div>
</section>
{/* Maintenance Mode Card */}
<section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
<div className="flex items-center justify-between mb-6">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-error" data-icon="engineering">engineering</span>
<h3 className="font-h1 text-h1">Maintenance Mode</h3>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input className="sr-only peer toggle-switch" type="checkbox"/>
<div className="w-11 h-6 bg-surface-container-highest rounded-full peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
</label>
</div>
<div className="space-y-4">
<p className="text-body-sm text-on-surface-variant">When enabled, the platform will be inaccessible to all users except Super Admins. A maintenance page will be displayed globally.</p>
<div className="bg-error-container/30 border border-error/20 p-4 rounded-lg">
<label className="block text-label-caps font-label-caps text-on-error-container mb-2">CUSTOM MAINTENANCE MESSAGE</label>
<textarea className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2 text-body-md focus:ring-2 focus:ring-error focus:border-error" placeholder="SCS is currently undergoing scheduled maintenance. We'll be back online at 04:00 UTC." rows={3}></textarea>
</div>
</div>
</section>
{/* Support Email Config Card */}
<section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
<div className="flex items-center gap-3 mb-6">
<span className="material-symbols-outlined text-primary" data-icon="mail">mail</span>
<h3 className="font-h1 text-h1">Communication</h3>
</div>
<div className="space-y-6">
<div>
<label className="block text-label-caps font-label-caps text-outline mb-2 uppercase">SYSTEM SENDER NAME</label>
<input className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-body-md focus:ring-2 focus:ring-primary" type="text" value="SCS Platform Notifications"/>
</div>
<div>
<label className="block text-label-caps font-label-caps text-outline mb-2 uppercase">SUPPORT CONTACT EMAIL</label>
<input className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-body-md focus:ring-2 focus:ring-primary" type="email" value="support@scs-platform.com"/>
</div>
<div className="flex items-center gap-2 text-body-sm text-secondary">
<span className="material-symbols-outlined text-[18px]" data-icon="verified_user">verified_user</span>
<span>SMTP Gateway: AWS SES (Active)</span>
</div>
</div>
</section>
{/* Global Invoice Settings Card */}
<section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
<div className="flex items-center gap-3 mb-6">
<span className="material-symbols-outlined text-primary" data-icon="receipt_long">receipt_long</span>
<h3 className="font-h1 text-h1">Global Invoice Settings</h3>
</div>
<div className="grid grid-cols-2 gap-4 mb-6">
<div>
<label className="block text-label-caps font-label-caps text-outline mb-2 uppercase">INVOICE PREFIX</label>
<input className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-mono-data focus:ring-2 focus:ring-primary" type="text" value="SCS-"/>
</div>
<div>
<label className="block text-label-caps font-label-caps text-outline mb-2 uppercase">NEXT NUMBER</label>
<input className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-mono-data focus:ring-2 focus:ring-primary" type="text" value="004512"/>
</div>
</div>
<div className="space-y-4">
<div className="flex items-center justify-between py-2 border-b border-outline-variant">
<div>
<p className="font-medium text-on-surface">Standard VAT Rate</p>
<p className="text-body-sm text-secondary">Applied to all new shop creation fees.</p>
</div>
<div className="flex items-center gap-2">
<input className="w-16 text-right bg-surface-container-low border-none rounded-lg px-2 py-1 text-mono-data" type="text" value="20"/>
<span className="text-secondary">%</span>
</div>
</div>
<div className="flex items-center justify-between py-2">
<div>
<p className="font-medium text-on-surface">Auto-Generate PDF</p>
<p className="text-body-sm text-secondary">Send invoice on subscription renewal.</p>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input defaultChecked className="sr-only peer toggle-switch" type="checkbox"/>
<div className="w-11 h-6 bg-surface-container-highest rounded-full peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
</label>
</div>
</div>
</section>
</div>
{/* Floating Footer Save Bar */}
<div className="fixed bottom-8 right-8 z-50 flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
<button className="bg-surface-container-lowest border border-outline-variant text-on-surface px-6 py-3 rounded-full font-bold shadow-lg hover:bg-surface-container-low transition-all active:scale-[0.98]">
                        Discard Changes
                    </button>
<button className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-[0.98] flex items-center gap-2">
<span className="material-symbols-outlined" data-icon="save">save</span>
                        Save Configuration
                    </button>
</div>
</div>
</main>
</div>
{/* Micro-interaction Scripts */}

    </div>
  );
}
