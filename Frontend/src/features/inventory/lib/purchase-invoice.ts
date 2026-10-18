import type { TFunction } from "i18next";
import type { Settings } from "@/features/settings/settings";

type PurchaseInvoice = {
  invoiceNumber: string;
  retailer: string;
  buyDate: string;
  salesperson: string;
  note: string;
  totalPrice: string;
  isDebt: boolean;
  status: string;
  items: {
    productName: string;
    warehouseName: string;
    quantity: number;
    unit?: string;
    price: number;
    totalPrice: number;
  }[];
};
const escape = (value: unknown) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );

export function purchaseInvoiceHtml(
  row: PurchaseInvoice,
  organization: Settings["organization"],
  t: TFunction,
  language: string,
  dir: string,
) {
  const label = (key: string) => escape(t(key));
  const money = (value: string | number) =>
    escape(
      new Intl.NumberFormat(language, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(value)),
    );
  const logo = /^(https:\/\/|data:image\/(png|jpeg|webp);base64,)/.test(
    organization.logo,
  )
    ? organization.logo
    : "";
  const detail = (key: string, value: string) =>
    `<div><span class="label">${label(key)}</span><strong>${escape(value || "—")}</strong></div>`;
  return `<!doctype html><html lang="${escape(language)}" dir="${dir === "rtl" ? "rtl" : "ltr"}"><head><meta charset="utf-8"><title>${escape(row.invoiceNumber)}</title><style>
*{box-sizing:border-box}body{margin:0;background:#edf2ef;color:#183229;font:12px/1.55 Arial,sans-serif}.sheet{max-width:850px;margin:24px auto;background:white;padding:40px;border-radius:12px;box-shadow:0 8px 40px #173a2110}.header{display:flex;align-items:center;justify-content:space-between;gap:24px;padding-bottom:24px;border-bottom:3px solid #17823d}.brand{display:flex;align-items:center;gap:16px;min-width:0}.logo{width:84px;height:84px;object-fit:contain}.brand h1{font-size:20px;line-height:1.3;margin:0 0 6px;color:#126a31}.contact{font-size:10px;color:#64756c;white-space:pre-line}.invoice{text-align:end;flex-shrink:0}.invoice h2{font-size:22px;margin:0;color:#126a31}.invoice strong{display:block;font-size:16px;margin-top:6px}.label{display:block;color:#738178;font-size:10px;margin-bottom:5px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:24px 0}.panel{border:1px solid #dfe8e2;border-radius:9px;padding:16px}.panel strong{font-size:13px;overflow-wrap:anywhere}.panel>div+div{margin-top:12px}.status{display:inline-block;background:#edf7f0;color:#126a31;border:1px solid #cce5d4;border-radius:5px;padding:3px 9px;font-size:10px;margin-top:10px}table{width:100%;border-collapse:collapse;table-layout:fixed}thead{display:table-header-group}th{text-align:start;background:#edf7f0;color:#126a31;font-size:10px;border-block:1px solid #d9e7de;padding:11px 8px}td{padding:13px 8px;border-bottom:1px solid #e5ece7;vertical-align:top;overflow-wrap:anywhere}tbody tr:nth-child(even){background:#fafcfb}.num{text-align:end;font-variant-numeric:tabular-nums}.index{color:#809087;text-align:center}.product{font-weight:600}.storage{color:#6b7b71;font-size:10px}.summary{display:flex;justify-content:space-between;align-items:start;gap:24px;margin-top:24px;break-inside:avoid}.note{flex:1;color:#5b6f62;white-space:pre-wrap;overflow-wrap:anywhere}.total{min-width:240px;border:1px solid #cce5d4;border-radius:9px;overflow:hidden}.count{display:flex;justify-content:space-between;padding:10px 14px;color:#5b6f62}.grand{display:flex;justify-content:space-between;gap:20px;background:#126a31;color:white;padding:15px 14px;font-size:15px}.footer{margin-top:40px;padding-top:14px;border-top:1px solid #dfe8e2;display:flex;justify-content:space-between;gap:20px;color:#7b8980;font-size:10px}tr{break-inside:avoid}@page{size:A4;margin:14mm}@media print{body{background:white;print-color-adjust:exact;-webkit-print-color-adjust:exact}.sheet{max-width:none;margin:0;padding:0;border-radius:0;box-shadow:none}}
</style></head><body><main class="sheet">
<header class="header"><div class="brand">${logo ? `<img class="logo" src="${escape(logo)}" alt="${escape(organization.name)}">` : ""}<div><h1>${escape(organization.name)}</h1><div class="contact">${[organization.address, organization.phone, organization.email].filter(Boolean).map(escape).join("<br>")}</div></div></div><div class="invoice"><h2>${label("buyHistory.purchaseInvoice")}</h2><strong dir="ltr">#${escape(row.invoiceNumber)}</strong><span class="status">${label(`buyHistory.${row.status}`)}</span></div></header>
<section class="meta"><div class="panel">${detail("buyProductForm.retailer", row.retailer)}${detail("buyProductForm.salesperson", row.salesperson)}</div><div class="panel">${detail("buyProductForm.buyDate", new Date(row.buyDate).toLocaleDateString(language))}<div><span class="label">${label("departmentOrders.status")}</span><strong>${label(row.isDebt ? "buyHistory.debt" : "buyHistory.paid")}</strong></div></div></section>
<table><colgroup><col style="width:5%"><col style="width:30%"><col style="width:20%"><col style="width:15%"><col style="width:14%"><col style="width:16%"></colgroup><thead><tr><th class="index">#</th>${["product", "storage", "quantity", "price", "totalPrice"].map((key, index) => `<th${index > 1 ? ' class="num"' : ""}>${label(`buyProductForm.${key}`)}</th>`).join("")}</tr></thead><tbody>${row.items.map((item, index) => `<tr><td class="index">${index + 1}</td><td class="product">${escape(item.productName)}</td><td class="storage">${escape(item.warehouseName)}</td><td class="num">${escape(item.quantity)} ${escape(item.unit)}</td><td class="num">${money(item.price)}</td><td class="num"><strong>${money(item.totalPrice)}</strong></td></tr>`).join("")}</tbody></table>
<section class="summary"><div class="note">${row.note ? `<span class="label">${label("buyProductForm.note")}</span>${escape(row.note)}` : ""}</div><div class="total"><div class="count"><span>${label("buyHistory.totalProducts")}</span><strong>${row.items.length}</strong></div><div class="grand"><span>${label("buyProductForm.totalPrice")}</span><strong>${money(row.totalPrice)}</strong></div></div></section><footer class="footer"><span>${escape(organization.name)}</span><span>${label("buyHistory.purchaseInvoice")} · ${escape(row.invoiceNumber)}</span></footer></main></body></html>`;
}
