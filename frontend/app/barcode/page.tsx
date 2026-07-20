"use client";

import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatINR } from "@/lib/currency";

type Product = {
  id: string;
  name: string;
  category?: string;
  stock: number;
  purchasePrice: number;
  sellingPrice: number;
  barcode?: string;
  status?: string;
};

type BarcodeResponse = {
  product: Product;
  barcode: string;
  svg: string;
};

type LabelSize = "small" | "medium" | "large";

type PrintLabel = {
  barcode: string;
  image: string;
  productName: string;
  price: number;
  labelSize: LabelSize;
  labelWidthMm?: number;
  labelHeightMm?: number;
  showName: boolean;
  showPrice: boolean;
  shopName?: string;
  customText1?: string;
  customText2?: string;
};

const labelSizes: Record<
  LabelSize,
  { title: string; description: string; widthClass: string }
> = {
  small: {
    title: "Small",
    description: "Compact shelf labels",
    widthClass: "max-w-24",
  },
  medium: {
    title: "Medium",
    description: "Standard product labels",
    widthClass: "max-w-28",
  },
  large: {
    title: "Large",
    description: "Wide warehouse labels",
    widthClass: "max-w-32",
  },
};

const svgToDataUrl = (svg: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = src;
  });

const svgToPngDataUrl = async (svg: string, width = 900, height = 300) => {
  const image = await loadImage(svgToDataUrl(svg));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas context unavailable");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/png");
};

const getBarcodesPerRow = (size: LabelSize) => {
  if (size === "small") return 3;
  if (size === "medium") return 2;
  return 1;
};

const getGridClasses = (size: LabelSize) => {
  if (size === "small") return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";
  if (size === "medium") return "grid-cols-1 lg:grid-cols-2";
  return "grid-cols-1";
};

const openPrintWindow = (labels: PrintLabel[]) => {
  const printWindow = window.open("", "_blank", "width=1200,height=900");
  if (!printWindow) {
    alert("Popup blocked. Please allow popups to print labels.");
    return;
  }

  const labelSize = labels[0]?.labelSize || "medium";
  const customWidthMm = labels[0]?.labelWidthMm;
  const customHeightMm = labels[0]?.labelHeightMm;
  const useCustomSize = Boolean(customWidthMm && customHeightMm);

  const gridClass = useCustomSize
    ? "grid-custom"
    : labelSize === "small"
      ? "grid-small"
      : labelSize === "medium"
        ? "grid-medium"
        : "grid-large";

  const html = `
    <html>
      <head>
        <title>Barcode Labels</title>
        <style>
          @page { size: A4; margin: 10mm; }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 12mm;
            background: #fff;
            color: #0f172a;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .title {
            font-size: 22px;
            font-weight: 700;
            margin: 0;
          }
          .meta {
            font-size: 12px;
            color: #64748b;
            margin-top: 4px;
          }
          .grid-small {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }
          .grid-medium {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          .grid-large {
            display: grid;
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .grid-custom {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(${customWidthMm || 50}mm, 1fr));
            gap: 4px;
          }
          .label {
            border: 1px solid #cbd5e1;
            border-radius: 10px;
            padding: 10px;
            min-height: 84px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            break-inside: avoid;
            ${useCustomSize ? `width: ${customWidthMm}mm; height: ${customHeightMm}mm; box-sizing: border-box;` : ""}
          }
          .label-shop {
            font-size: 10px;
            font-weight: 700;
            color: #1e293b;
            text-transform: uppercase;
            line-height: 1.2;
            text-align: left;
          }
          .label-name {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            line-height: 1.2;
            text-align: left;
          }
          .label-bottom {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            gap: 8px;
            font-size: 9px;
            font-weight: 700;
            line-height: 1.3;
          }
          .label-bottom-left {
            text-align: left;
            color: #1e293b;
          }
          .label-bottom-right {
            text-align: right;
            color: #1e293b;
          }
          .barcode {
            width: 100%;
            display: block;
            margin: 8px 0;
          }
          .footer {
            margin-top: 14px;
            font-size: 10px;
            color: #64748b;
            display: flex;
            justify-content: space-between;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">Barcode Labels</h1>
            <div class="meta">${labels[0]?.productName || "Selected product"} • ${labels.length} labels</div>
          </div>
          <div class="meta">${new Date().toLocaleDateString("en-IN")}</div>
        </div>
        <div class="${gridClass}">
          ${labels
            .map(
              (label) => `
              <div class="label">
                ${label.shopName ? `<div class="label-shop">${label.shopName}</div>` : ""}
                ${label.showName ? `<div class="label-name">${label.productName}</div>` : ""}
                <img class="barcode" src="${svgToDataUrl(label.image)}" alt="Barcode ${label.barcode}" />
                <div class="label-bottom">
                  <div class="label-bottom-left">
                    ${label.customText1 || ""}
                  </div>
                  <div class="label-bottom-right">
                    ${label.customText2 || ""}
                  </div>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:end;gap:8px;font-size:10px;font-weight:600;">
                  <span style="font-family: monospace; letter-spacing: 0.08em;">${label.barcode}</span>
                  ${label.showPrice ? `<span>₹${label.price.toFixed(2)}</span>` : "<span></span>"}
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
};

