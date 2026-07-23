export type DpiOption = 203 | 300;

export interface ElementPosition {
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm?: number;
  align: "left" | "center" | "right";
  fontBold: boolean;
  fontSizePt: number;
  maxLines?: number;
  truncate: boolean;
}

export interface BarcodeElementPosition {
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  quietZoneMm: number;
  type: "CODE128";
}

export interface LabelTemplateSpec {
  id: string;
  name: string;
  isDefault: boolean;
  widthMm: number;
  heightMm: number;
  paddingMm: number;
  dpi: DpiOption;
  shopName: ElementPosition;
  productName: ElementPosition;
  barcode: BarcodeElementPosition;
  barcodeNumber: ElementPosition;
  text1: ElementPosition;
  text2: ElementPosition;
}

export interface PrinterSettingsSpec {
  printerName: string;
  labelSize: "50x25" | "38x25" | "100x50" | "custom";
  customWidthMm?: number;
  customHeightMm?: number;
  dpi: DpiOption;
  darkness: number; // 1 - 15
  printSpeed: number; // 2 - 6 ips
  gapMm: number;
  orientation: "PORTRAIT" | "LANDSCAPE";
  defaultCopies: number;
}

/**
 * DEFAULT 50mm x 25mm (1 UPS) SPECIFICATION
 * Strict adherence to physical POS label standards:
 * - Width: 50mm, Height: 25mm, 1 UPS
 * - 2mm safe padding all around
 * - Shop Name: Top-Left (2, 2) 9pt Bold
 * - Product Name: Center (2, 6) 10pt Bold, Max 2 lines
 * - Barcode: Center (5, 10) 40mm x 8mm CODE128
 * - Barcode Number: Center (2, 19) 8pt Bold
 * - Text 1: Bottom Left (2, 22) 7pt
 * - Text 2: Bottom Right (48, 22) 7pt Right-Aligned
 */
export const DEFAULT_50X25_TEMPLATE: LabelTemplateSpec = {
  id: "default-50x25-1ups",
  name: "Enterprise 50x25mm (1 UPS)",
  isDefault: true,
  widthMm: 50,
  heightMm: 25,
  paddingMm: 4,
  dpi: 203,
  shopName: {
    xMm: 4,
    yMm: 2,
    widthMm: 42,
    align: "left",
    fontBold: true,
    fontSizePt: 9,
    maxLines: 1,
    truncate: true,
  },
  productName: {
    xMm: 4,
    yMm: 5.5,
    widthMm: 42,
    align: "center",
    fontBold: true,
    fontSizePt: 10,
    maxLines: 2,
    truncate: true,
  },
  barcode: {
    xMm: 4,
    yMm: 9.5,
    widthMm: 42,
    heightMm: 9.5,
    quietZoneMm: 0,
    type: "CODE128",
  },
  barcodeNumber: {
    xMm: 4,
    yMm: 19,
    widthMm: 42,
    align: "center",
    fontBold: true,
    fontSizePt: 8,
    maxLines: 1,
    truncate: true,
  },
  text1: {
    xMm: 4,
    yMm: 22,
    widthMm: 20,
    align: "left",
    fontBold: false,
    fontSizePt: 7,
    maxLines: 1,
    truncate: true,
  },
  text2: {
    xMm: 46,
    yMm: 22,
    widthMm: 20,
    align: "right",
    fontBold: false,
    fontSizePt: 7,
    maxLines: 1,
    truncate: true,
  },
};

export const DEFAULT_PRINTER_SETTINGS: PrinterSettingsSpec = {
  printerName: "Generic TSPL Thermal Printer",
  labelSize: "50x25",
  dpi: 203,
  darkness: 10,
  printSpeed: 4,
  gapMm: 2,
  orientation: "PORTRAIT",
  defaultCopies: 1,
};

/**
 * Convert millimeters to dots/pixels based on target DPI.
 * 203 DPI -> ~7.9921 dots/mm
 * 300 DPI -> ~11.811 dots/mm
 */
