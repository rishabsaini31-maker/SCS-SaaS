"use client";
import React from 'react';
import Link from 'next/link';

export default function SuperAdminDashboard() {
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
<aside className="bg-surface-container-low dark:bg-surface-container-lowest w-sidebar-width h-screen sticky top-0 left-0 border-r border-outline-variant dark:border-outline flex flex-col h-full py-6 shrink-0 z-40">
<div className="px-6 mb-8">
<h1 className="font-h1 text-h1 text-primary dark:text-primary-fixed-dim">SCS Admin</h1>
<p className="text-secondary text-[11px] font-medium tracking-wider">Super Admin Panel</p>
</div>
<nav className="flex-1 space-y-1 px-3">
{/* Active State: Dashboard */}
<Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary-container dark:bg-on-primary-fixed-variant text-on-secondary-container dark:text-on-primary-container border-l-4 border-primary transition-colors duration-150 active:scale-[0.98]" href="/">
<span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span className="font-body-md">Dashboard</span>
</Link>
<Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors duration-150" href="/tenants">
<span className="material-symbols-outlined" data-icon="storefront">storefront</span>
<span className="font-body-md">Tenants / Shops</span>
</Link>
<Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors duration-150" href="/onboard">
<span className="material-symbols-outlined" data-icon="add_business">add_business</span>
<span className="font-body-md">Create Shop</span>
</Link>
<Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors duration-150" href="/users">
<span className="material-symbols-outlined" data-icon="group">group</span>
<span className="font-body-md">Active Users</span>
</Link>
<Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors duration-150" href="/reports">
<span className="material-symbols-outlined" data-icon="analytics">analytics</span>
<span className="font-body-md">SaaS Reports</span>
</Link>
<Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-container-highest transition-colors duration-150" href="/settings">
<span className="material-symbols-outlined" data-icon="settings">settings</span>
<span className="font-body-md">System Settings</span>
</Link>
</nav>
<div className="px-3 mt-auto border-t border-outline-variant pt-4">
<button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-error hover:bg-error-container/20 transition-colors duration-150">
<span className="material-symbols-outlined" data-icon="logout">logout</span>
<span className="font-body-md">Logout</span>
</button>
</div>
</aside>
<main className="flex-1 flex flex-col min-w-0">
{/* TopAppBar (Shared Component) */}
<header className="bg-surface-container-lowest dark:bg-surface-dim h-header-height w-full sticky top-0 z-50 border-b border-outline-variant dark:border-outline shadow-sm dark:shadow-none flex items-center justify-between px-container-padding shrink-0">
<div className="flex items-center gap-4 flex-1">
<div className="relative w-full max-w-md">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" data-icon="search">search</span>
<input className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-body-sm focus:ring-2 focus:ring-primary" placeholder="Search analytics, tenants, or logs..." type="text"/>
<span className="absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[10px] font-mono border border-outline-variant px-1 rounded">⌘K</span>
</div>
</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-4">
<button className="p-2 text-secondary hover:text-primary transition-colors focus:ring-2 focus:ring-primary ring-offset-2 rounded-full relative">
<span className="material-symbols-outlined" data-icon="notifications">notifications</span>
<span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border border-surface-container-lowest"></span>
</button>
<button className="p-2 text-secondary hover:text-primary transition-colors focus:ring-2 focus:ring-primary ring-offset-2 rounded-full">
<span className="material-symbols-outlined" data-icon="account_tree">account_tree</span>
</button>
</div>
<div className="h-8 w-[1px] bg-outline-variant"></div>
<div className="flex items-center gap-3">
<div className="text-right hidden sm:block">
<p className="font-label-caps text-label-caps text-on-surface">Alex Rivera</p>
<p className="text-[10px] text-secondary">Super Admin</p>
</div>
<img alt="SCS Admin Profile" className="w-10 h-10 rounded-full border border-outline-variant object-cover" data-alt="A professional close-up portrait of a corporate executive in a modern, light-filled office. The individual has a confident yet approachable expression. The lighting is soft and natural, emphasizing a high-end, professional aesthetic consistent with a premium SaaS administrative environment. The background is slightly blurred, showing a contemporary workspace with neutral tones." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjXK-Ip9QizUTR19EgDz4dQl5uzM0KOUtDdhy7rw-q7MbhgXZNj-gLPW2N6of-lFXRkFtgocUSlmfAA3wZz2HtAqFKTbeVdI14zX1SRyu4OcrgNhXr9J5wMy-hXlCfxpR9xIXL2ziNM8qNMuNLNeX6b63YFybMPnHgK8pD5gfL_3rcf0WVAqMh8aY9EhvHjyINban2mIhVNYQEjHvPPb81djMVZkNsWIYwZWg_WdslGFTkrK4I_2az2kKdzThKu48O7aEMbOiFhBI"/>
</div>
</div>
</header>
{/* Content Canvas */}
<div className="p-container-padding overflow-y-auto">
<div className="flex flex-col gap-stack-gap">
{/* Page Header */}
<div className="flex items-end justify-between">
<div>
<h2 className="font-display-sm text-display-sm text-on-surface mb-1">Platform Overview</h2>
<p className="text-secondary font-body-md">Real-time performance and system health metrics.</p>
</div>
<div className="flex gap-3">
<button className="px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md text-on-surface-variant hover:bg-surface-container-high transition-colors flex items-center gap-2 shadow-sm">
<span className="material-symbols-outlined text-[18px]" data-icon="calendar_today">calendar_today</span>
                            Last 30 Days
                        </button>
<button className="px-4 py-2 bg-primary text-on-primary rounded-lg text-body-md font-medium hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2">
<span className="material-symbols-outlined text-[18px]" data-icon="download">download</span>
                            Export Data
                        </button>
</div>
</div>
{/* Stats Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
{/* Total Shops */}
<div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:shadow-sm transition-shadow">
<div className="flex items-center justify-between mb-4">
<div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
<span className="material-symbols-outlined" data-icon="storefront">storefront</span>
</div>
<span className="text-tertiary font-medium text-[12px] flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]" data-icon="trending_up">trending_up</span> +12%
                            </span>
</div>
<p className="text-secondary text-label-caps mb-1 uppercase tracking-wider">Total Shops</p>
<p className="font-display-sm text-display-sm text-on-surface">1,240</p>
</div>
{/* Active Shops */}
<div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:shadow-sm transition-shadow">
<div className="flex items-center justify-between mb-4">
<div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
<span className="material-symbols-outlined" data-icon="bolt">bolt</span>
</div>
<span className="text-green-700 font-medium text-[12px] flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]" data-icon="check_circle">check_circle</span> 95.1%
                            </span>
</div>
<p className="text-secondary text-label-caps mb-1 uppercase tracking-wider">Active Shops</p>
<p className="font-display-sm text-display-sm text-on-surface">1,180</p>
</div>
{/* Total Invoices */}
<div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:shadow-sm transition-shadow">
<div className="flex items-center justify-between mb-4">
<div className="w-10 h-10 rounded-lg bg-secondary-container text-primary flex items-center justify-center">
<span className="material-symbols-outlined" data-icon="receipt_long">receipt_long</span>
</div>
<span className="text-primary font-medium text-[12px] flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]" data-icon="trending_up">trending_up</span> +5.4k
                            </span>
</div>
<p className="text-secondary text-label-caps mb-1 uppercase tracking-wider">Total Invoices</p>
<p className="font-display-sm text-display-sm text-on-surface">45.2k</p>
</div>
{/* Total Products */}
<div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:shadow-sm transition-shadow">
<div className="flex items-center justify-between mb-4">
<div className="w-10 h-10 rounded-lg bg-tertiary-fixed text-tertiary-container flex items-center justify-center">
<span className="material-symbols-outlined" data-icon="inventory_2">inventory_2</span>
</div>
<span className="text-secondary font-medium text-[12px]">Avg 103/shop</span>
</div>
<p className="text-secondary text-label-caps mb-1 uppercase tracking-wider">Total Products</p>
<p className="font-display-sm text-display-sm text-on-surface">128k</p>
</div>
</div>
{/* Main Grid: Charts and Lists */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
{/* Growth Chart (2/3 width) */}
<div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col h-[400px]">
<div className="flex items-center justify-between mb-8">
<div>
<h3 className="font-h1 text-on-surface">Monthly Growth</h3>
<p className="text-body-sm text-secondary">Aggregate tenant acquisition performance.</p>
</div>
<div className="flex items-center gap-4">
<div className="flex items-center gap-2">
<span className="w-3 h-3 rounded-full bg-primary"></span>
<span className="text-[12px] text-secondary">New Shops</span>
</div>
</div>
</div>
<div className="flex-1 relative mt-4">
{/* Visual placeholder for a line chart */}
<div className="absolute inset-0 flex items-end justify-between px-2">
<div className="w-full h-full flex items-end gap-1">
{/* Simple SVG Chart Representation */}
<svg className="w-full h-full preserve-3d" preserveAspectRatio="none" viewBox="0 0 1000 300">
<defs>
<linearGradient id="line-grad" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stopColor="#004ac6" stopOpacity="0.2" />
<stop offset="100%" stopColor="#004ac6" stopOpacity="0" />
</linearGradient>
</defs>
<path d="M0,250 Q100,240 200,200 T400,150 T600,120 T800,80 T1000,50 L1000,300 L0,300 Z" fill="url(#line-grad)" />
<path d="M0,250 Q100,240 200,200 T400,150 T600,120 T800,80 T1000,50" fill="none" stroke="#004ac6" strokeLinecap="round" strokeWidth="3" />
{/* Points */}
<circle cx="200" cy="200" fill="white" r="4" stroke="#004ac6" strokeWidth="2" />
<circle cx="400" cy="150" fill="white" r="4" stroke="#004ac6" strokeWidth="2" />
<circle cx="600" cy="120" fill="white" r="4" stroke="#004ac6" strokeWidth="2" />
<circle cx="800" cy="80" fill="white" r="4" stroke="#004ac6" strokeWidth="2" />
</svg>
</div>
</div>
{/* Grid lines */}
<div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
<div className="border-t border-outline"></div>
<div className="border-t border-outline"></div>
<div className="border-t border-outline"></div>
<div className="border-t border-outline"></div>
<div className="border-t border-outline"></div>
</div>
</div>
<div className="flex justify-between mt-4 text-label-caps text-secondary uppercase tracking-widest px-2">
<span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
</div>
</div>
{/* Shop Status Distribution */}
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col h-[400px]">
<h3 className="font-h1 text-on-surface mb-1">Shop Status</h3>
<p className="text-body-sm text-secondary mb-8">System-wide health distribution.</p>
<div className="flex-1 flex flex-col items-center justify-center relative">
{/* Visual placeholder for a donut chart */}
<div className="w-48 h-48 rounded-full border-[16px] border-surface-container relative flex items-center justify-center">
<div className="absolute inset-[-16px] rounded-full border-[16px] border-primary" style={{clipPath: "polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 40%)"}}></div>
<div className="absolute inset-[-16px] rounded-full border-[16px] border-tertiary" style={{clipPath: "polygon(50% 50%, 0 40%, 0 0, 50% 0)"}}></div>
<div className="text-center">
<p className="font-display-sm text-display-sm text-on-surface">1,240</p>
<p className="text-[10px] text-secondary uppercase tracking-widest">Total</p>
</div>
</div>
</div>
<div className="space-y-3 mt-4">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
<span className="text-body-sm text-on-surface">Active / Online</span>
</div>
<span className="font-mono-data text-mono-data text-secondary">95%</span>
</div>
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
<span className="text-body-sm text-on-surface">Inactive / Pending</span>
</div>
<span className="font-mono-data text-mono-data text-secondary">4%</span>
</div>
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-error"></span>
<span className="text-body-sm text-on-surface">Suspended</span>
</div>
<span className="font-mono-data text-mono-data text-secondary">1%</span>
</div>
</div>
</div>
</div>
{/* Lower Section: Recent Activity and Secondary Stats */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
{/* Recently Added Shops */}
<div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
<div className="flex items-center justify-between mb-6">
<h3 className="font-h1 text-on-surface">Recently Added Shops</h3>
<button className="text-primary font-medium text-body-sm hover:underline">View All Tenants</button>
</div>
<div className="overflow-hidden">
<table className="w-full">
<thead>
<tr className="border-b border-outline-variant">
<th className="text-left py-3 text-label-caps text-secondary font-semibold uppercase">Shop Name</th>
<th className="text-left py-3 text-label-caps text-secondary font-semibold uppercase">Plan Type</th>
<th className="text-left py-3 text-label-caps text-secondary font-semibold uppercase">Added Date</th>
<th className="text-left py-3 text-label-caps text-secondary font-semibold uppercase">Status</th>
<th className="text-right py-3 text-label-caps text-secondary font-semibold uppercase">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant">
<tr className="hover:bg-surface-container-low transition-colors group">
<td className="py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-primary-fixed flex items-center justify-center text-primary font-bold text-[12px]">VL</div>
<div>
<p className="font-medium text-on-surface text-body-md">Velvet Lane Boutique</p>
<p className="text-[11px] text-secondary">ID: SHOP-40291</p>
</div>
</div>
</td>
<td className="py-4 text-body-sm text-on-surface">Enterprise</td>
<td className="py-4 text-mono-data text-secondary">Oct 12, 2023</td>
<td className="py-4">
<span className="px-2 py-1 bg-green-100 text-green-700 text-[11px] font-bold rounded-full uppercase">Live</span>
</td>
<td className="py-4 text-right">
<button className="p-1 text-secondary hover:text-primary transition-colors">
<span className="material-symbols-outlined" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors group">
<td className="py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed-variant font-bold text-[12px]">AW</div>
<div>
<p className="font-medium text-on-surface text-body-md">Alpine Watch Co.</p>
<p className="text-[11px] text-secondary">ID: SHOP-40288</p>
</div>
</div>
</td>
<td className="py-4 text-body-sm text-on-surface">Professional</td>
<td className="py-4 text-mono-data text-secondary">Oct 11, 2023</td>
<td className="py-4">
<span className="px-2 py-1 bg-blue-100 text-blue-700 text-[11px] font-bold rounded-full uppercase">Live</span>
</td>
<td className="py-4 text-right">
<button className="p-1 text-secondary hover:text-primary transition-colors">
<span className="material-symbols-outlined" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors group">
<td className="py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-surface-variant flex items-center justify-center text-on-surface-variant font-bold text-[12px]">GM</div>
<div>
<p className="font-medium text-on-surface text-body-md">Green Mountain Gear</p>
<p className="text-[11px] text-secondary">ID: SHOP-40285</p>
</div>
</div>
</td>
<td className="py-4 text-body-sm text-on-surface">Starter</td>
<td className="py-4 text-mono-data text-secondary">Oct 10, 2023</td>
<td className="py-4">
<span className="px-2 py-1 bg-surface-container-highest text-secondary text-[11px] font-bold rounded-full uppercase">Draft</span>
</td>
<td className="py-4 text-right">
<button className="p-1 text-secondary hover:text-primary transition-colors">
<span className="material-symbols-outlined" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors group">
<td className="py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-tertiary-fixed flex items-center justify-center text-tertiary font-bold text-[12px]">NS</div>
<div>
<p className="font-medium text-on-surface text-body-md">Nova Skincare</p>
<p className="text-[11px] text-secondary">ID: SHOP-40282</p>
</div>
</div>
</td>
<td className="py-4 text-body-sm text-on-surface">Professional</td>
<td className="py-4 text-mono-data text-secondary">Oct 10, 2023</td>
<td className="py-4">
<span className="px-2 py-1 bg-green-100 text-green-700 text-[11px] font-bold rounded-full uppercase">Live</span>
</td>
<td className="py-4 text-right">
<button className="p-1 text-secondary hover:text-primary transition-colors">
<span className="material-symbols-outlined" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors group">
<td className="py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-primary-container/20 flex items-center justify-center text-primary font-bold text-[12px]">TK</div>
<div>
<p className="font-medium text-on-surface text-body-md">Tech Kitchen</p>
<p className="text-[11px] text-secondary">ID: SHOP-40279</p>
</div>
</div>
</td>
<td className="py-4 text-body-sm text-on-surface">Enterprise</td>
<td className="py-4 text-mono-data text-secondary">Oct 09, 2023</td>
<td className="py-4">
<span className="px-2 py-1 bg-green-100 text-green-700 text-[11px] font-bold rounded-full uppercase">Live</span>
</td>
<td className="py-4 text-right">
<button className="p-1 text-secondary hover:text-primary transition-colors">
<span className="material-symbols-outlined" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
</div>
{/* Side Stats / Info */}
<div className="space-y-6">
{/* Revenue Entries */}
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
<h3 className="font-h1 text-on-surface mb-4">Revenue Health</h3>
<div className="space-y-4">
<div>
<div className="flex justify-between text-body-sm mb-1">
<span className="text-secondary">Gross Volume (MTD)</span>
<span className="text-on-surface font-semibold">$1.2M</span>
</div>
<div className="w-full bg-surface-container rounded-full h-1.5">
<div className="bg-primary h-1.5 rounded-full" style={{width: "72%"}}></div>
</div>
</div>
<div>
<div className="flex justify-between text-body-sm mb-1">
<span className="text-secondary">SaaS Subscription (MTD)</span>
<span className="text-on-surface font-semibold">$458k</span>
</div>
<div className="w-full bg-surface-container rounded-full h-1.5">
<div className="bg-tertiary h-1.5 rounded-full" style={{width: "48%"}}></div>
</div>
</div>
</div>
<div className="mt-6 pt-6 border-t border-outline-variant flex items-center justify-between">
<div>
<p className="text-[10px] text-secondary uppercase tracking-wider">Net Growth</p>
<p className="text-display-sm text-on-surface">+18.2%</p>
</div>
<span className="material-symbols-outlined text-green-600 text-4xl" data-icon="stacked_line_chart">stacked_line_chart</span>
</div>
</div>
{/* Platform Usage */}
<div className="bg-primary dark:bg-on-primary-fixed-variant rounded-xl p-6 text-on-primary shadow-lg relative overflow-hidden group">
<div className="relative z-10">
<h3 className="font-h1 mb-2">Platform Power</h3>
<p className="text-primary-fixed text-body-sm mb-6 opacity-90">Systems are running optimally across all 14 nodes.</p>
<div className="flex items-center gap-4 mb-4">
<div className="p-2 bg-white/20 rounded-lg">
<span className="material-symbols-outlined" data-icon="memory">memory</span>
</div>
<div>
<p className="text-white text-display-sm">99.98%</p>
<p className="text-primary-fixed text-[10px] uppercase">System Uptime</p>
</div>
</div>
<button className="w-full py-2 bg-white text-primary rounded-lg font-medium text-body-sm hover:bg-primary-fixed transition-colors">
                                    View Service Status
                                </button>
</div>
{/* Subtle background pattern */}
<div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
<span className="material-symbols-outlined text-[120px]" data-icon="hub">hub</span>
</div>
</div>
</div>
</div>
</div>
</div>
</main>

    </div>
  );
}
