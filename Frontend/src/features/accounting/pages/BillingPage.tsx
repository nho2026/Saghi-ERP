import { useServerTable } from "@/shared/hooks/useServerTable";
import {
  settingsSnapshot,
  formatSystemDate,
} from "@/features/settings/settings";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Printer, Trash2 } from "lucide-react";
import {
  billingApi,
  type Invoice,
  type Customer,
  type Payment,
} from "../api/billing.api";
import { printDocument } from "../components/print-document";
import { apiErrorMessage } from "@/shared/api/client";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { FormDatePicker } from "@/shared/components/ui/form-date-picker";
import { TableResourceState } from "@/shared/components/ui/table-resource-state";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import logo from "@/assets/icons/logo.png";
type Resource = "customers" | "invoices" | "payments";
type Item = {
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
};
const amount = (v: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(v);
export default function BillingPage({ resource }: { resource: Resource }) {
  const { t } = useTranslation(),
    customers = useApiResource(
      useCallback(() => billingApi.customers.list(), []),
    ),
    invoices = useApiResource(
      useCallback(() => billingApi.invoices.list(), []),
    ),
    payments = useServerTable<Payment>(
      "/billing/payments",
      {},
      resource === "payments",
    );
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [items, setItems] = useState<Item[]>([
      { description: "", quantity: 1, unitPrice: 0, discount: 0, taxRate: 0 },
    ]),
    [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
  const printOne = (invoice: Invoice) => {
    setPrintInvoice(invoice);
    window.setTimeout(printDocument, 0);
  };
  const customerRows = useServerTable<Customer>(
    "/billing/customers",
    {},
    resource === "customers",
  );
  const invoiceRows = useServerTable<Invoice>(
    "/billing/invoices",
    {},
    resource === "invoices",
  );
  const rows =
    resource === "customers"
      ? customerRows
      : resource === "invoices"
        ? invoiceRows
        : payments;
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = Object.fromEntries(new FormData(e.currentTarget));
    try {
      if (resource === "customers") await billingApi.customers.create(form);
      else if (resource === "invoices")
        await billingApi.invoices.create({
          ...form,
          discountAmount: Number(form.discountAmount),
          items,
        });
      else
        await billingApi.payments.create({
          ...form,
          amount: Number(form.amount),
        });
      setOpen(false);
      await Promise.all([
        rows.refresh(),
        customers.refresh(),
        invoices.refresh(),
        payments.refresh(),
      ]);
    } catch (c) {
      setError(apiErrorMessage(c));
    } finally {
      setBusy(false);
    }
  };
  const headers =
    resource === "customers"
      ? ["code", "customer", "phone", "email", "taxNumber", "status"]
      : resource === "invoices"
        ? [
            "invoiceNumber",
            "customer",
            "issueDate",
            "total",
            "paid",
            "balance",
            "status",
            "actions",
          ]
        : [
            "invoiceNumber",
            "customer",
            "amount",
            "method",
            "reference",
            "paidAt",
          ];
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t(`billing.${resource}`)}</h1>
          <p className="text-sm text-muted-foreground">
            {t(`billing.${resource}Description`)}
          </p>
        </div>
        <Button
          permission="create"
          onClick={() => {
            setError("");
            setItems([
              {
                description: "",
                quantity: 1,
                unitPrice: 0,
                discount: 0,
                taxRate: 0,
              },
            ]);
            setOpen(true);
          }}
        >
          <Plus />
          {t("billing.add")}
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((h) => (
                  <TableHead key={h}>{t(`billing.${h}`)}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody {...rows.tableProps}>
              <TableResourceState
                isLoading={rows.isLoading}
                error={rows.error}
                isEmpty={!rows.data?.length}
                colSpan={headers.length}
              />
              {resource === "customers" &&
                customerRows.data?.map((x) => (
                  <TableRow key={x.id}>
                    <TableCell>{x.code}</TableCell>
                    <TableCell>{x.name}</TableCell>
                    <TableCell>{x.phone || "—"}</TableCell>
                    <TableCell>{x.email || "—"}</TableCell>
                    <TableCell>{x.taxNumber || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {t(`billing.${x.status}`)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              {resource === "invoices" &&
                invoiceRows.data?.map((x) => (
                  <TableRow key={x.id}>
                    <TableCell>{x.invoiceNumber}</TableCell>
                    <TableCell>{x.customer.name}</TableCell>
                    <TableCell>{formatSystemDate(x.issueDate)}</TableCell>
                    <TableCell>
                      {amount(x.totalAmount)} {x.currency}
                    </TableCell>
                    <TableCell>{amount(x.paidAmount)}</TableCell>
                    <TableCell>{amount(x.balanceAmount)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {t(`billing.${x.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          permission="print"
                          size="icon"
                          variant="ghost"
                          title={t("billing.printInvoice")}
                          onClick={() => printOne(x)}
                        >
                          <Printer />
                        </Button>
                        {x.status === "draft" && (
                          <>
                            <Button
                              permission="update"
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                await billingApi.invoices.status(x.id, "sent");
                                await Promise.all([
                                  invoices.refresh(),
                                  invoiceRows.refresh(),
                                ]);
                              }}
                            >
                              {t("billing.send")}
                            </Button>
                            <Button
                              data-action="delete"
                              size="icon"
                              variant="ghost"
                              className="text-destructive"
                              onClick={async () => {
                                await billingApi.invoices.remove(x.id);
                                await Promise.all([
                                  invoices.refresh(),
                                  invoiceRows.refresh(),
                                ]);
                              }}
                            >
                              <Trash2 className="size-4 text-white" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              {resource === "payments" &&
                payments.data?.map((x) => (
                  <TableRow key={x.id}>
                    <TableCell>{x.invoice.invoiceNumber}</TableCell>
                    <TableCell>{x.invoice.customer.name}</TableCell>
                    <TableCell>
                      {amount(x.amount)} {x.invoice.currency}
                    </TableCell>
                    <TableCell>{t(`billing.methods.${x.method}`)}</TableCell>
                    <TableCell>{x.reference || "—"}</TableCell>
                    <TableCell>{formatSystemDate(x.paidAt)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={(v) => !busy && setOpen(v)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {t(
                `billing.add${resource[0].toUpperCase()}${resource.slice(1, -1)}`,
              )}
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={submit}>
            {resource === "customers" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  name="name"
                  placeholder={t("billing.customer")}
                  required
                />
                <Input name="phone" placeholder={t("billing.phone")} />
                <Input
                  name="email"
                  type="email"
                  placeholder={t("billing.email")}
                />
                <Input name="taxNumber" placeholder={t("billing.taxNumber")} />
                <Input name="address" placeholder={t("billing.address")} />
              </div>
            )}
            {resource === "invoices" && (
              <>
                <div className="grid gap-3 sm:grid-cols-4">
                  <Select name="customerId" required>
                    <SelectTrigger>
                      <SelectValue placeholder={t("billing.customer")} />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.data?.map((x) => (
                        <SelectItem key={x.id} value={x.id}>
                          {x.code} — {x.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDatePicker name="issueDate" required />
                  <FormDatePicker name="dueDate" />
                  <Input name="currency" value="USD" readOnly required />
                </div>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[1fr_80px_110px_80px_80px_36px] gap-2"
                    >
                      {(
                        [
                          "description",
                          "quantity",
                          "unitPrice",
                          "discount",
                          "taxRate",
                        ] as const
                      ).map((k) => (
                        <Input
                          key={k}
                          type={k === "description" ? "text" : "number"}
                          min={k === "description" ? undefined : 0}
                          step={k === "description" ? undefined : "0.01"}
                          placeholder={t(`billing.${k}`)}
                          value={item[k]}
                          onChange={(e) =>
                            setItems((v) =>
                              v.map((x, n) =>
                                n === i
                                  ? {
                                      ...x,
                                      [k]:
                                        k === "description"
                                          ? e.target.value
                                          : Number(e.target.value),
                                    }
                                  : x,
                              ),
                            )
                          }
                        />
                      ))}
                      <Button
                        permission="view"
                        data-action="delete"
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={items.length === 1}
                        onClick={() =>
                          setItems((v) => v.filter((_, n) => n !== i))
                        }
                      >
                        <Trash2 className="size-4 text-white" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setItems((v) => [
                      ...v,
                      {
                        description: "",
                        quantity: 1,
                        unitPrice: 0,
                        discount: 0,
                        taxRate: 0,
                      },
                    ])
                  }
                >
                  <Plus />
                  {t("billing.addItem")}
                </Button>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    name="discountAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue="0"
                    placeholder={t("billing.invoiceDiscount")}
                  />
                  <Input name="notes" placeholder={t("billing.notes")} />
                </div>
              </>
            )}
            {resource === "payments" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Select name="invoiceId" required>
                  <SelectTrigger>
                    <SelectValue placeholder={t("billing.invoiceNumber")} />
                  </SelectTrigger>
                  <SelectContent>
                    {invoices.data
                      ?.filter(
                        (x) =>
                          ["sent", "partial"].includes(x.status) &&
                          x.balanceAmount > 0,
                      )
                      .map((x) => (
                        <SelectItem key={x.id} value={x.id}>
                          {x.invoiceNumber} — {x.customer.name} (
                          {amount(x.balanceAmount)})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Input
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder={t("billing.amount")}
                  required
                />
                <Select
                  name="method"
                  defaultValue={
                    settingsSnapshot()?.finance.paymentMethods[0] ?? "cash"
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      settingsSnapshot()?.finance.paymentMethods ?? [
                        "cash",
                        "card",
                        "bank_transfer",
                        "cheque",
                        "other",
                      ]
                    ).map((x) => (
                      <SelectItem key={x} value={x}>
                        {t(`billing.methods.${x}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input name="reference" placeholder={t("billing.reference")} />
                <FormDatePicker name="paidAt" includeTime />
                <Input name="notes" placeholder={t("billing.notes")} />
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button permission="create" className="w-full" disabled={busy}>
              {t("billing.save")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      {printInvoice && (
        <section className="print-document hidden bg-white px-[9mm] py-[7mm] text-[11px] text-slate-900 print:absolute print:inset-0 print:block print:w-full [&_td]:border [&_td]:border-slate-300 [&_td]:p-1.75 [&_td]:text-start [&_th]:border [&_th]:border-slate-300 [&_th]:bg-teal-50 [&_th]:p-1.75 [&_th]:text-start [&_th]:font-bold [&_table]:w-full [&_table]:border-collapse">
          <header className="mb-5 flex items-start justify-between border-b-2 border-teal-500 pb-3.5">
            <div className="space-y-2">
              <img
                className="h-11.5 w-26.25 rounded-[9px] border border-slate-200 bg-white px-2 py-1 object-contain object-center shadow-[0_4px_12px_rgba(15,23,42,0.14)]"
                src={logo}
                alt={settingsSnapshot()?.organization.name || ""}
              />
              <p className="font-semibold uppercase tracking-wider text-slate-500">
                {t("billing.invoice")}
              </p>
            </div>
            <div className="text-end">
              <strong className="text-xl font-extrabold text-teal-500">
                {settingsSnapshot()?.organization.name}
                <br />
                {printInvoice.invoiceNumber}
              </strong>
              <p>
                {t("billing.issueDate")}:{" "}
                {formatSystemDate(printInvoice.issueDate)}
              </p>
              {printInvoice.dueDate && (
                <p>
                  {t("billing.dueDate")}:{" "}
                  {new Intl.DateTimeFormat().format(
                    new Date(printInvoice.dueDate),
                  )}
                </p>
              )}
            </div>
          </header>
          <div className="my-4.5 leading-relaxed">
            <strong>{t("billing.billTo")}</strong>
            <h2 className="my-1 text-[15px] font-bold">
              {printInvoice.customer.name}
            </h2>
            <p>{printInvoice.customer.address}</p>
            <p>
              {printInvoice.customer.phone} {printInvoice.customer.email}
            </p>
            {printInvoice.customer.taxNumber && (
              <p>
                {t("billing.taxNumber")}: {printInvoice.customer.taxNumber}
              </p>
            )}
          </div>
          <table className="mt-4.5">
            <thead>
              <tr>
                <th>#</th>
                <th>{t("billing.description")}</th>
                <th>{t("billing.quantity")}</th>
                <th>{t("billing.unitPrice")}</th>
                <th>{t("billing.discount")}</th>
                <th>{t("billing.taxRate")}</th>
                <th>{t("billing.total")}</th>
              </tr>
            </thead>
            <tbody>
              {printInvoice.items.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>{amount(item.unitPrice)}</td>
                  <td>{amount(item.discount)}</td>
                  <td>{item.taxRate}%</td>
                  <td>{amount(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="ms-auto mt-4.5 w-[45%] [&_p]:flex [&_p]:justify-between [&_p]:border-b [&_p]:border-slate-200 [&_p]:py-1.25">
            <p>
              <span>{t("billing.subtotal")}</span>
              <b>
                {amount(printInvoice.subtotal)} {printInvoice.currency}
              </b>
            </p>
            <p>
              <span>{t("billing.discount")}</span>
              <b>{amount(printInvoice.discountAmount)}</b>
            </p>
            <p>
              <span>{t("billing.tax")}</span>
              <b>{amount(printInvoice.taxAmount)}</b>
            </p>
            <p className="border-b-2! border-teal-500! text-sm text-teal-500">
              <span>{t("billing.total")}</span>
              <b>
                {amount(printInvoice.totalAmount)} {printInvoice.currency}
              </b>
            </p>
            <p>
              <span>{t("billing.paid")}</span>
              <b>{amount(printInvoice.paidAmount)}</b>
            </p>
            <p>
              <span>{t("billing.balance")}</span>
              <b>{amount(printInvoice.balanceAmount)}</b>
            </p>
          </div>
          {printInvoice.notes && (
            <div className="mt-5.5 border border-slate-300 p-2.5">
              <strong>{t("billing.notes")}</strong>
              <p>{printInvoice.notes}</p>
            </div>
          )}
          <footer className="mt-8.5 text-center text-slate-500">
            {t("billing.thankYou")}
          </footer>
        </section>
      )}
    </div>
  );
}
