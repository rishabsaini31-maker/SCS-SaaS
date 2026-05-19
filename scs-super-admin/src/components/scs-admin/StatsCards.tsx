"use client"
import React from 'react'

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
  )
}
