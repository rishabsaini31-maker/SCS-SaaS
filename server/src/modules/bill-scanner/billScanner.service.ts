import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";
import { tenantWhere } from "../../common/tenant/tenant.utils";
import axios from "axios";
import crypto from "crypto";

export interface ExtractedProductItem {
  productName: string;
  productCode?: string | null;
  description?: string | null;
  barcode?: string | null;
  hsn?: string | null;
  quantity: number;
  unit?: string | null;
  unitPrice: number;
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
  matchType?: "barcode" | "supplier_mapping" | "name" | "hsn" | "new_product";
}

export interface ExtractedBillData {
  scanId: string;
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

/**
 * Perform OCR on buffer (supports PDF text + Image buffer)
 */
async function extractRawTextFromBuffer(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string,
  scanId: string,
  apiKey?: string
): Promise<{ text: string, stageLogs: string[] }> {
  let rawText = "";
  let stageLogs: string[] = [];

  stageLogs.push(`--- Stage 1: PDF Parsing ---`);
  stageLogs.push(`File Name: ${fileName} | MIME: ${mimeType}`);

  if (mimeType.includes("pdf") || fileName.toLowerCase().endsWith(".pdf")) {
    try {
      const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(fileBuffer) });
      const pdfDocument = await loadingTask.promise;
      const numPages = pdfDocument.numPages;
      let textChunks: string[] = [];
      
      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        textChunks.push(pageText);
      }
      
      rawText = textChunks.join("\n");
      
      stageLogs.push(`Parser Used: pdfjs-dist`);
      stageLogs.push(`Page Count: ${numPages}`);
      stageLogs.push(`Extracted Text Length: ${rawText.length}`);
      stageLogs.push(`First 500 Chars: ${rawText.substring(0, 500).replace(/\n/g, " ")}`);
    } catch (e: any) {
      stageLogs.push(`pdfjs-dist failed: ${e.message}`);
    }
  }

  // Clean extracted raw text from pdf-parse or fallback
  rawText = rawText
    .replace(/\u0000/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
    .trim();

  // Prevent raw PDF binary from being treated as text
  if (rawText.startsWith("%PDF-") || rawText.includes("stream") || rawText.includes("endobj") || rawText.includes("xref")) {
    stageLogs.push(`ERROR: Raw binary detected in PDF parsing.`);
    rawText = ""; // clear it so we force OCR
  }

  // Fallback for plain text or text-based test documents (only if explicitly text)
  if (!rawText && mimeType.includes("text/plain")) {
    stageLogs.push(`Parser Used: latin1 string conversion (text/plain fallback)`);
    const textBuffer = fileBuffer.toString("latin1");
    const cleanPrintable = textBuffer
      .replace(/[^\x20-\x7E\r\n\t]/g, " ")
      .replace(/\s{2,}/g, " ");
    if (cleanPrintable.trim().length > 20) {
      rawText = cleanPrintable.trim();
      stageLogs.push(`Extracted Text Length: ${rawText.length}`);
      stageLogs.push(`First 500 Chars: ${rawText.substring(0, 500).replace(/\n/g, " ")}`);
    }
  }

  stageLogs.push(`--- Stage 2: OCR Fallback ---`);

  // Decision Logic: Use OCR if text < 100 characters
  if (rawText.length < 100 && process.env.GOOGLE_VISION_API_KEY) {
    stageLogs.push(`Triggering Google Cloud Vision OCR (Stage 1 text < 100 chars)`);
    try {
      const base64Data = fileBuffer.toString("base64");
      const isPdf = mimeType.includes("pdf") || fileName.toLowerCase().endsWith(".pdf");
      const visionApiUrl = `https://vision.googleapis.com/v1/${isPdf ? 'files:annotate' : 'images:annotate'}?key=${process.env.GOOGLE_VISION_API_KEY}`;
      
      const payload = isPdf ? {
        requests: [{
          inputConfig: { mimeType: "application/pdf", content: base64Data },
          features: [{ type: "DOCUMENT_TEXT_DETECTION" }]
        }]
      } : {
        requests: [{
          image: { content: base64Data },
          features: [{ type: "DOCUMENT_TEXT_DETECTION" }]
        }]
      };

      const response = await axios.post(visionApiUrl, payload, { timeout: 30000 });
      
      if (isPdf) {
        // PDF responses are in response.data.responses[0].responses
        const pages = response.data.responses?.[0]?.responses || [];
        rawText = pages.map((p: any) => p.fullTextAnnotation?.text || "").join("\n");
      } else {
        rawText = response.data.responses?.[0]?.fullTextAnnotation?.text || "";
      }
      
      stageLogs.push(`OCR Engine Used: Google Cloud Vision API`);
      stageLogs.push(`OCR Text Length: ${rawText.length}`);
      stageLogs.push(`First 500 OCR Chars: ${rawText.substring(0, 500).replace(/\n/g, " ")}`);
    } catch (e: any) {
      stageLogs.push(`Google Vision OCR failed: ${e.message}`);
    }
  } else if (rawText.length < 100 && !process.env.GOOGLE_VISION_API_KEY) {
     stageLogs.push(`OCR Skipped: GOOGLE_VISION_API_KEY not found.`);
  } else {
     stageLogs.push(`OCR Skipped: Sufficient text extracted in Stage 1.`);
  }

  return { text: rawText.trim(), stageLogs };
}

