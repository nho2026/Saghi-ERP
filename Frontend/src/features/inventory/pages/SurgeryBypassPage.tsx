import { useServerTable } from "@/shared/hooks/useServerTable";
import { hasPagePermission } from "@/features/auth/access";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { apiClient, apiErrorMessage } from "@/shared/api/client";
import { storedUser } from "@/features/auth/access";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/components/ui/table";
type Row = {
  id: string;
  patientName: string;
  entry: string;
  exit: string | null;
  isBypass: boolean;
};
export default function SurgeryBypassPage() {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState(""),
    [error, setError] = useState(""),
    [selected, setSelected] = useState<Row | null>(null),
    [busy, setBusy] = useState(false);
  const manage = hasPagePermission(storedUser(), "create", "update", "delete");
  const table = useServerTable<Row>("/inventory/surgery-bypass", { search });
  const filtered = table.data ?? [],
    loading = table.isLoading;
  return (
    <div className="space-y-4" dir={i18n.dir()}>
      <h1 className="text-xl font-bold">{t("bypass.title")}</h1>
      {(error || table.error) && !selected && (
        <p role="alert" className="text-destructive">
          {error || table.error}
        </p>
      )}
      <Card className="p-4">
        <Input
          className="mb-4 max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label={t("bypass.search")}
          placeholder={t("bypass.search")}
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("icu.patient")}</TableHead>
              <TableHead>{t("icu.entry")}</TableHead>
              <TableHead>{t("bypass.status")}</TableHead>
              <TableHead>{t("icu.exit")}</TableHead>
              {manage && <TableHead>{t("icu.actions")}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody {...table.tableProps}>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={manage ? 5 : 4}
                  className="h-24 text-center"
                >
                  {t("resourceState.loading")}
                </TableCell>
              </TableRow>
            ) : filtered.length ? (
              filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.patientName}</TableCell>
                  <TableCell>
                    {new Date(row.entry).toLocaleString(i18n.language)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.isBypass ? "default" : "secondary"}>
                      {t(row.isBypass ? "bypass.yes" : "bypass.no")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {row.exit
                      ? new Date(row.exit).toLocaleString(i18n.language)
                      : t("icu.notExited")}
                  </TableCell>
                  {manage && (
                    <TableCell>
                      <Button
                        permission="update"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelected({ ...row });
                          setError("");
                        }}
                      >
                        {t("bypass.edit")}
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={manage ? 5 : 4}
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
        <DialogContent dir={i18n.dir()}>
          <DialogHeader>
            <DialogTitle>{t("bypass.edit")}</DialogTitle>
          </DialogHeader>
          {selected && (
            <>
              <p>{selected.patientName}</p>
              <Label className="flex items-center gap-2">
                <Checkbox
                  disabled={busy}
                  checked={selected.isBypass}
                  onCheckedChange={(v) =>
                    setSelected({ ...selected, isBypass: v === true })
                  }
                />
                {t("bypass.status")}
              </Label>
              {error && (
                <p role="alert" className="text-destructive">
                  {error}
                </p>
              )}
              <Button
                permission="update"
                disabled={busy}
                onClick={async () => {
                  if (busy) return;
                  setBusy(true);
                  try {
                    await apiClient.patch(
                      `/inventory/surgery-bypass/${selected.id}`,
                      { isBypass: selected.isBypass },
                    );
                    await table.refresh();
                    setSelected(null);
                  } catch (e) {
                    setError(apiErrorMessage(e));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {t("retailers.save")}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
