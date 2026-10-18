import { hasPermission, storedUser } from "@/features/auth/access";
import { permissionForRequest } from "@/features/auth/permission-policy";
import { apiClient } from "@/shared/api/client";
import type { TFunction } from "i18next";

type Menu = { to: string; label: string };
type RecordItem = Record<string, unknown>;
type Result = { title: string; detail: string; to: string };
// Explicit list endpoints only; never query arbitrary navigation URLs or reports.
const endpoints: Record<string, string> = {
  "/warehouses/production-companies": "/inventory/production-companies",
  "/warehouses/customers": "/inventory/customers",
  "/warehouses/retailers": "/inventory/retailers",
  "/tasks": "/tasks",
  "/meetings": "/meetings",
  "/targets": "/targets",
  "/users": "/users",
  "/roles": "/roles",
  "/accounting/customers": "/billing/customers",
  "/accounting/invoices": "/billing/invoices",
  "/accounting/payments": "/billing/payments",
  "/accounting/service-advances": "/advances/service",
  "/inventory/products": "/inventory/products",
  "/inventory/categories": "/inventory/categories",
  "/inventory/brands": "/inventory/brands",
  "/inventory/warehouses": "/inventory/warehouses",
  "/inventory/stock": "/inventory/stock",
  "/warehouses/buy/product": "/inventory/purchases",
  "/warehouses/buy/order": "/inventory/orders",
  "/employees": "/employees",
  "/positions": "/employees/positions",
  "/salaries": "/employees/records/salaries",
  "/payrolls": "/employees/records/payrolls",
  "/salary-advances": "/advances/salary",
  "/departments": "/healthcare/departments",
  "/health-staff": "/healthcare/staff",
  "/crm/leads": "/crm/leads",
  "/crm/whatsapp": "/crm/whatsapp/conversations",
  "/crm/patients": "/crm/patients",
  "/crm/appointments": "/crm/appointments",
  "/crm/payments": "/crm/payments",
  "/crm/follow-up": "/crm/follow-up",
  "/crm/referrals": "/crm/referrals",
  "/crm/surgeries": "/crm/surgeries",
  "/crm/surgery-appointments": "/crm/surgery-appointments",
  "/crm/forms": "/crm/forms",
  "/accounting/accounts": "/accounting/accounts",
  "/accounting/journals": "/accounting/journals",
};
// Search display fields, not credentials or arbitrary serialized objects.
const fields = [
  "name",
  "title",
  "firstName",
  "lastName",
  "sku",
  "code",
  "employeeCode",
  "invoiceNumber",
  "entryNumber",
  "phone",
  "email",
  "description",
  "note",
  "status",
  "reference",
  "retailer",
];
function displayValues(item: RecordItem): string[] {
  return fields.flatMap((key) =>
    typeof item[key] === "string" ? [item[key] as string] : [],
  );
}
export async function searchSystemRecords(
  term: string,
  menus: Menu[],
  t: TFunction,
  signal: AbortSignal,
) {
  const user = storedUser();
  const sources = menus.filter((menu) => {
    const endpoint = endpoints[menu.to];
    return (
      endpoint &&
      hasPermission(user, permissionForRequest("GET", endpoint) ?? undefined)
    );
  });
  const results: PromiseSettledResult<Result[]>[] = [];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(4, sources.length) }, async () => {
      while (cursor < sources.length && !signal.aborted) {
        const source = sources[cursor++];
        try {
          const matches: Result[] = [];
          let page = 1;
          let totalPages = 1;
          do {
            const { data } = await apiClient.get<
              | RecordItem[]
              | { items: RecordItem[]; pagination?: { totalPages: number } }
            >(endpoints[source.to], {
              params: { page, pageSize: 100 },
              signal,
            });
            const items = Array.isArray(data) ? data : data.items;
            if (!Array.isArray(items))
              throw new Error("Unexpected search response");
            totalPages = Array.isArray(data)
              ? 1
              : (data.pagination?.totalPages ?? 1);
            for (const item of items) {
              const values = displayValues(item);
              if (
                !values.some((value) =>
                  value.toLocaleLowerCase().includes(term.toLocaleLowerCase()),
                )
              )
                continue;
              const title =
                String(
                  item.name ??
                    item.title ??
                    item.invoiceNumber ??
                    item.entryNumber ??
                    [item.firstName, item.lastName].filter(Boolean).join(" "),
                ) ||
                values[0] ||
                String(item.id);
              matches.push({
                title,
                detail: `${t(source.label)} · ${values
                  .filter((value) => value !== title)
                  .slice(0, 2)
                  .join(" · ")}`,
                to: `${source.to}?search=${encodeURIComponent(String(item.sku ?? item.invoiceNumber ?? title))}`,
              });
              if (matches.length === 5) break;
            }
            page++;
          } while (page <= totalPages && matches.length < 5 && !signal.aborted);
          results.push({ status: "fulfilled", value: matches });
        } catch (reason) {
          results.push({ status: "rejected", reason });
        }
      }
    }),
  );
  return results;
}