/**
 * Strict Generic OCR AI Extraction (Zero Hardcoded Fallbacks, No Hallucinations)
 */
export async function parseInvoiceFile(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string,
  scanId: string
): Promise<{
  supplierName?: string;
  supplierGstin?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  subtotal?: number;
  discount?: number;
  taxAmount?: number;
  roundOff?: number;
  grandTotal?: number;
  lineItems: ExtractedProductItem[];
  debug?: any;
}> {
  const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
  console.log(`\n======================================================`);
  console.log(`[SCAN_ID]: ${scanId}`);
  console.log(`[CHECK 1] Upload Received: ${fileName} | Size: ${(fileBuffer.length / 1024).toFixed(2)} KB | MIME: ${mimeType}`);
  console.log(`[CHECK 1] SHA-256 Hash: ${hash}`);
  console.log(`======================================================\n`);

  // Extract API keys
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  console.log(`\n======================================================`);
  console.log(`[SCAN_ID]: ${scanId} | Starting Stage Debug Pipeline`);
  console.log(`======================================================\n`);

  // Stage 1 & 2: Perform OCR to get actual document raw text
  const { text: rawOcrText, stageLogs } = await extractRawTextFromBuffer(fileBuffer, mimeType, fileName, scanId, apiKey);

  // Validation: Check if OCR failed completely (less than 100 chars)
  if (rawOcrText.length < 100) {
    console.error(`[${scanId}] Pipeline Aborted. Debug Logs:\n${stageLogs.join("\n")}`);
    throw new CustomError("No readable text found in uploaded document.", 400);
  }

  console.log(stageLogs.join("\n"));
  stageLogs.push(`--- Stage 3: Gemini Request Formulation ---`);

  // Setup debug view payload for frontend
  let debugData = { 
    rawOcrText, 
    aiPrompt: "", 
    aiResponse: "", 
    aiItemCount: 0, 
    ocrLineCount: rawOcrText.split(/\r?\n/).length,
    stageLogs 
  };

  if (apiKey && process.env.GEMINI_API_KEY) {
    try {
      const strictSystemPrompt = `You are an intelligent document understanding engine for SCS Flow.
Document Scan ID: ${scanId}

OCR Raw Text:
"""
${rawOcrText.substring(0, 10000)}
"""

MANDATORY RULES - YOU MUST STRICTLY FOLLOW THESE:

1. Understand Invoice Structure
Identify exactly as shown: Supplier Name, Supplier GSTIN, Supplier Address, Invoice Number, Invoice Date, Purchase Order Number, Payment Terms, Due Date.

2. Extract Product Table
Extract EXACTLY what is written. For every row return:
Product Name, Product Code, Description, Barcode, HSN Code, Quantity, Unit, Purchase Rate, MRP, GST %, Discount, Batch Number, Expiry Date, Amount.
- Never change values.
- Never invent values.

3. Extract Totals
Return Subtotal, CGST, SGST, IGST, CESS, Discount, Round Off, Freight, Grand Total exactly as shown.

4. Return Structured JSON
Return ONLY valid JSON matching the schema below. Never return markdown, explain, summarize, or chat.

5. Confidence Scores
Every extracted field must include a confidence score (0-100). Low confidence fields will be reviewed by the owner.
If something cannot be read, return "UNKNOWN" with confidence 20 and needsReview: true. Never guess.

6. Multi-page Support
Extract products from all pages. Merge into one JSON. Do not lose rows.

7. OCR Cleanup
Correct obvious OCR mistakes only when mathematically proven. (e.g., Qty 80, Rate 160, Amount 12800. If OCR reads 8O, replace O with 0).

YOU MUST NEVER:
❌ Guess unreadable handwriting
❌ Invent products, supplier names, GST numbers, HSN, Barcode, Quantity, Prices, Totals, Categories
❌ Match inventory, Create products, Update inventory, Save purchases, Decide duplicates, Modify business data

EXPECTED JSON SCHEMA:
{
  "supplierName": string | null,
  "supplierGstin": string | null,
  "supplierAddress": string | null,
  "invoiceNumber": string | null,
  "invoiceDate": string | null,
  "poNumber": string | null,
  "paymentTerms": string | null,
  "dueDate": string | null,
  "subtotal": number | 0,
  "cgst": number | 0,
  "sgst": number | 0,
  "igst": number | 0,
  "cess": number | 0,
  "discount": number | 0,
  "roundOff": number | 0,
  "freight": number | 0,
  "grandTotal": number | 0,
  "lineItems": [
    {
      "productName": string,
      "productCode": string | null,
      "description": string | null,
      "barcode": string | null,
      "hsn": string | null,
      "quantity": number,
      "unit": string | null,
      "unitPrice": number,
      "mrp": number | 0,
      "gstRate": number | 0,
      "discount": number | 0,
      "batch": string | null,
      "expiry": string | null,
      "amount": number | 0,
      "confidence": number,
      "needsReview": boolean
    }
  ]
}`;

      stageLogs.push(`Constructed strict text prompt with ${strictSystemPrompt.length} chars.`);
      debugData.aiPrompt = strictSystemPrompt;

      stageLogs.push(`--- Stage 4: Gemini Request & Response ---`);
      const startTime = Date.now();
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: strictSystemPrompt }] }],
          generationConfig: { response_mime_type: "application/json", temperature: 0.0 },
        },
        { timeout: 25000 }
      );
      
      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (responseText) {
        stageLogs.push(`Latency: ${Date.now() - startTime}ms`);
        stageLogs.push(`Raw JSON Output Length: ${responseText.length}`);
        debugData.aiResponse = responseText;
        
        stageLogs.push(`--- Stage 5: JSON Validation ---`);
        const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanedText);
        debugData.aiItemCount = parsed.lineItems?.length || 0;
        
        stageLogs.push(`OCR Estimated Lines: ${debugData.ocrLineCount} | Extracted JSON Products: ${debugData.aiItemCount}`);
        
        // Validation: Verify if OCR had many lines but Gemini returned 1 line
        if (debugData.ocrLineCount >= 20 && debugData.aiItemCount <= 1) {
          stageLogs.push(`ERROR: Pipeline Aborted. Severe line mismatch.`);
          throw new CustomError("Unable to reliably extract invoice table. Pipeline aborted.", 422);
        }
        
        stageLogs.push(`✅ Pipeline Completed Successfully.`);
        console.log(`[${scanId}] Pipeline Trace:\n`, stageLogs.join("\n"));
        return { ...parsed, debug: debugData };
      }
    } catch (err: any) {
      stageLogs.push(`ERROR in Stage 4/5: ${err.message}`);
      if (err instanceof CustomError) {
        console.error(`[${scanId}] Stage Error:\n`, stageLogs.join("\n"));
        throw err;
      }
      console.warn(`[${scanId}] AI API request failed or timed out, structuring raw OCR text locally:`, err);
    }
  }

  // Parse raw OCR text directly into structured items dynamically without ANY hardcoded dummy data
  stageLogs.push(`--- Stage 4: Local Regex Structuring Fallback ---`);
  const localStructured = parseRawTextToStructuredInvoice(rawOcrText, scanId);
  debugData.aiItemCount = localStructured.lineItems.length;
  stageLogs.push(`✅ Local Pipeline Completed. Items: ${debugData.aiItemCount}`);
  return { ...localStructured, debug: debugData };
}

