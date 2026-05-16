"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatINR } from "@/lib/currency";

type Product = {
  id: string;
  name: string;
  category?: string;
  stock: number;
  sellingPrice: number;
  barcode?: string;
  status?: string;
};

type BarcodeResponse = {
  product: Product;
  barcode: string;
  svg: string;
};

const svgToDataUrl = (svg: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

export default function SavedBarcodesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [savedBarcodeSvgs, setSavedBarcodeSvgs] = useState<
    Record<string, string>
  >({});
  const [printTarget, setPrintTarget] = useState<Product | null>(null);
  const [printQuantity, setPrintQuantity] = useState(30);
  const [isPrinting, setIsPrinting] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["saved-barcodes-products"],
    queryFn: async () => {
      const res = await api.get<Product[]>("/products");
      return res.data.filter((product) => Boolean(product.barcode));
    },
  });

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      const haystack = [
        product.name,
        product.category || "",
        product.barcode || "",
        product.status || "",
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !query || haystack.includes(query);
      const matchesCategory =
        categoryFilter === "all" || (product.category || "") === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      products.map((product) => product.category || "Uncategorized"),
    );
    return ["all", ...Array.from(uniqueCategories).sort()];
  }, [products]);

  useEffect(() => {
    let cancelled = false;

    const loadSvgs = async () => {
      if (filteredProducts.length === 0) return;

      const nextCache = { ...savedBarcodeSvgs };
      const missingProducts = filteredProducts.filter(
        (product) => product.barcode && !nextCache[product.id],
      );

      if (missingProducts.length === 0) return;

      await Promise.all(
        missingProducts.map(async (product) => {
          try {
            const response = await api.get<BarcodeResponse>(
              `/barcode/${product.id}`,
            );
            nextCache[product.id] = response.data.svg;
          } catch {
            nextCache[product.id] = "";
          }
        }),
      );

      if (!cancelled) {
        setSavedBarcodeSvgs(nextCache);
      }
    };

    void loadSvgs();

    return () => {
      cancelled = true;
    };
  }, [filteredProducts, savedBarcodeSvgs]);

  const openPrintDialog = (product: Product) => {
    setPrintTarget(product);
    setPrintQuantity(30);
  };

  const closePrintDialog = () => {
    setPrintTarget(null);
    setPrintQuantity(30);
  };

  const handlePrintLabels = async () => {
    if (!printTarget?.id || !printTarget.barcode) return;

    setIsPrinting(true);
    try {
      const response = await api.post<{
        labels: Array<{
          barcode: string;
          image: string;
          productName: string;
          price: number;
          labelSize: "small" | "medium" | "large";
          showName: boolean;
          showPrice: boolean;
        }>;
      }>("/barcode/print-data", {
        productId: printTarget.id,
        quantity: Math.max(1, printQuantity),
        labelSize: "medium",
        showName: true,
        showPrice: true,
      });

      const labels = response.data.labels;
      if (!labels.length) {
        alert("No labels available to print");
        return;
      }

      const printWindow = window.open("", "_blank", "width=1200,height=900");
      if (!printWindow) {
        alert("Popup blocked. Please allow popups to print labels.");
        return;
      }

      const html = `
        <html>
          <head>
            <title>Print Barcode Labels</title>
            <style>
              @page { size: A4; margin: 10mm; }
              body { font-family: Arial, sans-serif; margin: 0; padding: 12mm; background: #fff; color: #0f172a; }
              .header { display:flex; justify-content:space-between; align-items:flex-end; border-bottom:1px solid #e2e8f0; padding-bottom:12px; margin-bottom:16px; }
              .title { font-size:22px; font-weight:700; margin:0; }
              .meta { font-size:12px; color:#64748b; margin-top:4px; }
              .grid { display:grid; grid-template-columns:repeat(2, 1fr); gap:10px; }
              .label { border:1px solid #cbd5e1; border-radius:10px; padding:10px; min-height:84px; display:flex; flex-direction:column; justify-content:space-between; break-inside:avoid; }
              .label-name { font-size:10px; font-weight:700; text-transform:uppercase; line-height:1.2; }
              .barcode { width:100%; display:block; margin:8px 0; }
              .footer { margin-top:14px; font-size:10px; color:#64748b; display:flex; justify-content:space-between; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1 class="title">Barcode Labels</h1>
                <div class="meta">${printTarget.name} • ${labels.length} labels</div>
              </div>
              <div class="meta">${new Date().toLocaleDateString("en-IN")}</div>
            </div>
            <div class="grid">
              ${labels
                .map(
                  (label) => `
                    <div class="label">
                      <div class="label-name">${label.productName}</div>
                      <img class="barcode" src="${svgToDataUrl(label.image)}" alt="Barcode ${label.barcode}" />
                      <div style="display:flex;justify-content:space-between;align-items:end;gap:8px;font-size:10px;font-weight:600;">
                        <span style="font-family: monospace; letter-spacing: 0.08em;">${label.barcode}</span>
                        <span>₹${label.price.toFixed(2)}</span>
                      </div>
                    </div>
                  `,
                )
                .join("")}
            </div>
            <div class="footer">
              <span>Generated from SCS Inventory SaaS</span>
              <span>Print at Actual Size for best results</span>
            </div>
            <script>
              window.onload = () => {
                window.focus();
                window.print();
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      closePrintDialog();
    } catch (error) {
      console.error("Error printing labels:", error);
      alert("Failed to prepare labels for printing");
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Link
            href="/barcode"
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            ← Back to Barcode Generator
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">
            Saved Barcodes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse every barcode already stored in inventory and reuse it for
            printing.
          </p>
        </div>
        <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
          {products.length} saved barcode{products.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-2">
          Search Saved Barcodes
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by product name, category, or barcode"
          className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-2 mt-4">
          Filter By Category
        </label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "all" ? "All Categories" : category}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-slate-500">Loading saved barcodes...</div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <article
              key={product.id}
              className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    {product.name}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {product.category || "Uncategorized"}
                  </p>
                </div>
                <Link
                  href={`/barcode?productId=${product.id}`}
                  className="px-3 py-2 rounded-lg bg-white border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-100"
                >
                  Use Barcode
                </Link>
                <button
                  type="button"
                  onClick={() => openPrintDialog(product)}
                  className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                >
                  Print
                </button>
              </div>

              <div className="bg-white rounded-xl border border-emerald-200 p-3">
                <p className="text-[11px] font-semibold tracking-wider uppercase text-emerald-700 mb-2">
                  {product.barcode}
                </p>
                {savedBarcodeSvgs[product.id] ? (
                  <Image
                    src={svgToDataUrl(savedBarcodeSvgs[product.id])}
                    alt={`Saved barcode ${product.barcode}`}
                    width={900}
                    height={300}
                    unoptimized
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-emerald-200 bg-emerald-50 text-xs text-emerald-700">
                    Loading barcode image...
                  </div>
                )}

                <div className="mt-3 text-sm">
                  <span className="font-semibold text-slate-900">
                    {formatINR(product.sellingPrice)}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
          No saved barcodes found yet.
        </div>
      )}

      {printTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Print Barcode Labels
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {printTarget.name} • {printTarget.barcode}
                </p>
              </div>
              <button
                type="button"
                onClick={closePrintDialog}
                className="text-slate-500 hover:text-slate-700"
              >
                Close
              </button>
            </div>

            <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-2">
              Number of Labels
            </label>
            <input
              type="number"
              min={1}
              value={printQuantity}
              onChange={(e) =>
                setPrintQuantity(Math.max(1, Number(e.target.value) || 1))
              }
              className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <p className="text-xs text-slate-500 mt-2">
              Choose how many labels you want to print for this barcode.
            </p>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={closePrintDialog}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  void handlePrintLabels();
                }}
                disabled={isPrinting}
                className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:bg-slate-300"
              >
                {isPrinting ? "Preparing..." : "Print Labels"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
