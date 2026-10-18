import { LoaderCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TableCell, TableRow } from "@/shared/components/ui/table";

export function TableResourceState({
  isLoading,
  error,
  isEmpty,
  colSpan,
}: {
  isLoading: boolean;
  error?: string | null;
  isEmpty: boolean;
  colSpan: number;
}) {
  const { t } = useTranslation();
  if (isLoading)
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="h-28 text-center">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="size-5 animate-spin text-primary" />
            {t("resourceState.loading")}
          </span>
        </TableCell>
      </TableRow>
    );
  if (error)
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="h-28 text-center">
          <p className="font-medium text-destructive">
            {t("resourceState.loadFailed")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{error}</p>
        </TableCell>
      </TableRow>
    );
  if (isEmpty)
    return (
      <TableRow>
        <TableCell
          colSpan={colSpan}
          className="h-28 text-center text-sm text-muted-foreground"
        >
          {t("resourceState.notFound")}
        </TableCell>
      </TableRow>
    );
  return null;
}

export function ResourceState({
  isLoading,
  error,
  isEmpty,
}: {
  isLoading: boolean;
  error?: string | null;
  isEmpty: boolean;
}) {
  const { t } = useTranslation();
  if (!isLoading && !error && !isEmpty) return null;
  return (
    <div className="col-span-full grid min-h-32 place-items-center rounded-xl border border-dashed bg-card p-6 text-center">
      {isLoading ? (
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-5 animate-spin text-primary" />
          {t("resourceState.loading")}
        </span>
      ) : error ? (
        <div>
          <p className="font-medium text-destructive">
            {t("resourceState.loadFailed")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{error}</p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t("resourceState.notFound")}
        </p>
      )}
    </div>
  );
}
