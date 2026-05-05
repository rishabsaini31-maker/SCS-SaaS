 "use client";

import { mockInventory } from "@/lib/data";
import { useMemo, useState } from "react";

export default function InventoryPage() {
  const [customProducts, setCustomProducts] = useState<typeof mockInventory>([]);
  const [category, setCategory] = useState("All Categories");
  const [stockStatus, setStockStatus] = useState("All Statuses");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lastAction, setLastAction] = useState("Ready");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("Electronics");
  const [productStock, setProductStock] = useState("1");
  const [productPrice, setProductPrice] = useState("");
  const [productBarcode, setProductBarcode] = useState("");

  const filteredInventory = useMemo(() => {
    const allProducts = [...customProducts, ...mockInventory];
    return allProducts.filter((item) => {
      const categoryMatch =
        category === "All Categories" || item.category === category;
      const statusMatch =
        stockStatus === "All Statuses" ||
        (stockStatus === "In Stock" && item.status === "in-stock") ||
        (stockStatus === "Low Stock" && item.status === "low-stock") ||
        (stockStatus === "Out of Stock" && item.status === "out-of-stock");
      return categoryMatch && statusMatch;
    });
  }, [category, customProducts, stockStatus]);

  return (
    <div className="flex flex-col h-[calc(100vh-128px)]">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-h1 text-h1 text-on-surface mb-1">
            Inventory Management
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Manage your product stock levels and catalog in real-time.
          </p>
        </div>
        <button
          className="bg-primary hover:bg-primary-container text-white px-4 py-2.5 rounded-lg font-body-md text-body-md flex items-center space-x-2 transition-all active:scale-95 shadow-sm"
          onClick={() => setIsProductModalOpen(true)}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Add New Product</span>
        </button>
      </div>

      <div className="bg-white border border-outline-variant rounded-xl p-4 flex items-center space-x-4 mb-6 shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-label-caps font-label-caps text-outline uppercase">
            Category
          </span>
          <select
            className="bg-surface-container-low border-none rounded-lg text-body-sm font-body-sm py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-primary transition-all"
            onChange={(event) => setCategory(event.target.value)}
            value={category}
          >
            <option>All Categories</option>
            <option>Electronics</option>
            <option>Apparel</option>
          </select>
        </div>
        <div className="w-px h-6 bg-slate-200"></div>
        <div className="flex items-center space-x-2">
          <span className="text-label-caps font-label-caps text-outline uppercase">
            Stock Status
          </span>
          <select
            className="bg-surface-container-low border-none rounded-lg text-body-sm font-body-sm py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-primary transition-all"
            onChange={(event) => setStockStatus(event.target.value)}
            value={stockStatus}
          >
            <option>All Statuses</option>
            <option>In Stock</option>
            <option>Low Stock</option>
            <option>Out of Stock</option>
          </select>
        </div>
        <div className="flex-1"></div>
        <button
          className="flex items-center space-x-2 text-primary font-body-md text-body-md hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors"
          onClick={() => setLastAction("Export CSV clicked")}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">
            file_download
          </span>
          <span>Export CSV</span>
        </button>
      </div>

      <div className="bg-white border border-outline-variant rounded-xl overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="overflow-x-auto overflow-y-auto flex-1 thin-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 border-b border-outline-variant z-10">
              <tr>
                <th className="px-6 py-3 font-label-caps text-label-caps text-outline uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 font-label-caps text-label-caps text-outline uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 font-label-caps text-label-caps text-outline uppercase tracking-wider">
                  Stock Level
                </th>
                <th className="px-6 py-3 font-label-caps text-label-caps text-outline uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 font-label-caps text-label-caps text-outline uppercase tracking-wider">
                  Barcode
                </th>
                <th className="px-6 py-3 font-label-caps text-label-caps text-outline uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.map((item) => (
                <tr
                  key={item.id}
                  className={`transition-colors ${
                    selectedProductId === item.id
                      ? "bg-blue-50/70"
                      : item.status === "low-stock"
                      ? "bg-red-50/50 hover:bg-red-50"
                      : item.status === "out-of-stock"
                      ? "opacity-60 bg-slate-50"
                      : "hover:bg-slate-50/50"
                  }`}
                  onClick={() => {
                    setSelectedProductId(item.id);
                    setActiveMenuId(null);
                  }}
                >
                  <td className="px-6 h-[48px] font-body-md text-on-surface">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 ${
                          item.status === "out-of-stock" ? "grayscale" : ""
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt={item.name} src={item.image} />
                      </div>
                      <span className="font-semibold">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 h-[48px] font-body-sm text-on-surface-variant">
                    {item.category}
                  </td>
                  <td className="px-6 h-[48px] font-body-sm text-on-surface">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          item.status === "in-stock"
                            ? "bg-green-100 text-green-700"
                            : item.status === "low-stock"
                            ? "bg-error text-white"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {item.stock} Units
                      </span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            item.status === "in-stock"
                              ? "bg-green-500"
                              : item.status === "low-stock"
                              ? "bg-error"
                              : "bg-slate-400"
                          }`}
                          style={{ width: `${item.stockRatio}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 h-[48px] font-mono-data text-on-surface">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="px-6 h-[48px] font-mono-data text-slate-500">
                    {item.barcode}
                  </td>
                  <td className="px-6 h-[48px] text-right relative">
                    <button
                      className="text-slate-400 hover:text-primary transition-colors"
                      onClick={(event) => {
                        event.stopPropagation();
                        setActiveMenuId((current) =>
                          current === item.id ? null : item.id,
                        );
                        setSelectedProductId(item.id);
                      }}
                      type="button"
                    >
                      <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                    {activeMenuId === item.id ? (
                      <div className="absolute right-6 top-11 w-32 bg-white border border-slate-200 rounded-lg shadow z-20">
                        <button
                          className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50"
                          onClick={() => {
                            setLastAction(`Edit ${item.name}`);
                            setActiveMenuId(null);
                          }}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50"
                          onClick={() => {
                            setLastAction(`Restock ${item.name}`);
                            setActiveMenuId(null);
                          }}
                          type="button"
                        >
                          Restock
                        </button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-outline-variant px-6 py-3 bg-slate-50 flex justify-between items-center shrink-0">
          <span className="text-body-sm text-on-surface-variant">
            Showing <span className="font-bold">{filteredInventory.length}</span>{" "}
            filtered products
          </span>
          <div className="flex items-center space-x-2">
            <button
              className="p-1 rounded border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              type="button"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {[1, 2, 3].map((pageNumber) => (
              <button
                className={`w-8 h-8 rounded text-xs font-bold ${
                  page === pageNumber
                    ? "bg-primary text-white"
                    : "hover:bg-white text-slate-600"
                }`}
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                type="button"
              >
                {pageNumber}
              </button>
            ))}
            <button
              className="p-1 rounded border border-slate-200 text-slate-400 hover:bg-white"
              onClick={() => setPage((current) => current + 1)}
              type="button"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
        <div className="px-6 py-2 text-xs text-slate-500 border-t border-slate-100">
          Last action: {lastAction}
        </div>
      </div>
      {isProductModalOpen ? (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <form
            className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl p-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const stock = Number(productStock);
              const price = Number(productPrice || "0");
              const newProduct = {
                id: `custom-${Date.now()}`,
                name: productName.trim(),
                category: productCategory,
                stock,
                price,
                barcode: productBarcode.trim() || `${Date.now()}`,
                image:
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuCBlvg_jutuG_4h6xattbUMsT0RnWaieWfLBN4PqNakuaBw4YcuK8eggOJ-jm6VwNb0155_xkE35L942uSUtsvlLA0q5IIOy_cUAfMlwLofI9COj-0TKU0pTz-xaqF4zhh_Dte8lwDSCTZF968SvsBgQJ1pr3ijCJJsF5aMHtjL1XrRY1lWwlReqyATDGQ8B705hf73Jwc2rXEh86tUm5r4XvZsRgUDbrSPAk-Dv3Kjz6S9ibZed3LAKWjqqjWk3Slg2W1Hu0ao07A",
                status:
                  stock === 0 ? "out-of-stock" : stock <= 10 ? "low-stock" : "in-stock",
                stockRatio: Math.max(0, Math.min(100, stock)),
              } as (typeof mockInventory)[number];
              setCustomProducts((previous) => [newProduct, ...previous]);
              setSelectedProductId(newProduct.id);
              setLastAction(`Product created: ${newProduct.name}`);
              setIsProductModalOpen(false);
              setProductName("");
              setProductCategory("Electronics");
              setProductStock("1");
              setProductPrice("");
              setProductBarcode("");
            }}
          >
            <h3 className="text-base font-bold text-slate-900">New Product Form</h3>
            <input
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              onChange={(event) => setProductName(event.target.value)}
              placeholder="Product name"
              required
              value={productName}
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                onChange={(event) => setProductCategory(event.target.value)}
                value={productCategory}
              >
                <option>Electronics</option>
                <option>Apparel</option>
              </select>
              <input
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                min={0}
                onChange={(event) => setProductStock(event.target.value)}
                placeholder="Stock"
                required
                type="number"
                value={productStock}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                min={0}
                onChange={(event) => setProductPrice(event.target.value)}
                placeholder="Price"
                required
                step="0.01"
                type="number"
                value={productPrice}
              />
              <input
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                onChange={(event) => setProductBarcode(event.target.value)}
                placeholder="Barcode"
                value={productBarcode}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
                onClick={() => setIsProductModalOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 text-sm bg-primary text-white rounded-lg"
                type="submit"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
