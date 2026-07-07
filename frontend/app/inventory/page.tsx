"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { useNotifications } from "@/lib/NotificationContext";
import { waitForAuthenticatedSession } from "@/lib/session";
import { InventoryShell } from "@/components/inventory/InventoryShell";
import type { ProductFormData } from "@/components/inventory/DynamicProductForm";

type Product = {
  id: string;
  name: string;
  category: string;
  stock: number;
  purchasePrice: number;
  sellingPrice: number;
  gst: number;
  status: string;
  expiryDate?: string | null;
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activatingProductId, setActivatingProductId] = useState<string | null>(
    null,
  );
  const [tenantBusinessType, setTenantBusinessType] = useState<string | null>(null);
  const [activationForm, setActivationForm] = useState({
    sellingPrice: "",
  });
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    category: "",
    stock: "",
    purchasePrice: "",
    sellingPrice: "",
    gst: "18",
    expiryDate: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const { setPendingProducts } = useNotifications();

  useEffect(() => {
    const loadSession = async () => {
      const currentSession = await waitForAuthenticatedSession();
      if (currentSession?.tenant?.businessType) {
        setTenantBusinessType(currentSession.tenant.businessType);
      }
    };

    void loadSession();
  }, []);

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

  const visibleProducts = products.filter((product) => {
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    const matchesSearch = searchQuery ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    return matchesCategory && matchesSearch;
  });

  const activatingProduct = products.find(
    (product) => product.id === activatingProductId,
  );

  const startEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setFormData({
      name: product.name,
      category: product.category || "",
      stock: String(product.stock),
      purchasePrice: String(product.purchasePrice),
      sellingPrice: String(product.sellingPrice),
      gst: String(product.gst),
      expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : "",
    });
    setShowForm(true);
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleAddCategory = async () => {
    const categoryName = window.prompt("Enter new category name:");
    if (!categoryName || !categoryName.trim()) return;

    try {
      await api.post("/categories", { name: categoryName.trim() });
      void fetchProducts();
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category");
    }
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
        expiryDate: formData.expiryDate || null,
        customFields: Object.fromEntries(
          Object.entries(formData).filter(([key]) => !["name", "category", "stock", "purchasePrice", "sellingPrice", "gst", "expiryDate"].includes(key)),
        ),
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
        expiryDate: "",
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
    <InventoryShell
      tenantBusinessType={tenantBusinessType}
      products={visibleProducts}
      availableCategories={categoryOptions}
      onEdit={startEditProduct}
      onActivate={openActivationModal}
      onAddProduct={handleAddProduct}
      onToggleForm={() => {
        setEditingProductId(null);
        setFormData({
          name: "",
          category: "",
          stock: "",
          purchasePrice: "",
          sellingPrice: "",
          gst: "18",
          expiryDate: "",
        });
        setShowForm((current) => !current);
      }}
      showForm={showForm}
      formData={formData}
      onFieldChange={handleFieldChange}
      onCancelForm={() => setShowForm(false)}
      submitting={submitting}
      editingProductId={editingProductId}
      selectedCategory={selectedCategory}
      onCategoryChange={setSelectedCategory}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onAddCategory={handleAddCategory}
    />
  );
}
