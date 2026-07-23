import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";
// @ts-ignore
import JsBarcode from "jsbarcode";
import { JSDOM } from "jsdom";
import {
  assertTenantOwnership,
  tenantWhere,
} from "../../common/tenant/tenant.utils";
import {
  calculateLabelLayout,
  DEFAULT_50X25_TEMPLATE,
  DEFAULT_PRINTER_SETTINGS,
  generateTsplScript,
  LabelTemplateSpec,
  PrinterSettingsSpec,
} from "./label-engine";

const BARCODE_PREFIX = "PRD-";
const BARCODE_PAD = 6;

function formatBarcode(num: number) {
  return `${BARCODE_PREFIX}${String(num).padStart(BARCODE_PAD, "0")}`;
}

async function computeNextBarcode(
  tenantId?: string,
  offset: number = 0,
): Promise<string> {
  const rows = await prisma.product.findMany({
    where: tenantWhere(tenantId, {
      barcode: { startsWith: BARCODE_PREFIX },
    } as any),
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

  return formatBarcode(max + 1 + offset);
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
      width: 3,
      height: 80,
      margin: 0,
    });
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("preserveAspectRatio", "none");
  } catch (err) {
    throw new CustomError("Failed to generate barcode image", 500);
  } finally {
    globalThis.document = previousDocument as any;
    globalThis.window = previousWindow as any;
  }
  return svg.outerHTML as string;
}

export const generateBarcodeForProduct = async (
  productId: string,
  tenantId?: string,
) => {
  const product = await prisma.product.findFirst({
    where: tenantWhere(tenantId, { id: productId }),
  });
  if (!product) throw new CustomError("Product not found", 404);
  assertTenantOwnership(tenantId, (product as any).tenantId, "Product");

  if (product.barcode) {
    const svg = generateSvg(product.barcode);
    return { barcode: product.barcode, svg };
  }

  const maxAttempts = 3;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const next = await computeNextBarcode(tenantId, attempt);
    try {
      const result = await prisma.product.updateMany({
        where: tenantWhere(tenantId, { id: productId }),
        data: { barcode: next },
      });
      if (result.count !== 1) throw new CustomError("Product not found", 404);
      const updated = await prisma.product.findFirst({
        where: tenantWhere(tenantId, { id: productId }),
      });
      if (!updated?.barcode)
        throw new CustomError("Barcode not generated for product", 404);
      const svg = generateSvg(updated.barcode);
      return { barcode: updated.barcode, svg };
    } catch (err: any) {
      if (err && err.code === "P2002") {
        continue;
      }
      throw err;
    }
  }

  throw new CustomError("Failed to assign a unique barcode", 500);
};

export const getBarcodeForProduct = async (
  productId: string,
  tenantId?: string,
) => {
  const product = await prisma.product.findFirst({
    where: tenantWhere(tenantId, { id: productId }),
  });
  if (!product) throw new CustomError("Product not found", 404);
  assertTenantOwnership(tenantId, (product as any).tenantId, "Product");
  if (!product.barcode)
    throw new CustomError("Barcode not generated for product", 404);
  const svg = generateSvg(product.barcode);
  return { product, barcode: product.barcode, svg };
};

export const getPrintingConfig = async (tenantId?: string) => {
  if (!tenantId) throw new CustomError("Tenant context required", 403);

  const tenantSetting = await prisma.tenantSetting.findUnique({
    where: { tenantId },
  });

  const printerSettings: PrinterSettingsSpec = (tenantSetting as any)?.printerSettings
    ? { ...DEFAULT_PRINTER_SETTINGS, ...((tenantSetting as any).printerSettings as any) }
    : DEFAULT_PRINTER_SETTINGS;

  const activeTemplate: LabelTemplateSpec = (tenantSetting as any)?.labelTemplates
    ? { ...DEFAULT_50X25_TEMPLATE, ...(((tenantSetting as any).labelTemplates as any)?.activeTemplate || {}) }
    : DEFAULT_50X25_TEMPLATE;

  const customTemplates: LabelTemplateSpec[] =
    ((tenantSetting as any)?.labelTemplates as any)?.customTemplates || [DEFAULT_50X25_TEMPLATE];

  return {
    printerSettings,
    activeTemplate,
    customTemplates,
  };
};

