import { useServerTable } from "@/shared/hooks/useServerTable";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { billingApi, type ServiceAdvance } from "../api/billing.api";
import { healthcareApi } from "@/features/healthcare/api/healthcare.api";
import { apiErrorMessage } from "@/shared/api/client";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { FormDatePicker } from "@/shared/components/ui/form-date-picker";
import { TableResourceState } from "@/shared/components/ui/table-resource-state";
import { DeleteConfirmationDialog } from "@/shared/components/ui/confirmation-dialog";
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
const number = (value: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);
export default function ServiceAdvancesPage() {
  const { t } = useTranslation(),
    advances = useServerTable<ServiceAdvance>("/advances/service"),
    departments = useApiResource(
      useCallback(() => healthcareApi.departments.list(), []),
    ),
    appointments = useApiResource(
      useCallback(() => healthcareApi.appointments.list(), []),
    );
  const [editing, setEditing] = useState<ServiceAdvance | null | undefined>(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = Object.fromEntries(new FormData(e.currentTarget));
    const data = {
      ...form,
      departmentId: form.departmentId === "__none__" ? null : form.departmentId,
      appointmentId:
        form.appointmentId === "__none__" ? null : form.appointmentId,
      amount: Number(form.amount),
      appliedAmount: Number(form.appliedAmount || 0),
    };
    try {
      if (editing) await billingApi.serviceAdvances.update(editing.id, data);
      else await billingApi.serviceAdvances.create(data);
      setEditing(undefined);
      await advances.refresh();
    } catch (c) {
      setError(apiErrorMessage(c));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("serviceAdvance.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("serviceAdvance.description")}
          </p>
        </div>
        <Button
          permission="create"
          onClick={() => {
            setError("");
            setEditing(null);
          }}
        >
          <Plus />
          {t("serviceAdvance.add")}
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {[
                  "receipt",
                  "patient",
                  "department",
                  "amount",
                  "applied",
                  "balance",
                  "method",
                  "date",
                  "status",
                  "actions",
                ].map((key) => (
                  <TableHead key={key}>{t(`serviceAdvance.${key}`)}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody {...advances.tableProps}>
              <TableResourceState
                isLoading={advances.isLoading}
                error={advances.error}
                isEmpty={!advances.data?.length}
                colSpan={10}
              />
              {advances.data?.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.receiptNumber}</TableCell>
                  <TableCell>
                    <b>{row.patientName}</b>
                    <small className="block text-muted-foreground">
                      {row.patientPhone}
                    </small>
                  </TableCell>
                  <TableCell>{row.department?.name ?? "—"}</TableCell>
                  <TableCell>
                    {number(row.amount)} {row.currency}
                  </TableCell>
                  <TableCell>{number(row.appliedAmount)}</TableCell>
                  <TableCell>{number(row.balanceAmount)}</TableCell>
                  <TableCell>{t(`billing.methods.${row.method}`)}</TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat().format(new Date(row.receivedAt))}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {t(`serviceAdvance.statuses.${row.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        data-action="edit"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setError("");
                          setEditing(row);
                        }}
                      >
                        <Pencil />
                      </Button>
                      {row.appliedAmount === 0 && (
                        <DeleteConfirmationDialog
                          description={t("serviceAdvance.deleteConfirm")}
                          onConfirm={async () => {
                            await billingApi.serviceAdvances.remove(row.id);
                            await advances.refresh();
                          }}
                        >
                          <Button
                            data-action="delete"
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                          >
                            <Trash2 className="size-4 text-white" />
                          </Button>
                        </DeleteConfirmationDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog
        open={editing !== undefined}
        onOpenChange={(open) => !open && !busy && setEditing(undefined)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t(editing ? "serviceAdvance.edit" : "serviceAdvance.add")}
            </DialogTitle>
          </DialogHeader>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={submit}>
            <Input
              name="patientName"
              defaultValue={editing?.patientName ?? ""}
              placeholder={t("serviceAdvance.employeeName")}
              required
            />
            <Input
              name="patientPhone"
              defaultValue={editing?.patientPhone ?? ""}
              placeholder={t("serviceAdvance.phone")}
            />
            <Select
              name="departmentId"
              defaultValue={editing?.departmentId ?? "__none__"}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("serviceAdvance.department")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">
                  {t("serviceAdvance.none")}
                </SelectItem>
                {departments.data?.map((x) => (
                  <SelectItem key={x.id} value={x.id}>
                    {String(x.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              name="appointmentId"
              defaultValue={editing?.appointmentId ?? "__none__"}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("serviceAdvance.appointment")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">
                  {t("serviceAdvance.none")}
                </SelectItem>
                {appointments.data?.map((x) => (
                  <SelectItem key={x.id} value={x.id}>
                    {String(x.patientName)} —{" "}
                    {new Intl.DateTimeFormat().format(
                      new Date(String(x.scheduledAt)),
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              defaultValue={editing?.amount ?? ""}
              placeholder={t("serviceAdvance.amount")}
              required
            />
            <Input
              name="appliedAmount"
              type="number"
              min="0"
              step="0.01"
              defaultValue={editing?.appliedAmount ?? 0}
              placeholder={t("serviceAdvance.applied")}
            />
            <Input name="currency" value="USD" readOnly required />
            <Select name="method" defaultValue={editing?.method ?? "cash"}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["cash", "card", "bank_transfer", "cheque", "other"].map(
                  (x) => (
                    <SelectItem key={x} value={x}>
                      {t(`billing.methods.${x}`)}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
            <FormDatePicker
              name="receivedAt"
              initialValue={editing?.receivedAt}
              includeTime
              required
            />
            <Input
              name="reference"
              defaultValue={editing?.reference ?? ""}
              placeholder={t("serviceAdvance.reference")}
            />
            <Select name="status" defaultValue={editing?.status ?? "open"}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "open",
                  "partially_applied",
                  "applied",
                  "refunded",
                  "cancelled",
                ].map((x) => (
                  <SelectItem key={x} value={x}>
                    {t(`serviceAdvance.statuses.${x}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              name="notes"
              defaultValue={editing?.notes ?? ""}
              placeholder={t("serviceAdvance.notes")}
            />
            {error && (
              <p className="text-sm text-destructive sm:col-span-2">{error}</p>
            )}
            <Button
              permission={editing ? "update" : "create"}
              disabled={busy}
              className="sm:col-span-2"
            >
              {t("serviceAdvance.save")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
