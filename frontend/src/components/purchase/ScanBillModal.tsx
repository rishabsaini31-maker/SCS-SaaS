"use client";

import React, { useState, useRef } from "react";
import api from "@/lib/api";

export interface ExtractedProductItem {
  productName: string;
  productCode?: string | null;
  description?: string | null;
  barcode?: string | null;
  hsn?: string | null;
  quantity: number;
  unit?: string | null;
  unitPrice?: number;
  purchaseRate?: number;
  mrp?: number;
  gstRate?: number;
  discount?: number;
  batch?: string | null;
  expiry?: string | null;
  amount?: number;
  confidence?: number | "high" | "medium" | "low";
  needsReview?: boolean;
  matchedProductId?: string;
  matchedProductName?: string;
  category?: string;
  matchType?: "barcode" | "supplier_mapping" | "name" | "hsn" | "new_product" | "exact";
  pastPrice?: number;
}

export interface ExtractedBillData {
  supplierName?: string;
  supplierGstin?: string;
  supplierAddress?: string | null;
  invoiceNumber?: string;
  invoiceDate?: string;
  poNumber?: string | null;
  paymentTerms?: string | null;
  dueDate?: string | null;
  subtotal?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  cess?: number;
  discount?: number;
  taxAmount?: number;
  roundOff?: number;
  freight?: number;
  grandTotal?: number;
  lineItems: ExtractedProductItem[];
  isDuplicate?: boolean;
  duplicatePurchaseId?: string;
  existingPurchaseNumber?: string;
  debug?: any;
}

interface ScanBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onApplyExtractedData: (data: ExtractedBillData) => void;
}

