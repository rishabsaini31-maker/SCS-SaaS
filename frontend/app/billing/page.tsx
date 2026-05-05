"use client";

import { useEffect, useState } from "react";
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

type Customer = { id: string; name: string; email: string };
type Product = { id: string; name: string; sellingPrice: number };

type LineItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { productId: "", quantity: 0, unitPrice: 0 },
  ]);
  const [formData, setFormData] = useState({
    customerId: "",
    notes: "",
    gst: 18,
    barcodeInput: "",
  });

  const fetchInvoices = async () => {
    try {
      const res = await api.get("/invoices");
      setInvoices(res.data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    const fetchData = async () => {
      try {
        const [cusRes, prodRes] = await Promise.all([
          api.get("/customers"),
          api.get("/products"),
        ]);
        setCustomers(cusRes.data);
        setProducts(prodRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const addLineItem = () => {
    setLineItems([...lineItems, { productId: "", quantity: 0, unitPrice: 0 }]);
  };

  const removeLineItem = (idx: number) => {
    setLineItems(lineItems.filter((_, i) => i !== idx));
  };

  const updateLineItem = (idx: number, field: string, value: any) => {
    const updated = [...lineItems];
    updated[idx] = { ...updated[idx], [field]: value };
    setLineItems(updated);
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
    try {
      const productRes = await api.get(`/products?search=${barcode}`);
      const foundProduct = productRes.data.find(
        (p: any) => p.barcode === barcode,
      );

      if (foundProduct) {
        addLineItem();
        const idx = lineItems.length;
        updateLineItem(idx, "productId", foundProduct.id);
        updateLineItem(idx, "unitPrice", foundProduct.sellingPrice);
        setFormData({ ...formData, barcodeInput: "" });
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

    setSubmitting(true);
    try {
      await api.post("/invoices", {
        customerId: formData.customerId,
        lineItems: lineItems.map((item) => ({
          productId: item.productId,
          quantity: parseInt(String(item.quantity)),
          unitPrice: parseFloat(String(item.unitPrice)),
        })),
        notes: formData.notes || "",
      });
      setShowForm(false);
      setFormData({ customerId: "", notes: "", gst: 18, barcodeInput: "" });
      setLineItems([{ productId: "", quantity: 0, unitPrice: 0 }]);
      fetchInvoices();
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Failed to create invoice");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-slate-500">Loading billing...</div>;
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
                  <div key={idx} className="flex gap-2 items-end">
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
                          {p.name} ({formatINR(p.sellingPrice)})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateLineItem(
                          idx,
                          "quantity",
                          parseInt(e.target.value),
                        )
                      }
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-sm"
                      placeholder="Qty"
                      title="Quantity"
                    />
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
                    Subtotal
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    GST (18%)
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.map((invoice) => (
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
                    <td className="px-6 py-4">{formatINR(invoice.subtotal)}</td>
                    <td className="px-6 py-4">
                      {formatINR(invoice.gstAmount)}
                    </td>
                    <td className="px-6 py-4 font-bold">
                      {formatINR(invoice.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded ${
                          invoice.status === "created"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
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
            <div className="bg-white border border-slate-200 rounded-xl p-6 sticky top-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold">Invoice Details</h3>
                <button
                  className="text-slate-400 hover:text-slate-600"
                  onClick={() => setSelectedInvoice(null)}
                >
                  ✕
                </button>
              </div>

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
                  <p className="text-xs text-slate-500 uppercase">Customer</p>
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
                    {new Date(selectedInvoice.invoiceDate).toLocaleDateString(
                      "en-IN",
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-2 py-4 border-b">
                <h4 className="font-bold text-slate-900 mb-3">Line Items</h4>
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
                  <span>{formatINR(selectedInvoice.totalAmount)}</span>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="mt-4 p-3 bg-slate-50 rounded text-sm text-slate-700">
                  <p className="text-xs text-slate-500 uppercase mb-1">Notes</p>
                  <p>{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
