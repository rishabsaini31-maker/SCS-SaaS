"use client"
import React, { useState } from 'react'

export default function CreateShopForm() {
  const [name, setName] = useState('')
  const [plan, setPlan] = useState('Basic')
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Create shop: ${name} (${plan}) - ${email}`)
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
      <h3 className="font-h1 text-on-surface mb-4">Create Shop</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-label-caps text-secondary block mb-1">Shop Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-lg border border-outline-variant p-2" />
        </div>
        <div>
          <label className="text-label-caps text-secondary block mb-1">Owner Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-lg border border-outline-variant p-2" />
        </div>
        <div>
          <label className="text-label-caps text-secondary block mb-1">Plan</label>
          <select value={plan} onChange={e => setPlan(e.target.value)} className="w-full rounded-lg border border-outline-variant p-2">
            <option>Basic</option>
            <option>Pro</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg font-medium">Create</button>
        </div>
      </form>
    </div>
  )
}
