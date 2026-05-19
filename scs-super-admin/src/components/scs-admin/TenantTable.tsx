"use client"
import React from 'react'

export default function TenantTable() {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
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
          </tbody>
        </table>
      </div>
    </div>
  )
}
