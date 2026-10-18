import { toast } from "sonner";
import { renderBarcode } from "./render-barcode";
import type { RecordItem } from "../api/inventory.api";

export function printProductBarcode(
  product: RecordItem,
  quantity: number,
  size: "50x30" | "40x25",
) {
  printProductBarcodes([product], quantity, size);
}

export function printProductBarcodes(
  products: RecordItem[],
  quantity: number,
  size: "50x30" | "40x25",
) {
  const printable = products.filter((product) => product.barcode);
  if (!printable.length) return;
  const [width, height] = size.split("x").map(Number);
  let invalidCount = 0;
  const labels = printable.flatMap((product) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const valid = renderBarcode(svg, String(product.barcode), {
      width: size === "40x25" ? 1.35 : 1.65,
      height: size === "40x25" ? 34 : 42,
      fontSize: size === "40x25" ? 10 : 12,
      margin: 2,
    });
    if (!valid) {
      invalidCount++;
      return [];
    }
    const label = `<article class="label"><div class="barcode">${svg.outerHTML}</div></article>`;
    return Array.from(
      { length: Math.max(1, Math.min(500, quantity)) },
      () => label,
    );
  });
  if (invalidCount) {
    toast.error(
      `${invalidCount} selected barcode(s) cannot be printed. Correct or deselect the unsupported values and try again.`,
    );
    return;
  }
  const popup = window.open("", "_blank", "width=700,height=700");
  if (!popup) return;
  popup.document.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>Product barcodes</title><style>@page{size:${width}mm ${height}mm;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0}.label{width:${width}mm;height:${height}mm;padding:1.2mm 1.5mm;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;break-after:page;page-break-after:always}.label:last-child{break-after:auto;page-break-after:auto}.barcode{display:flex;width:100%;min-height:0;align-items:center;justify-content:center}.label svg{display:block;max-width:100%;height:auto}@media screen{body{background:#ddd}.label{margin:8px auto;background:white;box-shadow:0 2px 8px #0002}}</style></head><body>${labels.join("")}<script>setTimeout(()=>window.print(),300)</script></body></html>`,
  );
  popup.document.close();
}
