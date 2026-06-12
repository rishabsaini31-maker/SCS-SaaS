"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatINR } from "@/lib/currency";

type Invoice = {
  id: string;
  invoiceNumber: string;
  customer: { name: string };
  totalAmount: number;
  status: string;
  invoiceDate: string;
};

type Purchase = {
  id: string;
  purchaseNumber: string;
  supplier: { name: string };
  totalAmount: number;
  status: string;
  purchaseDate: string;
};

type Product = {
  id: string;
  name: string;
  stock: number;
  sellingPrice: number;
};

type Customer = {
  id: string;
  name: string;
  outstandingBalance: number;
};

export default function MobileDashboardPage() {
  const today = new Date();
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  const { data: session } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      return res.data;
    },
  });

  const isSalesman = session?.user?.role === "SALESMAN";
  const userName = session?.user?.name || "";
  const storeName = session?.tenant?.businessName || "";

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ["invoices", "today"],
    queryFn: async () => {
      const res = await api.get<Invoice[]>("/invoices", {
        params: {
          startDate: todayStart.toISOString(),
          endDate: todayEnd.toISOString(),
        },
      });
      return res.data;
    },
  });

  const { data: purchases = [], isLoading: purchasesLoading } = useQuery({
    queryKey: ["purchases", "today"],
    queryFn: async () => {
      const res = await api.get<Purchase[]>("/purchases", {
        params: {
          startDate: todayStart.toISOString(),
          endDate: todayEnd.toISOString(),
        },
      });
      return res.data;
    },
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products", "low-stock"],
    queryFn: async () => {
      const res = await api.get<Product[]>("/products/low-stock");
      return res.data;
    },
  });

  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await api.get<Customer[]>("/customers");
      return res.data;
    },
  });

  const loading =
    invoicesLoading ||
    purchasesLoading ||
    productsLoading ||
    customersLoading;

  const todaySales = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const todayPurchases = purchases.reduce((sum, pur) => sum + pur.totalAmount, 0);
  const outstandingReceivables = customers.reduce(
    (sum, c) => sum + (c.outstandingBalance || 0),
    0,
  );

  const recentActivityRaw = isSalesman
    ? [...invoices.slice(0, 5)]
    : [...invoices.slice(0, 3), ...purchases.slice(0, 3)];

  const recentActivity = recentActivityRaw.sort(
    (a, b) =>
      new Date("invoiceDate" in b ? b.invoiceDate : b.purchaseDate).getTime() -
      new Date("invoiceDate" in a ? a.invoiceDate : a.purchaseDate).getTime(),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {userName || "User"}</h1>
        <p className="text-sm text-slate-500">{storeName}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MobileCard
          title="Today's Sales"
          value={formatINR(todaySales)}
          icon="payments"
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
        />
        <MobileCard
          title="Today's Bills"
          value={invoices.length.toString()}
          icon="receipt_long"
          iconColor="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        {!isSalesman && (
          <>
            <MobileCard
              title="Today's Purchases"
              value={formatINR(todayPurchases)}
              icon="shopping_cart"
              iconColor="text-purple-600"
              bgColor="bg-purple-50"
            />
            <MobileCard
              title="Receivables"
              value={formatINR(outstandingReceivables)}
              icon="call_received"
              iconColor="text-emerald-600"
              bgColor="bg-emerald-50"
            />
          </>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-red-600">warning</span>
          <h2 className="font-semibold text-slate-900">Low Stock Alerts</h2>
        </div>
        {products.length > 0 ? (
          <div className="space-y-2">
            {products.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0"
              >
                <span className="text-sm text-slate-700">{product.name}</span>
                <span className="text-xs font-semibold text-red-600">
                  {product.stock} left
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">All products sufficiently stocked</p>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h2 className="font-semibold text-slate-900 mb-3">Recent Activity</h2>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
{recentActivity.map((item) => {
               const isInvoice = "invoiceDate" in item;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`material-symbols-outlined text-sm ${isInvoice ? "text-blue-600" : "text-purple-600"}`}
                    >
                      {isInvoice ? "receipt_long" : "shopping_cart"}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {isInvoice
                          ? (item as Invoice).invoiceNumber
                          : (item as Purchase).purchaseNumber}
                      </p>
                      <p className="text-xs text-slate-500">
                        {isInvoice
                          ? (item as Invoice).customer.name
                          : (item as Purchase).supplier.name}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatINR(item.totalAmount)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No recent activity</p>
        )}
      </div>
    </div>
  );
}

function MobileCard({
  title,
  value,
  icon,
  iconColor,
  bgColor,
}: {
  title: string;
  value: string;
  icon: string;
  iconColor: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <span className={`material-symbols-outlined text-lg ${iconColor}`}>
            {icon}
          </span>
        </div>
        <span className="text-[10px] uppercase font-semibold text-slate-500">
          {title}
        </span>
      </div>
      <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}