"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  DEFAULT_50X25_TEMPLATE,
  DEFAULT_PRINTER_SETTINGS,
  LabelTemplateSpec,
  PrinterSettingsSpec,
  openThermalPrintWindow,
  svgToDataUrl,
} from "@/lib/labelEngine";

// Sample barcode SVG for live preview
const SAMPLE_BARCODE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="60" viewBox="0 0 320 60"><rect width="320" height="60" fill="#ffffff"/><g fill="#000000"><rect x="10" y="5" width="4" height="50"/><rect x="18" y="5" width="2" height="50"/><rect x="24" y="5" width="6" height="50"/><rect x="34" y="5" width="2" height="50"/><rect x="40" y="5" width="4" height="50"/><rect x="48" y="5" width="8" height="50"/><rect x="60" y="5" width="2" height="50"/><rect x="66" y="5" width="4" height="50"/><rect x="74" y="5" width="6" height="50"/><rect x="84" y="5" width="2" height="50"/><rect x="90" y="5" width="4" height="50"/><rect x="98" y="5" width="8" height="50"/><rect x="110" y="5" width="2" height="50"/><rect x="116" y="5" width="4" height="50"/><rect x="124" y="5" width="6" height="50"/><rect x="134" y="5" width="2" height="50"/><rect x="140" y="5" width="4" height="50"/><rect x="148" y="5" width="8" height="50"/><rect x="160" y="5" width="2" height="50"/><rect x="166" y="5" width="4" height="50"/><rect x="174" y="5" width="6" height="50"/><rect x="184" y="5" width="2" height="50"/><rect x="190" y="5" width="4" height="50"/><rect x="198" y="5" width="8" height="50"/><rect x="210" y="5" width="2" height="50"/><rect x="216" y="5" width="4" height="50"/><rect x="224" y="5" width="6" height="50"/><rect x="234" y="5" width="2" height="50"/><rect x="240" y="5" width="4" height="50"/><rect x="248" y="5" width="8" height="50"/><rect x="260" y="5" width="2" height="50"/><rect x="266" y="5" width="4" height="50"/><rect x="274" y="5" width="6" height="50"/><rect x="284" y="5" width="2" height="50"/><rect x="290" y="5" width="4" height="50"/><rect x="298" y="5" width="6" height="50"/><rect x="308" y="5" width="4" height="50"/></g></svg>`;

export default function PrintingSettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"designer" | "settings" | "tspl">("designer");

  // Local state for printer settings & template designer
  const [printerSettings, setPrinterSettings] = useState<PrinterSettingsSpec>(
    DEFAULT_PRINTER_SETTINGS,
  );
  const [template, setTemplate] = useState<LabelTemplateSpec>(DEFAULT_50X25_TEMPLATE);

  // Live preview sample data
  const [sampleShop, setSampleShop] = useState("MY SUPERSTORE");
  const [sampleProduct, setSampleProduct] = useState("PREMIUM COTTON SHIRT XL");
  const [sampleBarcode, setSampleBarcode] = useState("PRD-000001");
  const [samplePrice, setSamplePrice] = useState("499.00");
  const [sampleText1, setSampleText1] = useState("PKD: 07/26");
  const [sampleText2, setSampleText2] = useState("INCL ALL TAXES");

  const [tsplOutput, setTsplOutput] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const { data: config, isLoading } = useQuery({
    queryKey: ["printing-config"],
    queryFn: async () => {
      const res = await api.get<{
        printerSettings: PrinterSettingsSpec;
        activeTemplate: LabelTemplateSpec;
        customTemplates: LabelTemplateSpec[];
      }>("/barcode/printing-config");
      return res.data;
    },
  });

  useEffect(() => {
    if (config) {
      if (config.printerSettings) setPrinterSettings(config.printerSettings);
      if (config.activeTemplate) setTemplate(config.activeTemplate);
    }
  }, [config]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await api.patch("/barcode/printing-config", {
        printerSettings,
        activeTemplate: template,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["printing-config"] });
      setStatusMsg("Settings & Template saved successfully!");
      setTimeout(() => setStatusMsg(""), 3000);
    },
    onError: (err) => {
      console.error(err);
      alert("Failed to save settings");
    },
  });

  const handleTestPrint = () => {
    openThermalPrintWindow(
      [
        {
          barcode: sampleBarcode,
          image: SAMPLE_BARCODE_SVG,
          productName: sampleProduct,
          price: Number(samplePrice) || 499,
          labelSize: "50x25",
          labelWidthMm: template.widthMm,
          labelHeightMm: template.heightMm,
          shopName: sampleShop,
          customText1: sampleText1,
          customText2: sampleText2,
        },
      ],
      template,
    );
  };

  const handleGenerateTspl = async () => {
    try {
      const res = await api.post<{ tsplScript: string }>("/barcode/print-tspl", {
        productId: "sample",
        copies: printerSettings.defaultCopies || 1,
        shopName: sampleShop,
        customText1: sampleText1,
        customText2: sampleText2,
      });
      setTsplOutput(res.data.tsplScript);
    } catch {
      // Fallback client TSPL text generator
      const script = `SIZE 50 mm, 25 mm\nGAP 2 mm, 0 mm\nDENSITY 10\nSPEED 4\nDIRECTION 1\nCLS\nTEXT 16,16,"3",0,1,1,"${sampleShop}"\nTEXT 200,48,"3",0,1,1,2,"${sampleProduct}"\nBARCODE 40,80,"128",64,1,0,2,2,"${sampleBarcode}"\nTEXT 200,152,"2",0,1,1,2,"${sampleBarcode}"\nTEXT 16,176,"1",0,1,1,"${sampleText1}"\nTEXT 384,176,"1",0,1,1,3,"₹${samplePrice}"\nPRINT 1,1`;
      setTsplOutput(script);
    }
  };

  const handleResetTemplate = () => {
    setTemplate(DEFAULT_50X25_TEMPLATE);
    setStatusMsg("Reset to default 50x25mm (1 UPS) template");
    setTimeout(() => setStatusMsg(""), 3000);
  };

  if (isLoading) {
    return <div className="p-8 text-slate-500">Loading label engine settings...</div>;
  }

  // 1mm = 12px for high detail designer preview (50mm = 600px, 25mm = 300px)
  const previewScale = 10; // 1mm = 10px

  return (
    <div className="flex flex-col flex-1 min-h-[calc(100vh-64px)] relative bg-slate-50">
      <main className="p-8 flex-1 z-10 relative space-y-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-600 text-3xl">
                print
              </span>
              <div>
                <h1 className="font-h1 text-2xl font-bold text-slate-900">
                  SCS Flow – Enterprise Barcode Label Engine
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  50mm × 25mm (1 UPS) Physical Label Designer & Thermal Printer Config
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {statusMsg && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                {statusMsg}
              </span>
            )}
            <button
              type="button"
              onClick={handleTestPrint}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
            >
              <span className="material-symbols-outlined text-base">print</span>
              Print Test Label (100%)
            </button>
            <button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-base">save</span>
              {saveMutation.isPending ? "Saving..." : "Save Template"}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-sm border">
          <button
            type="button"
            onClick={() => setActiveTab("designer")}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === "designer"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span className="material-symbols-outlined text-lg">design_services</span>
            Label Designer (50mm × 25mm)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === "settings"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span className="material-symbols-outlined text-lg">settings</span>
            Printer Hardware Settings
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("tspl");
              void handleGenerateTspl();
            }}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === "tspl"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span className="material-symbols-outlined text-lg">code</span>
            TSPL Command Export
          </button>
        </div>

        {/* TAB 1: LABEL DESIGNER */}
        {activeTab === "designer" && (
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* Live 1:1 Physical Designer Preview */}
            <div className="col-span-12 lg:col-span-6 space-y-6">
              <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-h1 text-sm font-bold text-slate-900">
                      Live Physical Preview (1:1 Aspect Ratio)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Rendered at exact {template.widthMm}mm × {template.heightMm}mm dimensions.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full uppercase">
                    1 UPS • {printerSettings.dpi} DPI
                  </span>
                </div>

                {/* Physical Label Mockup Box */}
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 bg-slate-100 flex flex-col items-center justify-center">
                  <div
                    style={{
                      width: `${template.widthMm * previewScale}px`,
                      height: `${template.heightMm * previewScale}px`,
                    }}
                    className="bg-white border border-slate-900 shadow-xl rounded-sm relative overflow-hidden transition-all select-none"
                  >
                    {/* Safe Padding Outline */}
                    <div
                      style={{
                        position: "absolute",
                        left: `${template.paddingMm * previewScale}px`,
                        top: `${template.paddingMm * previewScale}px`,
                        width: `${(template.widthMm - template.paddingMm * 2) * previewScale}px`,
                        height: `${(template.heightMm - template.paddingMm * 2) * previewScale}px`,
                      }}
                      className="border border-red-200 border-dashed pointer-events-none opacity-40"
                    />

                    {/* Shop Name */}
                    {sampleShop && (
                      <div
                        style={{
                          position: "absolute",
                          left: `${template.shopName.xMm * previewScale}px`,
                          top: `${template.shopName.yMm * previewScale}px`,
                          width: `${template.shopName.widthMm * previewScale}px`,
                          fontSize: `${template.shopName.fontSizePt * 1.2}px`,
                          fontWeight: template.shopName.fontBold ? 700 : 400,
                          textAlign: template.shopName.align,
                        }}
                        className="truncate text-slate-900 leading-none"
                      >
                        {sampleShop}
                      </div>
                    )}

                    {/* Product Name */}
                    {sampleProduct && (
                      <div
                        style={{
                          position: "absolute",
                          left: `${template.productName.xMm * previewScale}px`,
                          top: `${template.productName.yMm * previewScale}px`,
                          width: `${template.productName.widthMm * previewScale}px`,
                          fontSize: `${template.productName.fontSizePt * 1.2}px`,
                          fontWeight: template.productName.fontBold ? 700 : 400,
                          textAlign: template.productName.align,
                          lineHeight: "1.1",
                          maxHeight: "75px",
                        }}
                        className="line-clamp-2 overflow-hidden text-slate-900"
                      >
                        {sampleProduct}
                      </div>
                    )}

                    {/* Barcode Image */}
                    <div
                      style={{
                        position: "absolute",
                        left: `${template.barcode.xMm * previewScale}px`,
                        top: `${template.barcode.yMm * previewScale}px`,
                        width: `${template.barcode.widthMm * previewScale}px`,
                        height: `${template.barcode.heightMm * previewScale}px`,
                      }}
                      className="flex items-center justify-center"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={svgToDataUrl(SAMPLE_BARCODE_SVG)}
                        alt="Sample Barcode"
                        className="w-full h-full object-fill"
                      />
                    </div>

                    {/* Barcode Number */}
                    <div
                      style={{
                        position: "absolute",
                        left: `${template.barcodeNumber.xMm * previewScale}px`,
                        top: `${template.barcodeNumber.yMm * previewScale}px`,
                        width: `${template.barcodeNumber.widthMm * previewScale}px`,
                        fontSize: `${template.barcodeNumber.fontSizePt * 1.2}px`,
                        fontWeight: template.barcodeNumber.fontBold ? 700 : 400,
                        textAlign: template.barcodeNumber.align,
                      }}
                      className="truncate text-slate-900 leading-none tracking-widest"
                    >
                      {sampleBarcode}
                    </div>

                    {/* Text 1 */}
                    {sampleText1 && (
                      <div
                        style={{
                          position: "absolute",
                          left: `${template.text1.xMm * previewScale}px`,
                          top: `${template.text1.yMm * previewScale}px`,
                          width: `${template.text1.widthMm * previewScale}px`,
                          fontSize: `${template.text1.fontSizePt * 1.2}px`,
                          fontWeight: template.text1.fontBold ? 700 : 400,
                          textAlign: template.text1.align,
                        }}
                        className="truncate text-slate-900 leading-none"
                      >
                        {sampleText1}
                      </div>
                    )}

                    {/* Text 2 */}
                    {(sampleText2 || samplePrice) && (
                      <div
                        style={{
                          position: "absolute",
                          left:
                            template.text2.align === "right"
                              ? `${(template.text2.xMm - template.text2.widthMm) * previewScale}px`
                              : `${template.text2.xMm * previewScale}px`,
                          top: `${template.text2.yMm * previewScale}px`,
                          width: `${template.text2.widthMm * previewScale}px`,
                          fontSize: `${template.text2.fontSizePt * 1.2}px`,
                          fontWeight: template.text2.fontBold ? 700 : 400,
                          textAlign: template.text2.align,
                        }}
                        className="truncate text-slate-900 leading-none"
                      >
                        {sampleText2 || `₹${samplePrice}`}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mt-4">
                    Label Dimensions: {template.widthMm}mm (W) × {template.heightMm}mm (H)
                  </p>
                </div>

                {/* Sample Test Data Fields */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Live Preview Sample Data
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">Shop</label>
                      <input
                        className="w-full h-9 bg-slate-50 border border-slate-200 rounded px-2.5 text-xs text-slate-900"
                        value={sampleShop}
                        onChange={(e) => setSampleShop(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">Product</label>
                      <input
                        className="w-full h-9 bg-slate-50 border border-slate-200 rounded px-2.5 text-xs text-slate-900"
                        value={sampleProduct}
                        onChange={(e) => setSampleProduct(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">Barcode</label>
                      <input
                        className="w-full h-9 bg-slate-50 border border-slate-200 rounded px-2.5 text-xs text-slate-900"
                        value={sampleBarcode}
                        onChange={(e) => setSampleBarcode(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">Price</label>
                      <input
                        className="w-full h-9 bg-slate-50 border border-slate-200 rounded px-2.5 text-xs text-slate-900"
                        value={samplePrice}
                        onChange={(e) => setSamplePrice(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleResetTemplate}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">restart_alt</span>
                    Reset Template to Standard 50x25mm
                  </button>
                </div>
              </section>
            </div>

            {/* Element Positioning Controls */}
            <div className="col-span-12 lg:col-span-6 space-y-6">
              <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-h1 text-sm font-bold text-slate-900">
                    Element Position & Dimension Controls (mm)
                  </h3>
                  <span className="text-xs text-slate-500">±0.5mm Accuracy Target</span>
                </div>

                {/* Shop Name Position */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-900">Shop Name</span>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 block">X (mm)</label>
                      <input
                        type="number"
                        step="0.5"
                        className="w-full h-8 bg-white border border-slate-200 rounded px-2 text-xs font-semibold"
                        value={template.shopName.xMm}
                        onChange={(e) =>
                          setTemplate((prev) => ({
                            ...prev,
                            shopName: { ...prev.shopName, xMm: Number(e.target.value) },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">Y (mm)</label>
                      <input
                        type="number"
                        step="0.5"
                        className="w-full h-8 bg-white border border-slate-200 rounded px-2 text-xs font-semibold"
                        value={template.shopName.yMm}
                        onChange={(e) =>
                          setTemplate((prev) => ({
                            ...prev,
                            shopName: { ...prev.shopName, yMm: Number(e.target.value) },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">Font (pt)</label>
                      <input
                        type="number"
                        className="w-full h-8 bg-white border border-slate-200 rounded px-2 text-xs font-semibold"
                        value={template.shopName.fontSizePt}
                        onChange={(e) =>
                          setTemplate((prev) => ({
                            ...prev,
                            shopName: { ...prev.shopName, fontSizePt: Number(e.target.value) },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">Align</label>
                      <select
                        className="w-full h-8 bg-white border border-slate-200 rounded px-1 text-xs font-semibold"
                        value={template.shopName.align}
                        onChange={(e) =>
                          setTemplate((prev) => ({
                            ...prev,
                            shopName: { ...prev.shopName, align: e.target.value as any },
                          }))
                        }
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Product Name Position */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-900">Product Name</span>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 block">X (mm)</label>
                      <input
                        type="number"
                        step="0.5"
                        className="w-full h-8 bg-white border border-slate-200 rounded px-2 text-xs font-semibold"
                        value={template.productName.xMm}
                        onChange={(e) =>
                          setTemplate((prev) => ({
                            ...prev,
                            productName: { ...prev.productName, xMm: Number(e.target.value) },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">Y (mm)</label>
                      <input
                        type="number"
                        step="0.5"
                        className="w-full h-8 bg-white border border-slate-200 rounded px-2 text-xs font-semibold"
                        value={template.productName.yMm}
                        onChange={(e) =>
                          setTemplate((prev) => ({
                            ...prev,
                            productName: { ...prev.productName, yMm: Number(e.target.value) },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">Font (pt)</label>
                      <input
                        type="number"
                        className="w-full h-8 bg-white border border-slate-200 rounded px-2 text-xs font-semibold"
                        value={template.productName.fontSizePt}
                        onChange={(e) =>
                          setTemplate((prev) => ({
                            ...prev,
                            productName: {
                              ...prev.productName,
                              fontSizePt: Number(e.target.value),
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">Align</label>
                      <select
                        className="w-full h-8 bg-white border border-slate-200 rounded px-1 text-xs font-semibold"
                        value={template.productName.align}
                        onChange={(e) =>
                          setTemplate((prev) => ({
                            ...prev,
                            productName: { ...prev.productName, align: e.target.value as any },
                          }))
                        }
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Barcode Dimensions */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-900">
                    Barcode Image (CODE128)
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 block">X (mm)</label>
                      <input
                        type="number"
                        step="0.5"
                        className="w-full h-8 bg-white border border-slate-200 rounded px-2 text-xs font-semibold"
                        value={template.barcode.xMm}
                        onChange={(e) =>
                          setTemplate((prev) => ({
                            ...prev,
                            barcode: { ...prev.barcode, xMm: Number(e.target.value) },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">Y (mm)</label>
                      <input
                        type="number"
                        step="0.5"
                        className="w-full h-8 bg-white border border-slate-200 rounded px-2 text-xs font-semibold"
                        value={template.barcode.yMm}
                        onChange={(e) =>
                          setTemplate((prev) => ({
                            ...prev,
                            barcode: { ...prev.barcode, yMm: Number(e.target.value) },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">Width (mm)</label>
                      <input
                        type="number"
                        className="w-full h-8 bg-white border border-slate-200 rounded px-2 text-xs font-semibold"
                        value={template.barcode.widthMm}
                        onChange={(e) =>
                          setTemplate((prev) => ({
                            ...prev,
                            barcode: { ...prev.barcode, widthMm: Number(e.target.value) },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">Height (mm)</label>
                      <input
                        type="number"
                        className="w-full h-8 bg-white border border-slate-200 rounded px-2 text-xs font-semibold"
                        value={template.barcode.heightMm}
                        onChange={(e) =>
                          setTemplate((prev) => ({
                            ...prev,
                            barcode: { ...prev.barcode, heightMm: Number(e.target.value) },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Barcode Number & Text Fields */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-900">
                    Barcode Number & Footer Text 1 / Text 2
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 block">Number Y (mm)</label>
                      <input
                        type="number"
                        step="0.5"
                        className="w-full h-8 bg-white border border-slate-200 rounded px-2 text-xs font-semibold"
                        value={template.barcodeNumber.yMm}
                        onChange={(e) =>
                          setTemplate((prev) => ({
                            ...prev,
                            barcodeNumber: {
                              ...prev.barcodeNumber,
                              yMm: Number(e.target.value),
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">Text 1 Y (mm)</label>
                      <input
                        type="number"
                        step="0.5"
                        className="w-full h-8 bg-white border border-slate-200 rounded px-2 text-xs font-semibold"
                        value={template.text1.yMm}
                        onChange={(e) =>
                          setTemplate((prev) => ({
                            ...prev,
                            text1: { ...prev.text1, yMm: Number(e.target.value) },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">Text 2 Y (mm)</label>
                      <input
                        type="number"
                        step="0.5"
                        className="w-full h-8 bg-white border border-slate-200 rounded px-2 text-xs font-semibold"
                        value={template.text2.yMm}
                        onChange={(e) =>
                          setTemplate((prev) => ({
                            ...prev,
                            text2: { ...prev.text2, yMm: Number(e.target.value) },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* TAB 2: PRINTER HARDWARE SETTINGS */}
        {activeTab === "settings" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6 max-w-3xl">
            <h3 className="font-h1 text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Tenant Thermal Printer Hardware Setup
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Printer Model Name
                </label>
                <input
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm text-slate-900 font-semibold"
                  value={printerSettings.printerName}
                  onChange={(e) =>
                    setPrinterSettings((prev) => ({ ...prev, printerName: e.target.value }))
                  }
                  placeholder="e.g. TSC DA210 / Xprinter XP-365B"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Printer DPI Resolution
                </label>
                <select
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm text-slate-900 font-semibold"
                  value={printerSettings.dpi}
                  onChange={(e) =>
                    setPrinterSettings((prev) => ({
                      ...prev,
                      dpi: Number(e.target.value) as any,
                    }))
                  }
                >
                  <option value={203}>203 DPI (Default Thermal)</option>
                  <option value={300}>300 DPI (High Resolution)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Label Size Preset
                </label>
                <select
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm text-slate-900 font-semibold"
                  value={printerSettings.labelSize}
                  onChange={(e) =>
                    setPrinterSettings((prev) => ({
                      ...prev,
                      labelSize: e.target.value as any,
                    }))
                  }
                >
                  <option value="50x25">50mm × 25mm (1 UPS Standard)</option>
                  <option value="38x25">38mm × 25mm</option>
                  <option value="100x50">100mm × 50mm</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Print Darkness (1 - 15)
                </label>
                <input
                  type="number"
                  min={1}
                  max={15}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm text-slate-900 font-semibold"
                  value={printerSettings.darkness}
                  onChange={(e) =>
                    setPrinterSettings((prev) => ({
                      ...prev,
                      darkness: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Print Speed (ips)
                </label>
                <input
                  type="number"
                  min={2}
                  max={6}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm text-slate-900 font-semibold"
                  value={printerSettings.printSpeed}
                  onChange={(e) =>
                    setPrinterSettings((prev) => ({
                      ...prev,
                      printSpeed: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Label Gap (mm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm text-slate-900 font-semibold"
                  value={printerSettings.gapMm}
                  onChange={(e) =>
                    setPrinterSettings((prev) => ({
                      ...prev,
                      gapMm: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Default Copies
                </label>
                <input
                  type="number"
                  min={1}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm text-slate-900 font-semibold"
                  value={printerSettings.defaultCopies}
                  onChange={(e) =>
                    setPrinterSettings((prev) => ({
                      ...prev,
                      defaultCopies: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => saveMutation.mutate()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all"
            >
              Save Printer Hardware Settings
            </button>
          </div>
        )}

        {/* TAB 3: TSPL COMMAND EXPORT */}
        {activeTab === "tspl" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-h1 text-base font-bold text-slate-900">
                  Raw TSPL Thermal Script Output
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Use for SCS Print Agent or direct raw TCP/USB thermal printer output.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(tsplOutput);
                  alert("TSPL script copied to clipboard!");
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
                Copy Script
              </button>
            </div>

            <textarea
              readOnly
              rows={14}
              className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-xl outline-none leading-relaxed"
              value={tsplOutput}
            />
          </div>
        )}
      </main>
    </div>
  );
}
