import { prisma } from "../../../shared/database/client.js";
import { paginate } from "../../../shared/database/paginate.js";

export async function listIcuCases(unit, query = {}) {
  const result = await paginate(
    "inventoryIcuCase",
    query,
    { where: { unit }, orderBy: [{ entry: "desc" }, { id: "desc" }] },
    ["patientName", "id"],
  );
  if (Array.isArray(result)) return result;
  const invalid = query.start && query.end && query.start > query.end;
  const cases = invalid
    ? []
    : await prisma.inventoryIcuCase.findMany({
        where: {
          unit,
          ...((query.start || query.end) && {
            entry: {
              ...(query.start && {
                gte: new Date(`${query.start}T00:00:00+03:00`),
              }),
              ...(query.end && {
                lte: new Date(`${query.end}T23:59:59.999+03:00`),
              }),
            },
          }),
        },
        select: { items: true },
      });
  const totals = { count: 0, price: 0, cost: 0 };
  for (const record of cases) {
    const items = (Array.isArray(record.items) ? record.items : []).filter(
      (item) =>
        (!query.category ||
          query.category === "all" ||
          String(item.category).toLowerCase() === query.category) &&
        (unit !== "cardiac-surgery" ||
          !query.part ||
          query.part === "all" ||
          item.part === query.part),
    );
    if (
      ((!query.category || query.category === "all") &&
        (unit !== "cardiac-surgery" || !query.part || query.part === "all")) ||
      items.length
    )
      totals.count++;
    for (const item of items) {
      totals.price += Number(item.quantity) * Number(item.price);
      totals.cost += Number(item.quantity) * Number(item.cost);
    }
  }
  return { ...result, totals };
}