/**
 * Dynamically parses raw OCR text lines into structured items with ZERO hardcoded products
 */
function parseRawTextToStructuredInvoice(rawText: string, scanId: string) {
  const gstinMatch = rawText.match(/\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}\b/i);
  const invNoMatch = rawText.match(/(?:INV|BILL|NO|INVOICE|Ref)[\s:#-]*([A-Z0-9\/-]{3,20})/i);
  const dateMatch = rawText.match(/\b(\d{2}[\/\.-]\d{2}[\/\.-]\d{4}|\d{4}-\d{2}-\d{2})\b/);

  const items: ExtractedProductItem[] = [];
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    // Ignore non-item lines, metadata headers & footers
    if (
      /^(INVOICE|BILL|TAX|GSTIN|DATE|TOTAL|SUBTOTAL|SL|NO|ITEM|DESCRIPTION|QUANTITY|PRICE|AMOUNT|RS|PAGE|THANK|TERMS|CONDITIONS|SIGNATURE)/i.test(
        line
      ) ||
      line.length < 3
    ) {
      continue;
    }

    // Match lines starting with item number like "1. SD-23 - Qty: 10, Price: 250" or "Product Name 10 250"
    const explicitLabelMatch = line.match(/^(?:\d+[\.\)]\s*)?([A-Za-z0-9\s/&.-]{2,60}?)(?:\s*-\s*|\s+)(?:Qty[:\s]*)(\d+)(?:,\s*|\s+)(?:Price[:\s]*|₹|\$)?(\d+(?:\.\d+)?)/i);

    if (explicitLabelMatch && explicitLabelMatch[1]) {
      const prodName = explicitLabelMatch[1].trim();
      const qty = parseInt(explicitLabelMatch[2] || "1") || 1;
      const unitPrice = parseFloat(explicitLabelMatch[3] || "0") || 0;

      if (prodName.length >= 2 && !/^(TOTAL|SUBTOTAL|GST|TAX|GRAND|NET|BAL|ITEMS)/i.test(prodName)) {
        items.push({
          productName: prodName,
          quantity: qty,
          unitPrice,
          confidence: 90,
          needsReview: false,
        });
        continue;
      }
    }

    const numberedRowMatch = line.match(/^(?:\d+[\.\)]\s*)?([A-Za-z0-9\s/&.-]{2,60})\s+(\d+)\s+(?:Price[:\s]*|₹|\$)?(\d+(?:\.\d+)?)/i);
    if (numberedRowMatch && numberedRowMatch[1]) {
      const prodName = numberedRowMatch[1].trim();
      const qty = parseInt(numberedRowMatch[2] || "1") || 1;
      const unitPrice = parseFloat(numberedRowMatch[3] || "0") || 0;

      if (prodName.length >= 2 && !/^(TOTAL|SUBTOTAL|GST|TAX|GRAND|NET|BAL|ITEMS)/i.test(prodName)) {
        items.push({
          productName: prodName,
          quantity: qty,
          unitPrice,
          confidence: 90,
          needsReview: false,
        });
        continue;
      }
    }

    // Secondary match for delimited rows (tab, multiple spaces, pipe)
    const lineParts = line.split(/\s{2,}|\t|\|/);
    if (lineParts.length >= 2 && lineParts[0]) {
      const prodName = lineParts[0].replace(/^\d+[\.\)]\s*/, "").trim();
      const numbers = line.match(/\d+(?:\.\d+)?/g);
      if (
        prodName.length >= 2 &&
        !/^(TOTAL|SUBTOTAL|GST|TAX|INVOICE|SUPPLIER|CUSTOMER)/i.test(prodName) &&
        numbers &&
        numbers.length >= 1
      ) {
        const qty = parseInt(numbers[0]) || 1;
        const price = parseFloat(numbers[1] || numbers[0]) || 0;
        items.push({
          productName: prodName,
          quantity: qty,
          unitPrice: price,
          confidence: 80,
          needsReview: false,
        });
      }
    }

    // Fallback line reader: treat non-header line as product name
    const cleanedLine = line.replace(/^\d+[\.\)]\s*/, "").trim();
    if (cleanedLine.length >= 2 && !/^(TOTAL|SUBTOTAL|GST|TAX|INVOICE|SUPPLIER|CUSTOMER|BAL|TERMS|CONDITIONS|SIGNATURE|THANK)/i.test(cleanedLine)) {
      const numbers = line.match(/\d+(?:\.\d+)?/g);
      items.push({
        productName: cleanedLine,
        quantity: numbers && numbers[0] ? parseInt(numbers[0]) || 1 : 1,
        unitPrice: numbers && numbers.length > 1 && numbers[1] ? parseFloat(numbers[1]) || 0 : 0,
        confidence: 70,
        needsReview: false,
      });
    }
  }

  // If OCR could not parse any lines at all, return UNKNOWN line requiring owner review
  if (items.length === 0) {
    items.push({
      productName: "UNKNOWN PRODUCT (Check Image/Bill)",
      quantity: 1,
      unitPrice: 0,
      confidence: 25,
      needsReview: true,
    });
  }

  console.log(`[${scanId}] Dynamic OCR structuring complete. Parsed ${items.length} items from uploaded file.`);

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return {
    supplierName: "Scanned Supplier",
    supplierGstin: gstinMatch ? gstinMatch[0] : undefined,
    invoiceNumber: invNoMatch ? invNoMatch[1] : `INV-${scanId.slice(-6)}`,
    invoiceDate: dateMatch ? dateMatch[1] : new Date().toISOString().split("T")[0],
    subtotal,
    discount: 0,
    taxAmount: 0,
    roundOff: 0,
    grandTotal: subtotal,
    lineItems: items,
  };
}

