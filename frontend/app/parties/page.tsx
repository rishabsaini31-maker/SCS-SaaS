"use client";

import { useEffect, useState } from "react";
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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"customers" | "suppliers">(
    "customers",
  );
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    gstin: "",
  });

  const fetchData = async () => {
    try {
      const [customersRes, suppliersRes] = await Promise.all([
        api.get("/customers"),
        api.get("/suppliers"),
      ]);
      setCustomers(customersRes.data);
      setSuppliers(suppliersRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddParty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert("Please fill name and email");
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = activeTab === "customers" ? "/customers" : "/suppliers";
      await api.post(endpoint, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || "",
        address: formData.address || "",
        gstin: formData.gstin || "",
        status: "active",
      });
      setShowForm(false);
      setFormData({ name: "", email: "", phone: "", address: "", gstin: "" });
      fetchData();
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Parties</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Add {activeTab === "customers" ? "Customer" : "Supplier"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold">
            Add New {activeTab === "customers" ? "Customer" : "Supplier"}
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
                  ? "Adding..."
                  : "Add " +
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {customers.map((customer) => (
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {suppliers.map((supplier) => (
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
