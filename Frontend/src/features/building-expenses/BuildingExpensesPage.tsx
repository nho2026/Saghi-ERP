import { useBuildingTranslation } from "./useBuildingTranslation";
import { useSearchParams } from "react-router-dom";
import {
  ExternalLink,
  MoreHorizontal,
  Paperclip,
  Plus,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
import { BuildingStatusBadge } from "./BuildingStatusBadge";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/shared/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { FormDatePicker } from "@/shared/components/ui/form-date-picker";
import { apiClient, apiErrorMessage } from "@/shared/api/client";
import { productImageUrl } from "@/features/inventory/api/inventory.api";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { hasPermission, storedUser } from "@/features/auth/access";

type Department = { id: string; name: string };
type Product = {
  id: string;
  name: string;
  category: string;
  barcode: string | null;
  price: number | string;
  active: boolean;
};
type Item = {
  productId: string | null;
  name: string;
  quantity: number;
  price: number;
  note: string;
};
type Request = {
  id: string;
  departmentId: string | null;
  department: Department | null;
  kind: string;
  status: string;
  note: string;
  invoiceNumber: string | null;
  attachmentUrl: string | null;
  items: Item[];
  paidAmount: string | number;
  paymentMethod: string;
  createdBy: string;
  history: { status: string; by: string; at: string; reason: string }[];
};
type Expense = {
  id: string;
  departmentId: string | null;
  department: Department | null;
  category: string;
  description: string;
  amount: number | string;
  date: string;
  paidBy: string;
  note: string;
};
export type BuildingData = {
  departments: Department[];
  products: Product[];
  allocations: {
    id: string;
    departmentId: string | null;
    department: Department | null;
    product: Product;
    quantity: number;
  }[];
  expenses: Expense[];
  requests: Request[];
};
const transitions: Record<string, string[]> = {
  draft: ["pending", "cancelled"],
  pending: ["approved", "rejected", "cancelled"],
  approved: ["ordered", "completed", "cancelled"],
  ordered: ["completed", "cancelled"],
};
const total = (items: Item[]) =>
  items.reduce(
    (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
    0,
  ) / 100;
const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
function Field({ label, children }: { label: string; children: ReactNode }) {
  const { t } = useBuildingTranslation();
  return (
    <div className="space-y-2">
      <Label>{t(label)}</Label>
      {children}
    </div>
  );
}
function Choice({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  const { t } = useBuildingTranslation();
  return (
    <Field label={label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger aria-label={t(label)}>
          <SelectValue placeholder={t(label)} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {t(option.label, { defaultValue: option.label })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
export type BuildingPage =
  "products" | "requests" | "purchases" | "sales" | "departments" | "expenses";
const pageTitles: Record<BuildingPage, string> = {
  products: "Products",
  requests: "Requests",
  purchases: "Purchases",
  sales: "Sales",
  departments: "Department products",
  expenses: "Expenses",
};
export default function BuildingExpensesPage({ page }: { page: BuildingPage }) {
  const { t, i18n } = useBuildingTranslation();
  const locale = i18n.language.startsWith("ku") ? "ckb-IQ" : i18n.language;
  const money = (value: number | string) =>
    Number(value).toLocaleString(locale, { maximumFractionDigits: 2 });
  const resource = useApiResource(
    useCallback(
      async () =>
        (await apiClient.get<BuildingData>("/building-expenses")).data,
      [],
    ),
  );
  const tab = page === "purchases" || page === "sales" ? "requests" : page;
  const historyReason = (status: string, reason: string) => {
    const payment =
      status === "payment" && reason.match(/^([\d.]+) \((cash|card|bank)\)$/);
    if (payment)
      return t("Payment of {{amount}} by {{method}}", {
        amount: money(payment[1]),
        method: t(payment[2]),
      });
    return reason === "Submitted for approval"
      ? t("Submitted for approval")
      : reason;
  };
  const [params] = useSearchParams();
  const [department, setDepartment] = useState(
    params.get("department") ?? "all",
  );
  const [search, setSearch] = useState(params.get("search") ?? "");
  const [status, setStatus] = useState("all");
  const [dialog, setDialog] = useState<
    | "product"
    | "expense"
    | "request"
    | "details"
    | "status"
    | "allocation"
    | "payment"
    | null
  >(null);
  const [id, setId] = useState("");
  const [allocation, setAllocation] = useState({
    id: "",
    quantity: 0,
    previousQuantity: 0,
  });
  const [busy, setBusy] = useState(false);
  const [uploadingInvoice, setUploadingInvoice] = useState(false);
  const invoiceFileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [product, setProduct] = useState({
    name: "",
    category: "",
    barcode: "",
    price: 0,
    active: true,
  });
  const [expense, setExpense] = useState({
    departmentId: "",
    category: "daily",
    description: "",
    amount: 0,
    date: today(),
    paidBy: "",
    note: "",
  });
  const [request, setRequest] = useState({
    departmentId: "",
    kind: page === "sales" ? "sale" : "purchase",
    invoiceNumber: "",
    attachmentUrl: null as string | null,
    note: "",
    paidAmount: 0,
    paymentMethod: "cash",
    items: [
      { productId: null, name: "", quantity: 1, price: 0, note: "" },
    ] as Item[],
  });
  const [selected, setSelected] = useState<Request | null>(null);
  const [nextStatus, setNextStatus] = useState("");
  const [reason, setReason] = useState("");
  const [payment, setPayment] = useState({ amount: 0, paymentMethod: "cash" });
  const can = (action: string) =>
    hasPermission(storedUser(), `building-expenses.${action}`);
  const data = resource.data;
  const departments =
    data?.departments.map((d) => ({ value: d.id, label: d.name })) ?? [];
  const match = (value: string) =>
    value.toLowerCase().includes(search.toLowerCase());
  const inDepartment = (value: { departmentId: string | null }) =>
    department === "all" || value.departmentId === department;
  const visibleCount = !data
    ? 0
    : tab === "products"
      ? data.products.filter((row) =>
          match(`${row.name} ${row.category} ${row.barcode ?? ""}`),
        ).length
      : tab === "departments"
        ? data.allocations
            .filter(inDepartment)
            .filter((row) =>
              match(`${row.product.name} ${row.product.barcode ?? ""}`),
            ).length
        : tab === "expenses"
          ? data.expenses
              .filter(inDepartment)
              .filter((row) =>
                match(`${row.description} ${row.paidBy} ${row.note}`),
              ).length
          : data.requests
              .filter((row) =>
                page === "sales"
                  ? row.kind === "sale"
                  : page === "purchases"
                    ? row.kind === "purchase"
                    : !["ordered", "completed"].includes(row.status),
              )
              .filter(inDepartment)
              .filter(
                (row) =>
                  (status === "all" || row.status === status) &&
                  match(
                    `${row.id} ${row.note} ${row.items.map((item) => item.name).join(" ")}`,
                  ),
              ).length;
  const save = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError("");
    try {
      await fn();
      setDialog(null);
      await resource.refresh();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };
  const open = (kind: "product" | "expense" | "request") => {
    setId("");
    setError("");
    setDialog(kind);
    setProduct({ name: "", category: "", barcode: "", price: 0, active: true });
    setExpense({
      departmentId: department === "all" ? "" : department,
      category: "daily",
      description: "",
      amount: 0,
      date: today(),
      paidBy: storedUser()?.name ?? "",
      note: "",
    });
    setRequest({
      departmentId: department === "all" ? "" : department,
      kind: page === "sales" ? "sale" : "purchase",
      invoiceNumber: "",
      attachmentUrl: null,
      note: "",
      paidAmount: 0,
      paymentMethod: "cash",
      items: [{ productId: null, name: "", quantity: 1, price: 0, note: "" }],
    });
  };
  const editRequest = (row: Request) => {
    setId(row.id);
    setError("");
    setRequest({
      departmentId: row.departmentId ?? "",
      kind: row.kind,
      invoiceNumber: row.invoiceNumber ?? "",
      attachmentUrl: row.attachmentUrl,
      note: row.note,
      paidAmount: Number(row.paidAmount),
      paymentMethod: row.paymentMethod,
      items: row.items,
    });
    setDialog("request");
  };
  const uploadInvoice = async (file: File) => {
    if (
      file.size > 5 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.type,
      )
    ) {
      setError(t("Choose a supported image smaller than 5 MB."));
      return;
    }
    const body = new FormData();
    body.append("invoice", file);
    setUploadingInvoice(true);
    setError("");
    try {
      const response = await apiClient.post<{ attachmentUrl: string }>(
        "/building-expenses/invoices",
        body,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      setRequest((current) => ({
        ...current,
        attachmentUrl: response.data.attachmentUrl,
      }));
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setUploadingInvoice(false);
    }
  };
  const updateItem = (index: number, change: Partial<Item>) =>
    setRequest((current) => ({
      ...current,
      items: current.items.map((item, i) =>
        i === index ? { ...item, ...change } : item,
      ),
    }));
  return (
    <div className="mx-auto w-full min-w-0 max-w-[1500px] space-y-5 p-4 md:p-6">
      <div>
        <p className="text-sm text-muted-foreground">
          {t("Building expenses")}
        </p>
        <h1 className="text-2xl font-semibold">{t(pageTitles[page])}</h1>
        <p className="text-muted-foreground">
          {page === "requests"
            ? t("Drafts and requests awaiting approval or ordering.")
            : page === "purchases"
              ? t("Purchase orders, delivery status and supplier payments.")
              : page === "sales"
                ? t(
                    "Department sales, collected payments and outstanding balances.",
                  )
                : page === "products"
                  ? t("Manage product names, categories, barcodes and prices.")
                  : page === "departments"
                    ? t("Manage the products held by each department.")
                    : t(
                        "Track daily, cleaning, drinks and other building expenses.",
                      )}
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border bg-card p-4">
        <div className={tab === "products" ? "hidden" : "min-w-48 flex-1"}>
          <Choice
            label={t("Department")}
            value={department}
            onChange={setDepartment}
            options={[
              { value: "all", label: "All departments" },
              ...departments,
            ]}
          />
        </div>
        <Field label={t("Search")}>
          <Input
            aria-label={t("Search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Name, barcode or notes")}
          />
        </Field>
        {tab === "requests" && (
          <div className="w-32 shrink-0">
            <Choice
              label={t("Status")}
              value={status}
              onChange={setStatus}
              options={[
                "all",
                "draft",
                "pending",
                "approved",
                "ordered",
                "completed",
                "rejected",
                "cancelled",
              ].map((value) => ({ value, label: value }))}
            />
          </div>
        )}
        {can("create") && tab !== "departments" && (
          <Button
            onClick={() =>
              open(
                tab === "products"
                  ? "product"
                  : tab === "expenses"
                    ? "expense"
                    : "request",
              )
            }
          >
            {t(
              tab === "products"
                ? "Add product"
                : tab === "expenses"
                  ? "Add expense"
                  : page === "sales"
                    ? "Add sale"
                    : page === "purchases"
                      ? "Add purchase"
                      : "Add request",
            )}
          </Button>
        )}
      </div>
      {(resource.error || error) && (
        <p role="alert" className="text-destructive">
          {t(resource.error || error)}
        </p>
      )}
      {resource.isLoading ? (
        <p role="status">{t("Loading building expenses…")}</p>
      ) : !data ? (
        <p>{t("Unable to load building expenses.")}</p>
      ) : (
        <Card className="overflow-hidden rounded-2xl shadow-none">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-semibold">{t(pageTitles[page])}</h2>
            <Badge variant="secondary" className="rounded-full">
              {t("{{count}} records", { count: visibleCount })}
            </Badge>
          </div>
          <Table
            className={`${tab === "requests" ? "min-w-[1100px]" : ""} [&_td]:py-4 [&_td]:align-middle [&_td:last-child:not([colspan])]:text-end`}
          >
            <TableHeader className="bg-muted/40">
              <TableRow>
                {(tab === "products"
                  ? [
                      "Name",
                      "Category",
                      "Barcode",
                      "Price",
                      "Status",
                      "Actions",
                    ]
                  : tab === "departments"
                    ? [
                        "Department",
                        "Product",
                        "Category",
                        "Quantity",
                        "Actions",
                      ]
                    : tab === "expenses"
                      ? [
                          "Date",
                          "Department",
                          "Category",
                          "Description",
                          "Amount",
                          "Paid by",
                          "Actions",
                        ]
                      : [
                          "Department / reference",
                          "Type",
                          "Products",
                          "Invoice number",
                          "Total",
                          "Paid / balance",
                          "Status",
                          "Actions",
                        ]
                ).map((heading) => (
                  <TableHead
                    key={t(heading)}
                    className={
                      [
                        "Price",
                        "Amount",
                        "Total",
                        "Quantity",
                        "Paid / balance",
                        "Actions",
                      ].includes(heading)
                        ? "text-end whitespace-nowrap"
                        : "whitespace-nowrap"
                    }
                  >
                    {t(heading)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody
              autoPaginate={visibleCount > 0}
              key={`${page}-${department}-${search}-${status}`}
              emptyMessage={t("No matching records.")}
            >
              {visibleCount === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={
                      tab === "products" ? 6 : tab === "departments" ? 5 : 8
                    }
                    className="h-24 !text-center"
                  >
                    <p className="font-medium">{t("No matching records")}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("Try another filter or add your first record.")}
                    </p>
                  </TableCell>
                </TableRow>
              )}
              {tab === "products" &&
                data.products
                  .filter((row) =>
                    match(`${row.name} ${row.category} ${row.barcode ?? ""}`),
                  )
                  .map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="max-w-64 font-medium">
                        <span className="block truncate" title={row.name}>
                          {row.name}
                        </span>
                      </TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell>{row.barcode || "—"}</TableCell>
                      <TableCell className="text-end tabular-nums whitespace-nowrap">
                        {money(row.price)}
                      </TableCell>
                      <TableCell>
                        <BuildingStatusBadge
                          status={row.active ? "active" : "archived"}
                        />
                      </TableCell>
                      <TableCell>
                        {can("update") && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setId(row.id);
                              setProduct({
                                ...row,
                                barcode: row.barcode ?? "",
                                price: Number(row.price),
                              });
                              setError("");
                              setDialog("product");
                            }}
                          >
                            {t("Edit")}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              {tab === "departments" &&
                data.allocations
                  .filter(inDepartment)
                  .filter((row) =>
                    match(`${row.product.name} ${row.product.barcode ?? ""}`),
                  )
                  .map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.department?.name ?? t("Unassigned department")}</TableCell>
                      <TableCell className="max-w-64 font-medium">
                        <span
                          className="block truncate"
                          title={row.product.name}
                        >
                          {row.product.name}
                        </span>
                      </TableCell>
                      <TableCell>{row.product.category}</TableCell>
                      <TableCell className="text-end tabular-nums">
                        {row.quantity}
                      </TableCell>
                      <TableCell>
                        {can("update") && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setAllocation({
                                id: row.id,
                                quantity: row.quantity,
                                previousQuantity: row.quantity,
                              });
                              setError("");
                              setDialog("allocation");
                            }}
                          >
                            {t("Adjust quantity")}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              {tab === "expenses" &&
                data.expenses
                  .filter(inDepartment)
                  .filter((row) =>
                    match(`${row.description} ${row.paidBy} ${row.note}`),
                  )
                  .map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        {new Date(
                          row.date.slice(0, 10) + "T12:00:00",
                        ).toLocaleDateString(locale)}
                      </TableCell>
                      <TableCell>{row.department?.name ?? t("Unassigned department")}</TableCell>
                      <TableCell>{t(row.category)}</TableCell>
                      <TableCell>
                        {row.description}
                        <p
                          className="max-w-64 truncate text-xs text-muted-foreground"
                          title={row.note}
                        >
                          {row.note}
                        </p>
                      </TableCell>
                      <TableCell className="text-end tabular-nums whitespace-nowrap">
                        {money(row.amount)}
                      </TableCell>
                      <TableCell>{row.paidBy}</TableCell>
                      <TableCell>
                        {can("update") && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setId(row.id);
                              setExpense({
                                ...row,
                                departmentId: row.departmentId ?? "",
                                date: row.date.slice(0, 10),
                                amount: Number(row.amount),
                              });
                              setError("");
                              setDialog("expense");
                            }}
                          >
                            {t("Edit")}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              {tab === "requests" &&
                data.requests
                  .filter((row) =>
                    page === "sales"
                      ? row.kind === "sale"
                      : page === "purchases"
                        ? row.kind === "purchase"
                        : !["ordered", "completed"].includes(row.status),
                  )
                  .filter(inDepartment)
                  .filter(
                    (row) =>
                      (status === "all" || row.status === status) &&
                      match(
                        `${row.id} ${row.note} ${row.items.map((item) => item.name).join(" ")}`,
                      ),
                  )
                  .map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        {row.department?.name ?? t("Unassigned department")}
                        <p
                          className="max-w-44 truncate font-mono text-xs text-muted-foreground"
                          title={row.id}
                        >
                          #{row.id.slice(-8).toUpperCase()}
                        </p>
                      </TableCell>
                      <TableCell className="capitalize">
                        {t(row.kind)}
                      </TableCell>
                      <TableCell>
                        <div className="flex max-w-64 flex-wrap gap-1.5">
                          {row.items.slice(0, 3).map((item, index) => (
                            <span
                              key={`${item.name}-${index}`}
                              className="rounded-md bg-muted px-2 py-1 text-xs"
                            >
                              {item.name}{" "}
                              <span className="font-semibold">
                                × {item.quantity}
                              </span>
                            </span>
                          ))}
                          {row.items.length > 3 && (
                            <span className="self-center text-xs text-muted-foreground">
                              {t("+{{count}} more", {
                                count: row.items.length - 3,
                              })}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-start">
                        <div className="space-y-1">
                          <span className="font-medium">
                            {row.kind === "purchase"
                              ? row.invoiceNumber || "—"
                              : "—"}
                          </span>
                          {row.kind === "purchase" && row.attachmentUrl ? (
                            <a
                              href={productImageUrl(row.attachmentUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                            >
                              <ExternalLink className="size-3" />
                              {t("View invoice")}
                            </a>
                          ) : row.kind === "purchase" ? (
                            <span className="block text-xs text-muted-foreground">
                              {t("No invoice attached")}
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-end tabular-nums whitespace-nowrap">
                        {money(total(row.items))}
                      </TableCell>
                      <TableCell className="text-end tabular-nums whitespace-nowrap">
                        <p>
                          {t("Paid: {{amount}}", {
                            amount: money(row.paidAmount),
                          })}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t("Due: {{amount}}", {
                            amount: money(
                              total(row.items) - Number(row.paidAmount),
                            ),
                          })}
                        </p>
                      </TableCell>
                      <TableCell>
                        <BuildingStatusBadge status={row.status} />
                      </TableCell>
                      <TableCell className="text-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={busy}
                              aria-label={t("Actions for {{department}}", {
                                department:
                                  row.department?.name ??
                                  t("Unassigned department"),
                              })}
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelected(row);
                                setDialog("details");
                              }}
                            >
                              {t("Details")}
                            </DropdownMenuItem>
                            {row.status === "completed" &&
                              Number(row.paidAmount) < total(row.items) &&
                              can("update") && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelected(row);
                                    setPayment({
                                      amount:
                                        total(row.items) -
                                        Number(row.paidAmount),
                                      paymentMethod: row.paymentMethod,
                                    });
                                    setError("");
                                    setDialog("payment");
                                  }}
                                >
                                  {t("Record payment")}
                                </DropdownMenuItem>
                              )}
                            {row.status === "draft" &&
                              row.departmentId &&
                              can("update") && (
                              <DropdownMenuItem
                                disabled={busy}
                                onClick={() =>
                                  void save(() =>
                                    apiClient.put(
                                      `/building-expenses/requests/${row.id}/submit`,
                                    ),
                                  )
                                }
                              >
                                {t("Submit")}
                              </DropdownMenuItem>
                            )}
                            {row.status === "draft" &&
                              row.departmentId &&
                              can("update") && (
                              <DropdownMenuItem
                                onClick={() => editRequest(row)}
                              >
                                {t("Edit draft")}
                              </DropdownMenuItem>
                            )}
                            {row.departmentId &&
                              can("approve") &&
                              (transitions[row.status] ?? [])
                                .filter((next) => next !== "pending")
                                .filter(
                                  (next) =>
                                    !(
                                      row.kind === "sale" && next === "ordered"
                                    ) &&
                                    !(
                                      row.kind === "purchase" &&
                                      row.status === "approved" &&
                                      next === "completed"
                                    ),
                                )
                                .map((next) => (
                                  <DropdownMenuItem
                                    key={next}

                                    onClick={() => {
                                      setSelected(row);
                                      setNextStatus(next);
                                      setReason("");
                                      setError("");
                                      setDialog("status");
                                    }}
                                  >
                                    {next === "pending" ? t("Submit") : t(next)}
                                  </DropdownMenuItem>
                                ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
          <p
            className={
              visibleCount ? "p-4 text-sm text-muted-foreground" : "hidden"
            }
          >
            {tab === "departments"
              ? t(
                  "Completed sales and purchases add catalog products to the selected department. Free-text purchases remain in request history.",
                )
              : t(
                  "Showing matching records. Use the row action menu to view details and manage orders.",
                )}
          </p>
        </Card>
      )}
      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open && !busy) setDialog(null);
        }}
      >
        <DialogContent
          closeLabel={t("Close")}
          dir={i18n.dir()}
          className={
            dialog === "request"
              ? "flex max-h-[90dvh] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[1200px]"
              : "max-h-[90dvh] overflow-y-auto sm:max-w-3xl"
          }
        >
          <DialogHeader
            className={
              dialog === "request"
                ? "shrink-0 border-b px-6 py-4 pe-12"
                : undefined
            }
          >
            <DialogTitle>
              {dialog === "details"
                ? t("Request details")
                : dialog === "status"
                  ? t("Change status to {{status}}", { status: t(nextStatus) })
                  : t(
                      dialog === "product"
                        ? id
                          ? "Edit product"
                          : "New product"
                        : dialog === "expense"
                          ? id
                            ? "Edit expense"
                            : "New expense"
                          : dialog === "allocation"
                            ? "Adjust quantity"
                            : dialog === "payment"
                              ? "Record payment"
                              : request.kind === "sale"
                                ? id
                                  ? "Edit sale"
                                  : "New sale"
                                : page === "purchases"
                                  ? id
                                    ? "Edit purchase"
                                    : "New purchase"
                                  : id
                                    ? "Edit request"
                                    : "New request",
                    )}
            </DialogTitle>
            <DialogDescription>
              {dialog === "request"
                ? t(
                    "Save a draft, then submit for approval. Amounts use the same currency as your building records.",
                  )
                : t("Manage building and department records.")}
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p role="alert" className="text-destructive">
              {t(error)}
            </p>
          )}
          {(dialog === "product" ||
            dialog === "expense" ||
            dialog === "request") && (
            <form
              className={
                dialog === "request"
                  ? "flex min-h-0 flex-1 flex-col overflow-hidden"
                  : "space-y-4"
              }
              onSubmit={(e) => {
                e.preventDefault();
                const path =
                  dialog === "product"
                    ? "products"
                    : dialog === "expense"
                      ? "expenses"
                      : "requests";
                const body =
                  dialog === "product"
                    ? product
                    : dialog === "expense"
                      ? expense
                      : request;
                void save(() =>
                  id
                    ? apiClient.put(`/building-expenses/${path}/${id}`, body)
                    : apiClient.post(`/building-expenses/${path}`, body),
                );
              }}
            >
              <fieldset
                disabled={busy}
                className={
                  dialog === "request"
                    ? "min-h-0 min-w-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-4"
                    : "space-y-4"
                }
              >
                {dialog === "product" && (
                  <>
                    <Field label={t("Name")}>
                      <Input
                        aria-label={t("Name")}
                        required
                        maxLength={200}
                        value={product.name}
                        onChange={(e) =>
                          setProduct({ ...product, name: e.target.value })
                        }
                      />
                    </Field>
                    <Field label={t("Category")}>
                      <Input
                        aria-label={t("Category")}
                        required
                        maxLength={200}
                        placeholder={t("Furniture, cleaning supplies, drinks…")}
                        value={product.category}
                        onChange={(e) =>
                          setProduct({ ...product, category: e.target.value })
                        }
                      />
                    </Field>
                    <Field label={t("Barcode")}>
                      <Input
                        aria-label={t("Barcode")}
                        maxLength={100}
                        value={product.barcode}
                        onChange={(e) =>
                          setProduct({ ...product, barcode: e.target.value })
                        }
                      />
                    </Field>
                    <Field label={t("Price")}>
                      <Input
                        aria-label={t("Price")}
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={product.price}
                        onChange={(e) =>
                          setProduct({
                            ...product,
                            price: Number(e.target.value),
                          })
                        }
                      />
                    </Field>
                    <Choice
                      label={t("Availability")}
                      value={product.active ? "active" : "archived"}
                      onChange={(value) =>
                        setProduct({ ...product, active: value === "active" })
                      }
                      options={[
                        { value: "active", label: "Active" },
                        { value: "archived", label: "Archived" },
                      ]}
                    />
                  </>
                )}
                {dialog === "expense" && (
                  <>
                    <Choice
                      label={t("Department")}
                      value={expense.departmentId}
                      onChange={(departmentId) =>
                        setExpense({ ...expense, departmentId })
                      }
                      options={departments}
                    />
                    <Choice
                      label={t("Expense category")}
                      value={expense.category}
                      onChange={(category) =>
                        setExpense({ ...expense, category })
                      }
                      options={[
                        "daily",
                        "cleaning",
                        "drinks",
                        "maintenance",
                        "other",
                      ].map((value) => ({ value, label: value }))}
                    />
                    <Field label={t("Description")}>
                      <Input
                        aria-label={t("Description")}
                        required
                        maxLength={200}
                        value={expense.description}
                        onChange={(e) =>
                          setExpense({
                            ...expense,
                            description: e.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field label={t("Amount")}>
                      <Input
                        aria-label={t("Amount")}
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        value={expense.amount}
                        onChange={(e) =>
                          setExpense({
                            ...expense,
                            amount: Number(e.target.value),
                          })
                        }
                      />
                    </Field>
                    <Field label={t("Date")}>
                      <FormDatePicker
                        value={expense.date}
                        onValueChange={(date) =>
                          setExpense({ ...expense, date })
                        }
                        required
                      />
                    </Field>
                    <Field label={t("Paid by")}>
                      <Input
                        aria-label={t("Paid by")}
                        required
                        maxLength={200}
                        value={expense.paidBy}
                        onChange={(e) =>
                          setExpense({ ...expense, paidBy: e.target.value })
                        }
                      />
                    </Field>
                    <Field label={t("Notes")}>
                      <Textarea
                        aria-label={t("Notes")}
                        maxLength={5000}
                        value={expense.note}
                        onChange={(e) =>
                          setExpense({ ...expense, note: e.target.value })
                        }
                      />
                    </Field>
                  </>
                )}
                {dialog === "request" && (
                  <>
                    <div
                      className={`grid min-w-0 gap-4 ${request.kind === "purchase" ? "lg:grid-cols-2" : ""}`}
                    >
                      <Card className="rounded-2xl border bg-card p-5">
                        <h3 className="mb-5 text-sm font-semibold">
                          {t("Invoice details")}
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Choice
                            label={t("Department")}
                            value={request.departmentId}
                            onChange={(departmentId) =>
                              setRequest({ ...request, departmentId })
                            }
                            options={departments}
                          />
                          <Choice
                            label={t("Request type")}
                            value={request.kind}
                            onChange={(kind) => setRequest({ ...request, kind })}
                            options={
                              page === "sales"
                                ? [{ value: "sale", label: "Sale to department" }]
                                : page === "purchases"
                                  ? [{ value: "purchase", label: "Purchase order" }]
                                  : [
                                      { value: "purchase", label: "Purchase order" },
                                      { value: "sale", label: "Sale to department" },
                                    ]
                            }
                          />
                          {request.kind === "purchase" && (
                            <Field label={t("Invoice number")}>
                              <Input
                                aria-label={t("Invoice number")}
                                maxLength={100}
                                value={request.invoiceNumber}
                                onChange={(event) =>
                                  setRequest({
                                    ...request,
                                    invoiceNumber: event.target.value,
                                  })
                                }
                              />
                            </Field>
                          )}
                          <Field label={t("Total")}>
                            <Input
                              className="bg-muted/50 font-semibold tabular-nums"
                              aria-label={t("Total")}
                              readOnly
                              value={money(total(request.items))}
                            />
                          </Field>
                        </div>
                      </Card>
                      {request.kind === "purchase" && (
                        <Card className="rounded-2xl border bg-card p-5">
                          <h3 className="text-sm font-semibold">
                            {t("Attach invoice")}
                          </h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {t("JPG, PNG, WebP or GIF · Maximum 5 MB")}
                          </p>
                          <Input
                            ref={invoiceFileInput}
                            id="building-purchase-invoice"
                            aria-label={t("Invoice attachment")}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            disabled={uploadingInvoice}
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) void uploadInvoice(file);
                              event.currentTarget.value = "";
                            }}
                          />
                          <div className="mt-4 flex min-h-40 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed bg-muted/20 p-5">
                            {request.attachmentUrl ? (
                              <img
                                src={productImageUrl(request.attachmentUrl)}
                                alt={t("Invoice attachment")}
                                className="max-h-48 max-w-full rounded-lg object-contain"
                              />
                            ) : (
                              <>
                                <Paperclip className="mb-3 size-8 text-primary" />
                                <Button
                                  type="button"
                                  variant="outline"
                                  disabled={uploadingInvoice}
                                  onClick={() =>
                                    invoiceFileInput.current?.click()
                                  }
                                >
                                  {uploadingInvoice
                                    ? t("Uploading invoice…")
                                    : t("Attach invoice")}
                                </Button>
                              </>
                            )}
                          </div>
                          {request.attachmentUrl && (
                            <div className="mt-3 flex items-center justify-between gap-3">
                              <a
                                href={productImageUrl(request.attachmentUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                              >
                                <ExternalLink className="size-4" />
                                {t("View invoice")}
                              </a>
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    invoiceFileInput.current?.click()
                                  }
                                >
                                  {t("Replace")}
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="text-muted-foreground"
                                  onClick={() =>
                                    setRequest({
                                      ...request,
                                      attachmentUrl: null,
                                    })
                                  }
                                >
                                  {t("Remove")}
                                </Button>
                              </div>
                            </div>
                          )}
                        </Card>
                      )}
                    </div>
                    <Card className="overflow-hidden rounded-2xl border bg-card p-0">
                      <div className="flex items-center justify-between border-b px-4 py-3">
                        <h3 className="text-sm font-semibold">
                          {t("Items")}{" "}
                          <span className="ms-1 text-muted-foreground">
                            ({request.items.length})
                          </span>
                        </h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={request.items.length >= 100}
                          onClick={() =>
                            setRequest({
                              ...request,
                              items: [
                                ...request.items,
                                {
                                  productId: null,
                                  name: "",
                                  quantity: 1,
                                  price: 0,
                                  note: "",
                                },
                              ],
                            })
                          }
                        >
                          <Plus className="size-4" />
                          {t("Add item")}
                        </Button>
                      </div>
                      <Table className="min-w-[840px]">
                        <TableHeader className="bg-muted/40">
                          <TableRow>
                            <TableHead className="w-10">#</TableHead>
                            <TableHead className="w-[32%]">
                              {t("Product / name")}
                            </TableHead>
                            <TableHead className="w-24">
                              {t("Quantity")}
                            </TableHead>
                            <TableHead className="w-32">
                              {t("Unit price")}
                            </TableHead>
                            <TableHead className="w-28 text-end">
                              {t("Total")}
                            </TableHead>
                            <TableHead>{t("Note")}</TableHead>
                            <TableHead className="w-12">
                              <span className="sr-only">{t("Remove")}</span>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody autoPaginate={false}>
                          {request.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="align-top pt-5 text-muted-foreground">
                                {index + 1}
                              </TableCell>
                              <TableCell className="space-y-2 align-top">
                                <Select
                                  value={item.productId ?? "custom"}
                                  onValueChange={(value) => {
                                    const product = data?.products.find(
                                      (row) => row.id === value,
                                    );
                                    updateItem(index, {
                                      productId: product?.id ?? null,
                                      name: product?.name ?? "",
                                      price: Number(product?.price ?? 0),
                                    });
                                  }}
                                >
                                  <SelectTrigger
                                    aria-label={t("Product {{index}}", {
                                      index: index + 1,
                                    })}
                                    className="w-full"
                                  >
                                    <SelectValue
                                      placeholder={t("Select product")}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="custom">
                                      {request.kind === "sale"
                                        ? t("Select a catalog product")
                                        : t("Enter product name")}
                                    </SelectItem>
                                    {data?.products
                                      .filter(
                                        (product) =>
                                          product.active ||
                                          product.id === item.productId,
                                      )
                                      .map((product) => (
                                        <SelectItem
                                          key={product.id}
                                          value={product.id}
                                        >
                                          {product.name}
                                          {product.barcode
                                            ? ` / ${product.barcode}`
                                            : ""}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                                {!item.productId &&
                                  request.kind === "purchase" && (
                                    <Input
                                      aria-label={t("Product name {{index}}", {
                                        index: index + 1,
                                      })}
                                      placeholder={t("Product name")}
                                      required
                                      maxLength={191}
                                      value={item.name}
                                      onChange={(e) =>
                                        updateItem(index, {
                                          name: e.target.value,
                                        })
                                      }
                                    />
                                  )}
                              </TableCell>
                              <TableCell className="align-top">
                                <Input
                                  aria-label={t("Quantity {{index}}", {
                                    index: index + 1,
                                  })}
                                  type="number"
                                  required
                                  min="1"
                                  max="1000000"
                                  step="1"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateItem(index, {
                                      quantity: Number(e.target.value),
                                    })
                                  }
                                />
                              </TableCell>
                              <TableCell className="align-top">
                                <Input
                                  aria-label={t("Unit price {{index}}", {
                                    index: index + 1,
                                  })}
                                  type="number"
                                  required
                                  min="0"
                                  step="0.01"
                                  value={item.price}
                                  onChange={(e) =>
                                    updateItem(index, {
                                      price: Number(e.target.value),
                                    })
                                  }
                                />
                              </TableCell>
                              <TableCell className="pt-5 text-end align-top tabular-nums whitespace-nowrap">
                                {money(
                                  (Math.round(item.price * 100) *
                                    item.quantity) /
                                    100,
                                )}
                              </TableCell>
                              <TableCell className="align-top">
                                <Input
                                  aria-label={t("Item note {{index}}", {
                                    index: index + 1,
                                  })}
                                  placeholder={t("Optional note")}
                                  maxLength={1000}
                                  value={item.note}
                                  onChange={(e) =>
                                    updateItem(index, { note: e.target.value })
                                  }
                                />
                              </TableCell>
                              <TableCell className="align-top">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  aria-label={t("Remove item {{index}}", {
                                    index: index + 1,
                                  })}
                                  disabled={request.items.length === 1}
                                  onClick={() =>
                                    setRequest({
                                      ...request,
                                      items: request.items.filter(
                                        (_, i) => i !== index,
                                      ),
                                    })
                                  }
                                >
                                  <Trash2 className="size-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                    <Card className="rounded-2xl border bg-card p-5">
                      <h3 className="mb-4 text-sm font-semibold">
                        {t("Payment and notes")}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_2fr]">
                        <Field label={t("Amount paid")}>
                          <Input
                            aria-label={t("Amount paid")}
                            required
                            type="number"
                            min="0"
                            max={total(request.items)}
                            step="0.01"
                            value={request.paidAmount}
                            onChange={(e) =>
                              setRequest({
                                ...request,
                                paidAmount: Number(e.target.value),
                              })
                            }
                          />
                        </Field>
                        <Choice
                          label={t("Payment method")}
                          value={request.paymentMethod}
                          onChange={(paymentMethod) =>
                            setRequest({ ...request, paymentMethod })
                          }
                          options={["cash", "card", "bank"].map((value) => ({
                            value,
                            label: value,
                          }))}
                        />
                        <Field label={t("Request notes")}>
                          <Textarea
                            aria-label={t("Request notes")}
                            className="min-h-10 resize-none"
                            rows={1}
                            maxLength={5000}
                            value={request.note}
                            onChange={(e) =>
                              setRequest({ ...request, note: e.target.value })
                            }
                          />
                        </Field>
                      </div>
                    </Card>
                  </>
                )}
              </fieldset>
              <div
                className={
                  dialog === "request"
                    ? "flex shrink-0 flex-wrap items-center justify-between gap-3 border-t bg-muted/20 px-6 py-4"
                    : "flex justify-end"
                }
              >
                {dialog === "request" && (
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    <span>
                      {t("Total:")}{" "}
                      <strong className="tabular-nums">
                        {money(total(request.items))}
                      </strong>
                    </span>
                    <span className="text-muted-foreground">
                      {t("Balance:")}{" "}
                      <strong className="text-foreground tabular-nums">
                        {money(total(request.items) - request.paidAmount)}
                      </strong>
                    </span>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={() => setDialog(null)}
                  >
                    {t("Cancel")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      busy ||
                      uploadingInvoice ||
                      (dialog === "expense" && !expense.departmentId) ||
                      (dialog === "request" &&
                        (!request.departmentId ||
                          (request.kind === "sale" &&
                            request.items.some((item) => !item.productId))))
                    }
                  >
                    {busy
                      ? t("Saving…")
                      : dialog === "request"
                        ? t("Save draft")
                        : t("Save")}
                  </Button>
                </div>
              </div>
            </form>
          )}
          {dialog === "details" && selected && (
            <div className="space-y-4">
              <p>
                {selected.department?.name ??
                  t("Unassigned department")} · {t(selected.kind)} ·{" "}
                <Badge variant="outline">{t(selected.status)}</Badge>
              </p>
              {selected.kind === "purchase" && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border bg-muted/20 px-3 py-2 text-sm">
                  <span>
                    {t("Invoice number")}: {selected.invoiceNumber || "—"}
                  </span>
                  {selected.attachmentUrl && (
                    <a
                      href={productImageUrl(selected.attachmentUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      <ExternalLink className="size-4" />
                      {t("View invoice")}
                    </a>
                  )}
                </div>
              )}
              <p>
                {t("Created by:")}
                {selected.createdBy}
              </p>
              <p>{selected.note}</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    {["Product", "Quantity", "Price", "Note"].map((label) => (
                      <TableHead key={label}>{t(label)}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody autoPaginate={false}>
                  {selected.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="text-end tabular-nums whitespace-nowrap">
                        {money(item.price)}
                      </TableCell>
                      <TableCell>{item.note}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p>
                {t("Total:")}
                {money(total(selected.items))}
                {t("· Paid:")} {money(selected.paidAmount)} (
                {t(selected.paymentMethod)}
                {t(") · Balance:")}{" "}
                {money(total(selected.items) - Number(selected.paidAmount))}
              </p>
              <h3 className="font-semibold">{t("Status history")}</h3>
              {selected.history.map((entry, index) => (
                <p key={index}>
                  {t(entry.status)} · {entry.by} ·{" "}
                  {new Date(entry.at).toLocaleString(locale)}{" "}
                  {entry.reason && (
                    <span> / {historyReason(entry.status, entry.reason)}</span>
                  )}
                </p>
              ))}
            </div>
          )}
          {dialog === "allocation" && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void save(() =>
                  apiClient.put(
                    `/building-expenses/allocations/${allocation.id}`,
                    allocation,
                  ),
                );
              }}
            >
              <Field label={t("Department quantity")}>
                <Input
                  aria-label={t("Department quantity")}
                  required
                  type="number"
                  min="0"
                  max="1000000"
                  step="1"
                  value={allocation.quantity}
                  onChange={(e) =>
                    setAllocation({
                      ...allocation,
                      quantity: Number(e.target.value),
                    })
                  }
                />
              </Field>
              <Button disabled={busy} type="submit">
                {t("Save quantity")}
              </Button>
            </form>
          )}
          {dialog === "payment" && selected && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void save(() =>
                  apiClient.put(
                    `/building-expenses/requests/${selected.id}/payment`,
                    payment,
                  ),
                );
              }}
            >
              <p>
                {t("Outstanding balance:")}{" "}
                {money(total(selected.items) - Number(selected.paidAmount))}
              </p>
              <Field label={t("Payment amount")}>
                <Input
                  aria-label={t("Payment amount")}
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={total(selected.items) - Number(selected.paidAmount)}
                  value={payment.amount}
                  onChange={(e) =>
                    setPayment({ ...payment, amount: Number(e.target.value) })
                  }
                />
              </Field>
              <Choice
                label={t("Payment method")}
                value={payment.paymentMethod}
                onChange={(paymentMethod) =>
                  setPayment({ ...payment, paymentMethod })
                }
                options={["cash", "card", "bank"].map((value) => ({
                  value,
                  label: value,
                }))}
              />
              <Button disabled={busy} type="submit">
                {t("Record payment")}
              </Button>
            </form>
          )}
          {dialog === "status" && selected && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void save(() =>
                  apiClient.patch(
                    `/building-expenses/requests/${selected.id}/status`,
                    { status: nextStatus, reason },
                  ),
                );
              }}
            >
              <p>
                {nextStatus === "completed"
                  ? t(
                      "Completing this request records its catalog products in the department. This action cannot be repeated or reversed.",
                    )
                  : t("Update {{department}}'s request to {{status}}.", {
                      department:
                        selected.department?.name ??
                        t("Unassigned department"),
                      status: t(nextStatus),
                    })}
              </p>
              <Field label={t("Reason / note")}>
                <Textarea
                  aria-label={t("Reason / note")}
                  maxLength={5000}
                  required={["rejected", "cancelled"].includes(nextStatus)}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </Field>
              <Button disabled={busy} type="submit">
                {busy ? t("Saving…") : t("Confirm status")}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
