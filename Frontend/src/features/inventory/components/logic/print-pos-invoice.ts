import JsBarcode from "jsbarcode";
import defaultLogo from "@/assets/icons/logo.png";
import type { RecordItem } from "../api/inventory.api";
import { settingsSnapshot } from "@/features/settings/settings";
const esc = (v: unknown) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function printPosInvoice(
  sale: RecordItem,
  t: (key: string, options?: Record<string, unknown>) => string,
  target?: Window | null,
  format: "a4" | "receipt" = "a4",
) {
  const win = target ?? window.open("", "_blank", "width=900,height=1000");
  if (!win) return;
  const organization = settingsSnapshot()?.organization;
  const logo = organization?.logo || defaultLogo;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  JsBarcode(svg, sale.saleNumber, {
    format: "CODE128",
    displayValue: true,
    height: 58,
    width: 1.7,
    margin: 0,
    fontSize: 13,
  });
  const rows = (sale.items ?? [])
    .map(
      (item: RecordItem, i: number) =>
        `<tr><td>${i + 1}</td><td>${esc(item.product?.name)}</td><td>${esc(item.product?.sku)}</td><td>${item.quantity}</td><td>${Number(item.unitPrice).toLocaleString()}</td><td>${Number(item.lineTotal).toLocaleString()}</td></tr>`,
    )
    .join("");
  const receipt = format === "receipt";
  const receiptHeight = Math.min(
    500,
    125 + Math.max(0, (sale.items?.length ?? 1) - 1) * 8,
  );
  const page = receipt
    ? `@page{size:80mm ${receiptHeight}mm;margin:0}html,body{width:80mm;min-height:${receiptHeight}mm}body{padding:3mm;font-size:10px}.sheet{width:74mm;min-height:0;padding:3mm}.head{display:block!important;text-align:center}.brand{justify-content:center}.logo{width:44px!important;height:44px!important}.brand h1{font-size:15px!important}.brand p{display:none}.invoice{text-align:center!important;margin-top:7px}.invoice h2{font-size:18px!important}.meta{display:block!important;margin:9px 0!important}.box{padding:7px!important;margin-bottom:5px}table{font-size:9px;margin-top:8px!important}th,td{padding:4px 2px!important}th:nth-child(3),td:nth-child(3){display:none}.totals{width:100%!important;margin-top:8px!important}.barcode{margin-top:14px!important}.barcode svg{width:68mm}.note{font-size:8px}.footer{display:block!important;text-align:center;margin-top:12px!important}`
    : `@page{size:A4;margin:10mm}html,body{width:100%;height:auto}body{font-size:11px}.sheet{min-height:0;padding:16px!important}.head{padding-bottom:10px!important}.logo{width:52px!important;height:52px!important}.brand h1{font-size:19px!important}.brand p{margin:3px 0!important}.invoice h2{font-size:24px!important;margin-bottom:4px!important}.meta{margin:11px 0!important;gap:8px!important}.box{padding:8px!important;line-height:1.45!important}table{margin-top:10px!important;font-size:10px}th,td{padding:6px!important}.totals{margin-top:10px!important}.total{padding:5px!important}.barcode{margin-top:12px!important;break-inside:avoid;page-break-inside:avoid}.barcode svg{height:54px!important}.footer{margin-top:12px!important;padding-top:8px!important;break-inside:avoid;page-break-inside:avoid}.totals,tr{break-inside:avoid;page-break-inside:avoid}`;
  win.document.open();
  win.document.write(
    `<!doctype html><html dir="${document.documentElement.dir || "ltr"}"><head><meta charset="utf-8"><title>${esc(sale.saleNumber)}</title><style>*{box-sizing:border-box}body{margin:0;color:#0f172a;font-family:Arial,sans-serif}.sheet{border:1px solid #dbe3ec;border-radius:16px;padding:22px}.head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1C9B49;padding-bottom:16px}.brand{display:flex;align-items:center;gap:13px}.logo{width:64px;height:64px;border:1px solid #dbe3ec;border-radius:15px;object-fit:contain;box-shadow:0 4px 12px #0f172a20}.brand h1{margin:0;color:#17823D;font-size:21px}.brand p{margin:5px 0;color:#64748b}.invoice{text-align:end}.invoice h2{margin:0 0 7px;font-size:28px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:18px 0}.box{border:1px solid #dbe3ec;border-radius:10px;padding:12px;line-height:1.7}.box b{display:block;color:#17823D}table{width:100%;border-collapse:collapse;margin-top:18px}th{background:#EDF7F0;color:#126A31}th,td{border:1px solid #cbd5e1;padding:9px;text-align:start}td:nth-last-child(-n+3),th:nth-last-child(-n+3){text-align:end}.totals{width:310px;margin:18px 0 0 auto}.total{display:flex;justify-content:space-between;border-bottom:1px solid #dbe3ec;padding:8px}.grand{background:#17823D;color:#fff;border-radius:7px;font-size:15px;font-weight:bold}.barcode{text-align:center;margin:25px auto 0}.barcode svg{max-width:100%}.note{margin-top:9px;color:#64748b}.footer{display:flex;justify-content:space-between;margin-top:30px;padding-top:13px;border-top:1px dashed #94a3b8}${page}@media print{.sheet{border:0;border-radius:0}}</style></head><body><div class="sheet"><div class="head"><div class="brand"><img class="logo" src="${esc(logo)}"><div><h1>${esc(organization?.name || "")}</h1><p>${esc(t("accounting.organizationSubtitle"))}</p></div></div><div class="invoice"><h2>${esc(t("pos.invoice"))}</h2><b>${esc(sale.saleNumber)}</b></div></div><div class="meta"><div class="box"><b>${esc(t("pos.invoiceDetails"))}</b>${new Date(sale.soldAt).toLocaleString()}<br>${esc(sale.cashierName || "—")}<br>${esc(sale.warehouse?.name || "—")}</div><div class="box"><b>${esc(t("pos.customerDetails"))}</b>${esc(sale.customerName || t("pos.walkInCustomer"))}<br>${esc(t(`pos.values.${sale.paymentMethod}`))}</div></div><table><thead><tr><th>#</th><th>${esc(t("inventory.fields.product"))}</th><th>${esc(t("inventory.fields.sku"))}</th><th>${esc(t("inventory.fields.quantity"))}</th><th>${esc(t("billing.unitPrice"))}</th><th>${esc(t("pos.total"))}</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><div class="total"><span>${esc(t("pos.subtotal"))}</span><b>${Number(sale.subtotal).toLocaleString()} USD</b></div><div class="total"><span>${esc(t("pos.tax"))}</span><b>${Number(sale.taxAmount).toLocaleString()} USD</b></div><div class="total"><span>${esc(t("pos.discount"))}</span><b>${Number(sale.discountAmount).toLocaleString()} USD</b></div><div class="total grand"><span>${esc(t("pos.total"))}</span><b>${Number(sale.totalAmount).toLocaleString()} USD</b></div></div><div class="barcode">${svg.outerHTML}<div class="note">${esc(t("pos.returnBarcodeHelp"))}</div></div><div class="footer"><span>${esc(t("pos.thankYou"))}</span><span>${new Date().toLocaleDateString()}</span></div></div><script>setTimeout(()=>window.print(),500)<\/script></body></html>`,
  );
  win.document.close();
}
