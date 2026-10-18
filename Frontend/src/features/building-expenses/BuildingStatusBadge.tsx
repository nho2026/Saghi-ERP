import { useBuildingTranslation } from "./useBuildingTranslation";
import { Badge } from "@/shared/components/ui/badge";

const colors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  approved: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  ordered: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  rejected: "bg-red-500/10 text-red-700 dark:text-red-300",
};
export function BuildingStatusBadge({ status }: { status: string }) {
  const { t } = useBuildingTranslation();
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 rounded-full border-0 px-2.5 py-1 capitalize ${colors[status] ?? "bg-muted text-muted-foreground"}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {t(status)}
    </Badge>
  );
}