export default function BarcodePage() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(
    () => searchParams.get("productId") || "",
  );
  const [quantity, setQuantity] = useState(30);
  const [labelSize, setLabelSize] = useState<LabelSize>("medium");
  const [customLabelWidthMm, setCustomLabelWidthMm] = useState("");
  const [customLabelHeightMm, setCustomLabelHeightMm] = useState("");
  const [showName, setShowName] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [shopName, setShopName] = useState("");
  const [customText1, setCustomText1] = useState("");
  const [customText2, setCustomText2] = useState("");
  const [barcodeData, setBarcodeData] = useState<BarcodeResponse | null>(null);
  const [labelPreview, setLabelPreview] = useState<PrintLabel[]>([]);
  const [statusMessage, setStatusMessage] = useState(
    "Choose a product to generate barcode labels",
  );
  const [isFetchingBarcode, setIsFetchingBarcode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["barcode-products"],
    queryFn: async () => {
      const res = await api.get<Product[]>("/products");
      return res.data;
    },
  });

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return products;

    return products.filter((product) => {
      const haystack = [
        product.name,
        product.category || "",
        product.barcode || "",
        product.status || "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [products, searchTerm]);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) || null,
    [products, selectedProductId],
  );

  const savedBarcode = barcodeData?.barcode || selectedProduct?.barcode || "";

  useEffect(() => {
    let cancelled = false;

    const loadBarcode = async () => {
      if (!selectedProductId) {
        setBarcodeData(null);
        setLabelPreview([]);
        setStatusMessage("Choose a product to generate barcode labels");
        return;
      }

      setIsFetchingBarcode(true);
      try {
        const response = await api.get<BarcodeResponse>(
          `/barcode/${selectedProductId}`,
        );
        if (cancelled) return;
        setBarcodeData(response.data);
        setStatusMessage(`Loaded barcode ${response.data.barcode}`);
      } catch {
        if (cancelled) return;
        setBarcodeData(null);
        setLabelPreview([]);
        setStatusMessage("No barcode yet. Generate one to continue.");
      } finally {
        if (!cancelled) {
          setIsFetchingBarcode(false);
        }
      }
    };

    loadBarcode();

    return () => {
      cancelled = true;
    };
  }, [selectedProductId]);

  useEffect(() => {
    let cancelled = false;

    const loadPreview = async () => {
      if (!selectedProductId || !barcodeData?.barcode) {
        setLabelPreview([]);
        return;
      }

      try {
        const response = await api.post<{ labels: PrintLabel[] }>(
          "/barcode/print-data",
          {
            productId: selectedProductId,
            quantity: Math.max(1, quantity),
            labelSize,
            labelWidthMm: customLabelWidthMm ? Number(customLabelWidthMm) : undefined,
            labelHeightMm: customLabelHeightMm ? Number(customLabelHeightMm) : undefined,
            showName,
            showPrice,
            shopName: shopName || undefined,
            customText1: customText1 || undefined,
            customText2: customText2 || undefined,
          },
        );

        if (!cancelled) {
          setLabelPreview(response.data.labels);
        }
      } catch {
        if (!cancelled) {
          setLabelPreview([]);
          setStatusMessage(
            "Unable to build preview. Try generating the barcode first.",
          );
        }
      }
    };

    loadPreview();

    return () => {
      cancelled = true;
    };
  }, [
    barcodeData?.barcode,
    labelSize,
    quantity,
    selectedProductId,
    showName,
    showPrice,
    customLabelWidthMm,
    customLabelHeightMm,
    shopName,
    customText1,
    customText2,
  ]);

  const handleGenerateBarcode = async () => {
    if (!selectedProductId) {
      alert("Please select a product first");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/barcode/generate", {
        productId: selectedProductId,
      });

      const refreshed = await api.get<BarcodeResponse>(
        `/barcode/${selectedProductId}`,
      );
      setBarcodeData(refreshed.data);
      setStatusMessage(`Generated ${refreshed.data.barcode} successfully`);
    } catch (error) {
      console.error("Error generating barcode:", error);
      alert("Failed to generate barcode");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedProductId || !barcodeData?.barcode) {
      alert("Generate a barcode first");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post<{ labels: PrintLabel[] }>(
        "/barcode/print-data",
        {
          productId: selectedProductId,
          quantity: Math.max(1, quantity),
          labelSize,
          labelWidthMm: customLabelWidthMm ? Number(customLabelWidthMm) : undefined,
          labelHeightMm: customLabelHeightMm ? Number(customLabelHeightMm) : undefined,
          showName,
          showPrice,
          shopName: shopName || undefined,
          customText1: customText1 || undefined,
          customText2: customText2 || undefined,
        },
      );

      const labels = response.data.labels;
      if (labels.length === 0) {
        alert("No labels available to export");
        return;
      }

      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      const gap = 4;
      const useCustomSize = Boolean(labels[0]?.labelWidthMm && labels[0]?.labelHeightMm);
      const cols = useCustomSize
        ? Math.max(1, Math.floor((pageWidth - margin * 2 + gap) / (labels[0].labelWidthMm! + gap)))
        : getBarcodesPerRow(labelSize);
      const cellWidth = useCustomSize
        ? labels[0].labelWidthMm!
        : (pageWidth - margin * 2 - gap * (cols - 1)) / cols;
      const cellHeight = useCustomSize
        ? labels[0].labelHeightMm!
        : labelSize === "small" ? 36 : labelSize === "medium" ? 48 : 62;
      const barcodeWidth = cellWidth - 8;
      const barcodeHeight = useCustomSize
        ? Math.max(8, cellHeight * 0.45)
        : labelSize === "small" ? 12 : labelSize === "medium" ? 16 : 20;
      const barcodeImage = await svgToPngDataUrl(labels[0].image);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Barcode Labels", margin, 14);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `${selectedProduct?.name || labels[0].productName} • ${labels.length} labels`,
        margin,
        20,
      );
      doc.text(
        `Generated: ${new Date().toLocaleString("en-IN")}`,
        pageWidth - margin,
        20,
        {
          align: "right",
        },
      );
      doc.setTextColor(15, 23, 42);

      let x = margin;
      let y = 28;

      labels.forEach((label, index) => {
        const column = index % cols;
        if (column === 0 && index > 0) {
          y += cellHeight + gap;
          x = margin;
        } else {
          x = margin + column * (cellWidth + gap);
        }

        if (y + cellHeight > pageHeight - margin) {
          doc.addPage();
          y = 20;
          x = margin;
        }

        doc.setDrawColor(203, 213, 225);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(x, y, cellWidth, cellHeight, 2, 2, "FD");

        let innerY = y + 6;
        if (label.shopName) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(15, 23, 42);
          const shopLines = doc.splitTextToSize(label.shopName, cellWidth - 6);
          doc.text(shopLines, x + 3, innerY);
          innerY += shopLines.length * 3 + 1;
        }
        if (label.showName) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(labelSize === "large" ? 11 : 9);
          const nameLines = doc.splitTextToSize(
            label.productName,
            cellWidth - 6,
          );
          doc.text(nameLines, x + 3, innerY);
          innerY += nameLines.length * 4 + 2;
        }

        doc.addImage(
          barcodeImage,
          "PNG",
          x + 3,
          innerY,
          barcodeWidth,
          barcodeHeight,
        );
        innerY += barcodeHeight + 4;

        const bottomY = innerY;
        if (label.customText1) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(15, 23, 42);
          const text1Lines = doc.splitTextToSize(label.customText1, cellWidth - 6);
          doc.text(text1Lines, x + 3, bottomY);
        }
        if (label.customText2) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(15, 23, 42);
          const text2Lines = doc.splitTextToSize(label.customText2, cellWidth - 6);
          doc.text(text2Lines, x + 3, bottomY, { align: "right" });
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text(label.barcode, x + 3, bottomY + 6);
        if (label.showPrice) {
          doc.setFont("helvetica", "bold");
          doc.setTextColor(15, 23, 42);
          doc.text(`₹${label.price.toFixed(2)}`, x + cellWidth - 3, bottomY + 6, {
            align: "right",
          });
        }
        doc.setTextColor(15, 23, 42);
      });

      doc.setDrawColor(226, 232, 240);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(
        "Print using Actual Size for best results",
        margin,
        pageHeight - 6,
      );
      doc.text("SCS Inventory SaaS", pageWidth - margin, pageHeight - 6, {
        align: "right",
      });

      doc.save(
        `${(selectedProduct?.name || "barcode-labels").replace(/[^a-zA-Z0-9-_]/g, "_")}.pdf`,
      );
    } catch (error) {
      console.error("Error exporting barcode PDF:", error);
      alert("Failed to download PDF");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintLabels = async () => {
    if (!selectedProductId || !barcodeData?.barcode) {
      alert("Generate a barcode first");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post<{ labels: PrintLabel[] }>(
        "/barcode/print-data",
        {
          productId: selectedProductId,
          quantity: Math.max(1, quantity),
          labelSize,
          labelWidthMm: customLabelWidthMm ? Number(customLabelWidthMm) : undefined,
          labelHeightMm: customLabelHeightMm ? Number(customLabelHeightMm) : undefined,
          showName,
          showPrice,
          shopName: shopName || undefined,
          customText1: customText1 || undefined,
          customText2: customText2 || undefined,
        },
      );

      openPrintWindow(response.data.labels);
    } catch (error) {
      console.error("Error printing labels:", error);
      alert("Failed to prepare labels for printing");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedProductId("");
    setQuantity(30);
    setLabelSize("medium");
    setCustomLabelWidthMm("");
    setCustomLabelHeightMm("");
    setShowName(true);
    setShowPrice(true);
    setShopName("");
    setCustomText1("");
    setCustomText2("");
    setBarcodeData(null);
    setLabelPreview([]);
    setStatusMessage("Choose a product to generate barcode labels");
  };

  if (productsLoading) {
    return <div className="text-slate-500">Loading barcode tools...</div>;
  }

  return (
    <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] relative">
      <main className="p-8 flex-1 z-10 relative space-y-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-h1 text-2xl font-semibold text-slate-900 mb-1">
              Barcode Generator
            </h1>
            <p className="font-body-md text-sm text-slate-500">
              Generate unique barcodes, preview label sheets, and export
              print-ready PDFs.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-2 md:items-end">
            <Link
              href="/barcode/saved"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-100"
            >
              <span className="material-symbols-outlined text-base">
                search
              </span>
              Check Saved Barcode
            </Link>
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
              {statusMessage}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8 items-start">
          <div className="col-span-12 xl:col-span-7 space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-h1 text-sm font-bold text-slate-900">
                    Product Selection
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Search for a product, then generate or load its barcode.
                  </p>
                </div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  Step 1
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-4">
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-2">
                    Search Product
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, category, barcode..."
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-2">
                    Select Product
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-sm text-slate-900 appearance-none focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  >
                    <option value="">Choose a product</option>
                    {filteredProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedProduct && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-3 border border-slate-200 rounded-lg">
                    <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-1">
                      Category
                    </p>
                    <p className="font-semibold text-sm text-slate-900">
                      {selectedProduct.category || "Uncategorized"}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 border border-slate-200 rounded-lg">
                    <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-1">
                      Barcode
                    </p>
                    <p className="font-semibold text-sm text-slate-900">
                      {barcodeData?.barcode ||
                        selectedProduct.barcode ||
                        "Not generated"}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 border border-slate-200 rounded-lg">
                    <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-1">
                      Price
                    </p>
                    <p className="font-semibold text-sm text-slate-900">
                      {formatINR(selectedProduct.sellingPrice)}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-2 border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-500">
                    Live Preview
                  </p>
                  {isFetchingBarcode && (
                    <span className="text-xs text-slate-500">
                      Loading barcode...
                    </span>
                  )}
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 w-full max-w-115 mx-auto">
                  {barcodeData?.svg ? (
                    <>
                      {showName && (
                        <div className="text-center font-semibold text-slate-900 text-sm mb-3">
                          {barcodeData.product.name}
                        </div>
                      )}
                      <Image
                        src={svgToDataUrl(barcodeData.svg)}
                        alt={`Barcode ${barcodeData.barcode}`}
                        width={900}
                        height={300}
                        unoptimized
                        className="w-full h-auto"
                      />
                      <div className="flex justify-between items-end mt-4 text-sm">
                        <span className="font-mono tracking-[0.18em] text-slate-600">
                          {barcodeData.barcode}
                        </span>
                        {showPrice && (
                          <span className="font-bold text-slate-900">
                            {formatINR(barcodeData.product.sellingPrice)}
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="min-h-40 flex flex-col items-center justify-center text-center text-slate-500">
                      <span className="material-symbols-outlined text-4xl mb-3 text-slate-300">
                        barcode
                      </span>
                      <p className="text-sm font-medium">
                        No barcode generated yet
                      </p>
                      <p className="text-xs mt-1 max-w-xs">
                        Use Generate Barcode to create a unique barcode for the
                        selected product.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateBarcode}
                disabled={isSubmitting || !selectedProductId}
                className="w-full mt-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-3 rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined">barcode</span>
                {isSubmitting
                  ? "Working..."
                  : savedBarcode
                    ? "Reuse or Refresh Barcode"
                    : "Generate Barcode"}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="w-full mt-3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined">restart_alt</span>
                Reset Form
              </button>
            </section>
          </div>

          <div className="col-span-12 xl:col-span-5 space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-h1 text-sm font-bold text-slate-900">
                    Print Configuration
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Configure quantity, size, and label content.
                  </p>
                </div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  Step 2
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-2">
                    Number of Labels
                  </label>
                  <input
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, Number(e.target.value) || 1))
                    }
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-2">
                    Label Size
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["small", "medium", "large"] as const).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setLabelSize(size)}
                        className={`py-2 rounded-lg text-sm font-semibold transition-colors border ${
                          labelSize === size
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {labelSizes[size].title}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {labelSizes[labelSize].description}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-2">
                        Custom Width (mm)
                      </label>
                      <input
                        className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        type="number"
                        min={1}
                        placeholder="e.g. 50"
                        value={customLabelWidthMm}
                        onChange={(e) => setCustomLabelWidthMm(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-2">
                        Custom Height (mm)
                      </label>
                      <input
                        className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        type="number"
                        min={1}
                        placeholder="e.g. 30"
                        value={customLabelHeightMm}
                        onChange={(e) => setCustomLabelHeightMm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-2">
                      Shop Name
                    </label>
                    <input
                      className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                      type="text"
                      placeholder="e.g. My Shop"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-2">
                      Custom Text 1
                    </label>
                    <input
                      className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                      type="text"
                      placeholder="e.g. Free shipping above ₹500"
                      value={customText1}
                      onChange={(e) => setCustomText1(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-2">
                      Custom Text 2
                    </label>
                    <input
                      className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                      type="text"
                      placeholder="e.g. Return policy: 7 days"
                      value={customText2}
                      onChange={(e) => setCustomText2(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <label className="flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900">
                        Show Product Name
                      </span>
                      <span className="text-xs text-slate-500">
                        Include title on top of each label
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={showName}
                      onChange={(e) => setShowName(e.target.checked)}
                      className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900">
                        Show Price
                      </span>
                      <span className="text-xs text-slate-500">
                        Include selling price on the label
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={showPrice}
                      onChange={(e) => setShowPrice(e.target.checked)}
                      className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>

                <div className="pt-4">
                  <div className="bg-blue-50 p-4 rounded-lg flex gap-3 border border-blue-100">
                    <span className="material-symbols-outlined text-blue-600">
                      info
                    </span>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      Use Actual Size when printing. PDF export and print sheet
                      both use the live barcode generated from the backend.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="col-span-12">
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <div>
                  <h3 className="font-h1 text-sm font-bold text-slate-900">
                    Label Preview
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Preview is built from the live print-data endpoint.
                  </p>
                </div>
              </div>

              {labelPreview.length > 0 ? (
                <>
                  <div
                    className={`grid gap-4 bg-slate-50 p-6 rounded-xl border border-slate-200 ${getGridClasses(labelSize)}`}
                  >
                    {labelPreview
                      .slice(0, Math.min(labelPreview.length, 6))
                      .map((label, index) => (
                      <div
                        key={`${label.barcode}-${index}`}
                        className={`bg-white border border-slate-300 rounded-xl shadow-sm p-4 flex flex-col justify-between transition-colors hover:border-blue-500 ${
                          labelSize === "large" ? "min-h-48" : "min-h-36"
                        }`}
                      >
                        {label.shopName ? (
                          <div className="text-[10px] font-bold text-slate-900 uppercase leading-tight mb-2">
                            {label.shopName}
                          </div>
                        ) : (
                          <div className="h-2 mb-2" />
                        )}
                        {label.showName ? (
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <span className="text-[10px] font-bold text-slate-900 uppercase leading-tight">
                              {label.productName}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                              #{String(index + 1).padStart(2, "0")}
                            </span>
                          </div>
                        ) : (
                          <div className="h-3 mb-3" />
                        )}

                        <Image
                          src={svgToDataUrl(label.image)}
                          alt={`Barcode ${label.barcode}`}
                          width={900}
                          height={300}
                          unoptimized
                          className="w-full h-auto rounded-md bg-white"
                        />

                        <div className="flex justify-between items-start mt-3 gap-3">
                          <div className="text-[9px] font-bold text-slate-900 truncate">
                            {label.customText1 || ""}
                          </div>
                          <div className="text-[9px] font-bold text-slate-900 truncate text-right">
                            {label.customText2 || ""}
                          </div>
                        </div>

                        <div className="flex justify-between items-end mt-1 gap-3">
                          <span className="text-[9px] font-mono tracking-widest text-slate-500 truncate">
                            {label.barcode}
                          </span>
                          {label.showPrice ? (
                            <span className="text-xs font-bold text-slate-900 whitespace-nowrap">
                              {formatINR(label.price)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      ))}
                  </div>
                  {labelPreview.length > 6 && (
                    <p className="text-xs text-slate-500 mt-3">
                      Showing 6 of {labelPreview.length} labels in preview.
                    </p>
                  )}
                </>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500">
                  <span className="material-symbols-outlined text-4xl text-slate-300 block mb-3">
                    barcode
                  </span>
                  Select a product and generate a barcode to see the live
                  preview.
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <footer className="h-20 bg-white border-t border-slate-200 px-8 flex items-center justify-between sticky bottom-0 z-40">
        <div className="text-xs text-slate-500 hidden md:block">
          {selectedProduct
            ? `Selected: ${selectedProduct.name}`
            : "No product selected"}
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              void handleDownloadPdf();
            }}
            className="px-6 h-11 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-bold rounded-lg transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">
              picture_as_pdf
            </span>
            Download PDF
          </button>
          <button
            type="button"
            onClick={() => {
              void handlePrintLabels();
            }}
            className="px-8 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">print</span>
            Print Labels
          </button>
        </div>
      </footer>

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-20 overflow-hidden">
        <div className="absolute top-[20%] right-[5%] w-125 h-125 bg-blue-100 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] left-[20%] w-75 h-75 bg-slate-200 rounded-full blur-[100px]"></div>
      </div>
    </div>
  );
}
