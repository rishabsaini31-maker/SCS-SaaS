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

export default function PartiesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"customers" | "suppliers">(
    "customers",
  );
  const [showForm, setShowForm] = useState(false);
  const [editingParty, setEditingParty] = useState<{
    id: string;
    type: "customers" | "suppliers";
  } | null>(null);
  const [customerFilter, setCustomerFilter] = useState<
    "all" | "paid" | "pending"
  >("all");
  const [supplierFilter, setSupplierFilter] = useState<
    "all" | "paid" | "pending"
  >("all");
  const [submitting, setSubmitting] = useState(false);
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
    if (customerFilter === "all") return true;
    const isPaid = (c.outstandingBalance || 0) <= 0;
    return customerFilter === "paid" ? isPaid : !isPaid;
  });

  const filteredSuppliers = suppliers.filter((s) => {
    if (supplierFilter === "all") return true;
    const isPaid = (s.payableBalance || 0) <= 0;
    return supplierFilter === "paid" ? isPaid : !isPaid;
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
    return <div className="text-slate-500">Loading parties...</div>;
  }

  if (hasError) {
    return <div className="text-red-600">Failed to load parties data.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Parties</h1>
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
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Add {activeTab === "customers" ? "Customer" : "Supplier"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold">
            {editingParty ? "Edit" : "Add New"}{" "}
            {activeTab === "customers" ? "Customer" : "Supplier"}
          </h2>
          <form onSubmit={handleAddParty} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="+91-XXXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">GSTIN</label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) =>
                    setFormData({ ...formData, gstin: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="27AABCU9603R1Z0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Enter address"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {submitting
                  ? "Saving..."
                  : (editingParty ? "Save Changes" : "Add ") +
                    (activeTab === "customers" ? "Customer" : "Supplier")}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          className={`px-4 py-2 font-semibold border-b-2 ${
            activeTab === "customers"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-600"
          }`}
          onClick={() => setActiveTab("customers")}
        >
          Customers ({customers.length})
        </button>
        <button
          className={`px-4 py-2 font-semibold border-b-2 ${
            activeTab === "suppliers"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-600"
          }`}
          onClick={() => setActiveTab("suppliers")}
        >
          Suppliers ({suppliers.length})
        </button>
      </div>

      {/* Customers Table */}
      {activeTab === "customers" && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 border-b">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">
                Filter:
              </span>
              <button
                onClick={() => setCustomerFilter("all")}
                className={`px-3 py-1 rounded-md text-sm ${customerFilter === "all" ? "bg-slate-100 font-semibold" : "bg-transparent"}`}
              >
                All
              </button>
              <button
                onClick={() => setCustomerFilter("paid")}
                className={`px-3 py-1 rounded-md text-sm ${customerFilter === "paid" ? "bg-emerald-100 text-emerald-700 font-semibold" : "bg-transparent"}`}
              >
                Paid
              </button>
              <button
                onClick={() => setCustomerFilter("pending")}
                className={`px-3 py-1 rounded-md text-sm ${customerFilter === "pending" ? "bg-amber-100 text-amber-700 font-semibold" : "bg-transparent"}`}
              >
                Pending
              </button>
            </div>
            <div className="text-sm text-slate-500">
              Showing {filteredCustomers.length} of {customers.length}
            </div>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                  Phone
                </th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                  Address
                </th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                  GSTIN
                </th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                  Outstanding Balance
                </th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {customer.name}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {customer.email || "-"}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {customer.phone || "-"}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {customer.address || "-"}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {customer.gstin || "-"}
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-600">
                    {formatINR(customer.outstandingBalance)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingParty({ id: customer.id, type: "customers" });
                        setActiveTab("customers");
                        setFormData({
                          name: customer.name,
                          email: customer.email,
                          phone: customer.phone,
                          address: customer.address,
                          gstin: customer.gstin,
                        });
                        setShowForm(true);
                      }}
                      className="text-sm font-semibold text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && (
            <div className="px-6 py-8 text-center text-slate-500">
              No customers
            </div>
          )}
        </div>
      )}

      {/* Suppliers Table */}
      {activeTab === "suppliers" && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 border-b">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">
                Filter:
              </span>
              <button
                onClick={() => setSupplierFilter("all")}
                className={`px-3 py-1 rounded-md text-sm ${supplierFilter === "all" ? "bg-slate-100 font-semibold" : "bg-transparent"}`}
              >
                All
              </button>
              <button
                onClick={() => setSupplierFilter("paid")}
                className={`px-3 py-1 rounded-md text-sm ${supplierFilter === "paid" ? "bg-emerald-100 text-emerald-700 font-semibold" : "bg-transparent"}`}
              >
                Paid
              </button>
              <button
                onClick={() => setSupplierFilter("pending")}
                className={`px-3 py-1 rounded-md text-sm ${supplierFilter === "pending" ? "bg-amber-100 text-amber-700 font-semibold" : "bg-transparent"}`}
              >
                Pending
              </button>
            </div>
            <div className="text-sm text-slate-500">
              Showing {filteredSuppliers.length} of {suppliers.length}
            </div>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                  Phone
                </th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                  Address
                </th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                  GSTIN
                </th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                  Payable Balance
                </th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {supplier.name}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {supplier.email || "-"}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {supplier.phone || "-"}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {supplier.address || "-"}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {supplier.gstin || "-"}
                  </td>
                  <td className="px-6 py-4 font-bold text-orange-600">
                    {formatINR(supplier.payableBalance)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingParty({ id: supplier.id, type: "suppliers" });
                        setActiveTab("suppliers");
                        setFormData({
                          name: supplier.name,
                          email: supplier.email,
                          phone: supplier.phone,
                          address: supplier.address,
                          gstin: supplier.gstin,
                        });
                        setShowForm(true);
                      }}
                      className="text-sm font-semibold text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {suppliers.length === 0 && (
            <div className="px-6 py-8 text-center text-slate-500">
              No suppliers
            </div>
          )}
        </div>
      )}
    </div>
  );
}
