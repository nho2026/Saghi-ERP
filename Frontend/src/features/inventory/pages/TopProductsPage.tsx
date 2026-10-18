import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useServerTable } from "@/shared/hooks/useServerTable";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/shared/components/ui/table";
import { TableResourceState } from "@/shared/components/ui/table-resource-state";

export default function TopProductsPage() {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("");
  const table = useServerTable<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
  }>("/inventory/top-products", { search });
  return (
    <div className="space-y-4" dir={i18n.dir()}>
      <h1 className="text-2xl font-bold">{t("warehouseModule.topProducts")}</h1>
      <p className="text-sm text-muted-foreground">
        {t("warehouseModule.topProductsDescription")}
      </p>
      <Card>
        <CardContent className="space-y-4 p-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("common.search")}
            aria-label={t("common.search")}
            className="max-w-sm"
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("itemReduction.product")}</TableHead>
                <TableHead>{t("itemReduction.code")}</TableHead>
                <TableHead>{t("itemReduction.quantity")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody {...table.tableProps}>
              <TableResourceState
                isLoading={table.isLoading}
                error={table.error}
                isEmpty={!table.data?.length}
                colSpan={3}
              />
              {!table.isLoading &&
                !table.error &&
                table.data?.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.sku}</TableCell>
                    <TableCell>
                      {row.quantity.toLocaleString(i18n.language)}
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
