"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatINR } from "@/lib/currency";

type Payment = {
  id: string;
  paymentNumber: string;
  customer?: { name: string };
  supplier?: { name: string };
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  notes?: string;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [partyType, setPartyType] = useState<"customer" | "supplier">(
    "customer",
  );
  const [parties, setParties] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    partyId: "",
    invoiceId: "",
    amount: "",
    paymentMethod: "bank_transfer",
    notes: "",
  });

  const fetchPayments = async () => {
    try {
      const res = await api.get("/payments");
      setPayments(res.data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handlePartyTypeChange = async (type: "customer" | "supplier") => {
    setPartyType(type);
    setFormData({ ...formData, partyId: "", invoiceId: "", amount: "" });
    try {
      const endpoint = type === "customer" ? "/customers" : "/suppliers";
      const res = await api.get(endpoint);
      setParties(res.data);
    } catch (error) {
      console.error("Error fetching parties:", error);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.partyId || !formData.amount) {
      alert("Please select party and enter amount");
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || "",
      };

      if (partyType === "customer") {
        payload.customerId = formData.partyId;
        payload.invoiceId = formData.invoiceId || undefined;
      } else {
        payload.supplierId = formData.partyId;
        payload.purchaseId = formData.invoiceId || undefined;
      }

      await api.post("/payments", payload);
      setShowForm(false);
      setFormData({
        partyId: "",
        invoiceId: "",
        amount: "",
        paymentMethod: "bank_transfer",
        notes: "",
      });
      fetchPayments();
    } catch (error) {
      console.error("Error adding payment:", error);
      alert("Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-slate-500">Loading payments...</div>;
  }

  const totalReceived = payments.reduce(
    (sum, p) => sum + (p.customer ? p.amount : 0),
    0,
  );
  const totalPaid = payments.reduce(
    (sum, p) => sum + (p.supplier ? p.amount : 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payments</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) handlePartyTypeChange("customer");
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Record Payment
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold">Record Payment</h2>
          <form onSubmit={handleAddPayment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Payment Type *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="customer"
                    checked={partyType === "customer"}
                    onChange={(e) =>
                      handlePartyTypeChange(e.target.value as any)
                    }
                  />
                  <span>Received from Customer</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="supplier"
                    checked={partyType === "supplier"}
                    onChange={(e) =>
                      handlePartyTypeChange(e.target.value as any)
                    }
                  />
                  <span>Paid to Supplier</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {partyType === "customer" ? "Customer" : "Supplier"} *
                </label>
                <select
                  value={formData.partyId}
                  onChange={(e) =>
                    setFormData({ ...formData, partyId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Select party</option>
                  {parties.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Payment Method *
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentMethod: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="credit_card">Credit Card</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                placeholder="Payment notes..."
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {submitting ? "Recording..." : "Record Payment"}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 p-5 rounded-xl">
          <p className="text-slate-500 text-sm mb-2">
            Total Received (from Customers)
          </p>
          <h2 className="text-3xl font-bold text-emerald-600">
            {formatINR(totalReceived)}
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            {payments.filter((p) => p.customer).length} payments
          </p>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl">
          <p className="text-slate-500 text-sm mb-2">
            Total Paid (to Suppliers)
          </p>
          <h2 className="text-3xl font-bold text-orange-600">
            {formatINR(totalPaid)}
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            {payments.filter((p) => p.supplier).length} payments
          </p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                Payment #
              </th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                Party
              </th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                Method
              </th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">
                  {payment.paymentNumber}
                </td>
                <td className="px-6 py-4 text-slate-700">
                  {payment.customer?.name || payment.supplier?.name || "-"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-bold rounded ${
                      payment.customer
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-orange-50 text-orange-700"
                    }`}
                  >
                    {payment.customer ? "Received" : "Paid"}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold">
                  {formatINR(payment.amount)}
                </td>
                <td className="px-6 py-4 text-slate-700">
                  {payment.paymentMethod}
                </td>
                <td className="px-6 py-4 text-slate-700">
                  {new Date(payment.paymentDate).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && (
          <div className="px-6 py-8 text-center text-slate-500">
            No payments recorded
          </div>
        )}
      </div>
    </div>
  );
}
