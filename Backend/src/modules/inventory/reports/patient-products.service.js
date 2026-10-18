import { paginateRows } from "../../../shared/database/paginate.js";
import {
  filterPatientProducts,
  emptyReportFilters,
  reportTotals,
} from "./patient-products.filters.js";
import { patientProductsModel } from "./patient-products.model.js";
export function patientProductRows(cases) {
  return cases.flatMap((record) =>
    (Array.isArray(record.items) ? record.items : []).flatMap((item, index) => {
      if (!item || typeof item !== "object") return [];
      const number = (value) =>
        Number.isFinite(Number(value)) ? Number(value) : 0;
      const quantity = number(item.quantity);
      const cost = quantity * number(item.cost);
      const price = quantity * number(item.price);
      return [
        {
          id: `${record.id}:${index}`,
          patientName: record.patientName,
          patientCode: record.patient?.patientCode ?? record.patientId ?? "",
          department: record.unit,
          departmentType: item.part ?? "",
          date: record.entry.toISOString(),
          product: String(item.name ?? ""),
          size: String(item.size ?? ""),
          code: String(item.code ?? ""),
          barcode: String(item.barcode ?? ""),
          quantity,
          cost,
          price,
          profit: price - cost,
        },
      ];
    }),
  );
}

export const patientProductsService = {
  list: async ({ query = {} } = {}) => {
    const all = patientProductRows(await patientProductsModel.listCases());
    const rows = filterPatientProducts(all, {
      ...emptyReportFilters,
      ...query,
    });
    const key = [
      "patientName",
      "patientCode",
      "department",
      "departmentType",
      "date",
      "product",
      "size",
      "code",
      "barcode",
      "quantity",
      "cost",
      "price",
      "profit",
    ].includes(query.sort)
      ? query.sort
      : "date";
    rows.sort((a, b) => {
      const value =
        typeof a[key] === "number"
          ? a[key] - b[key]
          : String(a[key]).localeCompare(
              String(b[key]),
              String(query.locale || "en"),
              { numeric: true },
            );
      return (
        (query.descending === "false" ? value : -value) ||
        a.id.localeCompare(b.id)
      );
    });
    if (query.page === undefined) return rows;
    const products = new Map(),
      departments = new Map();
    for (const row of rows) {
      products.set(
        row.product,
        (products.get(row.product) ?? 0) + row.quantity,
      );
      const sums = departments.get(row.department) ?? [0, 0, 0];
      departments.set(row.department, [
        sums[0] + row.cost,
        sums[1] + row.price,
        sums[2] + row.profit,
      ]);
    }
    return {
      ...paginateRows(rows, query),
      totals: reportTotals(rows),
      productGroups: [...products]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value]) => ({ name, values: [value] })),
      departmentGroups: [...departments].map(([name, values]) => ({
        name,
        values,
      })),
    };
  },
};
