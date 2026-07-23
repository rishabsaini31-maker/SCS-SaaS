import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import { CustomError } from "../../common/errors/CustomError";
import axios from "axios";
import { DocumentAiExtractedInvoice, DocumentAiLineItem } from "./documentAi.types";

// Initialize Document AI Client (Automatically uses GOOGLE_APPLICATION_CREDENTIALS)
const client = new DocumentProcessorServiceClient();

/**
 * Normalizes Google Document AI Entity output into a clean JSON object
 */
function extractEntities(entities: any[]): DocumentAiExtractedInvoice {
  const invoice: DocumentAiExtractedInvoice = { lineItems: [] };

  const getEntityText = (type: string) => {
    const entity = entities.find((e) => e.type === type);
    return entity?.mentionText || entity?.normalizedValue?.text || undefined;
  };

  const getEntityNumber = (type: string) => {
    const text = getEntityText(type);
    if (!text) return undefined;
    const num = parseFloat(text.replace(/[^0-9.-]+/g, ""));
    return isNaN(num) ? undefined : num;
  };

  invoice.supplierName = getEntityText("supplier_name");
  invoice.supplierGstin = getEntityText("supplier_tax_id");
  invoice.invoiceNumber = getEntityText("invoice_id");
  invoice.invoiceDate = getEntityText("invoice_date");
  invoice.poNumber = getEntityText("purchase_order");
  invoice.paymentTerms = getEntityText("payment_terms");
  invoice.deliveryChallanNumber = getEntityText("delivery_note_id");

  invoice.subtotal = getEntityNumber("net_amount");
  invoice.grandTotal = getEntityNumber("total_amount");
  invoice.freight = getEntityNumber("freight_amount");
  invoice.discount = getEntityNumber("total_discount_amount");
  invoice.cgst = getEntityNumber("total_tax_amount"); // Generic tax mapping, Gemini will fix

  const lineItemEntities = entities.filter((e) => e.type === "line_item");

  for (const item of lineItemEntities) {
    const props = item.properties || [];
    const getPropText = (type: string) => props.find((p: any) => p.type === type)?.mentionText;
    const getPropNumber = (type: string) => {
      const text = getPropText(type);
      if (!text) return undefined;
      const num = parseFloat(text.replace(/[^0-9.-]+/g, ""));
      return isNaN(num) ? undefined : num;
    };

    const desc = getPropText("line_item/description") || "UNKNOWN PRODUCT";
    
    const lineItem: DocumentAiLineItem = {
      productDescription: desc,
      productCode: getPropText("line_item/product_code"),
      quantity: getPropNumber("line_item/quantity") || 1,
      unit: getPropText("line_item/unit"),
      rate: getPropNumber("line_item/unit_price") || 0,
      amount: getPropNumber("line_item/amount") || 0,
      confidenceScore: item.confidence || 0,
    };
    invoice.lineItems.push(lineItem);
  }

  return invoice;
}

