import { mockInventory } from "@/lib/data";

export default function InventoryPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-128px)]">
      {/* Header Actions */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-h1 text-h1 text-on-surface mb-1">
          "use client";
          import { useQuery } from "@tanstack/react-query";
          import api from "@/lib/api";
            Inventory Management
          type Product = {
            id: string;
            name: string;
            category: string;
            stock: number;
            price: number;
            barcode: string;
            image: string;
            status: string;
            stockRatio: number;
          };
          </h2>
          function useProducts() {
            return useQuery<Product[]>({
              queryKey: ["products"],
              queryFn: async () => {
                const res = await api.get("/products");
                return res.data;
              },
            });
          }
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Manage your product stock levels and catalog in real-time.
            const { data: products = [], isLoading, isError } = useProducts();
            return (
        </div>
        <button className="bg-primary hover:bg-primary-container text-white px-4 py-2.5 rounded-lg font-body-md text-body-md flex items-center space-x-2 transition-all active:scale-95 shadow-sm">
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filters Strip */}
      <div className="bg-white border border-outline-variant rounded-xl p-4 flex items-center space-x-4 mb-6 shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-label-caps font-label-caps text-outline uppercase">
            Category
          </span>
          <select className="bg-surface-container-low border-none rounded-lg text-body-sm font-body-sm py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-primary transition-all">
            <option>All Categories</option>
            <option>Electronics</option>
            <option>Home Goods</option>
            <option>Apparel</option>
            <option>Bulk Industrial</option>
          </select>
        </div>
        <div className="w-px h-6 bg-slate-200"></div>
        <div className="flex items-center space-x-2">
          <span className="text-label-caps font-label-caps text-outline uppercase">
            Stock Status
          </span>
          <select className="bg-surface-container-low border-none rounded-lg text-body-sm font-body-sm py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-primary transition-all">
            <option>All Statuses</option>
            <option>In Stock</option>
            <option>Low Stock</option>
            <option>Out of Stock</option>
          </select>
        </div>
        <div className="flex-1"></div>
        <button className="flex items-center space-x-2 text-primary font-body-md text-body-md hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors">
          <span className="material-symbols-outlined text-[18px]">
            file_download
          </span>
          <span>Export CSV</span>
        </button>
      </div>

      {/* Inventory Table Container */}
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
              {mockInventory.map((item) => (
                <tr
                  key={item.id}
                  className={`transition-colors ${
                    item.status === "low-stock"
                      ? "bg-red-50/50 hover:bg-red-50"
                      : item.status === "out-of-stock"
                      ? "opacity-60 bg-slate-50"
                      : "hover:bg-slate-50/50"
                  }`}
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
                      {item.status !== "in-stock" && (
                        <span
                          className={`font-bold text-[10px] uppercase ${
                            item.status === "low-stock"
                              ? "text-error"
                              : "text-slate-500"
                          }`}
                        >
                          {item.status === "low-stock"
                            ? "Low Stock"
                            : "Out of Stock"}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 h-[48px] font-mono-data text-on-surface">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="px-6 h-[48px] font-mono-data text-slate-500">
                    {item.barcode}
                  </td>
                  <td className="px-6 h-[48px] text-right">
                    <button className="text-slate-400 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">
                        more_horiz
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Table Footer/Pagination */}
        <div className="border-t border-outline-variant px-6 py-3 bg-slate-50 flex justify-between items-center shrink-0">
          <span className="text-body-sm text-on-surface-variant">
            Showing <span className="font-bold">1-15</span> of{" "}
            <span className="font-bold">1,204</span> products
          </span>
          <div className="flex items-center space-x-2">
            <button
              className="p-1 rounded border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-50"
              disabled
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded bg-primary text-white text-xs font-bold">
              1
            </button>
            <button className="w-8 h-8 rounded hover:bg-white text-slate-600 text-xs font-bold">
              2
            </button>
            <button className="w-8 h-8 rounded hover:bg-white text-slate-600 text-xs font-bold">
              3
            </button>
            <span className="text-slate-400 px-1">...</span>
            <button className="w-8 h-8 rounded hover:bg-white text-slate-600 text-xs font-bold">
              82
            </button>
            <button className="p-1 rounded border border-slate-200 text-slate-400 hover:bg-white">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
