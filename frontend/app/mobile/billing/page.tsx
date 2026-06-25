"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatINR } from "@/lib/currency";
import { useSettings } from "@/hooks/useSettings";

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

const getInvoiceStatusMeta = (status: string) => {
  const normalized = status.trim().toLowerCase();

  if (normalized === "paid") {
    return { label: "Paid", className: "bg-emerald-50 text-emerald-700" };
  }
  if (normalized === "pending") {
    return { label: "Pending", className: "bg-amber-50 text-amber-700" };
  }
  if (normalized === "partial") {
    return { label: "Partial", className: "bg-orange-50 text-orange-700" };
  }
  if (normalized === "cancelled") {
    return { label: "Cancelled", className: "bg-rose-50 text-rose-700" };
  }
  if (normalized === "created") {
    return { label: "Created", className: "bg-blue-50 text-blue-600" };
  }

  return { label: status, className: "bg-slate-100 text-slate-700" };
};

const formatShortDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });

export default function MobileBillingPage() {
  const queryClient = useQueryClient();
  const barcodeInputRef = useRef<HTMLInputElement | null>(null);
  const barcodeScanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { productId: "", quantity: 0, unitPrice: 0 },
  ]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const { settings } = useSettings();
  const [applyGst, setApplyGst] = useState(true);
  const [formData, setFormData] = useState({
    customerId: "",
    notes: "",
    gst: 18,
    barcodeInput: "",
    paymentMethod: "upi",
    paymentStatus: "Paid",
    paidAmount: "",
  });

  useEffect(() => {
    if (settings) {
      setApplyGst(settings.taxCalculation ?? true);
      setFormData((prev) => ({
        ...prev,
        gst: settings.defaultGst ?? 18,
      }));
    }
  }, [settings]);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    gstin: "",
  });
  const [submittingCustomer, setSubmittingCustomer] = useState(false);

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

  const loading =
    invoicesLoading || customersLoading || productsLoading || paymentsLoading;
  const hasError =
    invoicesError || customersError || productsError || paymentsError;

  useEffect(() => {
    if (showForm) {
      barcodeInputRef.current?.focus();
      barcodeInputRef.current?.select();
    }
  }, [showForm]);

  useEffect(() => {
    return () => {
      if (barcodeScanTimerRef.current) {
        clearTimeout(barcodeScanTimerRef.current);
      }
    };
  }, []);

  const invoicePaidAmounts = useMemo(() => {
    const map = new Map<string, number>();
    payments.forEach((p) => {
      if (p.invoiceId) {
        map.set(p.invoiceId, (map.get(p.invoiceId) || 0) + p.amount);
      }
    });
    return map;
  }, [payments]);

  const getInvoicePaidAmount = (invoiceId: string) =>
    invoicePaidAmounts.get(invoiceId) || 0;

  const filteredCustomers = useMemo(() => {
    const query = customerSearch.trim().toLowerCase();
    if (!query) return customers.slice(0, 100);
    return customers.filter((c) => c.name.toLowerCase().includes(query)).slice(0, 100);
  }, [customers, customerSearch]);

  const customerOptions = useMemo(() => {
    const list = [...filteredCustomers];
    if (formData.customerId && !list.some((c) => c.id === formData.customerId)) {
      const selectedCust = customers.find((c) => c.id === formData.customerId);
      if (selectedCust) {
        list.push(selectedCust);
      }
    }
    return list;
  }, [filteredCustomers, formData.customerId, customers]);

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return products.slice(0, 100);
    return products.filter((p) => p.name.toLowerCase().includes(query)).slice(0, 100);
  }, [products, productSearch]);

  const getProductOptionsForLineItem = (selectedProductId: string) => {
    const list = [...filteredProducts];
    if (selectedProductId && !list.some((p) => p.id === selectedProductId)) {
      const selectedProd = products.find((p) => p.id === selectedProductId);
      if (selectedProd) {
        list.push(selectedProd);
      }
    }
    return list;
  };

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
    const gst = applyGst ? (subtotal * (formData.gst / 100)) : 0;
    return { subtotal, gst, total: subtotal + gst };
  };

  const handleBarcodeInput = async (barcode: string) => {
    const code = barcode.trim();
    if (!code) return;

    if (barcodeScanTimerRef.current) {
      clearTimeout(barcodeScanTimerRef.current);
      barcodeScanTimerRef.current = null;
    }

    try {
      const foundInCache = products.find((p) => p.barcode === code);
      const foundProduct = foundInCache
        ? foundInCache
        : (
            await api.get<Product[]>("/products", { params: { barcode: code } })
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
        window.requestAnimationFrame(() => {
          barcodeInputRef.current?.focus();
        });
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
        gstRate: applyGst ? formData.gst : 0,
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

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.name || !newCustomerForm.phone) {
      alert("Please fill name and phone number");
      return;
    }

    setSubmittingCustomer(true);
    try {
      const res = await api.post("/customers", {
        ...newCustomerForm,
        status: "active",
      });
      setShowAddCustomerModal(false);
      setNewCustomerForm({ name: "", email: "", phone: "", address: "", gstin: "" });
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      setFormData(prev => ({ ...prev, customerId: res.data.id }));
      setCustomerSearch("");
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("Failed to add customer. Email might already exist.");
    } finally {
      setSubmittingCustomer(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading billing...</div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Failed to load billing data.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
        >
          + New
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
          <h2 className="text-lg font-semibold">Create Invoice</h2>
          <form onSubmit={handleCreateInvoice} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Customer *</label>
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(true)}
                  className="text-sm text-blue-600 font-medium"
                >
                  + Add
                </button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </span>
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCustomerSearch(value);
                    const exactMatch = customers.find(
                      (c) => c.name.toLowerCase() === value.toLowerCase(),
                    );
                    if (exactMatch) setFormData({ ...formData, customerId: exactMatch.id });
                  }}
                  placeholder="Search customer..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg text-base mb-2"
                  list="customer-datalist"
                />
              </div>
              <datalist id="customer-datalist">
                {customers.map((c) => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
              <select
                value={formData.customerId}
                onChange={(e) => {
                  setFormData({ ...formData, customerId: e.target.value });
                  const selectedCustomer = customers.find(c => c.id === e.target.value);
                  if (selectedCustomer) setCustomerSearch(selectedCustomer.name);
                }}
                className="w-full px-3 py-3 border border-slate-300 rounded-lg text-base"
              >
                <option value="">Select customer</option>
                {customerOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Scan Barcode
              </label>
              <div className="flex gap-2">
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={formData.barcodeInput}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    setFormData({ ...formData, barcodeInput: nextValue });

                    if (barcodeScanTimerRef.current) {
                      clearTimeout(barcodeScanTimerRef.current);
                    }

                    const trimmed = nextValue.trim();
                    if (!trimmed) return;

                    barcodeScanTimerRef.current = setTimeout(() => {
                      void handleBarcodeInput(trimmed);
                    }, 180);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void handleBarcodeInput(formData.barcodeInput);
                    }
                  }}
                  className="flex-1 px-3 py-3 border border-slate-300 rounded-lg text-base"
                  placeholder="Scan barcode"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Line Items *</label>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="text-sm text-blue-600 font-medium"
                >
                  + Add
                </button>
              </div>
              <div className="relative mb-2">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </span>
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => {
                    const value = e.target.value;
                    setProductSearch(value);
                    const exactMatch = products.find(
                      (p) => p.name.toLowerCase() === value.toLowerCase(),
                    );
                    if (exactMatch) {
                      const emptyIdx = lineItems.findIndex((li) => !li.productId);
                      if (emptyIdx >= 0) {
                        updateLineItem(emptyIdx, "productId", exactMatch.id);
                        updateLineItem(emptyIdx, "quantity", 1);
                        updateLineItem(emptyIdx, "unitPrice", exactMatch.sellingPrice);
                        setProductSearch("");
                      }
                    }
                  }}
                  placeholder="Search products... (exact match auto-selects)"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm"
                  list="product-datalist"
                />
              </div>
              <datalist id="product-datalist">
                {products.map((p) => (
                  <option key={p.id} value={p.name} />
                ))}
              </datalist>
              <div className="space-y-3">
                {lineItems.map((item, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-3">
                    <select
                      value={item.productId}
                      onChange={(e) => {
                        const prod = products.find(
                          (p) => p.id === e.target.value,
                        );
                        updateLineItem(idx, "productId", e.target.value);
                        if (prod)
                          updateLineItem(
                            idx,
                            "unitPrice",
                            prod.sellingPrice,
                          );
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="">Select product</option>
                      {getProductOptionsForLineItem(item.productId).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Stock: {p.stock})
                        </option>
                      ))}
                    </select>
                    <div className="grid grid-cols-2 gap-2">
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
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        placeholder="Quantity"
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
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        placeholder="Price"
                      />
                    </div>
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(idx)}
                        className="mt-2 text-xs text-red-600 font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

<div className="bg-slate-50 rounded-lg p-3 space-y-2">
              {(() => {
                const { subtotal, gst, total } = calculateTotals();
                const { paymentStatus } = formData;

                return (
                  <>
                    <div className="flex justify-between items-center">
                      <span>Subtotal:</span>
                      <span>{formatINR(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span>GST ({formData.gst}%):</span>
                        <button
                          type="button"
                          onClick={() => setApplyGst(!applyGst)}
                          className={`px-2 py-0.5 text-xs rounded font-medium ${
                            applyGst
                              ? "bg-blue-600 text-white"
                              : "bg-slate-300 text-slate-700"
                          }`}
                        >
                          {applyGst ? "Applied" : "Skip"}
                        </button>
                      </div>
                      <span>{formatINR(gst)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatINR(total)}</span>
                    </div>

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

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                      <select
                        value={paymentStatus}
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
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      >
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                      </select>

                      {paymentStatus === "Pending" && (
                        <input
                          type="number"
                          step="0.01"
                          value={formData.paidAmount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              paidAmount: e.target.value,
                            })
                          }
                          className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          placeholder="Paid amount"
                        />
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium"
              >
                {submitting ? "Creating..." : "Create Invoice"}
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
        {invoices.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No invoices yet</p>
        ) : (
          invoices.slice(0, 20).map((invoice) => {
            const paidAmount = getInvoicePaidAmount(invoice.id);
            const pendingAmount = Math.max(0, invoice.totalAmount - paidAmount);
            const statusMeta = getInvoiceStatusMeta(invoice.status);

            return (
              <div
                key={invoice.id}
                className="bg-white border border-slate-200 rounded-xl p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="text-sm text-slate-600">
                      {invoice.customer.name}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-bold rounded ${statusMeta.className}`}
                  >
                    {statusMeta.label}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-500">
                    {formatShortDate(invoice.invoiceDate)}
                  </p>
                  <p className="font-semibold">{formatINR(invoice.totalAmount)}</p>
                </div>
                {pendingAmount > 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    Pending: {formatINR(pendingAmount)}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {showAddCustomerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl p-6 w-full shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Customer</h2>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    value={newCustomerForm.name}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={newCustomerForm.email}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone *</label>
                  <input
                    type="text"
                    value={newCustomerForm.phone}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="+91-XXXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={newCustomerForm.gstin}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, gstin: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="27AABCU9603R1Z0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  value={newCustomerForm.address}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Enter address"
                  rows={2}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submittingCustomer}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {submittingCustomer ? "Adding..." : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}