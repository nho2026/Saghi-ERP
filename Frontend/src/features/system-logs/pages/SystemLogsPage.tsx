import { useCallback, useState } from "react";
import { Activity, FilterX, Printer, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { systemLogsApi } from "../api/system-logs.api";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { FormDatePicker } from "@/shared/components/ui/form-date-picker";
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
import { TableResourceState } from "@/shared/components/ui/table-resource-state";

const emptyFilters = {
  search: "",
  module: "all",
  action: "all",
  result: "all",
  from: "",
  to: "",
};

export default function SystemLogsPage() {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(emptyFilters);
  const logs = useApiResource(
    useCallback(
      () =>
        systemLogsApi.list({
          page,
          pageSize: 10,
          search: filters.search || undefined,
          module: filters.module === "all" ? undefined : filters.module,
          action: filters.action === "all" ? undefined : filters.action,
          result: filters.result === "all" ? undefined : filters.result,
          from: filters.from ? `${filters.from}T00:00:00` : undefined,
          to: filters.to ? `${filters.to}T23:59:59.999` : undefined,
        }),
      [page, filters],
    ),
  );
  const update = (key: keyof typeof filters, value: string) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };
  const displayIp = (value: string | null) =>
    value?.replace(/^::ffff:/, "") ?? "—";
  const printLogs = () => {
    document.body.classList.add("printing-system-logs");
    window.addEventListener(
      "afterprint",
      () => document.body.classList.remove("printing-system-logs"),
      { once: true },
    );
    window.print();
  };

  return (
    <div className="system-logs-print space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Activity className="text-primary" />
            {t("systemLogs.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("systemLogs.description")}
          </p>
        </div>
        <Button
          permission="print"
          className="print:hidden"
          variant="outline"
          onClick={printLogs}
        >
          <Printer />
          {t("systemLogs.print")}
        </Button>
      </header>
      <Card className="print:hidden">
        <CardContent className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="relative xl:col-span-2">
            <Search className="absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="ps-9"
              value={filters.search}
              onChange={(e) => update("search", e.target.value)}
              placeholder={t("systemLogs.search")}
            />
          </div>
          <Select
            value={filters.module}
            onValueChange={(value) => update("module", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("systemLogs.module")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("systemLogs.allModules")}</SelectItem>
              {logs.data?.modules.map((module) => (
                <SelectItem key={module} value={module}>
                  {t(`systemLogs.modules.${module}`, { defaultValue: module })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.action}
            onValueChange={(value) => update("action", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("systemLogs.allActions")}</SelectItem>
              {["login", "create", "update", "delete"].map((action) => (
                <SelectItem key={action} value={action}>
                  {t(`systemLogs.actions.${action}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.result}
            onValueChange={(value) => update("result", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("systemLogs.allResults")}</SelectItem>
              <SelectItem value="success">{t("systemLogs.success")}</SelectItem>
              <SelectItem value="failed">{t("systemLogs.failed")}</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setFilters(emptyFilters);
              setPage(1);
            }}
          >
            <FilterX />
            {t("systemLogs.clear")}
          </Button>
          <label className="grid gap-1 text-xs text-muted-foreground">
            {t("systemLogs.from")}
            <FormDatePicker
              value={filters.from}
              onValueChange={(value) => update("from", value)}
            />
          </label>
          <label className="grid gap-1 text-xs text-muted-foreground">
            {t("systemLogs.to")}
            <FormDatePicker
              value={filters.to}
              onValueChange={(value) => update("to", value)}
            />
          </label>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("systemLogs.time")}</TableHead>
                <TableHead>{t("systemLogs.user")}</TableHead>
                <TableHead>{t("systemLogs.action")}</TableHead>
                <TableHead>{t("systemLogs.module")}</TableHead>
                <TableHead>{t("systemLogs.result")}</TableHead>
                <TableHead>{t("systemLogs.ip")}</TableHead>
                <TableHead>{t("systemLogs.duration")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody
              autoPaginate={false}
              pagination={
                logs.data
                  ? {
                      ...logs.data.pagination,
                      onPageChange: setPage,
                      disabled: logs.isLoading,
                    }
                  : undefined
              }
            >
              <TableResourceState
                isLoading={logs.isLoading}
                error={logs.error}
                isEmpty={!logs.data?.items.length}
                colSpan={7}
              />
              {logs.data?.items.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Intl.DateTimeFormat(i18n.resolvedLanguage, {
                      dateStyle: "medium",
                      timeStyle: "medium",
                    }).format(new Date(log.createdAt))}
                  </TableCell>
                  <TableCell>
                    {log.userName ?? t("systemLogs.anonymous")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {t(`systemLogs.actions.${log.action}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {t(`systemLogs.modules.${log.module}`, {
                      defaultValue: log.module,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        log.statusCode < 400 ? "secondary" : "destructive"
                      }
                    >
                      {log.statusCode < 400
                        ? t("systemLogs.success")
                        : t("systemLogs.failed")}{" "}
                      · {log.statusCode}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs">
                    {displayIp(log.ipAddress)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {t("systemLogs.milliseconds", { count: log.durationMs })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