export function mmToDots(mm: number, dpi: DpiOption = 203): number {
  const dotsPerMm = dpi / 25.4;
  return Math.round(mm * dotsPerMm);
}

/**
 * Truncate text to fit within estimated character count at a given font size and width in mm.
 */
export function fitTextToWidth(
  text: string,
  widthMm: number,
  fontSizePt: number,
  fontBold: boolean = false,
): string {
  if (!text) return "";
  // Estimated char width in mm: pt * 0.352778 * average width factor (0.5 for normal, 0.58 for bold)
  const charWidthMm = fontSizePt * 0.352778 * (fontBold ? 0.58 : 0.5);
  const maxChars = Math.max(1, Math.floor(widthMm / charWidthMm));
  if (text.length <= maxChars) return text;
  return text.slice(0, Math.max(1, maxChars - 1)) + "…";
}

/**
 * Wrap text into maximum allowed lines for label rendering.
 */
export function wrapTextToLines(
  text: string,
  widthMm: number,
  fontSizePt: number,
  maxLines: number = 2,
  fontBold: boolean = false,
): string[] {
  if (!text) return [];
  const charWidthMm = fontSizePt * 0.352778 * (fontBold ? 0.58 : 0.5);
  const charsPerLine = Math.max(1, Math.floor(widthMm / charWidthMm));

  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + (currentLine ? " " : "") + word).length <= charsPerLine) {
      currentLine += (currentLine ? " " : "") + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  // Handle remaining text in last line with truncation
  if (lines.length > 0) {
    const totalRendered = lines.join(" ");
    const lastLine = lines[lines.length - 1];
    if (lastLine && totalRendered.length < text.length) {
      lines[lines.length - 1] = fitTextToWidth(
        lastLine,
        widthMm,
        fontSizePt,
        fontBold,
      );
    }
  }

  return lines;
}

export interface LabelRenderInput {
  shopName?: string;
  productName: string;
  barcode: string;
  price?: number;
  customText1?: string;
  customText2?: string;
  template?: Partial<LabelTemplateSpec>;
  printerSettings?: Partial<PrinterSettingsSpec>;
}

export interface CalculatedLabelLayout {
  template: LabelTemplateSpec;
  printerSettings: PrinterSettingsSpec;
  elements: {
    shopName: {
      text: string;
      rawText: string;
      xMm: number;
      yMm: number;
      widthMm: number;
      fontSizePt: number;
      fontBold: boolean;
      align: "left" | "center" | "right";
    };
    productName: {
      lines: string[];
      rawText: string;
      xMm: number;
      yMm: number;
      widthMm: number;
      fontSizePt: number;
      fontBold: boolean;
      align: "left" | "center" | "right";
    };
    barcode: {
      code: string;
      xMm: number;
      yMm: number;
      widthMm: number;
      heightMm: number;
      type: "CODE128";
    };
    barcodeNumber: {
      text: string;
      xMm: number;
      yMm: number;
      widthMm: number;
      fontSizePt: number;
      fontBold: boolean;
      align: "left" | "center" | "right";
    };
    text1: {
      text: string;
      rawText: string;
      xMm: number;
      yMm: number;
      widthMm: number;
      fontSizePt: number;
      fontBold: boolean;
      align: "left" | "center" | "right";
    };
    text2: {
      text: string;
      rawText: string;
      xMm: number;
      yMm: number;
      widthMm: number;
      fontSizePt: number;
      fontBold: boolean;
      align: "left" | "center" | "right";
    };
  };
  metrics: {
    dpi: DpiOption;
    dotsWidth: number;
    dotsHeight: number;
    dotsPadding: number;
  };
}

/**
 * Generate a complete, millimetric calculated label layout.
 */
