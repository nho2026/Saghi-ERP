import JsBarcode from "jsbarcode";

const isValidEan13 = (value: string) => {
  if (!/^\d{13}$/.test(value)) return false;
  const sum = [...value.slice(0, 12)].reduce(
    (total, digit, index) => total + Number(digit) * (index % 2 ? 3 : 1),
    0,
  );
  return Number(value[12]) === (10 - (sum % 10)) % 10;
};

export function renderBarcode(
  element: SVGSVGElement,
  value: string,
  options: Record<string, unknown>,
): boolean {
  const clear = () => {
    element.replaceChildren();
    for (const attribute of ["width", "height", "viewBox"])
      element.removeAttribute(attribute);
  };
  clear();
  if (!value) return false;
  try {
    JsBarcode(element, value, {
      ...options,
      format: isValidEan13(value) ? "EAN13" : "CODE128",
    });
    return true;
  } catch {
    clear();
    return false;
  }
}
