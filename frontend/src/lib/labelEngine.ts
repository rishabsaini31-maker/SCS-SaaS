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
  darkness: number;
  printSpeed: number;
  gapMm: number;
  orientation: "PORTRAIT" | "LANDSCAPE";
  defaultCopies: number;
}

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

export const svgToDataUrl = (svg: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

export interface PrintLabelItem {
  barcode: string;
  image: string;
  productName: string;
  price: number;
  labelSize: string;
  labelWidthMm?: number;
  labelHeightMm?: number;
  showName?: boolean;
  showPrice?: boolean;
  shopName?: string;
  customText1?: string;
  customText2?: string;
  layout?: any;
}

/**
 * Open a strict 100% scale 0mm margin print window.
 * Ensures exact 50mm x 25mm physical rendering without browser zoom or scaling.
 */
export function openThermalPrintWindow(
  labels: PrintLabelItem[],
  templateSpec: LabelTemplateSpec = DEFAULT_50X25_TEMPLATE,
) {
  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (!printWindow) {
    alert("Popup blocked. Please allow popups to print barcode labels.");
    return;
  }

  const widthMm = templateSpec.widthMm || 50;
  const heightMm = templateSpec.heightMm || 25;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title></title>
        <style>
          @page {
            size: ${widthMm}mm ${heightMm}mm;
            margin: 0 !important;
          }
          @media print {
            @page {
              size: ${widthMm}mm ${heightMm}mm;
              margin: 0 !important;
            }
            html, body {
              width: ${widthMm}mm !important;
              height: ${heightMm}mm !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
              background: #ffffff !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            header, footer, nav, aside, .header, .footer, .meta, .no-print {
              display: none !important;
              visibility: hidden !important;
            }
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          html, body {
            width: ${widthMm}mm;
            height: ${heightMm}mm;
            margin: 0;
            padding: 0;
            background: #ffffff;
            font-family: Arial, Helvetica, sans-serif;
          }
          .page-break {
            page-break-after: always;
            break-after: page;
          }
          .label-container {
            position: relative;
            width: ${widthMm}mm;
            height: ${heightMm}mm;
            overflow: hidden;
            background: #ffffff;
          }
          .shop-name {
            position: absolute;
            left: ${templateSpec.shopName.xMm}mm;
            top: ${templateSpec.shopName.yMm}mm;
            width: ${templateSpec.shopName.widthMm}mm;
            font-size: ${templateSpec.shopName.fontSizePt}pt;
            font-weight: ${templateSpec.shopName.fontBold ? "700" : "400"};
            text-align: ${templateSpec.shopName.align};
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1;
            color: #000000;
          }
          .product-name {
            position: absolute;
            left: ${templateSpec.productName.xMm}mm;
            top: ${templateSpec.productName.yMm}mm;
            width: ${templateSpec.productName.widthMm}mm;
            font-size: ${templateSpec.productName.fontSizePt}pt;
            font-weight: ${templateSpec.productName.fontBold ? "700" : "400"};
            text-align: ${templateSpec.productName.align};
            line-height: 1.1;
            max-height: 7.5mm;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            text-overflow: ellipsis;
            color: #000000;
          }
          .barcode-wrapper {
            position: absolute;
            left: ${templateSpec.barcode.xMm}mm;
            top: ${templateSpec.barcode.yMm}mm;
            width: ${templateSpec.barcode.widthMm}mm;
            height: ${templateSpec.barcode.heightMm}mm;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .barcode-wrapper svg,
          .barcode-img {
            width: 100% !important;
            height: 100% !important;
            object-fit: fill !important;
            display: block !important;
          }
          .barcode-number {
            position: absolute;
            left: ${templateSpec.barcodeNumber.xMm}mm;
            top: ${templateSpec.barcodeNumber.yMm}mm;
            width: ${templateSpec.barcodeNumber.widthMm}mm;
            font-size: ${templateSpec.barcodeNumber.fontSizePt}pt;
            font-weight: ${templateSpec.barcodeNumber.fontBold ? "700" : "400"};
            text-align: ${templateSpec.barcodeNumber.align};
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1;
            color: #000000;
          }
          .text-1 {
            position: absolute;
            left: ${templateSpec.text1.xMm}mm;
            top: ${templateSpec.text1.yMm}mm;
            width: ${templateSpec.text1.widthMm}mm;
            font-size: ${templateSpec.text1.fontSizePt}pt;
            font-weight: ${templateSpec.text1.fontBold ? "700" : "400"};
            text-align: ${templateSpec.text1.align};
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1;
            color: #000000;
          }
          .text-2 {
            position: absolute;
            left: ${templateSpec.text2.align === "right" ? `${templateSpec.text2.xMm - templateSpec.text2.widthMm}mm` : `${templateSpec.text2.xMm}mm`};
            top: ${templateSpec.text2.yMm}mm;
            width: ${templateSpec.text2.widthMm}mm;
            font-size: ${templateSpec.text2.fontSizePt}pt;
            font-weight: ${templateSpec.text2.fontBold ? "700" : "400"};
            text-align: ${templateSpec.text2.align};
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1;
            color: #000000;
          }
        </style>
      </head>
      <body>
        ${labels
          .map((label, idx) => {
            const isLast = idx === labels.length - 1;
            const shopText = label.shopName || "";
            const showName = label.showName !== false;
            const text1 = label.customText1 || "";
            const text2 =
              label.customText2 ||
              (label.showPrice !== false && label.price !== undefined
                ? `₹${Number(label.price).toFixed(2)}`
                : "");

            return `
              <div class="label-container ${isLast ? "" : "page-break"}">
                ${shopText ? `<div class="shop-name">${shopText}</div>` : ""}
                ${showName ? `<div class="product-name">${label.productName}</div>` : ""}
                <div class="barcode-wrapper">
                  <img class="barcode-img" src="${svgToDataUrl(label.image)}" alt="Barcode ${label.barcode}" />
                </div>
                <div class="barcode-number">${label.barcode}</div>
                <div class="text-1">${text1}</div>
                <div class="text-2">${text2}</div>
              </div>
            `;
          })
          .join("")}
        <script>
          window.onload = () => {
            window.focus();
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
