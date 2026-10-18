import { useServerTable } from "@/shared/hooks/useServerTable";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Star, Trash2 } from "lucide-react";
import { feedbackApi, type Feedback } from "../api/feedback.api";
import { Button } from "@/shared/components/ui/button";
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
import { Badge } from "@/shared/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { TableResourceState } from "@/shared/components/ui/table-resource-state";
const Stars = ({ value }: { value: number }) => (
  <span className="flex gap-0.5" aria-label={`${value}/5`}>
    {[1, 2, 3, 4, 5].map((x) => (
      <Star
        key={x}
        className={`size-4 ${x <= value ? "fill-amber-400 text-amber-400" : "text-muted"}`}
      />
    ))}
  </span>
);
export default function FeedbackPage() {
  const { t } = useTranslation();
  const [status, setStatus] = useState("all"),
    [type, setType] = useState("all");
  const table = useServerTable<Feedback>("/feedback", {
    status: status === "all" ? undefined : status,
    targetType: type === "all" ? undefined : type,
  });
  const items = table.data ?? [],
    loading = table.isLoading,
    error = table.error;
  const load = table.refresh;
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">{t("feedback.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("feedback.subtitle")}
        </p>
      </header>
      <div className="flex flex-wrap gap-2 rounded-xl border bg-card p-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("feedback.allStatuses")}</SelectItem>
            {["pending", "approved", "rejected"].map((x) => (
              <SelectItem key={x} value={x}>
                {t(`feedback.statuses.${x}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("feedback.allTargets")}</SelectItem>
            <SelectItem value="product">{t("feedback.products")}</SelectItem>
            <SelectItem value="service">{t("feedback.services")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("feedback.customer")}</TableHead>
              <TableHead>{t("feedback.target")}</TableHead>
              <TableHead>{t("feedback.rating")}</TableHead>
              <TableHead>{t("feedback.comment")}</TableHead>
              <TableHead>{t("feedback.status")}</TableHead>
              <TableHead className="text-end">{t("table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody {...table.tableProps}>
            <TableResourceState
              isLoading={loading}
              error={error}
              isEmpty={!items.length}
              colSpan={6}
            />
            {!loading &&
              !error &&
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <strong>{item.customerName}</strong>
                    <small className="block text-muted-foreground">
                      {item.customerEmail}
                    </small>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {t(`feedback.${item.targetType}s`)}
                    </Badge>
                    <span className="ms-2">
                      {item.product?.name ?? item.service?.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Stars value={item.rating} />
                  </TableCell>
                  <TableCell className="max-w-80 whitespace-normal">
                    {item.comment}
                  </TableCell>
                  <TableCell>
                    <Select
                      permission="update"
                      value={item.status}
                      onValueChange={async (value) => {
                        await feedbackApi.status(item.id, value);
                        await load();
                      }}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["pending", "approved", "rejected"].map((x) => (
                          <SelectItem key={x} value={x}>
                            {t(`feedback.statuses.${x}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex flex-wrap items-center gap-2 justify-end">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            data-action="delete"
                            size="icon"
                            variant="ghost"
                          >
                            <Trash2 className="text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t("feedback.deleteTitle")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("feedback.deleteDescription")}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {t("common.cancel")}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              permission="delete"
                              onClick={async () => {
                                await feedbackApi.remove(item.id);
                                await load();
                              }}
                            >
                              {t("common.delete")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
