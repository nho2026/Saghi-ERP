import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { apiClient } from "@/shared/api/client";
import { useApiResource } from "@/shared/hooks/useApiResource";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { ResourceState } from "@/shared/components/ui/table-resource-state";
type Snapshot = {
  amount?: string;
  currency?: string;
  status?: string;
  category?: string;
  departmentId?: string;
  cashAccountId?: string;
  flowDate?: string;
  description?: string;
  flowType?: string;
};
type Audit = {
  id: string;
  action: string;
  actorName: string | null;
  createdAt: string;
  before: Snapshot | null;
  after: Snapshot | null;
};
export default function FinanceHistory({
  id,
  close,
}: {
  id: string | null;
  close: () => void;
}) {
  const { t } = useTranslation();
  const data = useApiResource(
    useCallback(
      () =>
        id
          ? apiClient
              .get<Audit[]>(`/finance/cash-flow/${id}/history`)
              .then((r) => r.data)
          : Promise.resolve([]),
      [id],
    ),
  );
  return (
    <Dialog
      open={!!id}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("financeOverview.history")}</DialogTitle>
        </DialogHeader>
        <ResourceState
          isLoading={data.isLoading}
          error={data.error}
          isEmpty={!data.data?.length}
        />
        {!data.isLoading &&
          !data.error &&
          data.data?.map((row) => (
            <article key={row.id} className="space-y-2 rounded-lg border p-3">
              <p className="font-semibold">
                {t(`financeOverview.audit.${row.action}`)}
              </p>
              <p className="text-xs text-muted-foreground">
                {row.actorName ?? t("financeOverview.system")} ·{" "}
                {new Date(row.createdAt).toLocaleString()}
              </p>
              {(
                [
                  "amount",
                  "currency",
                  "status",
                  "category",
                  "departmentId",
                  "cashAccountId",
                  "flowDate",
                  "description",
                  "flowType",
                ] as const
              )
                .filter((key) => row.before?.[key] !== row.after?.[key])
                .map((key) => (
                  <p key={key} className="break-words text-sm">
                    {t(`incomeExpenses.${key}`)}:{" "}
                    {String(row.before?.[key] ?? "—")} →{" "}
                    {String(row.after?.[key] ?? "—")}
                  </p>
                ))}
            </article>
          ))}
      </DialogContent>
    </Dialog>
  );
}
