"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatINR } from "@/lib/currency";

type Purchase = {
  id: string;
  purchaseNumber: string;
  supplier: { name: string };
  lineItems: {
    quantity: number;
    unitPrice: number;
    product: { name: string };
  }[];
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  status: string;
  purchaseDate: string;
  notes?: string;
};

type Supplier = { id: string; name: string; email: string };
type Product = {
  id: string;
  name: string;
  purchasePrice: number;
  barcode?: string;
  category?: string;
};

type LineItem = {
  productId: string;
  productName?: string;
  category?: string;
  quantity: number;
  unitPrice: number;
};

const getPurchaseStatusMeta = (status: string) => {
  const normalized = status.trim().toLowerCase();

  if (normalized === "received") {
    return { label: "Received", className: "bg-emerald-50 text-emerald-700" };
  }
  if (normalized === "pending") {
    return { label: "Pending", className: "bg-amber-50 text-amber-700" };
  }
  if (normalized === "cancelled") {
    return { label: "Cancelled", className: "bg-rose-50 text-rose-700" };
  }

  return { label: status, className: "bg-slate-100 text-slate-700" };
};

export default function MobilePurchasePage() {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { productId: "", quantity: 0, unitPrice: 0 },
  ]);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [formData, setFormData] = useState({
    supplierId: "",
    notes: "",
    gst: 18,
    barcodeInput: "",
    paymentMethod: "upi",
    paymentStatus: "Paid",
    paidAmount: "",
  });
  const [applyGst, setApplyGst] = useState(true);
  const [productSearch, setProductSearch] = useState("");

  const {
    data: products = [],
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get<Product[]>("/products");
      return res.data;
    },
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get<{ name?: string }[]>("/categories");
      return res.data;
    },
  });

  const categoryOptions = Array.from(
    new Set([
      ...products
        .map((product) => product.category)
        .filter((category): category is string => Boolean(category)),
      ...categories
        .map((category) => category.name?.trim())
        .filter((category): category is string => Boolean(category)),
    ]),
  ).sort((a, b) => a.localeCompare(b));

  const {
    data: purchases = [],
    isLoading: purchasesLoading,
    refetch: refetchPurchases,
  } = useQuery({
    queryKey: ["purchases"],
    queryFn: async () => {
      const res = await api.get<Purchase[]>("/purchases");
      return res.data;
    },
  });

  const {
    data: suppliers = [],
    isLoading: suppliersLoading,
    refetch: refetchSuppliers,
  } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const res = await api.get<Supplier[]>("/suppliers");
      return res.data;
    },
  });

  const loading =
    purchasesLoading || suppliersLoading || productsLoading || categoriesLoading;
  const totalPurchased = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const averagePurchase =
    purchases.length > 0 ? totalPurchased / purchases.length : 0;

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
    const updated = [...lineItems];
    updated[idx] = { ...updated[idx], [field]: value };
    setLineItems(updated);
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    const gst = applyGst ? subtotal * (formData.gst / 100) : 0;
    return { subtotal, gst, total: subtotal + gst };
  };

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    const validLineItems = lineItems.filter((item) => {
      const hasProductRef =
        Boolean(item.productId) || Boolean(item.productName?.trim());
      return hasProductRef && item.quantity > 0 && item.unitPrice > 0;
    });
    const { total } = calculateTotals();
    const isPending = formData.paymentStatus === "Pending";
    const paidAmount = isPending
      ? Math.max(0, Number(formData.paidAmount) || 0)
      : total;

    if (!formData.supplierId || validLineItems.length === 0) {
      alert("Please select supplier and add line items");
      return;
    }

    if (paidAmount > total) {
      alert("Paid amount cannot be greater than total amount");
      return;
    }

    setSubmitting(true);
    try {
      const purchaseRes = await api.post("/purchases", {
        supplierId: formData.supplierId,
        lineItems: validLineItems.map((item) => ({
          productId: item.productId || undefined,
          productName: item.productName || undefined,
          category: item.category || undefined,
          quantity: parseInt(String(item.quantity)),
          unitPrice: parseFloat(String(item.unitPrice)),
        })),
        notes: formData.notes || "",
      });

      if (paidAmount > 0) {
        await api.post("/payments", {
          supplierId: formData.supplierId,
          purchaseId: purchaseRes.data.id,
          amount: paidAmount,
          paymentMethod: formData.paymentMethod,
          notes: `Payment for purchase ${purchaseRes.data.purchaseNumber}`,
        });
      }

      setShowForm(false);
      setFormData({
        supplierId: "",
        notes: "",
        gst: 18,
        barcodeInput: "",
        paymentMethod: "upi",
        paymentStatus: "Paid",
        paidAmount: "",
      });
      setLineItems([{ productId: "", productName: "", quantity: 0, unitPrice: 0 }]);
      await Promise.all([refetchPurchases(), refetchSuppliers(), refetchProducts()]);
    } catch (error) {
      console.error("Error creating purchase:", error);
      alert("Failed to create purchase order");
    } finally {
      setSubmitting(false);
    }
  };

  const openPurchaseEditor = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setPurchaseEditForm({
      status: purchase.status,
      notes: purchase.notes || "",
    });
  };

  const handleUpdatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPurchase) return;

    setSubmitting(true);
    try {
      await api.patch(`/purchases/${editingPurchase.id}`, purchaseEditForm);
      setEditingPurchase(null);
      setSelectedPurchase(null);
      await refetchPurchases();
    } catch (error) {
      console.error("Error updating purchase:", error);
      alert("Failed to update purchase");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading purchases...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Purchases</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
        >
          + New
        </button>
      </div>

      {!showForm && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase">Total</p>
            <p className="text-lg font-bold text-slate-900">
              {formatINR(totalPurchased)}
            </p>
            <p className="text-xs text-slate-500">{purchases.length} orders</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase">Average</p>
            <p className="text-lg font-bold text-slate-900">
              {formatINR(averagePurchase)}
            </p>
            <p className="text-xs text-slate-500">Per order</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
          <h2 className="text-lg font-semibold">Create Purchase</h2>
          <form onSubmit={handleCreatePurchase} className="space-y-4">
            <div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </span>
                <input
                  type="text"
                  value={supplierSearch}
                  onChange={(e) => setSupplierSearch(e.target.value)}
                  placeholder="Search supplier..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg text-base mb-2"
                  list="supplier-datalist"
                />
              </div>
              <datalist id="supplier-datalist">
                {suppliers.map((s) => (
                  <option key={s.id} value={s.name} />
                ))}
              </datalist>
              <select
                value={formData.supplierId}
                onChange={(e) => {
                  setFormData({ ...formData, supplierId: e.target.value });
                  const selectedSupplier = suppliers.find(s => s.id === e.target.value);
                  if (selectedSupplier) setSupplierSearch(selectedSupplier.name);
                }}
                className="w-full px-3 py-3 border border-slate-300 rounded-lg text-base"
              >
                <option value="">Select supplier</option>
                {suppliers
                  .filter((s) =>
                    supplierSearch
                      ? s.name.toLowerCase().includes(supplierSearch.toLowerCase())
                      : true,
                  )
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
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
                      const foundProduct = products.find(
                        (p) => p.barcode === formData.barcodeInput,
                      );
                      if (foundProduct) {
                        addLineItem();
                        const idx = lineItems.length;
                        updateLineItem(idx, "productId", foundProduct.id);
                        updateLineItem(idx, "quantity", 1);
                        updateLineItem(idx, "unitPrice", foundProduct.purchasePrice);
                        setFormData({ ...formData, barcodeInput: "" });
                      }
                    }
                  }}
                  className="flex-1 px-3 py-3 border border-slate-300 rounded-lg text-base"
                  placeholder="Scan barcode or enter product code (Press Enter)"
                />
                <button
                  type="button"
                  onClick={() => {
                    const foundProduct = products.find(
                      (p) => p.barcode === formData.barcodeInput,
                    );
                    if (foundProduct) {
                      addLineItem();
                      const idx = lineItems.length;
                      updateLineItem(idx, "productId", foundProduct.id);
                      updateLineItem(idx, "quantity", 1);
                      updateLineItem(idx, "unitPrice", foundProduct.purchasePrice);
                      setFormData({ ...formData, barcodeInput: "" });
                    }
                  }}
                  className="px-4 py-3 bg-slate-600 text-white rounded-lg"
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
                      const emptyIdx = lineItems.findIndex((li) => !li.productId && !li.productName);
                      if (emptyIdx >= 0) {
                        updateLineItem(emptyIdx, "productId", exactMatch.id);
                        updateLineItem(emptyIdx, "quantity", 1);
                        updateLineItem(emptyIdx, "unitPrice", exactMatch.purchasePrice);
                        setProductSearch("");
                      }
                    }
                  }}
                  placeholder="Search products... (exact match auto-selects)"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm"
                  list="purchase-product-datalist"
                />
              </div>
              <datalist id="purchase-product-datalist">
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
                        const prod = products.find((p) => p.id === e.target.value);
                        updateLineItem(idx, "productId", e.target.value);
                        if (prod) {
                          updateLineItem(idx, "unitPrice", prod.purchasePrice);
                          updateLineItem(idx, "productName", prod.name);
                        }
                      }}
                      className="w-full mb-2 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="">Select product</option>
                      {products
                        .filter((p) =>
                          productSearch
                            ? p.name.toLowerCase().includes(productSearch.toLowerCase())
                            : true,
                        )
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({formatINR(p.purchasePrice)})
                          </option>
                        ))}
                    </select>
                    <input
                      type="text"
                      value={item.productName || ""}
                      onChange={(e) =>
                        updateLineItem(idx, "productName", e.target.value)
                      }
                      className="w-full mb-2 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder="Or enter manual name"
                    />
                    <select
                      value={item.category || ""}
                      onChange={(e) =>
                        updateLineItem(idx, "category", e.target.value)
                      }
                      className="w-full mb-2 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="">Category</option>
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={item.quantity || ""}
                        onChange={(e) =>
                          updateLineItem(
                            idx,
                            "quantity",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        placeholder="Qty"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitPrice || ""}
                        onChange={(e) =>
                          updateLineItem(
                            idx,
                            "unitPrice",
                            parseFloat(e.target.value) || 0,
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
                const isPending = formData.paymentStatus === "Pending";

return (
                    <>
                      <div className="flex justify-between">
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

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                      <select
                        value={formData.paymentStatus}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentStatus: e.target.value,
                          })
                        }
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      >
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                      </select>

                      {isPending && (
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
                {submitting ? "Creating..." : "Create Purchase"}
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
        {purchases.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No purchases yet</p>
        ) : (
          purchases.slice(0, 20).map((purchase) => {
            const statusMeta = getPurchaseStatusMeta(purchase.status);

            return (
              <div
                key={purchase.id}
                className="bg-white border border-slate-200 rounded-xl p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {purchase.purchaseNumber}
                    </p>
                    <p className="text-sm text-slate-600">
                      {purchase.supplier.name}
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
                    {new Date(purchase.purchaseDate).toLocaleDateString("en-IN")}
                  </p>
                  <p className="font-semibold">{formatINR(purchase.totalAmount)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}