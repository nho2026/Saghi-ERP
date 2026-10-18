import { hasPagePermission } from "@/features/auth/access";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { apiClient } from "@/shared/api/client";
import { storedUser } from "@/features/auth/access";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Card } from "@/shared/components/ui/card";
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
import { apiErrorMessage } from "@/shared/api/client";
type Retailer = { id: string; name: string; [key: string]: string };

export default function DirectoryPage({
  resource,
}: {
  resource: "production-companies" | "customers";
}) {
  const company = resource === "production-companies";
  const prefix = company ? "productionCompanies" : "warehouseCustomers";
  const fields = company
    ? ["name", "country"]
    : ["name", "phone", "email", "address", "note", "debtThreshold"];
  const empty: Record<string, string> = Object.fromEntries(
    fields.map((key) => [key, key === "debtThreshold" ? "0" : ""]),
  );
  const endpoint = `/inventory/${resource}`;
  const { t, i18n } = useTranslation();
  const [rows, setRows] = useState<Retailer[]>([]);
  const [search, setSearch] = useState(
    () => new URLSearchParams(location.search).get("search") ?? "",
  );
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Retailer | "new" | null>(null);
  const [deleting, setDeleting] = useState<Retailer | null>(null);
  const [form, setForm] = useState(empty);
  const manage = hasPagePermission(storedUser(), "create", "update", "delete");
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(() => {
      apiClient
        .get<{ items: Retailer[]; pagination: { totalPages: number } }>(
          endpoint,
          { params: { search, page, pageSize: 10 }, signal: controller.signal },
        )
        .then(({ data }) => {
          setRows(data.items);
          setPages(data.pagination.totalPages);
          if (page > data.pagination.totalPages)
            setPage(data.pagination.totalPages);
        })
        .catch((e) => {
          if (!controller.signal.aborted) setError(apiErrorMessage(e));
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, page, version, endpoint]);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || !editing) return;
    setBusy(true);
    setError("");
    try {
      if (editing === "new") await apiClient.post(endpoint, form);
      else await apiClient.patch(`${endpoint}/${editing.id}`, form);
      setEditing(null);
      setVersion((v) => v + 1);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-4" dir={i18n.dir()}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">
          {t(
            company
              ? "warehouseModule.productionCompanies"
              : "warehouseModule.customers",
          )}
        </h1>
        {manage && (
          <Button
            permission="create"
            onClick={() => {
              setForm(empty);
              setError("");
              setEditing("new");
            }}
          >
            <Plus />
            {t(`${prefix}.create`)}
          </Button>
        )}
      </div>
      {error && !editing && !deleting && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      <Card className="overflow-hidden p-4">
        <Input
          className="mb-4 max-w-md"
          value={search}
          placeholder={t(`${prefix}.search`)}
          aria-label={t(`${prefix}.search`)}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Table>
          <TableHeader>
            <TableRow>
              {[...fields, "actions"].map((key) => (
                <TableHead key={key}>{t(`${prefix}.${key}`)}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody autoPaginate={false}>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={fields.length + 1}
                  className="h-24 text-center text-muted-foreground"
                >
                  {t("resourceState.loading")}
                </TableCell>
              </TableRow>
            ) : rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {fields.map((key) => (
                    <TableCell
                      key={key}
                      className="max-w-xs whitespace-pre-wrap break-words"
                    >
                      {key === "debtThreshold"
                        ? Number(row[key]).toLocaleString(i18n.language, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : row[key] || "—"}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-2">
                      {manage && (
                        <>
                          <Button
                            data-action="edit"
                            variant="outline"
                            size="icon"
                            aria-label={t(`${prefix}.edit`)}
                            onClick={() => {
                              setForm(
                                Object.fromEntries(
                                  fields.map((key) => [
                                    key,
                                    String(row[key] ?? ""),
                                  ]),
                                ),
                              );
                              setError("");
                              setEditing(row);
                            }}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            data-action="delete"
                            variant="destructive"
                            size="icon"
                            aria-label={t(`${prefix}.delete`)}
                            onClick={() => {
                              setError("");
                              setDeleting(row);
                            }}
                          >
                            <Trash2 className="size-4 text-white" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={fields.length + 1}
                  className="h-24 text-center text-muted-foreground"
                >
                  {t("resourceState.notFound")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="mt-4 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            disabled={page === 1 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            {t("retailers.previous")}
          </Button>
          <span className="text-sm">
            {page} / {pages}
          </span>
          <Button
            variant="outline"
            disabled={page >= pages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            {t("retailers.next")}
          </Button>
        </div>
      </Card>
      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open && !busy) setEditing(null);
        }}
      >
        <DialogContent
          dir={i18n.dir()}
          className="max-h-[90dvh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>
              {t(`${prefix}.${editing === "new" ? "create" : "edit"}`)}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            {fields.map((key) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`retailer-${key}`}>
                  {t(`${prefix}.${key}`)}
                </Label>
                {key === "note" ? (
                  <Textarea
                    id={`retailer-${key}`}
                    maxLength={5000}
                    disabled={busy}
                    value={form[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                  />
                ) : (
                  <Input
                    id={`retailer-${key}`}
                    required={
                      key === "name" ||
                      key === "country" ||
                      key === "debtThreshold"
                    }
                    min={key === "debtThreshold" ? 0 : undefined}
                    step={key === "debtThreshold" ? "0.01" : undefined}
                    type={
                      key === "debtThreshold"
                        ? "number"
                        : key === "email"
                          ? "email"
                          : key === "phone"
                            ? "tel"
                            : "text"
                    }
                    maxLength={
                      key === "phone" ? 50 : key === "address" ? 500 : 191
                    }
                    disabled={busy}
                    value={form[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                  />
                )}
              </div>
            ))}
            {error && (
              <p role="alert" className="text-destructive">
                {error}
              </p>
            )}
            <Button
              permission={editing === "new" ? "create" : "update"}
              disabled={busy || !form.name.trim()}
            >
              {t("retailers.save")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open && !busy) setDeleting(null);
        }}
      >
        <DialogContent dir={i18n.dir()}>
          <DialogHeader>
            <DialogTitle>{t(`${prefix}.delete`)}</DialogTitle>
          </DialogHeader>
          <p>{t(`${prefix}.confirm`, { name: deleting?.name })}</p>
          {error && (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setDeleting(null)}
            >
              {t("retailers.cancel")}
            </Button>
            <Button
              permission="delete"
              variant="destructive"
              disabled={busy}
              onClick={async () => {
                if (!deleting || busy) return;
                setBusy(true);
                setError("");
                try {
                  await apiClient.delete(`${endpoint}/${deleting.id}`);
                  setDeleting(null);
                  setVersion((v) => v + 1);
                } catch (e) {
                  setError(apiErrorMessage(e));
                } finally {
                  setBusy(false);
                }
              }}
            >
              {t(`${prefix}.delete`)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