export const updatePrintingConfig = async (
  tenantId: string | undefined,
  input: {
    printerSettings?: Partial<PrinterSettingsSpec>;
    activeTemplate?: Partial<LabelTemplateSpec>;
    customTemplates?: LabelTemplateSpec[];
  },
) => {
  if (!tenantId) throw new CustomError("Tenant context required", 403);

  const currentConfig = await getPrintingConfig(tenantId);

  const newPrinterSettings = {
    ...currentConfig.printerSettings,
    ...input.printerSettings,
  };

  const newActiveTemplate = input.activeTemplate
    ? { ...currentConfig.activeTemplate, ...input.activeTemplate }
    : currentConfig.activeTemplate;

  const newCustomTemplates = input.customTemplates || currentConfig.customTemplates;

  await (prisma.tenantSetting as any).upsert({
    where: { tenantId },
    update: {
      printerSettings: newPrinterSettings as any,
      labelTemplates: {
        activeTemplate: newActiveTemplate,
        customTemplates: newCustomTemplates,
      } as any,
    },
    create: {
      tenantId,
      printerSettings: newPrinterSettings as any,
      labelTemplates: {
        activeTemplate: newActiveTemplate,
        customTemplates: newCustomTemplates,
      } as any,
    },
  });

  return getPrintingConfig(tenantId);
};

export const generatePrintData = async (opts: {
  productId: string;
  quantity: number;
  labelSize?: "small" | "medium" | "large" | "50x25";
  labelWidthMm?: number;
  labelHeightMm?: number;
  showName?: boolean;
  showPrice?: boolean;
  shopName?: string;
  customText1?: string;
  customText2?: string;
  tenantId?: string;
}) => {
  const {
    productId,
    quantity,
    labelSize = "50x25",
    labelWidthMm,
    labelHeightMm,
    showName = true,
    showPrice = true,
    shopName,
    customText1,
    customText2,
    tenantId,
  } = opts;

  const product = await prisma.product.findFirst({
    where: tenantWhere(tenantId, { id: productId }),
  });
  if (!product) throw new CustomError("Product not found", 404);
  assertTenantOwnership(tenantId, (product as any).tenantId, "Product");
  if (!product.barcode)
    throw new CustomError("Barcode not generated for product", 404);

  const tenantConfig = tenantId ? await getPrintingConfig(tenantId) : null;
  const activeTemplate = tenantConfig?.activeTemplate || DEFAULT_50X25_TEMPLATE;

  // Calculate millimetric 1:1 layout specification
  const layout = calculateLabelLayout({
    shopName: shopName ?? undefined,
    productName: product.name,
    barcode: product.barcode,
    price: showPrice ? product.sellingPrice : undefined,
    customText1: customText1 ?? undefined,
    customText2: customText2 ?? undefined,
    template: {
      ...activeTemplate,
      ...(labelWidthMm ? { widthMm: labelWidthMm } : {}),
      ...(labelHeightMm ? { heightMm: labelHeightMm } : {}),
    },
    printerSettings: tenantConfig?.printerSettings,
  });

  const svg = generateSvg(product.barcode);

  const label = {
    barcode: product.barcode,
    image: svg,
    productName: product.name,
    price: product.sellingPrice,
    labelSize,
    labelWidthMm: labelWidthMm || layout.template.widthMm,
    labelHeightMm: labelHeightMm || layout.template.heightMm,
    showName,
    showPrice,
    shopName,
    customText1,
    customText2,
    layout,
  };

  const result = Array(Math.max(0, quantity)).fill(label);
  return result;
};

export const generateTsplData = async (opts: {
  productId: string;
  copies?: number;
  shopName?: string;
  customText1?: string;
  customText2?: string;
  tenantId?: string;
}) => {
  const { productId, copies = 1, shopName, customText1, customText2, tenantId } = opts;

  const product = await prisma.product.findFirst({
    where: tenantWhere(tenantId, { id: productId }),
  });
  if (!product) throw new CustomError("Product not found", 404);
  assertTenantOwnership(tenantId, (product as any).tenantId, "Product");
  if (!product.barcode)
    throw new CustomError("Barcode not generated for product", 404);

  const tenantConfig = tenantId ? await getPrintingConfig(tenantId) : null;

  const layout = calculateLabelLayout({
    shopName,
    productName: product.name,
    barcode: product.barcode,
    price: product.sellingPrice,
    customText1,
    customText2,
    template: tenantConfig?.activeTemplate,
    printerSettings: tenantConfig?.printerSettings,
  });

  const tsplScript = generateTsplScript(layout, copies);
  return {
    productId,
    barcode: product.barcode,
    copies,
    tsplScript,
    layout,
  };
};
