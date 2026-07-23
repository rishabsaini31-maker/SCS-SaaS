import { CustomError } from "../../common/errors/CustomError";
import { parseLocalInvoice } from "./localScanner.parser";
import { ExtractedBillData } from "./localScanner.parser";
import prisma from "../../common/db/prisma";
import { tenantWhere } from "../../common/tenant/tenant.utils";

export async function processAndMatchInvoice(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string,
  tenantId?: string
): Promise<ExtractedBillData> {
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
  const randomHash = Math.random().toString(36).substring(2, 8);
  const scanId = `scan_${timestamp}_${randomHash}`;

  console.log(`\n======================================================`);
  console.log(`[SCAN_ID]: ${scanId} | Starting Local Extraction Pipeline (NO AI)`);
  console.log(`======================================================\n`);

  let stageLogs: string[] = [];
  let rawText = "";

  stageLogs.push(`--- Stage 1: File Upload & Validation ---`);
  stageLogs.push(`File Name: ${fileName} | MIME: ${mimeType}`);

  const startExtraction = Date.now();

  if (mimeType.includes("pdf") || fileName.toLowerCase().endsWith(".pdf")) {
    stageLogs.push(`--- Stage 2: Digital PDF Parsing (pdfjs-dist) ---`);
    try {
      const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(fileBuffer) });
      const pdfDocument = await loadingTask.promise;
      const numPages = pdfDocument.numPages;
      let textChunks: string[] = [];
      
      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        let pageText = "";
        let lastY = -1;
        for (const item of textContent.items) {
          if (!item.str || item.str.trim() === "") continue;
          const y = item.transform[5];
          if (lastY !== -1 && Math.abs(y - lastY) > 5) {
            pageText += "\n" + item.str.trim();
          } else {
            pageText += " " + item.str.trim();
          }
          lastY = y;
        }
        textChunks.push(pageText.trim());
      }
      
      rawText = textChunks.join("\n").replace(/\u0000/g, "").trim();
      
      stageLogs.push(`Parser Used: pdfjs-dist`);
      stageLogs.push(`Page Count: ${numPages}`);
      stageLogs.push(`Extracted Text Length: ${rawText.length}`);
    } catch (e: any) {
      stageLogs.push(`pdfjs-dist failed: ${e.message}`);
    }
  }

  // --- Stage 3: OCR Fallback ---
  if (rawText.length < 100) {
    stageLogs.push(`--- Stage 3: PaddleOCR Fallback ---`);
    try {
      const { PaddleOcrService } = require("ppu-paddle-ocr");
      try {
        const { PaddleOcrService } = require("ppu-paddle-ocr");
        const service = new PaddleOcrService();
        await service.initialize();
        const uint8Array = new Uint8Array(fileBuffer);
        const res = await service.recognize(uint8Array);
        if (res && res.text) rawText = res.text;
        await service.destroy();
        stageLogs.push(`OCR Engine Used: PaddleOCR (ppu-paddle-ocr)`);
      } catch (paddleErr: any) {
        stageLogs.push(`PaddleOCR failed (${paddleErr.message}). Falling back to Tesseract.js...`);
        const Tesseract = require("tesseract.js");
        const { data: { text } } = await Tesseract.recognize(fileBuffer, 'eng'); // Use fileBuffer directly
        rawText = text;
        stageLogs.push(`OCR Engine Used: Tesseract.js (Graceful Fallback)`);
      }
      
      stageLogs.push(`OCR Text Length: ${rawText.length}`);
    } catch (e: any) {
      stageLogs.push(`PaddleOCR failed: ${e.message}. (Ensure ONNX runtime binaries are compiled for this OS).`);
    }
  }

  // --- Stage 9: Barcode Recognition (ZXing) ---
  stageLogs.push(`--- Stage 9: ZXing Barcode Scan ---`);
  let detectedBarcode = null;
  try {
    const { MultiFormatReader } = require('@zxing/library');
    stageLogs.push(`Skipping ZXing visual decode due to missing canvas dependency in Node.`);
  } catch (e: any) {
     stageLogs.push(`ZXing scan skipped/failed: ${e.message}`);
  }

  const extractionLatency = Date.now() - startExtraction;

  if (rawText.length < 50) {
    console.error(`[${scanId}] Pipeline Aborted. Debug Logs:\n${stageLogs.join("\n")}`);
    throw new CustomError("No readable text found in uploaded document.", 400);
  }

  // --- Stages 5-8: Regex Parsing ---
  stageLogs.push(`--- Stage 5: Rule-Based Parser (NO AI) ---`);
  const parsingStart = Date.now();
  const parsedData = parseLocalInvoice(rawText, scanId);
  const parsingLatency = Date.now() - parsingStart;

  stageLogs.push(`Parsed Items: ${parsedData.lineItems.length}`);
  
  if (detectedBarcode) {
    // If a barcode was found outside the text, apply it globally or locally
    stageLogs.push(`Global Barcode Applied: ${detectedBarcode}`);
  }

  // --- Stage 10: Inventory Matching Engine ---
  stageLogs.push(`--- Stage 10: Inventory Matching Engine ---`);
  let matchedCount = 0;
  for (let i = 0; i < parsedData.lineItems.length; i++) {
    const item = parsedData.lineItems[i];
    if (!item) continue;
    if (!item.productName || item.productName === "UNKNOWN PRODUCT") continue;

    try {
      const existingProduct = await prisma.product.findFirst({
        where: tenantWhere(tenantId, {
          name: { equals: item.productName, mode: "insensitive" },
        } as any),
        select: { id: true, name: true, purchasePrice: true },
      });

      if (existingProduct) {
        item.matchedProductId = existingProduct.id;
        item.matchedProductName = existingProduct.name;
        item.matchType = "exact";
        item.pastPrice = existingProduct.purchasePrice;
        matchedCount++;
      } else {
        item.matchType = "new_product";
      }
    } catch (err: any) {
      stageLogs.push(`Matching error for ${item.productName}: ${err.message}`);
    }
  }
  stageLogs.push(`Inventory Matching: Found ${matchedCount} existing products.`);

  const debugData = {
    rawOcrText: rawText,
    aiPrompt: "NO AI USED. 100% REGEX PARSER.",
    aiResponse: JSON.stringify(parsedData, null, 2),
    aiItemCount: parsedData.lineItems.length,
    ocrLineCount: rawText.split(/\r?\n/).length,
    stageLogs
  };

  parsedData.debug = debugData;

  console.log(stageLogs.join("\n"));
  console.log(`[${scanId}] Pipeline Total Latency: ${extractionLatency + parsingLatency}ms`);

  return parsedData;
}