export function calculateLabelLayout(input: LabelRenderInput): CalculatedLabelLayout {
  const template: LabelTemplateSpec = {
    ...DEFAULT_50X25_TEMPLATE,
    ...input.template,
    shopName: { ...DEFAULT_50X25_TEMPLATE.shopName, ...input.template?.shopName },
    productName: { ...DEFAULT_50X25_TEMPLATE.productName, ...input.template?.productName },
    barcode: { ...DEFAULT_50X25_TEMPLATE.barcode, ...input.template?.barcode },
    barcodeNumber: { ...DEFAULT_50X25_TEMPLATE.barcodeNumber, ...input.template?.barcodeNumber },
    text1: { ...DEFAULT_50X25_TEMPLATE.text1, ...input.template?.text1 },
    text2: { ...DEFAULT_50X25_TEMPLATE.text2, ...input.template?.text2 },
  };

  const printerSettings: PrinterSettingsSpec = {
    ...DEFAULT_PRINTER_SETTINGS,
    ...input.printerSettings,
  };

  const dpi = template.dpi || printerSettings.dpi || 203;

  const shopTextRaw = input.shopName || "";
  const shopTextFormatted = fitTextToWidth(
    shopTextRaw,
    template.shopName.widthMm,
    template.shopName.fontSizePt,
    template.shopName.fontBold,
  );

  const productTextRaw = input.productName || "";
  const productLines = wrapTextToLines(
    productTextRaw,
    template.productName.widthMm,
    template.productName.fontSizePt,
    template.productName.maxLines || 2,
    template.productName.fontBold,
  );

  const text1Raw = input.customText1 || "";
  const text1Formatted = fitTextToWidth(
    text1Raw,
    template.text1.widthMm,
    template.text1.fontSizePt,
    template.text1.fontBold,
  );

  const text2Raw =
    input.customText2 ||
    (input.price !== undefined && input.price !== null
      ? `₹${input.price.toFixed(2)}`
      : "");
  const text2Formatted = fitTextToWidth(
    text2Raw,
    template.text2.widthMm,
    template.text2.fontSizePt,
    template.text2.fontBold,
  );

  return {
    template,
    printerSettings,
    elements: {
      shopName: {
        text: shopTextFormatted,
        rawText: shopTextRaw,
        xMm: template.shopName.xMm,
        yMm: template.shopName.yMm,
        widthMm: template.shopName.widthMm,
        fontSizePt: template.shopName.fontSizePt,
        fontBold: template.shopName.fontBold,
        align: template.shopName.align,
      },
      productName: {
        lines: productLines,
        rawText: productTextRaw,
        xMm: template.productName.xMm,
        yMm: template.productName.yMm,
        widthMm: template.productName.widthMm,
        fontSizePt: template.productName.fontSizePt,
        fontBold: template.productName.fontBold,
        align: template.productName.align,
      },
      barcode: {
        code: input.barcode,
        xMm: template.barcode.xMm,
        yMm: template.barcode.yMm,
        widthMm: template.barcode.widthMm,
        heightMm: template.barcode.heightMm,
        type: "CODE128",
      },
      barcodeNumber: {
        text: input.barcode,
        xMm: template.barcodeNumber.xMm,
        yMm: template.barcodeNumber.yMm,
        widthMm: template.barcodeNumber.widthMm,
        fontSizePt: template.barcodeNumber.fontSizePt,
        fontBold: template.barcodeNumber.fontBold,
        align: template.barcodeNumber.align,
      },
      text1: {
        text: text1Formatted,
        rawText: text1Raw,
        xMm: template.text1.xMm,
        yMm: template.text1.yMm,
        widthMm: template.text1.widthMm,
        fontSizePt: template.text1.fontSizePt,
        fontBold: template.text1.fontBold,
        align: template.text1.align,
      },
      text2: {
        text: text2Formatted,
        rawText: text2Raw,
        xMm: template.text2.xMm,
        yMm: template.text2.yMm,
        widthMm: template.text2.widthMm,
        fontSizePt: template.text2.fontSizePt,
        fontBold: template.text2.fontBold,
        align: template.text2.align,
      },
    },
    metrics: {
      dpi,
      dotsWidth: mmToDots(template.widthMm, dpi),
      dotsHeight: mmToDots(template.heightMm, dpi),
      dotsPadding: mmToDots(template.paddingMm, dpi),
    },
  };
}

