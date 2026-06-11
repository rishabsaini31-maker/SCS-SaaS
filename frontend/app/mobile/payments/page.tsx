"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatINR } from "@/lib/currency";

type Payment = {
  id: string;
  paymentNumber: string;
  customer?: { name: string };
  supplier?: { name: string };
  purchase?: { id: string };
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  notes?: string;
};

type Party = { id: string; name: string };
type CustomerParty = Party & { outstandingBalance: number };
type SupplierParty = Party & { payableBalance: number };

type PaymentLine = {
  amount: number;
};

type CustomerInvoice = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  totalAmount: number;
  status: string;
  payments: PaymentLine[];
};

export default function MobilePaymentsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [partyType, setPartyType] = useState<"customer" | "supplier">("customer");
  const [formData, setFormData] = useState({
    partyId: "",
    invoiceId: "",
    amount: "",
    paymentMethod: "cash",
    notes: "",
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const res = await api.get<Payment[]>("/payments");
      return res.data;
    },
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await api.get<CustomerParty[]>("/customers");
      return res.data;
    },
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const res = await api.get<SupplierParty[]>("/suppliers");
      return res.data;
    },
  });

  const { data: customerInvoices = [] } = useQuery({
    queryKey: ["customerInvoices", formData.partyId],
    enabled: partyType === "customer" && Boolean(formData.partyId),
    queryFn: async () => {
      const res = await api.get<CustomerInvoice[]>(
        `/invoices/customer/${formData.partyId}`,
      );
      return res.data;
    },
  });

  const loading = paymentsLoading;

  const totalReceived = payments.reduce(
    (sum, p) => sum + (p.customer ? p.amount : 0),
    0,
  );
  const totalPaid = payments.reduce(
    (sum, p) => sum + (p.supplier ? p.amount : 0),
    0,
  );

  const formatPaymentMethod = (value: string) =>
    value
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const selectedPartyBalance = useMemo(() => {
    if (!formData.partyId) return 0;

    if (partyType === "customer") {
      return (
        (customers as CustomerParty[]).find(
          (party) => party.id === formData.partyId,
        )?.outstandingBalance || 0
      );
    }

    return (
      (suppliers as SupplierParty[]).find(
        (party) => party.id === formData.partyId,
      )?.payableBalance || 0
    );
  }, [customers, formData.partyId, partyType, suppliers]);

  const customerOrderRows = useMemo(() => {
    return customerInvoices.map((invoice) => {
      const paidAmount = invoice.payments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      );
      const pendingAmount = Math.max(0, invoice.totalAmount - paidAmount);
      return {
        id: invoice.id,
        label: `${invoice.invoiceNumber}`,
        pendingAmount,
      };
    });
  }, [customerInvoices]);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.partyId || !formData.amount) {
      alert("Please select party and enter amount");
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
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
        paymentMethod: "cash",
        notes: "",
      });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    } catch (error) {
      console.error("Error adding payment:", error);
      alert("Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading payments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) {
              setPartyType("customer");
              setFormData({
                partyId: "",
                invoiceId: "",
                amount: "",
                paymentMethod: "cash",
                notes: "",
              });
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
        >
          + Record
        </button>
      </div>

      {!showForm && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase">Received</p>
            <p className="text-lg font-bold text-emerald-600">
              {formatINR(totalReceived)}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase">Paid</p>
            <p className="text-lg font-bold text-orange-600">
              {formatINR(totalPaid)}
            </p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
          <h2 className="text-lg font-semibold">Record Payment</h2>
          <form onSubmit={handleAddPayment} className="space-y-4">
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setPartyType("customer")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                  partyType === "customer"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                From Customer
              </button>
              <button
                type="button"
                onClick={() => setPartyType("supplier")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                  partyType === "supplier"
                    ? "bg-orange-600 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                To Supplier
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {partyType === "customer" ? "Customer" : "Supplier"} *
              </label>
              <select
                value={formData.partyId}
                onChange={(e) =>
                  setFormData({ ...formData, partyId: e.target.value })
                }
                className="w-full px-3 py-3 border border-slate-300 rounded-lg text-base"
              >
                <option value="">Select party</option>
                {(partyType === "customer" ? customers : suppliers).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {formData.partyId && (
                <p className="text-xs mt-1">
                  Balance:{" "}
                  <span className="font-semibold text-amber-600">
                    {formatINR(selectedPartyBalance)}
                  </span>
                </p>
              )}
            </div>

            {formData.partyId && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  {partyType === "customer" ? "Invoice" : "Purchase"} (Optional)
                </label>
                <select
                  value={formData.invoiceId}
                  onChange={(e) => {
                    const orderId = e.target.value;
                    const order = customerOrderRows.find(
                      (row) => row.id === orderId,
                    );
                    setFormData({
                      ...formData,
                      invoiceId: orderId,
                      amount: order ? String(order.pendingAmount) : formData.amount,
                    });
                  }}
                  className="w-full px-3 py-3 border border-slate-300 rounded-lg text-base"
                >
                  <option value="">Select order to settle</option>
                  {customerOrderRows.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
                className="w-full px-3 py-3 border border-slate-300 rounded-lg text-base"
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
                className="w-full px-3 py-3 border border-slate-300 rounded-lg text-base"
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium"
              >
                {submitting ? "Recording..." : "Record Payment"}
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
        {payments.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No payments yet</p>
        ) : (
          payments.slice(0, 30).map((payment) => (
            <div
              key={payment.id}
              className="bg-white border border-slate-200 rounded-xl p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    {payment.paymentNumber}
                  </p>
                  <p className="text-xs text-slate-500">
                    {payment.customer?.name || payment.supplier?.name || "-"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatPaymentMethod(payment.paymentMethod)}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      payment.customer ? "text-emerald-600" : "text-orange-600"
                    }`}
                  >
                    {formatINR(payment.amount)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(payment.paymentDate).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}