export default function ScanBillModal({
  isOpen,
  onClose,
  categories,
  onApplyExtractedData,
}: ScanBillModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedBillData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [duplicateModal, setDuplicateModal] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 20 * 1024 * 1024) {
        setErrorMsg("File size exceeds maximum allowed size of 20MB");
        return;
      }
      // Check 6: Reset previous scan state immediately on new upload
      setExtractedData(null);
      setErrorMsg("");
      setSelectedFile(file);

      // STEP 3: Frontend Logging
      console.log(`[FRONTEND_UPLOAD] File Selected: ${file.name} | Size: ${file.size} bytes | Last Modified: ${file.lastModified}`);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
        console.log(`[FRONTEND_UPLOAD] SHA-256 Hash: ${hashHex}`);
      } catch (err) {
        console.warn("[FRONTEND_UPLOAD] SHA-256 calculation skipped:", err);
      }

      // Reset file input target value so selecting the same filename again triggers onChange
      e.target.value = "";
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setExtractedData(null);
    setErrorMsg("");
    setDuplicateModal(false);
    onClose();
  };

  const handleUploadAndScan = async () => {
    if (!selectedFile) {
      setErrorMsg("Please select a bill file (PDF, JPG, PNG, WEBP, HEIC)");
      return;
    }

    setIsUploading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("billFile", selectedFile);

      const res = await api.post("/purchases/bill-scanner/scan", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data: ExtractedBillData = res.data.data;
      setExtractedData(data);

      if (data.isDuplicate) {
        setDuplicateModal(true);
      }
    } catch (err: any) {
      console.error("Bill Scan Error:", err);
      setErrorMsg(
        err?.response?.data?.message || "Failed to parse bill. Please check file format."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleApply = () => {
    if (extractedData) {
      onApplyExtractedData(extractedData);
      handleClose();
    }
  };

  const updateItemCategory = (index: number, category: string) => {
    if (!extractedData) return;
    const updatedLineItems = [...extractedData.lineItems];
    updatedLineItems[index] = { ...updatedLineItems[index], category };
    setExtractedData({ ...extractedData, lineItems: updatedLineItems });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-800">Scan Purchase Bill</h2>
            <button 
              onClick={() => setShowDebug(!showDebug)} 
              className={`px-2 py-1 text-xs font-medium rounded-md border ${showDebug ? "bg-red-50 text-red-600 border-red-200" : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"}`}
            >
              🐞 Debug
            </button>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 rounded-full p-1 transition"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {/* Upload Area */}
          {!extractedData && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-200 hover:border-blue-500 rounded-xl p-8 text-center bg-blue-50/40 hover:bg-blue-50 transition cursor-pointer flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined text-3xl">upload_file</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-700">
                    Click to upload or drag & drop purchase bill
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports PDF, JPG, JPEG, PNG, HEIC, WEBP (Max 20MB)
                  </p>
                </div>
                {selectedFile && (
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                    <span>📄 {selectedFile.name}</span>
                    <span className="text-xs text-blue-600">
                      ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.heic,.webp"
                onChange={handleFileSelect}
                className="hidden"
              />

              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                  ⚠️ {errorMsg}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedFile || isUploading}
                  onClick={handleUploadAndScan}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <span className="animate-spin">⏳</span> AI Reading Bill...
                    </>
                  ) : (
                    <>
                      <span>Scan Bill</span> →
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Extracted Bill Preview & Product Verification */}
          {extractedData && !showDebug && (
            <div className="space-y-6">
              {/* Invoice Metadata Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
                <div>
                  <span className="text-slate-500 block text-xs">Supplier</span>
                  <span className="font-semibold text-slate-800">
                    {extractedData.supplierName || "Not specified"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Invoice No</span>
                  <span className="font-semibold text-slate-800">
                    {extractedData.invoiceNumber || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Invoice Date</span>
                  <span className="font-semibold text-slate-800">
                    {extractedData.invoiceDate || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Grand Total</span>
                  <span className="font-semibold text-emerald-700">
                    ₹{extractedData.grandTotal?.toLocaleString("en-IN") || "0"}
                  </span>
                </div>
              </div>

              {/* Extracted Product Table */}
              <div>
                <h3 className="font-bold text-slate-700 text-sm mb-3">
                  Extracted Line Items ({extractedData.lineItems.length})
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b">
                      <tr>
                        <th className="p-3">Status</th>
                        <th className="p-3">Extracted Product</th>
                        <th className="p-3 text-right">Qty</th>
                        <th className="p-3 text-right">Price</th>
                        <th className="p-3">Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {extractedData.lineItems.map((item, idx) => {
                        const isMatched = item.matchType && item.matchType !== "new_product";
                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-3">
                              {isMatched ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                                  ✓ Matched
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
                                  ⚠ New Product
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              <p className="font-medium text-slate-800">{item.productName}</p>
                              {item.matchedProductName && (
                                <p className="text-xs text-slate-400">
                                  Linked to: {item.matchedProductName}
                                </p>
                              )}
                              {item.barcode && (
                                <span className="text-xs text-slate-400 block font-mono">
                                  Barcode: {item.barcode}
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right font-semibold">{item.quantity}</td>
                            <td className="p-3 text-right">
                              {(() => {
                                if (item.pastPrice) {
                                  return (
                                    <div className="flex flex-col items-end">
                                      <span>₹{item.pastPrice}</span>
                                      <span className="text-[10px] text-emerald-600 font-medium whitespace-nowrap bg-emerald-50 px-1 py-0.5 rounded">
                                        (Using Past DB Price)
                                      </span>
                                    </div>
                                  );
                                }
                                const price = item.purchaseRate ?? item.unitPrice ?? 0;
                                return `₹${price}`;
                              })()}
                            </td>
                            <td className="p-3">
                              {!isMatched ? (
                                <select
                                  value={item.category || ""}
                                  onChange={(e) => updateItemCategory(idx, e.target.value)}
                                  className="w-full text-xs p-1.5 border border-amber-300 rounded focus:ring-1 focus:ring-amber-500 bg-amber-50"
                                >
                                  <option value="">▼ Select Category</option>
                                  {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                      {cat}
                                    </option>
                                  ))}
                                  <option value="General">General</option>
                                </select>
                              ) : (
                                <span className="text-xs text-slate-600 font-medium">
                                  {item.category || "General"}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setExtractedData(null)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  ← Upload Different File
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApply}
                    className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium shadow-sm"
                  >
                    Auto-Fill Purchase Form →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Debug View */}
          {extractedData && showDebug && extractedData.debug && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <h3 className="text-red-800 font-bold text-sm">Pipeline Diagnostics</h3>
                  <p className="text-red-600 text-xs mt-1">Uploaded: {selectedFile?.name} | Size: {selectedFile?.size} bytes</p>
                </div>
                <div className="flex gap-4 text-sm font-semibold">
                  <div className="bg-white px-3 py-1 rounded shadow-sm text-slate-700">OCR Lines: <span className="text-blue-600">{extractedData.debug.ocrLineCount}</span></div>
                  <div className="bg-white px-3 py-1 rounded shadow-sm text-slate-700">AI Products: <span className="text-green-600">{extractedData.debug.aiItemCount}</span></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-slate-700">Raw OCR Extracted Text (Input to AI)</h4>
                  <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-[10px] h-[300px] overflow-y-auto whitespace-pre-wrap">
                    {extractedData.debug.rawOcrText || "[Empty]"}
                  </pre>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-slate-700">AI Request Prompt Payload</h4>
                  <pre className="bg-slate-900 text-blue-300 p-4 rounded-lg text-[10px] h-[300px] overflow-y-auto whitespace-pre-wrap">
                    {extractedData.debug.aiPrompt || "[Empty or Local Parser Used]"}
                  </pre>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-slate-700">Raw AI JSON Output</h4>
                  <pre className="bg-slate-900 text-yellow-300 p-4 rounded-lg text-[10px] h-[300px] overflow-y-auto whitespace-pre-wrap">
                    {extractedData.debug.aiResponse || "[Empty or Local Parser Used]"}
                  </pre>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-slate-700">Final Parsed JSON Object</h4>
                  <pre className="bg-slate-800 text-slate-200 p-4 rounded-lg text-[10px] h-[300px] overflow-y-auto whitespace-pre-wrap">
                    {JSON.stringify(extractedData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Duplicate Warning Dialog */}
        {duplicateModal && (
          <div className="absolute inset-0 z-50 bg-black/60 rounded-2xl flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center gap-3 text-amber-600">
                <span className="material-symbols-outlined text-3xl">warning</span>
                <h3 className="font-bold text-lg text-slate-800">Invoice Already Exists</h3>
              </div>
              <p className="text-sm text-slate-600">
                Invoice Number{" "}
                <span className="font-bold text-slate-800">
                  {extractedData?.invoiceNumber}
                </span>{" "}
                has already been imported previously in Purchase Order{" "}
                <span className="font-semibold text-blue-600">
                  {extractedData?.existingPurchaseNumber || "record"}
                </span>
                .
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => setDuplicateModal(false)}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Import Again
                </button>
                <button
                  onClick={() => {
                    setDuplicateModal(false);
                    onClose();
                  }}
                  className="w-full py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200"
                >
                  Cancel Import
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
