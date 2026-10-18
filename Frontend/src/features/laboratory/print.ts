import { randomId } from "@/shared/lib/random-id";
import JsBarcode from "jsbarcode";
import arabicFont from "@/assets/fonts/arabic.ttf";
import kurdishFont from "@/assets/fonts/kurdish.ttf";
import { apiClient } from "@/shared/api/client";
import { labApi, type LabOrder } from "./api";

const escape = (value: unknown) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );

export async function printLaboratory(
  order: LabOrder,
  labels: Record<string, string>,
  direction: string,
  kind: "ticket" | "invoice" | "results",
  language = "ku",
) {
  const kiosk =
    kind === "ticket" && Boolean(window.electronWindow?.printTicket);
  const token = kiosk ? `nho-ticket-${randomId()}` : null;
  const win = window.open("", "_blank");
  if (!win) throw new Error(labels.popupBlocked);
  let branding: { logo: string; name: string };
  try {
    branding = (
      await apiClient.get<{ logo: string; name: string }>("/settings/logo")
    ).data;
  } catch (error) {
    win.close();
    throw error;
  }
  if (win.closed) return;
  const absolute = (url: string) => new URL(url, window.location.href).href;
  const font = language.startsWith("ar") ? "NHO Arabic" : "NHO Kurdish";
  const ticket = kind === "ticket";
  const receipt = kind !== "results";
  const money = (value: unknown) =>
    escape(Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 }));
  const amount = (value: unknown) =>
    `<bdi dir="ltr">${money(value)} ${escape(order.invoice.currency)}</bdi>`;
  const detail = (label: string, value: unknown) =>
    `<div class="detail"><span>${escape(label)}</span><bdi>${escape(value)}</bdi></div>`;
  const rows = order.items
    .map(
      (item, index) =>
        `<tr><td class="index">${index + 1}</td><td>${escape(item.testName)}</td><td class="number">${kind === "results" ? `<bdi>${escape(item.result || "—")} ${escape(item.unit)}</bdi>` : money(item.price)}</td>${kind === "results" ? `<td>${escape(item.referenceRange || "—")}</td>` : ""}</tr>${kind === "results" && item.resultNotes ? `<tr><td colspan="4" class="result-note">${escape(item.resultNotes)}</td></tr>` : ""}`,
    )
    .join("");
  let barcode = "";
  if (kind === "invoice") {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    JsBarcode(svg, order.invoice.invoiceNumber, {
      format: "CODE128",
      displayValue: true,
      height: 42,
      width: 1.5,
      margin: 12,
      fontSize: 12,
      background: "#ffffff",
      lineColor: "#000000",
    });
    barcode = `<section class="barcode" dir="ltr">${svg.outerHTML}<p dir="${escape(direction)}">${escape(labels.returnBarcodeHelp)}</p></section>`;
  }
  const position = ticket
    ? await labApi.queuePosition(order.id).catch((error) => {
        win.close();
        throw error;
      })
    : null;
  const queueInfo = position?.active
    ? `<div class="queue-info"><p>${escape(position.queue === "accounting" ? labels.accounting : labels.queue)}</p><p>${escape(labels.ticketsAhead)}: <strong>${position.ahead}</strong></p></div>`
    : "";
  const content = ticket
    ? `<section class="queue"><span>${escape(labels.queueNumber)}</span><strong>${escape(String(order.queueNumber).padStart(3, "0"))}</strong>${queueInfo}<p>${escape(order.invoice.balanceAmount > 0 ? labels.goAccounting : labels.goLaboratory)}</p></section><div class="total grand"><span>${escape(labels.total)}</span>${amount(order.invoice.totalAmount)}</div>`
    : `<div class="queue-line">${detail(labels.queueNumber, String(order.queueNumber).padStart(3, "0"))}</div><table class="items"><thead><tr><th class="index">#</th><th>${escape(labels.test)}</th><th class="number">${escape(kind === "results" ? labels.result : labels.price)}</th>${kind === "results" ? `<th>${escape(labels.referenceRange)}</th>` : ""}</tr></thead><tbody>${rows}</tbody></table>${kind === "invoice" ? `<section class="totals"><div class="total grand"><span>${escape(labels.total)}</span>${amount(order.invoice.totalAmount)}</div><div class="total"><span>${escape(labels.paidAmount)}</span>${amount(order.invoice.paidAmount)}</div><div class="total"><span>${escape(labels.balance)}</span>${amount(order.invoice.balanceAmount)}</div></section>` : ""}${order.notes ? `<p class="notes">${escape(order.notes)}</p>` : ""}`;
  // Start with a compact sheet, then measure wrapped content before printing.
  const page = receipt ? "size:80mm 110mm;margin:0" : "size:A4;margin:15mm";
  win.document
    .write(`<!doctype html><html dir="${escape(direction)}" lang="${escape(language)}"><head><meta charset="utf-8"><title>${escape(token || order.invoice.invoiceNumber)}</title><style id="paper">@page{${page}}</style><style>
    @font-face{font-family:"NHO Arabic";src:url("${escape(absolute(arabicFont))}") format("truetype");font-weight:100 900;font-display:block}
    @font-face{font-family:"NHO Kurdish";src:url("${escape(absolute(kurdishFont))}") format("truetype");font-weight:100 900;font-display:block}
    *{box-sizing:border-box}html,body{margin:0;color:#111;font-family:"${font}",sans-serif;font-size:11px;line-height:1.5}
    ${receipt ? "html,body{width:80mm}.sheet{width:80mm;padding:4mm}" : ".sheet{width:100%;padding:0;font-size:13px}"}
    .brand{text-align:center;padding-bottom:3mm;border-bottom:1.5px solid #111}.logo{display:block;width:16mm;height:16mm;object-fit:contain;margin:0 auto 2mm}
    .brand-name{font-size:15px;font-weight:800;letter-spacing:.8px}.brand h1{font-size:13px;margin:1mm 0 0}.document-title{text-align:center;font-size:12px;font-weight:700;margin:3mm 0 2mm}
    .meta{padding:0 0 2mm;border-bottom:1px dashed #777}.detail{display:flex;justify-content:space-between;align-items:baseline;gap:3mm;padding:.6mm 0}.detail span{font-size:10px;color:#444;flex-shrink:0}.detail bdi{text-align:end;overflow-wrap:anywhere}
    .patient{padding:3mm 0;border-bottom:1px dashed #777}.patient-name{font-weight:700;font-size:13px;overflow-wrap:anywhere}.patient-code{font-size:10px;color:#444;margin-top:.5mm}.queue-line{margin:2mm 0}
    table{width:100%;border-collapse:collapse;table-layout:fixed;margin-top:2mm}th,td{text-align:start;padding:2mm 1mm;border-bottom:1px solid #ddd;overflow-wrap:anywhere}th{font-size:10px;border-top:1px solid #111;border-bottom:1px solid #111}.index{width:6mm;font-size:9px;color:#555}.number{text-align:end;width:${receipt ? "21mm" : "35mm"};font-variant-numeric:tabular-nums}tr{break-inside:avoid}
    .items th,.items td{border:1px solid #777}.items th{font-weight:700}.barcode{margin:4mm auto 0;text-align:center;break-inside:avoid}.barcode svg{display:block;width:100%;max-width:68mm;height:auto;margin:auto}.barcode p{font-size:9px;margin:1mm 0 0;letter-spacing:0}
    .totals{margin-top:3mm;break-inside:avoid}.total{display:flex;justify-content:space-between;gap:2mm;padding:1.5mm 0}.total bdi{font-weight:700;white-space:nowrap;font-variant-numeric:tabular-nums}.grand{font-size:13px;font-weight:800;border-top:2px solid #111;border-bottom:1px solid #111;padding:2mm 0}
    .queue{text-align:center;padding:4mm 0}.queue>span{font-size:11px}.queue strong{display:block;font-size:46px;line-height:1.2;letter-spacing:3px;margin:2mm 0}.queue p{font-size:12px;font-weight:700;margin:2mm 0}
    .queue-info strong{display:inline;font-size:16px;letter-spacing:0}.queue-info p{margin:1mm 0}
    .notes,.result-note{white-space:pre-wrap;font-size:10px;overflow-wrap:anywhere}.footer{margin-top:4mm;padding-top:2mm;border-top:1px dashed #777;text-align:center;font-size:9px;letter-spacing:.4px;break-inside:avoid}
    </style></head><body><main class="sheet"><header class="brand">${branding.logo ? `<img class="logo" src="${escape(absolute(branding.logo))}" alt="${escape(branding.name)}">` : ""}<div class="brand-name">${escape(branding.name)}</div><h1>${escape(labels.title)}</h1></header><div class="document-title">${escape(labels[kind] || labels.queueNumber)}</div><section class="meta">${detail(labels.invoice, order.invoice.invoiceNumber)}${detail(labels.date, order.queueDay)}</section><section class="patient"><div class="patient-name"><bdi>${escape(order.patient.firstName)} ${escape(order.patient.lastName)}</bdi></div><div class="patient-code"><bdi>${escape(order.patient.patientCode)}</bdi></div>${detail(labels.phone, order.patient.phone)}${order.patient.address ? detail(labels.address, order.patient.address) : ""}</section>${content}${barcode}<footer class="footer"><bdi>${escape(branding.name)} · ${escape(order.invoice.invoiceNumber)}</bdi></footer></main></body></html>`);
  win.document.close();
  await Promise.all([
    win.document.fonts.load(`11px "${font}"`),
    win.document.fonts.load(`700 13px "${font}"`),
    new Promise<void>((resolve) => {
      const image = win.document.querySelector("img");
      if (!image || image.complete) resolve();
      else {
        image.onload = () => resolve();
        image.onerror = () => resolve();
      }
    }),
  ]);
  const print = async () => {
    await win.document.fonts.ready;
    if (win.closed) return;
    let paperHeight = 110;
    if (receipt) {
      const height =
        Math.ceil(
          (win.document.querySelector(".sheet")!.getBoundingClientRect()
            .height *
            25.4) /
            96,
        ) + 3;
      paperHeight = Math.max(80, height);
      win.document.getElementById("paper")!.textContent =
        `@page{size:80mm ${Math.max(80, height)}mm;margin:0}`;
    }
    if (kiosk && token) {
      await window.electronWindow!.printTicket(token, paperHeight);
    } else {
      win.focus();
      win.print();
    }
  };
  await print();
}
