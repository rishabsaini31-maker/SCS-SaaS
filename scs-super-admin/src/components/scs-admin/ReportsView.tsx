"use client"
import React from 'react'

export default function ReportsView() {
  return (
    <div className="p-container-padding">
      <div className="flex flex-col gap-stack-gap">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display-sm text-display-sm text-on-surface mb-1">SaaS Reports</h2>
            <p className="text-secondary font-body-md">Exportable financial and usage reports.</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
          <h3 className="font-h1">Reports</h3>
          <p className="text-body-sm text-secondary">Placeholder for compiled reports and exports.</p>
        </div>
      </div>
    </div>
  )
}
