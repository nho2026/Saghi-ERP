export type PatientProductRow = {
  id: string;
  patientName: string;
  patientCode: string;
  department: string;
  departmentType: string;
  date: string;
  product: string;
  size: string;
  code: string;
  barcode: string;
  quantity: number;
  cost: number;
  price: number;
  profit: number;
};
export type ReportFilters = {
  department: string;
  product: string;
  patient: string;
  start: string;
  end: string;
  search: string;
};
export const emptyReportFilters: ReportFilters = {
  department: "all",
  product: "",
  patient: "",
  start: "",
  end: "",
  search: "",
};
export function filterPatientProducts(
  rows: PatientProductRow[],
  filters: ReportFilters,
) {
  const includes = (value: string, search: string) =>
    value.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase());
  if (filters.start && filters.end && filters.start > filters.end) return [];
  return rows.filter((row) => {
    const date = new Date(row.date);
    const day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return (
      (filters.department === "all" || row.department === filters.department) &&
      includes(`${row.product} ${row.code} ${row.barcode}`, filters.product) &&
      includes(`${row.patientName} ${row.patientCode}`, filters.patient) &&
      (!filters.start || day >= filters.start) &&
      (!filters.end || day <= filters.end) &&
      includes(
        `${row.patientName} ${row.patientCode} ${row.product} ${row.code} ${row.barcode}`,
        filters.search,
      )
    );
  });
}
export function reportTotals(rows: PatientProductRow[]) {
  return rows.reduce(
    (total, row) => ({
      quantity: total.quantity + row.quantity,
      cost: total.cost + row.cost,
      price: total.price + row.price,
      profit: total.profit + row.profit,
    }),
    { quantity: 0, cost: 0, price: 0, profit: 0 },
  );
}
export function csvCell(value: string | number) {
  const text = String(value);
  // Keep spreadsheet applications from interpreting user-entered text as formulas.
  const safe =
    typeof value === "string" && /^[\s]*[=+\-@\t\r\n]/.test(text)
      ? `'${text}`
      : text;
  return `"${safe.replace(/"/g, '""')}"`;
}
export const escapeReportHtml = (value: unknown) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]!,
  );
