import { useServerTable } from "@/shared/hooks/useServerTable";
import { hasPagePermission } from "@/features/auth/access";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, Plus, Printer } from "lucide-react";
import { apiClient, apiErrorMessage } from "@/shared/api/client";
import { storedUser } from "@/features/auth/access";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card } from "@/shared/components/ui/card";
import { FormDatePicker } from "@/shared/components/ui/form-date-picker";
import { SearchableFilter } from "@/shared/components/ui/searchable-filter";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
type Item = {
  part?: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  cost: number;
};
type Case = {
  id?: string;
  patientId?: string;
  patientName: string;
  entry: string;
  exit: string | null;
  items: Item[];
};
export default function IcuPage({
  unit = "icu",
  moduleMode = false,
}: {
  unit?: "icu" | "picu" | "cardiac-sw" | "cardiac-surgery" | "cardiology";
  moduleMode?: boolean;
}) {
  const isOp = unit === "cardiac-surgery";
  const parts = ["scrubNurse", "anesthesia", "perfusion"];
  const endpoint = moduleMode ? "/icu/cases" : `/inventory/${unit}-cases`;
  const writeEndpoint = `/inventory/${unit}-cases`;
  const { t, i18n } = useTranslation();
  const manage = hasPagePermission(storedUser(), "create", "update", "delete");
  const [patients, setPatients] = useState<
    { id: string; patientCode: string; firstName: string; lastName: string }[]
  >([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [patientPage, setPatientPage] = useState(1);
  const [patientHasMore, setPatientHasMore] = useState(false);
  const [patientLoading, setPatientLoading] = useState(false);
  useEffect(() => {
    const c = new AbortController();
    setPatientLoading(true);
    apiClient
      .get("/inventory/icu-cases/patients", {
        params: { page: patientPage, pageSize: 30, search: patientSearch },
        signal: c.signal,
      })
      .then((r) => {
        const rows = r.data.items ?? [];
        setPatients((current) =>
          patientPage === 1 ? rows : [...current, ...rows],
        );
        setPatientHasMore(patientPage < (r.data.pagination?.totalPages ?? 1));
      })
      .catch((e) => {
        if (!c.signal.aborted) setError(apiErrorMessage(e));
      })
      .finally(() => {
        if (!c.signal.aborted) setPatientLoading(false);
      });
    return () => c.abort();
  }, [patientPage, patientSearch]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Case | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [version, setVersion] = useState(0);
  const table = useServerTable<Case>(endpoint, { search, version });
  const loading = table.isLoading;
  const money = (value: number) =>
    new Intl.NumberFormat(i18n.language, {
      style: "currency",
      currency: "USD",
    }).format(value);
  const sum = (items: Item[], key: "price" | "cost") =>
    items.reduce((v, item) => v + item.quantity * item[key], 0);
  const filtered = table.data ?? [];
  const esc = (v: unknown) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c]!,
    );
  const print = (row: Case) => {
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) {
      setError(t("buyHistory.popupBlocked"));
      return;
    }
    win.opener = null;
    win.document.write(
      `<html dir="${i18n.dir()}"><head><title>${esc(row.patientName)}</title></head><body><h1>${esc(row.patientName)}</h1><p>${esc(new Date(row.entry).toLocaleString(i18n.language))}</p><table>${row.items.map((item) => `<tr><td>${esc(item.name)}</td><td>${item.quantity}</td>${moduleMode ? "" : `<td>${esc(money(item.price * item.quantity))}</td>`}</tr>`).join("")}</table>${moduleMode ? "" : `<p>${esc(t("icu.totalPrice"))}: ${esc(money(sum(row.items, "price")))}</p>`}</body></html>`,
    );
    win.document.close();
    win.print();
  };
  return (
    <div className="space-y-5" dir={i18n.dir()}>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">{t(`${unit}.title`)}</h1>
        {manage && (
          <Button
            permission="create"
            onClick={() => {
              setError("");
              setSelected({
                patientName: "",
                entry: new Date().toISOString(),
                exit: null,
                items: [],
              });
            }}
          >
            <Plus />
            {t(`${unit}.add`)}
          </Button>
        )}
      </div>
      {(error || table.error) && !selected && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      <Card className="p-4">
        <Input
          className="mb-4 max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t(`${unit}.search`)}
          aria-label={t(`${unit}.search`)}
        />
        <Table>
          <TableHeader>
            <TableRow>
              {[
                "id",
                "patient",
                ...(!moduleMode ? ["totalPrice"] : []),
                ...(isOp ? parts : []),
                "entry",
                "exit",
                "items",
                "actions",
              ].map((k) => (
                <TableHead key={k}>{t(`icu.${k}`)}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody {...table.tableProps}>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={moduleMode ? 6 : isOp ? 10 : 7}
                  className="h-24 text-center"
                >
                  {t("resourceState.loading")}
                </TableCell>
              </TableRow>
            ) : filtered.length ? (
              filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="max-w-36 truncate" title={row.id}>
                    {row.id}
                  </TableCell>
                  <TableCell>{row.patientName}</TableCell>
                  {!moduleMode && (
                    <TableCell>{money(sum(row.items, "price"))}</TableCell>
                  )}
                  {isOp &&
                    parts.map((key) => (
                      <TableCell key={key}>
                        {money(
                          sum(
                            row.items.filter((item) => item.part === key),
                            "price",
                          ),
                        )}
                      </TableCell>
                    ))}
                  <TableCell>
                    {new Date(row.entry).toLocaleString(i18n.language)}
                  </TableCell>
                  <TableCell>
                    {row.exit
                      ? new Date(row.exit).toLocaleString(i18n.language)
                      : t("icu.notExited")}
                  </TableCell>
                  <TableCell>{row.items.length}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        permission="print"
                        variant="outline"
                        size="icon"
                        aria-label={t("icu.print")}
                        onClick={() => print(row)}
                      >
                        <Printer />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label={t("icu.details")}
                        onClick={() => {
                          setError("");
                          setSelected(structuredClone(row));
                        }}
                      >
                        <Eye />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={moduleMode ? 6 : isOp ? 10 : 7}
                  className="h-24 text-center text-muted-foreground"
                >
                  {t("resourceState.notFound")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      <Dialog
        open={!!selected}
        onOpenChange={(v) => {
          if (!v && !busy) setSelected(null);
        }}
      >
        <DialogContent
          dir={i18n.dir()}
          className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl"
        >
          <DialogHeader>
            <DialogTitle>{t("icu.details")}</DialogTitle>
          </DialogHeader>
          {selected && (
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (busy || !manage || !selected.patientId) return;
                setBusy(true);
                setError("");
                try {
                  if (selected.id)
                    await apiClient.patch(
                      `${writeEndpoint}/${selected.id}`,
                      selected,
                    );
                  else await apiClient.post(writeEndpoint, selected);
                  setSelected(null);
                  setVersion((v) => v + 1);
                } catch (e) {
                  setError(apiErrorMessage(e));
                } finally {
                  setBusy(false);
                }
              }}
            >
              <fieldset disabled={busy || !manage} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="icu-patient">{t("icu.patient")}</Label>
                  <SearchableFilter
                    className="w-full"
                    searchable
                    label={t("icu.patient")}
                    value={selected.patientId ?? ""}
                    onValueChange={(patientId) => {
                      const patient = patients.find((p) => p.id === patientId);
                      setSelected({
                        ...selected,
                        patientId,
                        patientName: patient
                          ? [patient.firstName, patient.lastName]
                              .filter(Boolean)
                              .join(" ")
                          : "",
                      });
                    }}
                    onSearchChange={(value) => {
                      setPatients([]);
                      setPatientPage(1);
                      setPatientSearch(value);
                    }}
                    onLoadMore={() => {
                      if (patientHasMore && !patientLoading)
                        setPatientPage((page) => page + 1);
                    }}
                    hasMore={patientHasMore}
                    loading={patientLoading}
                    options={[
                      ...(selected.patientId &&
                      !patients.some(
                        (patient) => patient.id === selected.patientId,
                      )
                        ? [
                            {
                              value: selected.patientId,
                              label: selected.patientName,
                            },
                          ]
                        : []),
                      ...patients.map((patient) => ({
                        value: patient.id,
                        label: `${patient.firstName} ${patient.lastName} · ${patient.patientCode}`,
                      })),
                    ]}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>{t("icu.entry")}</Label>
                    <FormDatePicker
                      includeTime
                      required
                      value={selected.entry}
                      onValueChange={(entry) =>
                        setSelected({ ...selected, entry })
                      }
                    />
                  </div>
                  <div>
                    <Label>{t("icu.exit")}</Label>
                    <FormDatePicker
                      includeTime
                      value={selected.exit ?? ""}
                      onValueChange={(exit) =>
                        setSelected({ ...selected, exit: exit || null })
                      }
                    />
                  </div>
                </div>
                {selected.items.map((item, index) => (
                  <Card key={index} className="grid gap-3 p-3 sm:grid-cols-2">
                    {isOp && (
                      <div>
                        <Label>{t("icu.opPart")}</Label>
                        <Select
                          value={item.part ?? "scrubNurse"}
                          onValueChange={(part) =>
                            setSelected({
                              ...selected,
                              items: selected.items.map((v, i) =>
                                i === index ? { ...v, part } : v,
                              ),
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent searchable={false}>
                            {parts.map((key) => (
                              <SelectItem key={key} value={key}>
                                {t(`icu.${key}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {(
                      ["name", "category", "quantity", "price", "cost"] as const
                    ).map((key) => (
                      <div key={key}>
                        <Label htmlFor={`item-${index}-${key}`}>
                          {t(`icu.${key}`)}
                        </Label>
                        {key === "category" ? (
                          <Select
                            value={item.category}
                            onValueChange={(category) =>
                              setSelected({
                                ...selected,
                                items: selected.items.map((v, i) =>
                                  i === index ? { ...v, category } : v,
                                ),
                              })
                            }
                          >
                            <SelectTrigger id={`item-${index}-${key}`}>
                              <SelectValue placeholder={t("icu.category")} />
                            </SelectTrigger>
                            <SelectContent searchable={false}>
                              <SelectItem value="pharmacy">
                                {t("icu.pharmacy")}
                              </SelectItem>
                              <SelectItem value="disposable">
                                {t("icu.disposable")}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id={`item-${index}-${key}`}
                            required
                            type={key === "name" ? "text" : "number"}
                            min={key === "quantity" ? 0.001 : 0}
                            step="any"
                            value={item[key]}
                            onChange={(e) =>
                              setSelected({
                                ...selected,
                                items: selected.items.map((v, i) =>
                                  i === index
                                    ? {
                                        ...v,
                                        [key]:
                                          key === "name"
                                            ? e.target.value
                                            : Number(e.target.value),
                                      }
                                    : v,
                                ),
                              })
                            }
                          />
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() =>
                        setSelected({
                          ...selected,
                          items: selected.items.filter((_, i) => i !== index),
                        })
                      }
                    >
                      {t("icu.delete")}
                    </Button>
                  </Card>
                ))}
                {manage && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setSelected({
                        ...selected,
                        items: [
                          ...selected.items,
                          {
                            name: "",
                            category: "disposable",
                            quantity: 1,
                            price: 0,
                            cost: 0,
                            ...(isOp ? { part: "scrubNurse" } : {}),
                          },
                        ],
                      })
                    }
                  >
                    <Plus />
                    {t("icu.addItem")}
                  </Button>
                )}
              </fieldset>
              {error && (
                <p role="alert" className="text-destructive">
                  {error}
                </p>
              )}
              {manage && (
                <Button
                  permission={selected.id ? "update" : "create"}
                  disabled={busy || !selected.patientId}
                >
                  {t("retailers.save")}
                </Button>
              )}
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
