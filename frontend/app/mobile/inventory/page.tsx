"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatINR } from "@/lib/currency";

type Product = {
  id: string;
  name: string;
  category: string;
  stock: number;
  purchasePrice: number;
  sellingPrice: number;
  gst: number;
  status: string;
  barcode?: string;
};

export default function MobileInventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const {
    data: products = [],
    isLoading: productsLoading,
  } = useQuery({
    queryKey: ["products", showLowStockOnly],
    queryFn: async () => {
      const res = await api.get<Product[]>("/products", {
        params: showLowStockOnly ? { lowStock: true } : {},
      });
      return res.data;
    },
  });

  const loading = productsLoading;

  const filteredProducts = products.filter((product) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(q) ||
      product.barcode?.toLowerCase().includes(q) ||
      product.category?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
        <button
          onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            showLowStockOnly
              ? "bg-amber-100 text-amber-700"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {showLowStockOnly ? "All" : "Low Stock"}
        </button>
      </div>

      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
          search
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg text-base"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Products</p>
          <p className="text-lg font-bold text-slate-900">{products.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase">Low Stock</p>
          <p className="text-lg font-bold text-amber-600">
            {products.filter((p) => p.stock < 10).length}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {filteredProducts.length === 0 ? (
          <p className="text-slate-500 text-center py-8">
            {searchTerm ? "No products found" : "No products in inventory"}
          </p>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-slate-200 rounded-xl p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{product.name}</p>
                  <p className="text-xs text-slate-500">{product.category}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    product.status === "active"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {product.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-500">Stock: {product.stock}</p>
                  {product.barcode && (
                    <p className="text-xs text-slate-400">Barcode: {product.barcode}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {formatINR(product.sellingPrice)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Cost: {formatINR(product.purchasePrice)}
                  </p>
                </div>
              </div>
              {product.stock < 10 && (
                <div className="mt-2 text-xs text-red-600 font-medium">
                  Low stock alert!
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}