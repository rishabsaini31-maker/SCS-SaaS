"use client";

import { useEffect, useState } from "react";
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
  category?: string;
  quantity: number;
  unitPrice: number;
};

export default function PurchasePage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null,
  );
  const [showForm, setShowForm] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { productId: "", quantity: 0, unitPrice: 0 },
  ]);
  const [formData, setFormData] = useState({
    supplierId: "",
    notes: "",
    gst: 18,
    barcodeInput: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [purchaseRes, supRes, prodRes] = await Promise.all([
          api.get("/purchases"),
          api.get("/suppliers"),
          api.get("/products"),
        ]);
        setPurchases(purchaseRes.data);
        setSuppliers(supRes.data);
        setProducts(prodRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const categoryOptions = Array.from(
    new Set(
      products
        .map((product) => product.category)
        .filter((category): category is string => Boolean(category)),
    ),
  );

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
    const gst = subtotal * (formData.gst / 100);
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
    if (
      !formData.supplierId ||
      lineItems.some((item) => !item.productId || item.quantity === 0)
    ) {
      alert("Please select supplier and add line items");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/purchases", {
        supplierId: formData.supplierId,
        lineItems: lineItems.map((item) => ({
          productId: item.productId,
          category: item.category || undefined,
          quantity: parseInt(String(item.quantity)),
          unitPrice: parseFloat(String(item.unitPrice)),
        })),
        notes: formData.notes || "",
      });
      setShowForm(false);
      setFormData({ supplierId: "", notes: "", gst: 18, barcodeInput: "" });
      setLineItems([{ productId: "", quantity: 0, unitPrice: 0 }]);
      fetchPurchases();
    } catch (error) {
      console.error("Error creating purchase:", error);
      alert("Failed to create purchase order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-slate-500">Loading purchases...</div>;
  }

  const totalPurchased = purchases.reduce((sum, p) => sum + p.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Purchases</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Create PO
        </button>
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
                <select
                  value={formData.supplierId}
                  onChange={(e) =>
                    setFormData({ ...formData, supplierId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((s) => (
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
                          updateLineItem(idx, "unitPrice", prod.purchasePrice);
                      }}
                      className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm"
                    >
                      <option value="">Select product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({formatINR(p.purchasePrice)})
                        </option>
                      ))}
                    </select>
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

      {/* Summary */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl">
        <p className="text-slate-500 text-sm mb-2">Total Purchases</p>
        <h2 className="text-3xl font-bold">{formatINR(totalPurchased)}</h2>
        <p className="text-xs text-slate-500 mt-2">
          {purchases.length} purchase orders
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    PO #
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Supplier
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
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {purchases.map((purchase) => (
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
                    <td className="px-6 py-4">
                      {formatINR(purchase.subtotal)}
                    </td>
                    <td className="px-6 py-4">
                      {formatINR(purchase.gstAmount)}
                    </td>
                    <td className="px-6 py-4 font-bold">
                      {formatINR(purchase.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {new Date(purchase.purchaseDate).toLocaleDateString(
                        "en-IN",
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {purchases.length === 0 && (
              <div className="px-6 py-8 text-center text-slate-500">
                No purchases
              </div>
            )}
          </div>
        </div>

        {selectedPurchase && (
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 sticky top-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold">Purchase Details</h3>
                <button
                  className="text-slate-400 hover:text-slate-600"
                  onClick={() => setSelectedPurchase(null)}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 pb-4 border-b">
                <div>
                  <p className="text-xs text-slate-500 uppercase">PO Number</p>
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
                    {new Date(selectedPurchase.purchaseDate).toLocaleDateString(
                      "en-IN",
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-2 py-4 border-b">
                <h4 className="font-bold text-slate-900 mb-3">Line Items</h4>
                {selectedPurchase.lineItems.map((item, i) => (
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

              {selectedPurchase.notes && (
                <div className="mt-4 p-3 bg-slate-50 rounded text-sm text-slate-700">
                  <p className="text-xs text-slate-500 uppercase mb-1">Notes</p>
                  <p>{selectedPurchase.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

<select
  className="w-32 px-2 py-1 border border-slate-300 rounded text-sm"
  title="Category"
>
  <option value="">Category</option>
  {categories.map((cat) => (
    <option key={cat.name} value={cat.name}>
      {cat.name}
    </option>
  ))}
  <option value="General">General</option>
</select>;
const [supRes, prodRes, catRes] = await Promise.all([
  api.get("/suppliers"),
  api.get("/products"),
  api.get("/categories"),
]);
setSuppliers(supRes.data);
setProducts(prodRes.data);
setCategories(catRes.data);
