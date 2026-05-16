import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";
// @ts-ignore
import JsBarcode from "jsbarcode";
import { JSDOM } from "jsdom";

const BARCODE_PREFIX = "PRD-";
const BARCODE_PAD = 6;

function formatBarcode(num: number) {
  return `${BARCODE_PREFIX}${String(num).padStart(BARCODE_PAD, "0")}`;
}

async function computeNextBarcode(): Promise<string> {
  // Get all existing barcodes that match prefix
  const rows = await prisma.product.findMany({
    where: { barcode: { startsWith: BARCODE_PREFIX } },
    select: { barcode: true },
  });

  let max = 0;
  for (const r of rows) {
    const b = r.barcode;
    if (!b) continue;
    const suffix = b.replace(BARCODE_PREFIX, "");
    const n = parseInt(suffix, 10);
    if (!Number.isNaN(n) && n > max) max = n;
  }

  return formatBarcode(max + 1);
}

function generateSvg(barcodeValue: string) {
  const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);
  const document = dom.window.document as any;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const previousDocument = globalThis.document;
  const previousWindow = globalThis.window;
  try {
    globalThis.document = dom.window.document as any;
    globalThis.window = dom.window as any;
    // JsBarcode mutates the svg element
    // @ts-ignore
    JsBarcode(svg, barcodeValue, {
      format: "CODE128",
      displayValue: false,
      width: 2,
      height: 40,
      margin: 5,
    });
  } catch (err) {
    throw new CustomError("Failed to generate barcode image", 500);
  } finally {
    globalThis.document = previousDocument as any;
    globalThis.window = previousWindow as any;
  }
  return svg.outerHTML as string;
}

export const generateBarcodeForProduct = async (productId: string) => {
  // fetch product
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new CustomError("Product not found", 404);

  if (product.barcode) {
    const svg = generateSvg(product.barcode);
    return { barcode: product.barcode, svg };
  }

  // Retry loop in case of unique constraint collisions
  const maxAttempts = 3;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const next = await computeNextBarcode();
    try {
      const updated = await prisma.product.update({
        where: { id: productId },
        data: { barcode: next },
      });
      const svg = generateSvg(updated.barcode!);
      return { barcode: updated.barcode!, svg };
    } catch (err: any) {
      // unique constraint error code for Prisma is P2002
      if (err && err.code === "P2002") {
        // collision, retry
        continue;
      }
      throw err;
    }
  }

  throw new CustomError("Failed to assign a unique barcode", 500);
};

export const getBarcodeForProduct = async (productId: string) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new CustomError("Product not found", 404);
  if (!product.barcode)
    throw new CustomError("Barcode not generated for product", 404);
  const svg = generateSvg(product.barcode);
  return { product, barcode: product.barcode, svg };
};

export const generatePrintData = async (opts: {
  productId: string;
  quantity: number;
  labelSize: "small" | "medium" | "large";
  showName?: boolean;
  showPrice?: boolean;
}) => {
  const {
    productId,
    quantity,
    labelSize,
    showName = true,
    showPrice = true,
  } = opts;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new CustomError("Product not found", 404);
  if (!product.barcode)
    throw new CustomError("Barcode not generated for product", 404);

  const svg = generateSvg(product.barcode);

  const label = {
    barcode: product.barcode,
    image: svg,
    productName: product.name,
    price: product.sellingPrice,
    labelSize,
    showName,
    showPrice,
  };

  const result = Array(Math.max(0, quantity)).fill(label);
  return result;
};