/**
 * Generate raw TSPL printer commands for direct thermal label printing (TSC / Xprinter / Zebra).
 */
export function generateTsplScript(
  layout: CalculatedLabelLayout,
  copies: number = 1,
): string {
  const { template, printerSettings, elements, metrics } = layout;
  const dpi = metrics.dpi;

  const widthDots = metrics.dotsWidth;
  const heightDots = metrics.dotsHeight;
  const gapDots = mmToDots(printerSettings.gapMm, dpi);

  const lines: string[] = [];
  lines.push(`SIZE ${template.widthMm} mm, ${template.heightMm} mm`);
  lines.push(`GAP ${printerSettings.gapMm} mm, 0 mm`);
  lines.push(`DENSITY ${printerSettings.darkness}`);
  lines.push(`SPEED ${printerSettings.printSpeed}`);
  lines.push(`DIRECTION 1`);
  lines.push(`CLS`);

  // 1. Shop Name
  if (elements.shopName.text) {
    const x = mmToDots(elements.shopName.xMm, dpi);
    const y = mmToDots(elements.shopName.yMm, dpi);
    const safeText = elements.shopName.text.replace(/"/g, '\\"');
    lines.push(`TEXT ${x},${y},"3",0,1,1,"${safeText}"`);
  }

  // 2. Product Name (Up to 2 lines)
  if (elements.productName.lines.length > 0) {
    const startY = elements.productName.yMm;
    elements.productName.lines.forEach((lineText, idx) => {
      const y = mmToDots(startY + idx * 3.5, dpi); // 3.5mm line height
      const safeText = lineText.replace(/"/g, '\\"');
      // For center alignment in TSPL, calculate center X
      const centerX = mmToDots(template.widthMm / 2, dpi);
      lines.push(`TEXT ${centerX},${y},"3",0,1,1,2,"${safeText}"`);
    });
  }

  // 3. Barcode (CODE128)
  if (elements.barcode.code) {
    const x = mmToDots(elements.barcode.xMm, dpi);
    const y = mmToDots(elements.barcode.yMm, dpi);
    const height = mmToDots(elements.barcode.heightMm, dpi);
    lines.push(`BARCODE ${x},${y},"128",${height},1,0,2,2,"${elements.barcode.code}"`);
  }

  // 4. Barcode Number
  if (elements.barcodeNumber.text) {
    const y = mmToDots(elements.barcodeNumber.yMm, dpi);
    const centerX = mmToDots(template.widthMm / 2, dpi);
    lines.push(`TEXT ${centerX},${y},"2",0,1,1,2,"${elements.barcodeNumber.text}"`);
  }

  // 5. Text 1 (Bottom Left)
  if (elements.text1.text) {
    const x = mmToDots(elements.text1.xMm, dpi);
    const y = mmToDots(elements.text1.yMm, dpi);
    const safeText = elements.text1.text.replace(/"/g, '\\"');
    lines.push(`TEXT ${x},${y},"1",0,1,1,"${safeText}"`);
  }

  // 6. Text 2 (Bottom Right)
  if (elements.text2.text) {
    const x = mmToDots(elements.text2.xMm, dpi);
    const y = mmToDots(elements.text2.yMm, dpi);
    const safeText = elements.text2.text.replace(/"/g, '\\"');
    // Align right in TSPL (alignment mode 3)
    lines.push(`TEXT ${x},${y},"1",0,1,1,3,"${safeText}"`);
  }

  lines.push(`PRINT ${Math.max(1, copies)},1`);
  return lines.join("\n");
}
