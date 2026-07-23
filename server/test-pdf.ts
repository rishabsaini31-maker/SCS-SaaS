import fs from 'fs';
import path from 'path';
import { processAndMatchInvoice } from './src/modules/local-scanner/localScanner.service';

async function testPdfExtraction() {
  try {
    const filePath = '/Users/rishab/Desktop/SCS-SaaS/SCS-Inventory SaaS/product.pdf';
    const fileBuffer = fs.readFileSync(filePath);
    
    console.log('Testing extraction on:', filePath);
    
    const result = await processAndMatchInvoice(
      fileBuffer,
      'application/pdf',
      'product.pdf',
      'test-tenant'
    );
    
    console.log("== EXTRACTED DATA ==");
    console.log(JSON.stringify(result.lineItems, null, 2));
    if(result.debug && result.debug.rawOcrText) {
      console.log("== RAW TEXT ==");
      console.log(result.debug.rawOcrText.substring(0, 1500));
    }
  } catch (e) {
    console.error(e);
  }
}

testPdfExtraction();