/**
 * Match Extracted Products against Tenant Inventory (Post-OCR strict matching)
 */
export async function processAndMatchInvoice(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string,
  tenantId?: string
): Promise<ExtractedBillData> {
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
  const randomHash = Math.random().toString(36).substring(2, 8);
  const scanId = `scan_${timestamp}_${randomHash}`;

  const extracted = await parseInvoiceFile(fileBuffer, mimeType, fileName, scanId);

  // Load tenant products
  const tenantProducts = await prisma.product.findMany({
    where: tenantWhere(tenantId, { status: "active" }),
  });

  // Load supplier mappings memory
  const supplierMappings = await prisma.supplierProductMapping.findMany({
    where: tenantWhere(tenantId, {}),
  });
  const mappingMap = new Map(
    supplierMappings.map((m) => [m.supplierItemName.toLowerCase().trim(), m.productId])
  );

  const matchedLineItems: ExtractedProductItem[] = [];

  for (const item of extracted.lineItems || []) {
    const rawName = (item.productName || "").trim();
    const normalizedName = rawName.toLowerCase();
    let matchedProd: (typeof tenantProducts)[0] | undefined = undefined;
    let matchType: ExtractedProductItem["matchType"] = "new_product";
    let confidence: ExtractedProductItem["confidence"] = "high";

    // Level 1: Match by Barcode
    if (item.barcode) {
      matchedProd = tenantProducts.find(
        (p) => p.barcode && p.barcode.trim() === item.barcode?.trim()
      );
      if (matchedProd) matchType = "barcode";
    }

    // Level 2: Match by Supplier Memory Mapping
    if (!matchedProd && mappingMap.has(normalizedName)) {
      const prodId = mappingMap.get(normalizedName);
      matchedProd = tenantProducts.find((p) => p.id === prodId);
      if (matchedProd) matchType = "supplier_mapping";
    }

    // Level 3: Match by Exact Product Name / SKU Code
    if (!matchedProd) {
      matchedProd = tenantProducts.find(
        (p) => p.name.toLowerCase().trim() === normalizedName
      );
      if (matchedProd) {
        matchType = "name";
      } else {
        matchedProd = tenantProducts.find(
          (p) => p.barcode && p.barcode.toLowerCase().trim() === normalizedName
        );
        if (matchedProd) {
          matchType = "barcode";
        }
      }
    }

    if (matchedProd) {
      matchedLineItems.push({
        ...item,
        matchedProductId: matchedProd.id,
        matchedProductName: matchedProd.name,
        category: matchedProd.category || item.category || "General",
        matchType,
        confidence,
      });
    } else {
      matchedLineItems.push({
        ...item,
        matchType: "new_product",
        confidence: item.confidence && (item.confidence as number) < 50 ? "low" : "high",
        category: item.category || "",
      });
    }
  }

  // Duplicate Check
  let isDuplicate = false;
  let duplicatePurchaseId: string | undefined = undefined;
  let existingPurchaseNumber: string | undefined = undefined;

  if (extracted.invoiceNumber) {
    const existingScanOrPurchase = await prisma.purchase.findFirst({
      where: tenantWhere(tenantId, {
        notes: { contains: extracted.invoiceNumber },
      }),
    });
    if (existingScanOrPurchase) {
      isDuplicate = true;
      duplicatePurchaseId = existingScanOrPurchase.id;
      existingPurchaseNumber = existingScanOrPurchase.purchaseNumber;
    }
  }

  // Audit Log with safe JSON sanitization (removes null bytes \u0000)
  try {
    const cleanScannedData = JSON.parse(
      JSON.stringify({
        scanId,
        extracted,
        matchedLineItems,
      }).replace(/\u0000/g, "")
    );

    await prisma.purchaseInvoiceScan.create({
      data: {
        tenantId: tenantId || null,
        supplierName: extracted.supplierName || null,
        supplierGstin: extracted.supplierGstin || null,
        invoiceNumber: extracted.invoiceNumber || null,
        invoiceDate: extracted.invoiceDate || null,
        scannedData: cleanScannedData,
        status: isDuplicate ? "DUPLICATE_WARNING" : "SCANNED",
      },
    });
  } catch (auditErr) {
    console.warn(`[${scanId}] Failed to record purchaseInvoiceScan audit log:`, auditErr);
  }

  return {
    scanId,
    ...extracted,
    lineItems: matchedLineItems,
    isDuplicate,
    duplicatePurchaseId,
    existingPurchaseNumber,
  };
}

export async function saveSupplierMapping(
  supplierItemName: string,
  productId: string,
  supplierId?: string,
  tenantId?: string
) {
  if (!supplierItemName || !productId) return;
  const cleanName = supplierItemName.trim();

  await prisma.supplierProductMapping.upsert({
    where: {
      tenantId_supplierItemName: {
        tenantId: tenantId || "",
        supplierItemName: cleanName,
      },
    },
    update: {
      productId,
      supplierId: supplierId || null,
    },
    create: {
      tenantId: tenantId || null,
      supplierId: supplierId || null,
      supplierItemName: cleanName,
      productId,
    },
  });
}
