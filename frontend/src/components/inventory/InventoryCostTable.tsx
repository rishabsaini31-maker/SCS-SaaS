import { formatINR } from "@/lib/currency";

type CostRow = {
  id: string;
  name: string;
  category?: string | null;
  stock: number;
  purchasePrice: number;
  sellingPrice: number;
  status: string;
  expiryDate?: string | null;
};

export function InventoryCostTable({ products }: { products: CostRow[] }) {
  const totalBuyingCost = products.reduce(
    (acc, p) => acc + (p.stock * (p.purchasePrice || 0)),
    0,
  );
  const totalSellingValue = products.reduce(
    (acc, p) => acc + (p.stock * (p.sellingPrice || 0)),
    0,
  );
  const totalMargin = totalSellingValue - totalBuyingCost;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
        <h2 className="text-lg font-bold text-slate-900">Buying Cost</h2>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="text-slate-600">
            Total Buying Cost:{" "}
            <span className="font-bold text-slate-900">{formatINR(totalBuyingCost)}</span>
          </span>
          <span className="text-slate-600">
            Total Selling Value:{" "}
            <span className="font-bold text-slate-900">{formatINR(totalSellingValue)}</span>
          </span>
          <span className="text-slate-600">
            Margin:{" "}
            <span className="font-bold text-emerald-600">{formatINR(totalMargin)}</span>
          </span>
        </div>
      </div>
      <table className="min-w-full text-left">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Product</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Category</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Stock</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Buying Price</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Selling Price</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Margin</th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-500">
                No products found.
              </td>
            </tr>
          ) : (
            products.map((product) => {
              const margin = (product.sellingPrice || 0) - (product.purchasePrice || 0);
              return (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-700">{product.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{product.category || "-"}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{product.stock} units</td>
                  <td className="px-4 py-3 text-sm font-semibold text-rose-600">
                    {formatINR(product.purchasePrice)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-emerald-600">
                    {formatINR(product.sellingPrice)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{formatINR(margin)}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        product.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
