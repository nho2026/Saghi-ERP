export function printDocument() {
  document.body.classList.add("printing-document");
  const cleanup = () => document.body.classList.remove("printing-document");
  window.addEventListener("afterprint", cleanup, { once: true });
  window.setTimeout(() => window.print(), 50);
  window.setTimeout(cleanup, 2000);
}
