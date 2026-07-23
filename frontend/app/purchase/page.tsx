"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatINR } from "@/lib/currency";
import { useSettings } from "@/hooks/useSettings";
import ScanBillModal, { ExtractedBillData } from "@/components/purchase/ScanBillModal";

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

  const titleCase = status
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return {
    label: titleCase || "Unknown",
    className: "bg-slate-100 text-slate-700",
  };
};

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

type CategoryOption = { name?: string };

export default function PurchasePage() {
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null,
  );
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [purchaseEditForm, setPurchaseEditForm] = useState({
    status: "Pending",
    notes: "",
  });
  const [showForm, setShowForm] = useState(false);
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
  const [submitting, setSubmitting] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { productId: "", quantity: 0, unitPrice: 0 },
  ]);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const { settings } = useSettings();
  const [applyGst, setApplyGst] = useState(true);
  const [formData, setFormData] = useState({
    supplierId: "",
    notes: "",
    gst: 18,
    barcodeInput: "",
    paymentMethod: "upi",
    paymentStatus: "Paid",
    paidAmount: "",
  });

  const handleApplyExtractedBill = (data: ExtractedBillData) => {
    // Reset previous purchase form state completely before applying newly scanned bill
    setFormData((prev) => ({
      ...prev,
      supplierId: "",
      notes: "",
    }));
    setSupplierSearch("");
    setLineItems([]);

    // Attempt auto supplier match
    if (data.supplierName) {
      const matchSup = suppliers.find(
        (s) =>
          s.name.toLowerCase().includes(data.supplierName!.toLowerCase()) ||
          data.supplierName!.toLowerCase().includes(s.name.toLowerCase())
      );
      if (matchSup) {
        setFormData((prev) => ({ ...prev, supplierId: matchSup.id }));
      } else {
        setSupplierSearch(data.supplierName);
      }
    }

    // Set notes / invoice metadata
    if (data.invoiceNumber || data.invoiceDate) {
      setFormData((prev) => ({
        ...prev,
        notes: `Inv: ${data.invoiceNumber || "N/A"} | Date: ${data.invoiceDate || "N/A"}`,
      }));
    }

    const newItems: LineItem[] = data.lineItems.map((item: any) => {
      // User requested to ALWAYS use the existing product's purchase price if it exists
      let price = item.pastPrice ?? item.purchaseRate ?? item.unitPrice ?? 0;
      
      return {
        productId: item.matchedProductId || "",
        productName: item.productName,
        category: item.category || "General",
        quantity: item.quantity || 1,
        unitPrice: price,
      };
    });

    setLineItems(newItems.length > 0 ? newItems : [{ productId: "", quantity: 0, unitPrice: 0 }]);
    setShowForm(true);
  };

  useEffect(() => {
    if (settings) {
      setApplyGst(settings.taxCalculation ?? true);
      setFormData((prev) => ({
        ...prev,
        gst: settings.defaultGst ?? 18,
      }));
    }
  }, [settings]);

  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get<CategoryOption[]>('/categories');
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

  const filteredSuppliers = useMemo(() => {
    const query = supplierSearch.trim().toLowerCase();
    if (!query) return suppliers.slice(0, 100);
    return suppliers.filter((s) => s.name.toLowerCase().includes(query)).slice(0, 100);
  }, [suppliers, supplierSearch]);

  const supplierOptions = useMemo(() => {
    const list = [...filteredSuppliers];
    if (formData.supplierId && !list.some((s) => s.id === formData.supplierId)) {
      const selectedSup = suppliers.find((s) => s.id === formData.supplierId);
      if (selectedSup) {
        list.push(selectedSup);
      }
    }
    return list;
  }, [filteredSuppliers, formData.supplierId, suppliers]);

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
    const updated = [...lineItems];
    updated[idx] = { ...updated[idx], [field]: value };
    setLineItems(updated);
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
    try {
      const productRes = await api.get(`/products?search=${barcode}`);
      const foundProduct = productRes.data.find(
        (p: Product) => p.barcode === barcode,
      );

      if (foundProduct) {
        addLineItem();
        const idx = lineItems.length;
        updateLineItem(idx, "productId", foundProduct.id);
        updateLineItem(idx, "unitPrice", foundProduct.purchasePrice);
        updateLineItem(idx, "quantity", 1);
        updateLineItem(idx, "productName", foundProduct.name);
        setFormData({ ...formData, barcodeInput: "" });
      } else {
        alert("Product not found");
      }
    } catch (error) {
      console.error("Error scanning barcode:", error);
      alert("Failed to scan barcode");
    }
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
        gstRate: applyGst ? formData.gst : 0,
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
      setLineItems([
        { productId: "", productName: "", quantity: 0, unitPrice: 0 },
      ]);
      await Promise.all([
        refetchPurchases(),
        refetchSuppliers(),
        refetchProducts(),
      ]);
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

  const loading =
    purchasesLoading || suppliersLoading || productsLoading || categoriesLoading;

  if (loading) {
    return <div className="text-slate-500">Loading purchases...</div>;
  }

  const totalPurchased = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const averagePurchase =
    purchases.length > 0 ? totalPurchased / purchases.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Purchases</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowScanModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-sm font-medium flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">document_scanner</span>
            Scan Purchase Bill
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Create PO
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold">Create Purchase Order</h2>
          <form onSubmit={handleCreatePurchase} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Supplier *
                </label>
                <input
                  type="text"
                  value={supplierSearch}
                  onChange={(e) => setSupplierSearch(e.target.value)}
                  placeholder="Search supplier..."
                  className="w-full mb-2 px-3 py-2 border border-slate-300 rounded-lg"
                />
                <select
                  value={formData.supplierId}
                  onChange={(e) =>
                    setFormData({ ...formData, supplierId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Select supplier</option>
                  {supplierOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  GST % (Editable)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.gst || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gst: parseFloat(e.target.value) || 18,
                      })
                    }
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="18"
                  />
                  <button
                    type="button"
                    onClick={() => setApplyGst(!applyGst)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      applyGst
                        ? "bg-blue-600 text-white"
                        : "bg-slate-300 text-slate-700"
                    }`}
                  >
                    {applyGst ? "Applied" : "Skip"}
                  </button>
                </div>
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
              <div className="relative mb-2">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </span>
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-1 border border-slate-300 rounded text-sm"
                />
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
                        if (prod) {
                          updateLineItem(idx, "unitPrice", prod.purchasePrice);
                          updateLineItem(idx, "productName", prod.name);
                          if (!item.quantity || item.quantity <= 0) {
                            updateLineItem(idx, "quantity", 1);
                          }
                        }
                      }}
                      className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm"
                    >
                      <option value="">Select product</option>
                      {getProductOptionsForLineItem(item.productId).map((p) => (
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
                      className="w-32 px-2 py-1 border border-slate-300 rounded text-sm"
                      placeholder="Manual name"
                      title="Manual Product Name"
                    />
                    <select
                      value={item.category || ""}
                      onChange={(e) =>
                        updateLineItem(idx, "category", e.target.value)
                      }
                      className="w-32 px-2 py-1 border border-slate-300 rounded text-sm"
                    >
                      <option value="">Category</option>
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                      <option value="General">General</option>
                    </select>
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
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-sm"
                      placeholder="Qty"
                      title="Quantity"
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
                placeholder="PO notes..."
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {submitting ? "Creating..." : "Create PO"}
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

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="bg-white border border-slate-200 p-5 rounded-xl">
          <p className="text-slate-500 text-sm mb-2">Total Purchases</p>
          <h2 className="text-3xl font-bold">{formatINR(totalPurchased)}</h2>
          <p className="text-xs text-slate-500 mt-2">
            {purchases.length} purchase orders
          </p>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl">
          <p className="text-slate-500 text-sm mb-2">Average Purchase</p>
          <h2 className="text-3xl font-bold">{formatINR(averagePurchase)}</h2>
          <p className="text-xs text-slate-500 mt-2">Per purchase order</p>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl">
          <p className="text-slate-500 text-sm mb-2">Quick View</p>
          <h2 className="text-3xl font-bold">
            {purchases[0] ? "Latest" : "Empty"}
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            {purchases[0]
              ? `${purchases[0].purchaseNumber} • ${purchases[0].supplier.name}`
              : "Create a purchase order to see it here"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full min-w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    PO #
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Items
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Subtotal
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    GST
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {purchases.map((purchase) => {
                  const statusMeta = getPurchaseStatusMeta(purchase.status);

                  return (
                    <tr
                      key={purchase.id}
                      className="hover:bg-slate-50 cursor-pointer"
                      onClick={() => setSelectedPurchase(purchase)}
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {purchase.purchaseNumber}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {purchase.supplier.name}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {purchase.lineItems.length}
                      </td>
                      <td className="px-6 py-4">
                        {formatINR(purchase.subtotal)}
                      </td>
                      <td className="px-6 py-4">
                        {formatINR(purchase.gstAmount)}
                      </td>
                      <td className="px-6 py-4 font-bold">
                        {formatINR(purchase.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${statusMeta.className}`}
                        >
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {new Date(purchase.purchaseDate).toLocaleDateString(
                          "en-IN",
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {purchases.length === 0 && (
              <div className="px-6 py-8 text-center text-slate-500">
                No purchases
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sticky top-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">
                  {selectedPurchase ? "Purchase Details" : "Purchase Overview"}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedPurchase
                    ? "Full PO view with line items, totals, and editing."
                    : "Select a purchase to see all cart details clearly on the right."}
                </p>
              </div>
              {selectedPurchase && (
                <button
                  className="text-slate-400 hover:text-slate-600"
                  onClick={() => setSelectedPurchase(null)}
                >
                  ✕
                </button>
              )}
            </div>

            {!selectedPurchase ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-xs uppercase text-slate-500">Orders</p>
                    <p className="mt-1 text-2xl font-bold">
                      {purchases.length}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-xs uppercase text-slate-500">Value</p>
                    <p className="mt-1 text-2xl font-bold">
                      {formatINR(totalPurchased)}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                  Open a purchase row to view the supplier, full line items,
                  totals, status, and notes without losing the table.
                </div>
              </div>
            ) : !editingPurchase ? (
              <>
                <div className="space-y-4 pb-4 border-b">
                  <div>
                    <p className="text-xs text-slate-500 uppercase">
                      PO Number
                    </p>
                    <p className="font-bold text-slate-900">
                      {selectedPurchase.purchaseNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Supplier</p>
                    <p className="font-bold text-slate-900">
                      {selectedPurchase.supplier.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Date</p>
                    <p className="font-bold text-slate-900">
                      {new Date(
                        selectedPurchase.purchaseDate,
                      ).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 py-4 border-b">
                  <h4 className="font-bold text-slate-900 mb-3">Line Items</h4>
                  {selectedPurchase.lineItems.map((item, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-slate-200 p-3"
                    >
                      <div className="flex justify-between gap-3 text-sm">
                        <span className="text-slate-700 font-medium">
                          {item.product.name}
                        </span>
                        <span className="font-semibold">
                          {formatINR(item.quantity * item.unitPrice)}
                        </span>
                      </div>
                      <div className="mt-1 flex justify-between text-xs text-slate-500">
                        <span>Qty: {item.quantity}</span>
                        <span>Rate: {formatINR(item.unitPrice)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 py-4">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-medium">
                      {formatINR(selectedPurchase.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">GST (18%)</span>
                    <span className="font-medium">
                      {formatINR(selectedPurchase.gstAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>{formatINR(selectedPurchase.totalAmount)}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                  <p className="text-xs text-slate-500 uppercase mb-1">
                    Status
                  </p>
                  <span
                    className={`inline-flex items-center justify-center px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${getPurchaseStatusMeta(selectedPurchase.status).className}`}
                  >
                    {getPurchaseStatusMeta(selectedPurchase.status).label}
                  </span>
                </div>

                {selectedPurchase.notes && (
                  <div className="mt-4 p-3 bg-slate-50 rounded text-sm text-slate-700">
                    <p className="text-xs text-slate-500 uppercase mb-1">
                      Notes
                    </p>
                    <p>{selectedPurchase.notes}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => openPurchaseEditor(selectedPurchase)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-700 transition"
                >
                  Edit Purchase
                </button>
              </>
            ) : (
              <form onSubmit={handleUpdatePurchase} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    value={purchaseEditForm.status}
                    onChange={(e) =>
                      setPurchaseEditForm({
                        ...purchaseEditForm,
                        status: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Received">Received</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Notes
                  </label>
                  <textarea
                    value={purchaseEditForm.notes}
                    onChange={(e) =>
                      setPurchaseEditForm({
                        ...purchaseEditForm,
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
                    onClick={() => setEditingPurchase(null)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <ScanBillModal
        isOpen={showScanModal}
        onClose={() => setShowScanModal(false)}
        categories={categoryOptions}
        onApplyExtractedData={handleApplyExtractedBill}
      />
    </div>
  );
}
