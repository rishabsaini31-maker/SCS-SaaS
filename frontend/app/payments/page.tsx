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

type SupplierPurchase = {
  id: string;
  purchaseNumber: string;
  purchaseDate: string;
  totalAmount: number;
  status: string;
};

type PaymentPayload = {
  amount: number;
  paymentMethod: string;
  notes: string;
  customerId?: string;
  supplierId?: string;
  invoiceId?: string;
  purchaseId?: string;
};

export default function PaymentsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [partyType, setPartyType] = useState<"customer" | "supplier">(
    "customer",
  );
  const [activeSection, setActiveSection] = useState<
    "all" | "customer" | "supplier"
  >("all");
  const [customerPartyFilter, setCustomerPartyFilter] = useState<
    "all" | "paid" | "pending"
  >("all");
  const [supplierPartyFilter, setSupplierPartyFilter] = useState<
    "all" | "paid" | "pending"
  >("all");
  const [orderFilter, setOrderFilter] = useState<"all" | "paid" | "pending">(
    "pending",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    partyId: "",
    invoiceId: "",
    amount: "",
    paymentMethod: "bank_transfer",
    notes: "",
  });

  const {
    data: payments = [],
    isLoading: paymentsLoading,
    isError: paymentsError,
  } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const res = await api.get<Payment[]>("/payments");
      return res.data;
    },
  });

  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await api.get<CustomerParty[]>("/customers");
      return res.data;
    },
  });

  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery({
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

  const { data: supplierPurchases = [] } = useQuery({
    queryKey: ["supplierPurchases", formData.partyId],
    enabled: partyType === "supplier" && Boolean(formData.partyId),
    queryFn: async () => {
      const res = await api.get<SupplierPurchase[]>("/purchases", {
        params: { supplierId: formData.partyId },
      });
      return res.data;
    },
  });

  const loading = paymentsLoading;
  const hasError = paymentsError;
  const parties = partyType === "customer" ? customers : suppliers;
  const partiesLoading =
    partyType === "customer" ? customersLoading : suppliersLoading;

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

  const formatOrderDate = (value: string) => {
    const date = new Date(value);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const customerOrderRows = useMemo(() => {
    return customerInvoices
      .map((invoice) => {
        const paidAmount = invoice.payments.reduce(
          (sum, payment) => sum + payment.amount,
          0,
        );
        const pendingAmount = Math.max(0, invoice.totalAmount - paidAmount);
        return {
          id: invoice.id,
          label: `${invoice.invoiceNumber} - ${formatOrderDate(invoice.invoiceDate)}`,
          paidAmount,
          pendingAmount,
          orderDate: invoice.invoiceDate,
        };
      })
      .filter((row) => {
        if (orderFilter === "all") return true;
        return orderFilter === "paid"
          ? row.pendingAmount <= 0
          : row.pendingAmount > 0;
      });
  }, [customerInvoices, orderFilter]);

  const supplierOrderRows = useMemo(() => {
    return supplierPurchases
      .map((purchase) => {
        const paidAmount = payments
          .filter((payment) => payment.purchase?.id === purchase.id)
          .reduce((sum, payment) => sum + payment.amount, 0);
        const pendingAmount = Math.max(0, purchase.totalAmount - paidAmount);
        return {
          id: purchase.id,
          label: `${purchase.purchaseNumber} - ${formatOrderDate(purchase.purchaseDate)}`,
          paidAmount,
          pendingAmount,
          orderDate: purchase.purchaseDate,
        };
      })
      .filter((row) => {
        if (orderFilter === "all") return true;
        return orderFilter === "paid"
          ? row.pendingAmount <= 0
          : row.pendingAmount > 0;
      });
  }, [orderFilter, payments, supplierPurchases]);

  const handlePartyTypeChange = (type: "customer" | "supplier") => {
    setPartyType(type);
    setOrderFilter("pending");
    setFormData({
      ...formData,
      partyId: "",
      invoiceId: "",
      amount: "",
      notes: "",
    });
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.partyId || !formData.amount) {
      alert("Please select party and enter amount");
      return;
    }

    setSubmitting(true);
    try {
      const payload: PaymentPayload = {
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

  const handleOrderSelect = (orderId: string) => {
    const order =
      partyType === "customer"
        ? customerOrderRows.find((row) => row.id === orderId)
        : supplierOrderRows.find((row) => row.id === orderId);

    setFormData((prev) => ({
      ...prev,
      invoiceId: orderId,
      amount: order
        ? String(order.pendingAmount || prev.amount || "")
        : prev.amount,
      notes: order ? `Payment of ${order.label} order` : prev.notes,
    }));
  };

  const totalReceived = payments.reduce(
    (sum, p) => sum + (p.customer ? p.amount : 0),
    0,
  );
  const totalPaid = payments.reduce(
    (sum, p) => sum + (p.supplier ? p.amount : 0),
    0,
  );

  const customerPayments = useMemo(
    () => payments.filter((p) => Boolean(p.customer)),
    [payments],
  );

  const supplierPayments = useMemo(
    () => payments.filter((p) => Boolean(p.supplier)),
    [payments],
  );

  const filteredCustomerParties = useMemo(() => {
    if (!customers) return [];
    return customers.filter((c) => {
      if (customerPartyFilter === "all") return true;
      const isPaid = (c.outstandingBalance || 0) <= 0;
      return customerPartyFilter === "paid" ? isPaid : !isPaid;
    });
  }, [customers, customerPartyFilter]);

  const filteredSupplierParties = useMemo(() => {
    if (!suppliers) return [];
    return suppliers.filter((s) => {
      if (supplierPartyFilter === "all") return true;
      const isPaid = (s.payableBalance || 0) <= 0;
      return supplierPartyFilter === "paid" ? isPaid : !isPaid;
    });
  }, [suppliers, supplierPartyFilter]);

  const filteredPayments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return payments.filter((payment) => {
      const isCustomer = Boolean(payment.customer);
      const isSupplier = Boolean(payment.supplier);

      if (activeSection === "customer" && !isCustomer) return false;
      if (activeSection === "supplier" && !isSupplier) return false;

      if (!query) return true;
      const partyName = (
        payment.customer?.name ||
        payment.supplier?.name ||
        ""
      ).toLowerCase();

      return partyName.includes(query);
    });
  }, [payments, activeSection, searchTerm]);

  if (loading) {
    return <div className="text-slate-500">Loading payments...</div>;
  }

  if (hasError) {
    return <div className="text-red-600">Failed to load payments data.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payments</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) {
              setPartyType("customer");
              setFormData((prev) => ({
                ...prev,
                partyId: "",
                invoiceId: "",
                amount: "",
              }));
            }
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
                      handlePartyTypeChange(
                        e.target.value as "customer" | "supplier",
                      )
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
                      handlePartyTypeChange(
                        e.target.value as "customer" | "supplier",
                      )
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
                  {parties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {partiesLoading && (
                  <p className="text-xs text-slate-500 mt-1">
                    Loading parties...
                  </p>
                )}
                {formData.partyId && (
                  <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                    <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">
                      {partyType === "customer" ? "Outstanding" : "Payable"}
                    </p>
                    <p
                      className={`font-bold ${partyType === "customer" ? "text-amber-700" : "text-orange-700"}`}
                    >
                      {formatINR(selectedPartyBalance)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Enter the amount actually received or paid now.
                    </p>
                  </div>
                )}

                {formData.partyId && (
                  <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 space-y-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <p className="text-sm font-semibold text-slate-700">
                        Select order to settle
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setOrderFilter("all")}
                          className={`px-2 py-1 rounded text-xs font-semibold ${orderFilter === "all" ? "bg-slate-200 text-slate-800" : "bg-slate-100 text-slate-600"}`}
                        >
                          All
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrderFilter("pending")}
                          className={`px-2 py-1 rounded text-xs font-semibold ${orderFilter === "pending" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}
                        >
                          Pending
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrderFilter("paid")}
                          className={`px-2 py-1 rounded text-xs font-semibold ${orderFilter === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                        >
                          Paid
                        </button>
                      </div>
                    </div>

                    <select
                      value={formData.invoiceId}
                      onChange={(e) => handleOrderSelect(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="">
                        Select{" "}
                        {partyType === "customer" ? "invoice" : "purchase"}
                      </option>
                      {(partyType === "customer"
                        ? customerOrderRows
                        : supplierOrderRows
                      ).map((order) => (
                        <option key={order.id} value={order.id}>
                          {order.label} | Paid {formatINR(order.paidAmount)} |
                          Pending {formatINR(order.pendingAmount)}
                        </option>
                      ))}
                    </select>

                    {(partyType === "customer"
                      ? customerOrderRows
                      : supplierOrderRows
                    ).length === 0 && (
                      <p className="text-xs text-slate-500">
                        No{" "}
                        {orderFilter === "pending"
                          ? "pending"
                          : orderFilter === "paid"
                            ? "paid"
                            : "matching"}{" "}
                        orders found for this party.
                      </p>
                    )}

                    {formData.invoiceId && (
                      <div className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        <p className="font-semibold text-slate-700 mb-1">
                          Auto note
                        </p>
                        <p>{formData.notes}</p>
                      </div>
                    )}
                  </div>
                )}
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
                  <option value="upi">UPI</option>
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

      {/* Quick Customer / Supplier Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 p-5 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-600 text-sm font-semibold">
              Customer Payments
            </p>
            <span className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-bold">
              {customerPayments.length} records
            </span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setCustomerPartyFilter("all")}
              className={`px-3 py-1 rounded text-sm ${customerPartyFilter === "all" ? "bg-slate-100 font-semibold" : "bg-transparent"}`}
            >
              All
            </button>
            <button
              onClick={() => setCustomerPartyFilter("paid")}
              className={`px-3 py-1 rounded text-sm ${customerPartyFilter === "paid" ? "bg-emerald-100 text-emerald-700 font-semibold" : "bg-transparent"}`}
            >
              Paid
            </button>
            <button
              onClick={() => setCustomerPartyFilter("pending")}
              className={`px-3 py-1 rounded text-sm ${customerPartyFilter === "pending" ? "bg-amber-100 text-amber-700 font-semibold" : "bg-transparent"}`}
            >
              Pending
            </button>
            <div className="ml-auto text-sm text-slate-500">
              Matching: {filteredCustomerParties.length}
            </div>
          </div>
          <p className="text-sm text-slate-500">Total Received</p>
          <p className="text-2xl font-bold text-emerald-600">
            {formatINR(totalReceived)}
          </p>
          <div className="mt-3 max-h-36 overflow-auto text-sm">
            {filteredCustomerParties.slice(0, 8).map((c) => (
              <div
                key={c.id}
                className="flex justify-between py-1 border-b border-slate-50"
              >
                <div className="text-slate-800">{c.name}</div>
                <div className="text-slate-600">
                  {formatINR(c.outstandingBalance || 0)}
                </div>
              </div>
            ))}
            {filteredCustomerParties.length === 0 && (
              <div className="text-slate-500 py-2">No customers</div>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-600 text-sm font-semibold">
              Supplier Payments
            </p>
            <span className="text-xs px-2 py-1 rounded bg-orange-50 text-orange-700 font-bold">
              {supplierPayments.length} records
            </span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setSupplierPartyFilter("all")}
              className={`px-3 py-1 rounded text-sm ${supplierPartyFilter === "all" ? "bg-slate-100 font-semibold" : "bg-transparent"}`}
            >
              All
            </button>
            <button
              onClick={() => setSupplierPartyFilter("paid")}
              className={`px-3 py-1 rounded text-sm ${supplierPartyFilter === "paid" ? "bg-emerald-100 text-emerald-700 font-semibold" : "bg-transparent"}`}
            >
              Paid
            </button>
            <button
              onClick={() => setSupplierPartyFilter("pending")}
              className={`px-3 py-1 rounded text-sm ${supplierPartyFilter === "pending" ? "bg-amber-100 text-amber-700 font-semibold" : "bg-transparent"}`}
            >
              Pending
            </button>
            <div className="ml-auto text-sm text-slate-500">
              Matching: {filteredSupplierParties.length}
            </div>
          </div>
          <p className="text-sm text-slate-500">Total Paid</p>
          <p className="text-2xl font-bold text-orange-600">
            {formatINR(totalPaid)}
          </p>
          <div className="mt-3 max-h-36 overflow-auto text-sm">
            {filteredSupplierParties.slice(0, 8).map((s) => (
              <div
                key={s.id}
                className="flex justify-between py-1 border-b border-slate-50"
              >
                <div className="text-slate-800">{s.name}</div>
                <div className="text-slate-600">
                  {formatINR(s.payableBalance || 0)}
                </div>
              </div>
            ))}
            {filteredSupplierParties.length === 0 && (
              <div className="text-slate-500 py-2">No suppliers</div>
            )}
          </div>
        </div>
      </div>

      {/* Section Filter + Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSection("all")}
            className={`px-3 py-1.5 rounded text-sm font-semibold ${
              activeSection === "all"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("customer")}
            className={`px-3 py-1.5 rounded text-sm font-semibold ${
              activeSection === "customer"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Customers
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("supplier")}
            className={`px-3 py-1.5 rounded text-sm font-semibold ${
              activeSection === "supplier"
                ? "bg-orange-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Suppliers
          </button>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search customer/supplier by name..."
          className="md:ml-auto w-full md:w-80 px-3 py-2 border border-slate-300 rounded-lg text-sm"
        />
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
                Note
              </th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredPayments.map((payment) => (
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
                <td className="px-6 py-4 text-slate-700 max-w-xs">
                  <span className="block truncate" title={payment.notes || "-"}>
                    {payment.notes || "-"}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-700">
                  {new Date(payment.paymentDate).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPayments.length === 0 && (
          <div className="px-6 py-8 text-center text-slate-500">
            No matching payments found
          </div>
        )}
      </div>
    </div>
  );
}