export async function processAndMatchInvoice(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string,
  tenantId?: string
) {
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
  const randomHash = Math.random().toString(36).substring(2, 8);
  const scanId = `scan_${timestamp}_${randomHash}`;

  const projectId = process.env.GOOGLE_PROJECT_ID;
  const location = process.env.GOOGLE_LOCATION || "us";
  const processorId = process.env.DOCUMENT_AI_PROCESSOR_ID;
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  console.log(`\n======================================================`);
  console.log(`[SCAN_ID]: ${scanId} | Starting Document AI Pipeline`);
  console.log(`======================================================\n`);

  let stageLogs: string[] = [];
  stageLogs.push(`--- Stage 1: Google Document AI ---`);
  stageLogs.push(`File Name: ${fileName} | MIME: ${mimeType}`);

  if (!projectId || !processorId) {
    stageLogs.push(`ERROR: DOCUMENT_AI_PROCESSOR_ID or GOOGLE_PROJECT_ID is missing.`);
    throw new CustomError("Server is missing Document AI Configuration.", 500);
  }

  let documentData;
  const startTime = Date.now();
  try {
    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
    const request = {
      name,
      rawDocument: {
        content: fileBuffer.toString("base64"),
        mimeType,
      },
    };

    const [result] = await client.processDocument(request);
    documentData = result.document;
    stageLogs.push(`Document AI Latency: ${Date.now() - startTime}ms`);
  } catch (err: any) {
    stageLogs.push(`Document AI Error: ${err.message}`);
    throw new CustomError("Failed to extract document using Google Document AI.", 500);
  }

  if (!documentData || !documentData.entities) {
    throw new CustomError("No readable text or entities found in uploaded document.", 400);
  }

  stageLogs.push(`--- Stage 2: Normalization ---`);
  const rawInvoice = extractEntities(documentData.entities);
  stageLogs.push(`Extracted Items: ${rawInvoice.lineItems.length}`);
  stageLogs.push(`Total Confidence: ${documentData.entities.reduce((sum: number, e: any) => sum + (e.confidence || 0), 0) / (documentData.entities.length || 1)}`);

  stageLogs.push(`--- Stage 3: Gemini 1.5 Pro Understanding ---`);
  
  if (!apiKey) {
    throw new CustomError("GEMINI_API_KEY is missing for final structuring step.", 500);
  }

  const geminiPrompt = `
You are an expert strict JSON normalization agent for an inventory system.
I am providing you with the exact JSON data extracted by Google Document AI Invoice Parser.

Your ONLY job is to map this JSON strictly into our exact schema, clean up product names (remove typos/extra characters), deduce exact tax brackets if possible, and extract embedded Batch/Expiry from descriptions.
DO NOT INVENT ANY PRODUCTS. DO NOT PERFORM OCR. You must ONLY output valid JSON and nothing else.

Raw Extracted JSON from Document AI:
${JSON.stringify(rawInvoice, null, 2)}

Ensure every line item conforms to this schema exactly, do not omit fields, set to null if missing:
{
  "supplierName": "string or null",
  "supplierGstin": "string or null",
  "invoiceNumber": "string or null",
  "invoiceDate": "YYYY-MM-DD or null",
  "poNumber": "string or null",
  "paymentTerms": "string or null",
  "dueDate": "YYYY-MM-DD or null",
  "subtotal": number,
  "cgst": number,
  "sgst": number,
  "igst": number,
  "cess": number,
  "discount": number,
  "roundOff": number,
  "freight": number,
  "grandTotal": number,
  "lineItems": [
    {
      "productName": "string",
      "productCode": "string or null",
      "description": "string or null",
      "barcode": "string or null",
      "hsn": "string or null",
      "quantity": number,
      "unit": "string or null",
      "purchaseRate": number,
      "mrp": number,
      "gstPercent": number,
      "discount": number,
      "batchNumber": "string or null",
      "expiryDate": "YYYY-MM-DD or null",
      "amount": number
    }
  ]
}
`;

  stageLogs.push(`Gemini Prompt Length: ${geminiPrompt.length} chars`);

  let debugData = {
    rawOcrText: JSON.stringify(rawInvoice, null, 2),
    aiPrompt: geminiPrompt,
    aiResponse: "",
    aiItemCount: 0,
    ocrLineCount: rawInvoice.lineItems.length,
    stageLogs
  };

  try {
    const geminiStart = Date.now();
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: geminiPrompt }] }],
        generationConfig: { response_mime_type: "application/json", temperature: 0.0 },
      },
      { timeout: 25000 }
    );
    
    const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (responseText) {
      stageLogs.push(`Gemini Latency: ${Date.now() - geminiStart}ms`);
      debugData.aiResponse = responseText;
      const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      let parsed = JSON.parse(cleanedText);
      
      debugData.aiItemCount = parsed.lineItems?.length || 0;
      
      stageLogs.push(`--- Stage 4: Backend Validation ---`);
      if (parsed.lineItems) {
        parsed.lineItems = parsed.lineItems.filter((item: any) => item.quantity >= 0 && item.purchaseRate >= 0);
        // Basic deduplication if Doc AI hallucinates identical rows
        const uniqueItems = new Map();
        for (const item of parsed.lineItems) {
           const key = \`\${item.productName}-\${item.quantity}-\${item.purchaseRate}\`;
           if (!uniqueItems.has(key)) uniqueItems.set(key, item);
        }
        parsed.lineItems = Array.from(uniqueItems.values());
      }

      stageLogs.push(`Final Validated Products: ${parsed.lineItems?.length}`);
      
      // Validation Check: if Doc AI found 20 lines, but Gemini returned 1
      if (debugData.ocrLineCount >= 10 && debugData.aiItemCount <= 1) {
        stageLogs.push(`ERROR: Pipeline Aborted. Severe mismatch between Document AI and Gemini output.`);
        throw new CustomError("Unable to reliably map invoice. Pipeline aborted.", 422);
      }
      
      console.log(`[${scanId}] Pipeline Trace:\n`, stageLogs.join("\n"));
      
      // Inject debug payload for frontend 
      return { ...parsed, debug: debugData };
    }
  } catch (err: any) {
    stageLogs.push(`Gemini Pipeline Error: ${err.message}`);
    console.error(`[${scanId}] Pipeline Error:\n`, stageLogs.join("\n"));
    throw new CustomError("Failed to normalize structured data from Document AI.", 500);
  }

  throw new CustomError("Unknown error occurred during Document AI Extraction pipeline.", 500);
}
