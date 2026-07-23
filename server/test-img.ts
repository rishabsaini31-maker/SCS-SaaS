
import fs from 'fs';
import { processAndMatchInvoice } from './src/modules/local-scanner/localScanner.service';

async function testImageExtraction() {
  try {
    const filePath = '/Users/rishab/Desktop/SCS-SaaS/SCS-Inventory SaaS/WhatsApp Image 2026-07-23 at 19.13.33.jpeg';
    const fileBuffer = fs.readFileSync(filePath);
    
    console.log('Testing extraction on:', filePath);
    
    const result = await processAndMatchInvoice(
      fileBuffer, // Revert to fileBuffer
      'image/jpeg',
      'whatsapp_image.jpeg',
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

testImageExtraction();
