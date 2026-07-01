import { formatINR } from "@/lib/currency";
import type { BusinessConfig } from "@/config/business/types";

type InventoryRow = {
  id: string;
  name: string;
  category?: string | null;
  stock: number;
  purchasePrice: number;
  sellingPrice: number;
  gst: number;
  status: string;
  expiryDate?: string | null;
};

export function InventoryTable({
  config,
  products,
  onEdit,
  onActivate,
}: {
  config: BusinessConfig;
  products: InventoryRow[];
  onEdit: (product: InventoryRow) => void;
  onActivate: (product: InventoryRow) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <h2 className="text-lg font-bold text-slate-900">{config.label} Inventory</h2>
      </div>
      <table className="min-w-full text-left">
        <thead className="bg-slate-50">
          <tr>
            {config.tableColumns.map((column) => (
              <th key={column.key} className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                {column.label}
              </th>
            ))}
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-slate-50">
              {config.tableColumns.map((column) => {
                const cellValue = (() => {
                  switch (column.key) {
                    case "product":
                      return product.name;
                    case "category":
                      return product.category || "-";
                    case "stock":
                      return `${product.stock} units`;
                    case "price":
                      return formatINR(product.sellingPrice);
                    case "expiry":
                    case "expiryDate":
                      return product.expiryDate ? new Date(product.expiryDate).toLocaleDateString("en-IN") : "-";
                    default:
                      return "-";
                  }
                })();

                return (
                  <td key={column.key} className="px-4 py-3 text-sm text-slate-700">
                    {cellValue}
                  </td>
                );
              })}
              <td className="px-4 py-3 text-sm">
                {product.status === "active" ? (
                  <button type="button" onClick={() => onEdit(product)} className="font-semibold text-blue-600 hover:underline">
                    Edit
                  </button>
                ) : (
                  <button type="button" onClick={() => onActivate(product)} className="font-semibold text-green-600 hover:underline">
                    Activate
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
