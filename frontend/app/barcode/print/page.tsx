"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { PrintLabelItem, svgToDataUrl } from "@/lib/labelEngine";

export default function BarcodePrintPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId") || "";
  const quantity = Math.max(1, Number(searchParams.get("quantity")) || 1);
  const shopName = searchParams.get("shopName") || "";
  const customText1 = searchParams.get("customText1") || "";
  const customText2 = searchParams.get("customText2") || "";

  const [labels, setLabels] = useState<PrintLabelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchLabels = async () => {
      if (!productId) {
        setError("Missing productId parameter");
        setLoading(false);
        return;
      }

      try {
        const response = await api.post<{ labels: PrintLabelItem[] }>(
          "/barcode/print-data",
          {
            productId,
            quantity,
            labelSize: "50x25",
            showName: true,
            showPrice: true,
            shopName: shopName || undefined,
            customText1: customText1 || undefined,
            customText2: customText2 || undefined,
          },
        );

        if (!cancelled) {
          setLabels(response.data.labels);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load barcode print data:", err);
          setError("Failed to load barcode print data");
          setLoading(false);
        }
      }
    };

    fetchLabels();

    return () => {
      cancelled = true;
    };
  }, [productId, quantity, shopName, customText1, customText2]);

  useEffect(() => {
    if (!loading && labels.length > 0) {
      // Trigger print after rendering
      const timer = setTimeout(() => {
        window.print();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading, labels]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-500 font-sans text-sm">
        Preparing 50mm × 25mm barcode labels...
      </div>
    );
  }

  if (error || labels.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500 font-sans text-sm">
        {error || "No labels available to print"}
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @page {
          size: 50mm 25mm;
          margin: 0 !important;
        }
        @media print {
          @page {
            size: 50mm 25mm;
            margin: 0 !important;
          }
          html,
          body {
            width: 50mm !important;
            height: 25mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header,
          footer,
          nav,
          aside,
          .no-print {
            display: none !important;
            visibility: hidden !important;
          }
        }
        * {
          box-sizing: border-box;
        }
        html,
        body {
          margin: 0;
          padding: 0;
          background: #ffffff;
          font-family: Arial, Helvetica, sans-serif;
        }
        .page-break {
          page-break-after: always;
          break-after: page;
        }
        .label-container {
          position: relative;
          width: 50mm;
          height: 25mm;
          overflow: hidden;
          background: #ffffff;
        }
        .shop-name {
          position: absolute;
          left: 4mm;
          top: 2mm;
          width: 42mm;
          font-size: 9pt;
          font-weight: 700;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1;
          color: #000000;
        }
        .product-name {
          position: absolute;
          left: 4mm;
          top: 5.5mm;
          width: 42mm;
          font-size: 10pt;
          font-weight: 700;
          text-align: center;
          line-height: 1.1;
          max-height: 7.5mm;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          text-overflow: ellipsis;
          color: #000000;
        }
        .barcode-wrapper {
          position: absolute;
          left: 4mm;
          top: 9.5mm;
          width: 42mm;
          height: 9.5mm;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .barcode-wrapper svg,
        .barcode-img {
          width: 100% !important;
          height: 100% !important;
          object-fit: fill !important;
          display: block !important;
        }
        .barcode-number {
          position: absolute;
          left: 4mm;
          top: 19mm;
          width: 42mm;
          font-size: 8pt;
          font-weight: 700;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1;
          color: #000000;
        }
        .text-1 {
          position: absolute;
          left: 4mm;
          top: 22mm;
          width: 20mm;
          font-size: 7pt;
          font-weight: 400;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1;
          color: #000000;
        }
        .text-2 {
          position: absolute;
          left: 26mm;
          top: 22mm;
          width: 20mm;
          font-size: 7pt;
          font-weight: 400;
          text-align: right;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1;
          color: #000000;
        }
      `}</style>

      <div>
        {labels.map((label, idx) => {
          const isLast = idx === labels.length - 1;
          const shopText = label.shopName || "";
          const text1 = label.customText1 || "";
          const text2 =
            label.customText2 ||
            (label.showPrice !== false && label.price !== undefined
              ? `₹${Number(label.price).toFixed(2)}`
              : "");

          return (
            <div
              key={`${label.barcode}-${idx}`}
              className={`label-container ${isLast ? "" : "page-break"}`}
            >
              {shopText ? <div className="shop-name">{shopText}</div> : null}
              <div className="product-name">{label.productName}</div>
              <div className="barcode-wrapper">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="barcode-img"
                  src={svgToDataUrl(label.image)}
                  alt={`Barcode ${label.barcode}`}
                />
              </div>
              <div className="barcode-number">{label.barcode}</div>
              <div className="text-1">{text1}</div>
              <div className="text-2">{text2}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}
