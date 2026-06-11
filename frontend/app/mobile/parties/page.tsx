"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatINR } from "@/lib/currency";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gstin: string;
  outstandingBalance: number;
  status: string;
};

type Supplier = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gstin: string;
  payableBalance: number;
  status: string;
};

export default function MobilePartiesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"customers" | "suppliers">("customers");
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingParty, setEditingParty] = useState<{
    id: string;
    type: "customers" | "suppliers";
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    gstin: "",
  });

  const {
    data: customers = [],
    isLoading: customersLoading,
    isError: customersError,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await api.get<Customer[]>("/customers");
      return res.data;
    },
  });

  const {
    data: suppliers = [],
    isLoading: suppliersLoading,
    isError: suppliersError,
  } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const res = await api.get<Supplier[]>("/suppliers");
      return res.data;
    },
  });

  const loading = customersLoading || suppliersLoading;
  const hasError = customersError || suppliersError;

  const filteredCustomers = customers.filter((c) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );
  });

  const filteredSuppliers = suppliers.filter((s) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q)
    );
  });

  const handleAddParty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert("Please fill name and email");
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = activeTab === "customers" ? "/customers" : "/suppliers";
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || "",
        address: formData.address || "",
        gstin: formData.gstin || "",
        status: "active",
      };

      if (editingParty && editingParty.type === activeTab) {
        await api.patch(`${endpoint}/${editingParty.id}`, payload);
      } else {
        await api.post(endpoint, payload);
      }
      setShowForm(false);
      setEditingParty(null);
      setFormData({ name: "", email: "", phone: "", address: "", gstin: "" });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    } catch (error) {
      console.error("Error adding party:", error);
      alert("Failed to add. Email might already exist.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading parties...</div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Failed to load parties data.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Parties</h1>
        <button
          onClick={() => {
            setEditingParty(null);
            setFormData({
              name: "",
              email: "",
              phone: "",
              address: "",
              gstin: "",
            });
            setShowForm(!showForm);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
        >
          + Add
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("customers")}
          className={`flex-1 py-2 rounded-lg font-medium ${
            activeTab === "customers"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          Customers ({customers.length})
        </button>
        <button
          onClick={() => setActiveTab("suppliers")}
          className={`flex-1 py-2 rounded-lg font-medium ${
            activeTab === "suppliers"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          Suppliers ({suppliers.length})
        </button>
      </div>

      {!showForm && (
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg text-base"
            list={activeTab === "customers" ? "customer-names" : "supplier-names"}
          />
        </div>
      )}
      <datalist id="customer-names">
        {customers.map((c) => (
          <option key={c.id} value={c.name} />
        ))}
      </datalist>
      <datalist id="supplier-names">
        {suppliers.map((s) => (
          <option key={s.id} value={s.name} />
        ))}
      </datalist>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
          <h2 className="text-lg font-semibold">
            {editingParty ? "Edit" : "Add"}{" "}
            {activeTab === "customers" ? "Customer" : "Supplier"}
          </h2>
          <form onSubmit={handleAddParty} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-3 border border-slate-300 rounded-lg text-base"
                placeholder="Enter name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-3 border border-slate-300 rounded-lg text-base"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-3 py-3 border border-slate-300 rounded-lg text-base"
                placeholder="+91-XXXXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-3 py-3 border border-slate-300 rounded-lg text-base"
                placeholder="Enter address"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium"
              >
                {submitting ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-3 bg-slate-400 text-white rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {activeTab === "customers" &&
          (filteredCustomers.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No customers</p>
          ) : (
            filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="bg-white border border-slate-200 rounded-xl p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{customer.name}</p>
                    <p className="text-xs text-slate-500">{customer.email}</p>
                    {customer.phone && (
                      <p className="text-xs text-slate-500">{customer.phone}</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setEditingParty({ id: customer.id, type: "customers" });
                      setFormData({
                        name: customer.name,
                        email: customer.email,
                        phone: customer.phone,
                        address: customer.address,
                        gstin: customer.gstin,
                      });
                      setShowForm(true);
                    }}
                    className="text-blue-600 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Outstanding:{" "}
                    <span className="font-semibold text-amber-600">
                      {formatINR(customer.outstandingBalance || 0)}
                    </span>
                  </p>
                </div>
              </div>
            ))
          ))}

        {activeTab === "suppliers" &&
          (filteredSuppliers.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No suppliers</p>
          ) : (
            filteredSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="bg-white border border-slate-200 rounded-xl p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{supplier.name}</p>
                    <p className="text-xs text-slate-500">{supplier.email}</p>
                    {supplier.phone && (
                      <p className="text-xs text-slate-500">{supplier.phone}</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setEditingParty({ id: supplier.id, type: "suppliers" });
                      setFormData({
                        name: supplier.name,
                        email: supplier.email,
                        phone: supplier.phone,
                        address: supplier.address,
                        gstin: supplier.gstin,
                      });
                      setShowForm(true);
                    }}
                    className="text-blue-600 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Payable:{" "}
                    <span className="font-semibold text-orange-600">
                      {formatINR(supplier.payableBalance || 0)}
                    </span>
                  </p>
                </div>
              </div>
            ))
          ))}
      </div>
    </div>
  );
}