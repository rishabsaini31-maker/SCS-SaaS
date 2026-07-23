import { parseInvoiceFile, processAndMatchInvoice } from "../modules/bill-scanner/billScanner.service";
import assert from "assert";

async function runBillScannerTest() {
  console.log("🚀 Running AI Purchase Bill Scanner Tests...");

  // Mock invoice file buffer with verbatim product codes
  const sampleBillText = `
INVOICE
Generic Industrial Hardware Supplier
GSTIN: 27AAAAA0000A1Z5
Invoice No: INV-2026-9874
Date: 2026-07-23

Items:
1. SD-23 - Qty: 10, Price: 250
2. SD-26 - Qty: 5, Price: 400
3. 84-62 PW - Qty: 12, Price: 180

Total: 7110
  `;

  const buffer = Buffer.from(sampleBillText, "utf-8");

  // Test 1: Parser extraction
  const extracted = await parseInvoiceFile(buffer, "text/plain", "sample_bill.txt", "scan_test_001");
  assert(extracted.lineItems.length > 0, "Line items should be dynamically extracted from uploaded file");
  console.log("✅ Dynamic OCR Parser Test Passed. Extracted:", extracted.lineItems.map(i => i.productName));

  // Test 2: Matching pipeline
  const result = await processAndMatchInvoice(buffer, "text/plain", "sample_bill.txt");
  assert(result.lineItems.length > 0, "Matched line items should be present");
  console.log("✅ Matching Pipeline Test Passed");

  console.log("🎉 All Bill Scanner Unit Tests Passed Successfully!");
}

runBillScannerTest().catch((err) => {
  console.error("❌ Bill Scanner Test Failed:", err);
  process.exit(1);
});
