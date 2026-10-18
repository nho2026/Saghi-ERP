import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlaskConical, Pencil, Plus, Trash2 } from "lucide-react";
import { useServerTable } from "@/shared/hooks/useServerTable";
import { apiErrorMessage } from "@/shared/api/client";
import { hasPermission, storedUser } from "@/features/auth/access";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
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
import { TableResourceState } from "@/shared/components/ui/table-resource-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/shared/components/ui/alert-dialog";
import { labApi, type LabTest } from "../api";

const unitOptions = [
  "mg/dL",
  "g/dL",
  "mg/L",
  "g/L",
  "mmol/L",
  "µmol/L",
  "mEq/L",
  "IU/L",
  "U/L",
  "mIU/L",
  "µIU/mL",
  "ng/mL",
  "pg/mL",
  "µg/dL",
  "µg/L",
  "ng/dL",
  "ng/L",
  "%",
  "10^3/µL",
  "10^6/µL",
  "cells/µL",
  "mm/hr",
  "seconds",
  "ratio",
  "mL/min/1.73m²",
  "CFU/mL",
  "copies/mL",
  "Positive / Negative",
  "Reactive / Non-reactive",
];

export default function LaboratoryTestsPage() {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState<LabTest | null>(null);
  const [editing, setEditing] = useState<LabTest | null>(null);
  const [unit, setUnit] = useState("");
  const [status, setStatus] = useState("active");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const locked = useRef(false);
  const table = useServerTable<LabTest>("/laboratory/tests", { search });
  const canCreate = hasPermission(storedUser(), "laboratory.tests.create");
  const canDelete = hasPermission(storedUser(), "laboratory.tests.delete");
  const canEdit = hasPermission(storedUser(), "laboratory.tests.update");
  const start = (test: LabTest | null) => {
    setEditing(test);
    setUnit(test?.unit ?? "");
    setStatus(test?.status ?? "active");
    setError("");
    setOpen(true);
  };
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (locked.current) return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    locked.current = true;
    setBusy(true);
    setError("");
    try {
      await labApi.saveTest(editing?.id, { ...data, status, unit });
      setOpen(false);
      await table.refresh();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      locked.current = false;
      setBusy(false);
    }
  };
  const remove = async () => {
    if (!deleting || locked.current) return;
    locked.current = true;
    setBusy(true);
    setError("");
    try {
      await labApi.deleteTest(deleting.id);
      setDeleting(null);
      await table.refresh();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      locked.current = false;
      setBusy(false);
    }
  };
  return (
    <div className="w-full min-w-0 space-y-5 pb-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <FlaskConical className="text-primary" />
          {t("laboratory.tests")}
        </h1>
        {canCreate && (
          <Button
            permission="laboratory.tests.create"
            onClick={() => start(null)}
          >
            <Plus className="size-4" />
            {t("laboratory.newTest")}
          </Button>
        )}
      </header>
      <p className="text-sm text-muted-foreground">
        {t("laboratory.testsHint")}
      </p>
      {error && !open && !deleting && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Card className="overflow-hidden rounded-2xl">
        <div className="p-4">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("laboratory.searchTests")}
            aria-label={t("laboratory.searchTests")}
            className="sm:max-w-80"
          />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {["code", "name", "price", "status", "actions"].map((key) => (
                  <TableHead key={key}>{t(`laboratory.${key}`)}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody {...table.tableProps}>
              <TableResourceState
                isLoading={table.isLoading}
                error={table.error}
                isEmpty={!table.data?.length}
                colSpan={5}
              />
              {table.data?.map((test) => (
                <TableRow key={test.id}>
                  <TableCell>{test.code}</TableCell>
                  <TableCell>{test.name}</TableCell>
                  <TableCell>{test.price}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        test.status === "active" ? "default" : "secondary"
                      }
                    >
                      {t(`laboratory.${test.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {canEdit && (
                        <Button
                          permission="laboratory.tests.update"
                          variant="outline"
                          size="icon"
                          aria-label={`${t("laboratory.editTest")} ${test.name}`}
                          className="border-sky-300 bg-white text-sky-700 hover:bg-white hover:text-sky-800 dark:border-sky-700 dark:bg-card dark:text-sky-300 dark:hover:bg-card"
                          disabled={busy}
                          onClick={() => start(test)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          permission="laboratory.tests.delete"
                          variant="outline"
                          className="border-red-300 bg-white text-red-600 hover:bg-white hover:text-red-700 dark:border-red-700 dark:bg-card dark:text-red-400 dark:hover:bg-card"
                          size="icon"
                          disabled={busy}
                          aria-label={`${t("laboratory.deleteTest")} ${test.name}`}
                          onClick={() => {
                            setError("");
                            setDeleting(test);
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(next) => {
          if (!busy && !next) setDeleting(null);
        }}
      >
        <AlertDialogContent dir={i18n.dir()}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("laboratory.deleteTest")} · {deleting?.name}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("laboratory.deleteTestHint")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>
              {t("laboratory.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={busy}
              onClick={(event) => {
                event.preventDefault();
                void remove();
              }}
            >
              {t(busy ? "laboratory.saving" : "laboratory.deleteTest")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!busy) setOpen(next);
        }}
      >
        <DialogContent
          dir={i18n.dir()}
          className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl"
        >
          <DialogHeader>
            <DialogTitle>
              {t(editing ? "laboratory.editTest" : "laboratory.newTest")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
              {(["code", "name", "price", "unit"] as const).map((field) => (
                <div className="flex flex-col gap-2" key={field}>
                  <Label htmlFor={`lab-test-${field}`}>
                    {t(`laboratory.${field}`)}
                  </Label>
                  {field === "unit" ? (
                    <Select
                      value={unit || "__none__"}
                      onValueChange={(value) =>
                        setUnit(value === "__none__" ? "" : value)
                      }
                      disabled={busy}
                      dir="ltr"
                    >
                      <SelectTrigger id="lab-test-unit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">None</SelectItem>
                        {editing?.unit &&
                          !unitOptions.includes(editing.unit) && (
                            <SelectItem value={editing.unit}>
                              {editing.unit}
                            </SelectItem>
                          )}
                        {unitOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={`lab-test-${field}`}
                      name={field}
                      readOnly={field === "code"}
                      placeholder={
                        field === "code" ? t("laboratory.autoCode") : undefined
                      }
                      type={field === "price" ? "number" : "text"}
                      min={field === "price" ? "0" : undefined}
                      step={field === "price" ? "0.01" : undefined}
                      required={["name", "price"].includes(field)}
                      maxLength={field === "code" ? 100 : 191}
                      defaultValue={editing?.[field] ?? ""}
                    />
                  )}
                </div>
              ))}
              <div className="flex flex-col gap-2">
                <Label>{t("laboratory.status")}</Label>
                <Select
                  value={status}
                  onValueChange={setStatus}
                  disabled={busy}
                >
                  <SelectTrigger aria-label={t("laboratory.status")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["active", "inactive"].map((item) => (
                      <SelectItem key={item} value={item}>
                        {t(`laboratory.${item}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </fieldset>
            <div className="flex justify-end">
              <Button
                permission={
                  editing
                    ? "laboratory.tests.update"
                    : "laboratory.tests.create"
                }
                type="submit"
                disabled={busy}
              >
                {t(busy ? "laboratory.saving" : "laboratory.save")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
