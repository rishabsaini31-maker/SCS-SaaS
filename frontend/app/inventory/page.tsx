"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { formatINR } from "@/lib/currency";
import { useNotifications } from "@/lib/NotificationContext";

type Product = {
  id: string;
  name: string;
  category: string;
  stock: number;
  purchasePrice: number;
  sellingPrice: number;
  gst: number;
  status: string;
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "" });
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activatingProductId, setActivatingProductId] = useState<string | null>(
    null,
  );
  const [activationForm, setActivationForm] = useState({
    sellingPrice: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    stock: "",
    purchasePrice: "",
    sellingPrice: "",
    gst: "18",
  });
  const [submitting, setSubmitting] = useState(false);
  const { setPendingProducts } = useNotifications();

  const fetchProducts = useCallback(async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get("/products"),
        api.get("/categories"),
      ]);
      setProducts(productsRes.data);
      setAvailableCategories(
        Array.from(
          new Set(
            (categoriesRes.data as Array<{ name?: string }>)
              .map((category) => category.name?.trim())
              .filter((category): category is string => Boolean(category)),
          ),
        ).sort((a, b) => a.localeCompare(b)),
      );
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const syncStoredCategories = async () => {
      const storedCategories = window.localStorage.getItem("inventoryCategories");
      if (!storedCategories) return;

      let parsedCategories: string[] = [];
      try {
        parsedCategories = JSON.parse(storedCategories) as string[];
      } catch {
        parsedCategories = [];
      }

      const normalized = Array.from(
        new Set(parsedCategories.map((category) => category.trim()).filter(Boolean)),
      );

      if (normalized.length === 0) return;

      try {
        await Promise.all(
          normalized.map((name) => api.post("/categories", { name })),
        );
        window.localStorage.removeItem("inventoryCategories");
        void fetchProducts();
      } catch (error) {
        console.error("Error syncing store categories:", error);
      }
    };

    void syncStoredCategories();
  }, [fetchProducts]);

  // Check for pending products and show activation modal
  // Show activation modal for pending products (without auto-triggering)
  useEffect(() => {
    // This effect only syncs to notification context, doesn't trigger modal automatically
    const allPendingProducts = products.filter((p) => p.status === "pending");
    setPendingProducts(
      allPendingProducts.map((p) => ({
        id: p.id,
        name: p.name,
        purchasePrice: p.purchasePrice,
      })),
    );
  }, [products, setPendingProducts]);

  const categoryOptions = Array.from(
    new Set([
      ...availableCategories,
      ...products.map((product) => product.category).filter(Boolean),
    ]),
  ).sort((a, b) => a.localeCompare(b));

  const visibleProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

  const activatingProduct = products.find(
    (product) => product.id === activatingProductId,
  );

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const value = categoryForm.name.trim();
    if (!value) return;

    api
      .post("/categories", { name: value })
      .then(() => {
        setCategoryForm({ name: "" });
        setShowCategoryForm(false);
        void fetchProducts();
      })
      .catch((error) => {
        console.error("Error adding category:", error);
        alert("Failed to add category");
      });
  };

  const handleDeleteCategory = async (category: string) => {
    const confirmed = window.confirm(
      `Delete category "${category}" from this store? Products in this category will be moved to no category.`,
    );
    if (!confirmed) return;

    try {
      await api.delete(`/categories/${encodeURIComponent(category)}`);
      if (selectedCategory === category) {
        setSelectedCategory("");
      }
      void fetchProducts();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category");
    }
  };

  const startEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setFormData({
      name: product.name,
      category: product.category || "",
      stock: String(product.stock),
      purchasePrice: String(product.purchasePrice),
      sellingPrice: String(product.sellingPrice),
      gst: String(product.gst),
    });
    setShowForm(true);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.purchasePrice || !formData.sellingPrice) {
      alert("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        category: formData.category || "General",
        stock: parseInt(formData.stock) || 0,
        purchasePrice: parseFloat(formData.purchasePrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        gst: parseFloat(formData.gst),
        status: "active",
      };

      if (editingProductId) {
        await api.patch(`/products/${editingProductId}`, payload);
      } else {
        await api.post("/products", payload);
      }
      setShowForm(false);
      setEditingProductId(null);
      setFormData({
        name: "",
        category: "",
        stock: "",
        purchasePrice: "",
        sellingPrice: "",
        gst: "18",
      });
      void fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product");
    } finally {
      setSubmitting(false);
    }
  };

  const openActivationModal = (product: Product) => {
    setActivatingProductId(product.id);
    setActivationForm({ sellingPrice: String(product.sellingPrice || "") });
    setShowActivationModal(true);
  };

  const handleActivateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activatingProductId || !activationForm.sellingPrice) {
      alert("Please enter selling price");
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/products/${activatingProductId}/activate`, {
        sellingPrice: parseFloat(activationForm.sellingPrice),
      });
      setShowActivationModal(false);
      setActivatingProductId(null);
      setActivationForm({ sellingPrice: "" });
      void fetchProducts();
    } catch (error) {
      console.error("Error activating product:", error);
      alert("Failed to activate product");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-slate-500">Loading inventory...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCategoryForm(!showCategoryForm)}
            className="px-4 py-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 transition"
          >
            + Add Category
          </button>
          <button
            onClick={() => {
              setEditingProductId(null);
              setFormData({
                name: "",
                category: "",
                stock: "",
                purchasePrice: "",
                sellingPrice: "",
                gst: "18",
              });
              setShowForm(!showForm);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Add Product
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Store Categories
              </h2>
              <p className="text-sm text-slate-500">
                Categories are isolated to this store only.
              </p>
            </div>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none"
            >
              <option value="">All categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.length > 0 ? (
              categoryOptions.map((category) => {
                const isActive = selectedCategory === category;
                const count = products.filter(
                  (product) => product.category === category,
                ).length;
                return (
                  <div
                    key={category}
                    className={`group flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                      isActive
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedCategory((current) =>
                          current === category ? "" : category,
                        )
                      }
                      className="flex items-center gap-2"
                    >
                      <span>{category}</span>
                      <span
                        className={`text-xs ${isActive ? "text-blue-100" : "text-slate-400"}`}
                      >
                        {count}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteCategory(category)}
                      className={`rounded-full p-1 text-xs font-bold transition ${
                        isActive
                          ? "text-white/80 hover:bg-white/15 hover:text-white"
                          : "text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                      }`}
                      aria-label={`Delete category ${category}`}
                      title="Delete category"
                    >
                      ×
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-slate-500">
                No categories saved for this store yet.
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-xl p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Inventory Summary
          </p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <div>
              <div className="text-3xl font-bold">{products.length}</div>
              <p className="text-sm text-slate-300">Total products</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold text-blue-300">
                {categoryOptions.length}
              </div>
              <p className="text-sm text-slate-300">Store categories</p>
            </div>
          </div>
          {selectedCategory ? (
            <div className="mt-4 rounded-lg bg-white/10 px-3 py-2 text-sm text-slate-200">
              Showing only {selectedCategory}
            </div>
          ) : null}
        </div>
      </div>

      {showCategoryForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold">Add Category</h2>
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input
              type="text"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ name: e.target.value })}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
              placeholder="e.g., Electronics"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Save Category
            </button>
          </form>
        </div>
      )}

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold">
            {editingProductId ? "Edit Product" : "Add New Product"}
          </h2>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Select a category</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                  <option value="General">General (default)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Purchase Price (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, purchasePrice: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, sellingPrice: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">GST %</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.gst}
                  onChange={(e) =>
                    setFormData({ ...formData, gst: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="18"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {submitting
                  ? "Saving..."
                  : editingProductId
                    ? "Save Changes"
                    : "Add Product"}
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

      {showActivationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full space-y-4">
            <h2 className="text-xl font-bold">Activate Product</h2>
            {activatingProduct && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 space-y-1">
                <div className="font-semibold text-slate-900">
                  {activatingProduct.name}
                </div>
                <div>Buying Price: {formatINR(activatingProduct.purchasePrice)}</div>
              </div>
            )}
            <form onSubmit={handleActivateProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={activationForm.sellingPrice}
                  onChange={(e) =>
                    setActivationForm({
                      ...activationForm,
                      sellingPrice: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  {submitting ? "Activating..." : "Activate"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowActivationModal(false);
                    setActivatingProductId(null);
                    setActivationForm({ sellingPrice: "" });
                  }}
                  className="flex-1 px-4 py-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                Product
              </th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                Category
              </th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                Stock
              </th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                Cost Price
              </th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                Selling Price
              </th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {visibleProducts.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">
                  {product.name}
                </td>
                <td className="px-6 py-4 text-slate-700">
                  {product.category || "-"}
                </td>
                <td
                  className={`px-6 py-4 font-semibold ${product.stock < 10 ? "text-red-600" : "text-emerald-600"}`}
                >
                  {product.stock} units
                </td>
                <td className="px-6 py-4">
                  {formatINR(product.purchasePrice)}
                </td>
                <td className="px-6 py-4 font-bold">
                  {formatINR(product.sellingPrice)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-bold rounded ${
                      product.status === "active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {product.status === "active" ? (
                    <button
                      type="button"
                      onClick={() => startEditProduct(product)}
                      className="text-sm font-semibold text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openActivationModal(product)}
                      className="text-sm font-semibold text-green-600 hover:underline"
                    >
                      Active
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visibleProducts.length === 0 && (
          <div className="px-6 py-8 text-center text-slate-500">
            {selectedCategory
              ? "No products found for this category"
              : "No products in inventory"}
          </div>
        )}
      </div>
    </div>
  );
}
