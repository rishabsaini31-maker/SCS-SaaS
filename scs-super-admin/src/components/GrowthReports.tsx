"use client";
import React from 'react';
import Link from 'next/link';

export default function GrowthReports() {
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
<aside className="w-sidebar-width h-screen sticky top-0 left-0 bg-surface-container-low border-r border-outline-variant flex flex-col py-6 shrink-0 z-50">
<div className="px-6 mb-8">
<div className="flex items-center gap-3">
<div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
<span className="material-symbols-outlined text-on-primary text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>account_tree</span>
</div>
<div>
<h1 className="font-h1 text-h1 text-primary">SCS Admin</h1>
<p className="font-label-caps text-label-caps text-secondary opacity-70">Super Admin Panel</p>
</div>
</div>
</div>
<nav className="flex-1 px-3 space-y-1">
<Link className="flex items-center gap-3 px-3 py-2 text-secondary hover:bg-surface-container-high transition-colors duration-150 ease-in-out rounded-lg font-body-md" href="/">
<span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span>Dashboard</span>
</Link>
<Link className="flex items-center gap-3 px-3 py-2 text-secondary hover:bg-surface-container-high transition-colors duration-150 ease-in-out rounded-lg font-body-md" href="/tenants">
<span className="material-symbols-outlined" data-icon="storefront">storefront</span>
<span>Tenants / Shops</span>
</Link>
<Link className="flex items-center gap-3 px-3 py-2 text-secondary hover:bg-surface-container-high transition-colors duration-150 ease-in-out rounded-lg font-body-md" href="/onboard">
<span className="material-symbols-outlined" data-icon="add_business">add_business</span>
<span>Create Shop</span>
</Link>
<Link className="flex items-center gap-3 px-3 py-2 text-secondary hover:bg-surface-container-high transition-colors duration-150 ease-in-out rounded-lg font-body-md" href="/users">
<span className="material-symbols-outlined" data-icon="group">group</span>
<span>Active Users</span>
</Link>
{/* SaaS Reports (Active) */}
<Link className="flex items-center gap-3 px-3 py-2 bg-secondary-container text-on-secondary-container border-l-4 border-primary transition-colors duration-150 ease-in-out font-body-md" href="/reports">
<span className="material-symbols-outlined" data-icon="analytics" style={{fontVariationSettings: "'FILL' 1"}}>analytics</span>
<span className="font-bold">SaaS Reports</span>
</Link>
<Link className="flex items-center gap-3 px-3 py-2 text-secondary hover:bg-surface-container-high transition-colors duration-150 ease-in-out rounded-lg font-body-md" href="/settings">
<span className="material-symbols-outlined" data-icon="settings">settings</span>
<span>System Settings</span>
</Link>
</nav>
<div className="mt-auto px-3">
<Link className="flex items-center gap-3 px-3 py-2 text-secondary hover:bg-surface-container-high transition-colors duration-150 ease-in-out rounded-lg font-body-md" href="/">
<span className="material-symbols-outlined" data-icon="logout">logout</span>
<span>Logout</span>
</Link>
</div>
</aside>
<div className="flex-1 flex flex-col min-w-0">
{/* TopAppBar */}
<header className="h-header-height w-full sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant shadow-sm flex items-center justify-between px-container-padding">
<div className="flex items-center gap-8 flex-1 max-w-xl">
<div className="relative w-full">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
<input className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-all" placeholder="Search platform analytics (Cmd+K)" type="text"/>
</div>
</div>
<div className="flex items-center gap-4 ml-6">
<button className="w-10 h-10 flex items-center justify-center text-secondary hover:text-primary transition-colors focus:ring-2 focus:ring-primary ring-offset-2 rounded-full">
<span className="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
<button className="w-10 h-10 flex items-center justify-center text-secondary hover:text-primary transition-colors focus:ring-2 focus:ring-primary ring-offset-2 rounded-full">
<span className="material-symbols-outlined" data-icon="account_tree">account_tree</span>
</button>
<div className="h-8 w-px bg-outline-variant mx-2"></div>
<div className="flex items-center gap-3 cursor-pointer group">
<img alt="Admin Profile" className="w-8 h-8 rounded-full object-cover border-2 border-transparent group-hover:border-primary transition-all" data-alt="A professional headshot of a senior technology executive in a well-lit modern office environment. He is wearing a crisp white shirt and a tailored navy blazer, looking directly at the camera with a confident and calm expression. The background is softly blurred, showing clean lines and neutral tones characteristic of high-end corporate architecture. The lighting is soft and natural, emphasizing clarity and professionalism." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAO4pWuY6YzavgT6U0yrKe7qLh16nxUGAZEQpeFJCErGHowZaxZvhuRQwRVTwDOlxPEDsaMuSqWEmC6h1zF-I1n6RotK12Vo5sjRewo9BoOs2vMnJipLI5voHSFKaxUALfDWxixP6UuuBVHa3QzXYvPdLrVfyw9CdRp2AzOCd5eflvNjEOKkGNBk8xOfA-ug_u1ziv2Hookzm7Bvd6L-p_ws-7DpDe4U0TXu91z1NuBAh5R5RuGJOCjkIkqrxIJ06VMOUskJURA-cQ"/>
<div className="hidden lg:block text-right">
<p className="font-body-md font-bold leading-none">Alex Sterling</p>
<p className="font-label-caps text-label-caps text-secondary opacity-70 uppercase tracking-tighter">Platform Owner</p>
</div>
</div>
</div>
</header>
{/* Main Content */}
<main className="flex-1 p-container-padding overflow-y-auto">
<div className="max-w-[1400px] mx-auto">
{/* Header Section */}
<div className="flex items-end justify-between mb-8">
<div>
<h2 className="font-display-sm text-display-sm mb-1">SaaS Intelligence</h2>
<p className="text-secondary font-body-md">Real-time performance metrics and ecosystem health monitoring.</p>
</div>
<div className="flex gap-3">
<button className="px-4 py-2 bg-surface-container-lowest border border-outline-variant text-body-md rounded-lg hover:bg-surface-container-high transition-all flex items-center gap-2">
<span className="material-symbols-outlined text-[18px]">calendar_month</span>
                                Last 30 Days
                            </button>
<button className="px-4 py-2 bg-primary text-on-primary text-body-md font-bold rounded-lg hover:bg-primary-container transition-all flex items-center gap-2">
<span className="material-symbols-outlined text-[18px]">download</span>
                                Export Report
                            </button>
</div>
</div>
{/* Bento Grid Dashboard */}
<div className="grid grid-cols-12 gap-6">
{/* Summary Cards */}
<div className="col-span-12 lg:col-span-3 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant flex flex-col justify-between hover:shadow-sm transition-shadow">
<div>
<div className="flex items-center justify-between mb-4">
<div className="w-10 h-10 bg-primary-fixed rounded-lg flex items-center justify-center text-primary">
<span className="material-symbols-outlined">storefront</span>
</div>
<span className="px-2 py-1 bg-green-50 text-green-700 text-[11px] font-bold rounded flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">trending_up</span> 12%
                                    </span>
</div>
<h3 className="text-secondary font-label-caps uppercase tracking-wider mb-1">Total Shops Onboarded</h3>
<p className="text-[32px] font-bold font-h1">2,842</p>
</div>
<div className="mt-4 pt-4 border-t border-outline-variant">
<p className="text-body-sm text-secondary">+24 shops in last 24h</p>
</div>
</div>
<div className="col-span-12 lg:col-span-3 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant flex flex-col justify-between hover:shadow-sm transition-shadow">
<div>
<div className="flex items-center justify-between mb-4">
<div className="w-10 h-10 bg-tertiary-fixed rounded-lg flex items-center justify-center text-tertiary">
<span className="material-symbols-outlined">receipt_long</span>
</div>
<span className="px-2 py-1 bg-green-50 text-green-700 text-[11px] font-bold rounded flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">trending_up</span> 8.4%
                                    </span>
</div>
<h3 className="text-secondary font-label-caps uppercase tracking-wider mb-1">Total Transaction Volume</h3>
<p className="text-[32px] font-bold font-h1 leading-tight">$4.2M</p>
</div>
<div className="mt-4 pt-4 border-t border-outline-variant">
<p className="text-body-sm text-secondary">Avg. $1.4k per tenant</p>
</div>
</div>
{/* Monthly Growth Bar Chart */}
<div className="col-span-12 lg:col-span-6 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:shadow-sm transition-shadow">
<div className="flex items-center justify-between mb-8">
<h3 className="font-h1 text-h1">Monthly Growth</h3>
<div className="flex items-center gap-2">
<div className="flex items-center gap-1">
<span className="w-3 h-3 rounded-full bg-primary"></span>
<span className="text-body-sm text-secondary">New</span>
</div>
<div className="flex items-center gap-1">
<span className="w-3 h-3 rounded-full bg-primary-fixed"></span>
<span className="text-body-sm text-secondary">Retained</span>
</div>
</div>
</div>
<div className="flex items-end justify-between h-40 gap-2 px-2">
{/* Mock Bars */}
<div className="flex-1 flex flex-col justify-end items-center group cursor-help">
<div className="w-full bg-primary rounded-t-sm h-[40%]"></div>
<div className="w-full bg-primary-fixed h-[20%]"></div>
<span className="text-[10px] text-secondary mt-2">Jan</span>
</div>
<div className="flex-1 flex flex-col justify-end items-center group cursor-help">
<div className="w-full bg-primary rounded-t-sm h-[55%]"></div>
<div className="w-full bg-primary-fixed h-[25%]"></div>
<span className="text-[10px] text-secondary mt-2">Feb</span>
</div>
<div className="flex-1 flex flex-col justify-end items-center group cursor-help">
<div className="w-full bg-primary rounded-t-sm h-[45%]"></div>
<div className="w-full bg-primary-fixed h-[30%]"></div>
<span className="text-[10px] text-secondary mt-2">Mar</span>
</div>
<div className="flex-1 flex flex-col justify-end items-center group cursor-help">
<div className="w-full bg-primary rounded-t-sm h-[70%]"></div>
<div className="w-full bg-primary-fixed h-[25%]"></div>
<span className="text-[10px] text-secondary mt-2">Apr</span>
</div>
<div className="flex-1 flex flex-col justify-end items-center group cursor-help">
<div className="w-full bg-primary rounded-t-sm h-[60%]"></div>
<div className="w-full bg-primary-fixed h-[35%]"></div>
<span className="text-[10px] text-secondary mt-2">May</span>
</div>
<div className="flex-1 flex flex-col justify-end items-center group cursor-help">
<div className="w-full bg-primary rounded-t-sm h-[85%]"></div>
<div className="w-full bg-primary-fixed h-[25%]"></div>
<span className="text-[10px] text-secondary mt-2">Jun</span>
</div>
</div>
</div>
{/* Invoice Activity Heat Map */}
<div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:shadow-sm transition-shadow">
<div className="flex items-center justify-between mb-6">
<div>
<h3 className="font-h1 text-h1">Invoice Activity Heatmap</h3>
<p className="text-body-sm text-secondary">Processing load across last 14 days by hour</p>
</div>
<div className="flex items-center gap-1">
<span className="text-[10px] text-secondary uppercase">Low</span>
<div className="flex gap-1 px-2">
<div className="w-3 h-3 bg-surface-container-low rounded-sm"></div>
<div className="w-3 h-3 bg-primary-fixed-dim rounded-sm"></div>
<div className="w-3 h-3 bg-primary rounded-sm"></div>
<div className="w-3 h-3 bg-on-primary-fixed-variant rounded-sm"></div>
</div>
<span className="text-[10px] text-secondary uppercase">Peak</span>
</div>
</div>
<div className="grid grid-cols-14 gap-1.5 h-64">
{/* JavaScript will fill this with cells or we hardcode a subset */}
{/* Generating a visual grid representation */}

</div>
<div className="flex justify-between mt-3 text-[10px] text-secondary uppercase tracking-widest px-1">
<span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
<span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
</div>
</div>
{/* Active vs Inactive Tenants */}
<div className="col-span-12 lg:col-span-4 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:shadow-sm transition-shadow flex flex-col">
<h3 className="font-h1 text-h1 mb-6">Tenant Engagement</h3>
<div className="flex-1 flex flex-col items-center justify-center relative">
{/* Simple CSS Pie representation */}
<div className="w-48 h-48 rounded-full border-[16px] border-primary-fixed relative flex items-center justify-center">
<div className="absolute inset-[-16px] rounded-full border-[16px] border-primary border-r-transparent border-b-transparent rotate-45"></div>
<div className="text-center">
<p className="text-[32px] font-bold font-h1">78%</p>
<p className="text-label-caps text-secondary uppercase">Active</p>
</div>
</div>
<div className="mt-8 w-full space-y-4">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<div className="w-3 h-3 rounded-full bg-primary"></div>
<span className="text-body-md font-bold">Highly Active</span>
</div>
<span className="font-mono-data text-secondary">2,216</span>
</div>
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<div className="w-3 h-3 rounded-full bg-primary-fixed"></div>
<span className="text-body-md font-bold">Hibernating</span>
</div>
<span className="font-mono-data text-secondary">626</span>
</div>
</div>
</div>
</div>
{/* Product Usage Stats */}
<div className="col-span-12 bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
<div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex items-center justify-between">
<h3 className="font-h1 text-h1">Core Feature Adoption</h3>
<button className="text-primary font-bold text-body-sm flex items-center gap-1 hover:underline">
                                    Detailed Audit <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead>
<tr className="text-label-caps text-secondary uppercase border-b border-outline-variant">
<th className="px-6 py-4 font-semibold">Feature Module</th>
<th className="px-6 py-4 font-semibold text-center">Active Users</th>
<th className="px-6 py-4 font-semibold">Weekly Usage</th>
<th className="px-6 py-4 font-semibold">Growth</th>
<th className="px-6 py-4 font-semibold text-right">API Latency</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant">
<tr className="hover:bg-surface-container-lowest transition-colors h-table-row-height">
<td className="px-6 py-4 font-bold flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[20px]">inventory_2</span>
                                                Inventory Engine
                                            </td>
<td className="px-6 py-4 text-center font-mono-data">1,942</td>
<td className="px-6 py-4">
<div className="w-32 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
<div className="h-full bg-primary rounded-full w-[85%]"></div>
</div>
</td>
<td className="px-6 py-4">
<span className="text-green-600 font-bold text-body-sm">+14.2%</span>
</td>
<td className="px-6 py-4 text-right font-mono-data text-secondary">
                                                42ms
                                            </td>
</tr>
<tr className="hover:bg-surface-container-lowest transition-colors h-table-row-height bg-surface-container-low/30">
<td className="px-6 py-4 font-bold flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[20px]">point_of_sale</span>
                                                Smart POS Connect
                                            </td>
<td className="px-6 py-4 text-center font-mono-data">1,105</td>
<td className="px-6 py-4">
<div className="w-32 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
<div className="h-full bg-primary rounded-full w-[62%]"></div>
</div>
</td>
<td className="px-6 py-4">
<span className="text-green-600 font-bold text-body-sm">+5.8%</span>
</td>
<td className="px-6 py-4 text-right font-mono-data text-secondary">
                                                88ms
                                            </td>
</tr>
<tr className="hover:bg-surface-container-lowest transition-colors h-table-row-height">
<td className="px-6 py-4 font-bold flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[20px]">monitoring</span>
                                                Tenant Analytics
                                            </td>
<td className="px-6 py-4 text-center font-mono-data">2,480</td>
<td className="px-6 py-4">
<div className="w-32 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
<div className="h-full bg-primary rounded-full w-[94%]"></div>
</div>
</td>
<td className="px-6 py-4">
<span className="text-green-600 font-bold text-body-sm">+22.1%</span>
</td>
<td className="px-6 py-4 text-right font-mono-data text-secondary">
                                                12ms
                                            </td>
</tr>
<tr className="hover:bg-surface-container-lowest transition-colors h-table-row-height bg-surface-container-low/30">
<td className="px-6 py-4 font-bold flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[20px]">local_shipping</span>
                                                Wholesale Logistics
                                            </td>
<td className="px-6 py-4 text-center font-mono-data">842</td>
<td className="px-6 py-4">
<div className="w-32 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
<div className="h-full bg-primary rounded-full w-[41%]"></div>
</div>
</td>
<td className="px-6 py-4">
<span className="text-secondary font-bold text-body-sm">-1.2%</span>
</td>
<td className="px-6 py-4 text-right font-mono-data text-secondary">
                                                120ms
                                            </td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</div>
</main>
</div>
</div>
{/* Floating Action Button - Supressed as per rule for "Reports" page */}


    </div>
  );
}
