"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatINR } from "@/lib/currency";

type Invoice = {
  id: string;
  invoiceNumber: string;
  customer: { name: string; email: string };
  lineItems: {
    quantity: number;
    unitPrice: number;
    product: { name: string };
  }[];
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  status: string;
  invoiceDate: string;
  notes?: string;
};

type Payment = {
  id: string;
  invoiceId?: string;
  amount: number;
};

type Customer = { id: string; name: string; email: string };
type Product = {
  id: string;
  name: string;
  stock: number;
  sellingPrice: number;
  barcode?: string;
};

type LineItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

const useLocalCategories = () => {
  const [saved, setSaved] = useState<string[]>([]);
  useEffect(() => {
    const stored = window.localStorage.getItem("inventoryCategories");
    if (stored) {
      setSaved(JSON.parse(stored) as string[]);
    }
  }, []);
  return saved;
};

const formatShortDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function BillingPage() {
  const queryClient = useQueryClient();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [invoiceEditForm, setInvoiceEditForm] = useState({
    status: "Pending",
    notes: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { productId: "", quantity: 0, unitPrice: 0 },
  ]);
  const [formData, setFormData] = useState({
    customerId: "",
    notes: "",
    gst: 18,
    barcodeInput: "",
    paymentMethod: "upi",
    paymentStatus: "Paid",
    paidAmount: "",
  });

  const {
    data: invoices = [],
    isLoading: invoicesLoading,
    isError: invoicesError,
  } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const res = await api.get<Invoice[]>("/invoices");
      return res.data;
    },
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
    data: products = [],
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get<Product[]>("/products");
      return res.data;
    },
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

  const savedCategories = useLocalCategories();
  const loading =
    invoicesLoading || customersLoading || productsLoading || paymentsLoading;
  const hasError =
    invoicesError || customersError || productsError || paymentsError;

  const getInvoicePaidAmount = (invoiceId: string) =>
    payments
      .filter((payment) => payment.invoiceId === invoiceId)
      .reduce((sum, payment) => sum + payment.amount, 0);

  const addLineItem = () => {
    setLineItems([...lineItems, { productId: "", quantity: 0, unitPrice: 0 }]);
  };

  const removeLineItem = (idx: number) => {
    setLineItems(lineItems.filter((_, i) => i !== idx));
  };

  const updateLineItem = (
    idx: number,
    field: keyof LineItem,
    value: LineItem[keyof LineItem],
  ) => {
    setLineItems((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    const gst = subtotal * (formData.gst / 100);
    return { subtotal, gst, total: subtotal + gst };
  };

  const handleBarcodeInput = async (barcode: string) => {
    const code = barcode.trim();
    if (!code) return;

    try {
      const foundInCache = products.find((p) => p.barcode === code);
      const foundProduct = foundInCache
        ? foundInCache
        : (
            await api.get<Product[]>("/products", { params: { search: code } })
          ).data.find((p) => p.barcode === code);

      if (foundProduct) {
        if (foundProduct.stock <= 0) {
          alert("This product is out of stock");
          return;
        }

        setLineItems((prev) => [
          ...prev,
          {
            productId: foundProduct.id,
            quantity: 1,
            unitPrice: foundProduct.sellingPrice,
          },
        ]);
        setFormData((prev) => ({ ...prev, barcodeInput: "" }));
      } else {
        alert("Product not found");
      }
    } catch (error) {
      console.error("Error scanning barcode:", error);
      alert("Failed to scan barcode");
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.customerId ||
      lineItems.some((item) => !item.productId || item.quantity === 0)
    ) {
      alert("Please select customer and add line items");
      return;
    }

    for (const item of lineItems) {
      const selectedProduct = products.find((p) => p.id === item.productId);
      if (!selectedProduct) {
        alert("Selected product not found");
        return;
      }

      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty <= 0) {
        alert(`Please enter a valid quantity for ${selectedProduct.name}`);
        return;
      }

      if (qty > selectedProduct.stock) {
        alert(
          `${selectedProduct.name}: entered quantity (${qty}) is more than stock (${selectedProduct.stock})`,
        );
        return;
      }
    }

    const { total } = calculateTotals();
    const isPending = formData.paymentStatus === "Pending";
    const paidAmount = isPending
      ? Math.max(0, Number(formData.paidAmount) || 0)
      : total;

    if (paidAmount > total) {
      alert("Paid amount cannot be greater than total amount");
      return;
    }

    setSubmitting(true);
    try {
      const invoiceRes = await api.post("/invoices", {
        customerId: formData.customerId,
        lineItems: lineItems.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          unitPrice: parseFloat(String(item.unitPrice)),
        })),
        status: formData.paymentStatus,
        notes: formData.notes || "",
      });

      if (paidAmount > 0) {
        await api.post("/payments", {
          customerId: formData.customerId,
          invoiceId: invoiceRes.data.id,
          amount: paidAmount,
          paymentMethod: formData.paymentMethod,
          notes: `Payment for invoice ${invoiceRes.data.invoiceNumber}`,
        });
      }

      setShowForm(false);
      setFormData({
        customerId: "",
        notes: "",
        gst: 18,
        barcodeInput: "",
        paymentMethod: "upi",
        paymentStatus: "Paid",
        paidAmount: "",
      });
      setLineItems([{ productId: "", quantity: 0, unitPrice: 0 }]);
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["payments"] });
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
    } catch (error) {
      console.error("Error creating invoice:", error);
      const message =
        (
          error as {
            response?: { data?: { error?: string; message?: string } };
          }
        ).response?.data?.error ||
        (
          error as {
            response?: { data?: { error?: string; message?: string } };
          }
        ).response?.data?.message ||
        "Failed to create invoice";
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-slate-500">Loading billing...</div>;
  }

  if (hasError) {
    return <div className="text-red-600">Failed to load billing data.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Billing & Invoices</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Create Invoice
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold">Create New Invoice</h2>
          <form onSubmit={handleCreateInvoice} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Customer *
                </label>
                <select
                  value={formData.customerId}
                  onChange={(e) =>
                    setFormData({ ...formData, customerId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Select customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  GST % (Editable)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.gst}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gst: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="18"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Scan Product Barcode
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.barcodeInput}
                  onChange={(e) =>
                    setFormData({ ...formData, barcodeInput: e.target.value })
                  }
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleBarcodeInput(formData.barcodeInput);
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Scan barcode or enter product code (Press Enter)"
                />
                <button
                  type="button"
                  onClick={() => handleBarcodeInput(formData.barcodeInput)}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
                >
                  Scan
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Or manually select products below
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">
                  Line Items *
                </label>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="text-sm text-blue-600 hover:underline"
                >
                  + Add Item
                </button>
              </div>
              <div className="space-y-2 border border-slate-200 rounded-lg p-3">
                {lineItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <select
                      value={item.productId}
                      onChange={(e) => {
                        const prod = products.find(
                          (p) => p.id === e.target.value,
                        );
                        updateLineItem(idx, "productId", e.target.value);
                        if (prod)
                          updateLineItem(idx, "unitPrice", prod.sellingPrice);
                      }}
                      className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm"
                    >
                      <option value="">Select product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Stock: {p.stock},{" "}
                          {formatINR(p.sellingPrice)})
                        </option>
                      ))}
                    </select>
                    <div className="w-24">
                      <input
                        type="number"
                        value={item.quantity === 0 ? "" : item.quantity}
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (raw === "") {
                            updateLineItem(idx, "quantity", 0);
                            return;
                          }

                          updateLineItem(
                            idx,
                            "quantity",
                            Math.max(0, Number(raw) || 0),
                          );
                        }}
                        className="w-16 px-2 py-1 border border-slate-300 rounded text-sm"
                        placeholder="Qty"
                        title="Quantity"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Stock:{" "}
                        {item.productId
                          ? (products.find((p) => p.id === item.productId)
                              ?.stock ?? "-")
                          : "-"}
                      </p>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateLineItem(
                          idx,
                          "unitPrice",
                          parseFloat(e.target.value),
                        )
                      }
                      className="w-20 px-2 py-1 border border-slate-300 rounded text-sm"
                      placeholder="Price"
                      title="Unit Price"
                    />
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(idx)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded space-y-2">
              {(() => {
                const { subtotal, gst, total } = calculateTotals();
                const isPending = formData.paymentStatus === "Pending";
                const paidAmount = isPending
                  ? Math.max(0, Number(formData.paidAmount) || 0)
                  : total;
                const pendingAmount = Math.max(0, total - paidAmount);

                return (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{formatINR(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>GST ({formData.gst}%):</span>
                      <span>{formatINR(gst)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatINR(total)}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-200 mt-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Payment Method
                        </label>
                        <select
                          value={formData.paymentMethod}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              paymentMethod: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        >
                          <option value="upi">UPI</option>
                          <option value="cash">Cash</option>
                          <option value="cheque">Cheque</option>
                          <option value="bank_transfer">Bank Transfer</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Payment Status
                        </label>
                        <select
                          value={formData.paymentStatus}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              paymentStatus: e.target.value,
                              paidAmount:
                                e.target.value === "Pending"
                                  ? formData.paidAmount
                                  : "",
                            })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        >
                          <option value="Paid">Paid</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </div>

                      {isPending && (
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Paid Amount
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max={total}
                            value={formData.paidAmount}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                paidAmount: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            placeholder="Enter paid amount"
                          />
                          <p className="text-xs text-slate-600 mt-1">
                            Pending: {formatINR(pendingAmount)}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                placeholder="Invoice notes..."
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {submitting ? "Creating..." : "Create Invoice"}
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

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Created
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Subtotal
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    GST (18%)
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Paid
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Pending
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase whitespace-nowrap">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.map((invoice) =>
                  (() => {
                    const paidAmount = getInvoicePaidAmount(invoice.id);
                    const pendingAmount = Math.max(
                      0,
                      invoice.totalAmount - paidAmount,
                    );

                    return (
                      <tr
                        key={invoice.id}
                        className="hover:bg-slate-50 cursor-pointer"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {invoice.customer.name}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {formatShortDate(invoice.invoiceDate)}
                        </td>
                        <td className="px-6 py-4">
                          {formatINR(invoice.subtotal)}
                        </td>
                        <td className="px-6 py-4">
                          {formatINR(invoice.gstAmount)}
                        </td>
                        <td className="px-6 py-4 font-bold">
                          {formatINR(invoice.totalAmount)}
                        </td>
                        <td className="px-6 py-4 text-emerald-700 font-semibold">
                          {formatINR(paidAmount)}
                        </td>
                        <td className="px-6 py-4 text-orange-700 font-semibold">
                          {formatINR(pendingAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded whitespace-nowrap min-w-18 ${
                              invoice.status === "created"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {invoice.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })(),
                )}
              </tbody>
            </table>
            {invoices.length === 0 && (
              <div className="px-6 py-8 text-center text-slate-500">
                No invoices
              </div>
            )}
          </div>
        </div>

        {selectedInvoice && (
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 sticky top-6 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold">Invoice Details</h3>
                <button
                  className="text-slate-400 hover:text-slate-600"
                  onClick={() => setSelectedInvoice(null)}
                >
                  ✕
                </button>
              </div>

              {!editingInvoice ? (
                <>
                  <div className="space-y-4 pb-4 border-b">
                    <div>
                      <p className="text-xs text-slate-500 uppercase">
                        Invoice Number
                      </p>
                      <p className="font-bold text-slate-900">
                        {selectedInvoice.invoiceNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase">
                        Customer
                      </p>
                      <p className="font-bold text-slate-900">
                        {selectedInvoice.customer.name}
                      </p>
                      <p className="text-sm text-slate-600">
                        {selectedInvoice.customer.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase">Date</p>
                      <p className="font-bold text-slate-900">
                        {formatShortDate(selectedInvoice.invoiceDate)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 py-4 border-b">
                    <h4 className="font-bold text-slate-900 mb-3">
                      Line Items
                    </h4>
                    {selectedInvoice.lineItems.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-slate-700">
                          {item.product.name} x{item.quantity}
                        </span>
                        <span className="font-medium">
                          {formatINR(item.quantity * item.unitPrice)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 py-4">
                    {(() => {
                      const paidAmount = getInvoicePaidAmount(
                        selectedInvoice.id,
                      );
                      const pendingAmount = Math.max(
                        0,
                        selectedInvoice.totalAmount - paidAmount,
                      );

                      return (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Subtotal</span>
                            <span className="font-medium">
                              {formatINR(selectedInvoice.subtotal)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">GST (18%)</span>
                            <span className="font-medium">
                              {formatINR(selectedInvoice.gstAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between text-lg font-bold pt-2 border-t">
                            <span>Total</span>
                            <span>
                              {formatINR(selectedInvoice.totalAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Paid Amount</span>
                            <span className="font-medium text-emerald-700">
                              {formatINR(paidAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">
                              Pending Amount
                            </span>
                            <span className="font-medium text-orange-700">
                              {formatINR(pendingAmount)}
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {selectedInvoice.notes && (
                    <div className="mt-4 p-3 bg-slate-50 rounded text-sm text-slate-700">
                      <p className="text-xs text-slate-500 uppercase mb-1">
                        Notes
                      </p>
                      <p>{selectedInvoice.notes}</p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => openInvoiceEditor(selectedInvoice)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-700 transition"
                  >
                    Edit Invoice
                  </button>
                </>
              ) : (
                <form onSubmit={handleUpdateInvoice} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Status
                    </label>
                    <select
                      value={invoiceEditForm.status}
                      onChange={(e) =>
                        setInvoiceEditForm({
                          ...invoiceEditForm,
                          status: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Partial">Partial</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Notes
                    </label>
                    <textarea
                      value={invoiceEditForm.notes}
                      onChange={(e) =>
                        setInvoiceEditForm({
                          ...invoiceEditForm,
                          notes: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {submitting ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingInvoice(null)}
                      className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
