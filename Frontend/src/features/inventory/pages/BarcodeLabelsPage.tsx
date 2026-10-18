import { Label } from "@/shared/components/ui/label";
import { useCallback, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { PaginationControls } from "@/shared/components/ui/pagination-controls";
import {
  Barcode,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { inventoryApi } from "../api/inventory.api";
import { ProductBarcode } from "../components/product-barcode";
import { printProductBarcodes } from "../components/logic/print-product-barcodes";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { ResourceState } from "@/shared/components/ui/table-resource-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { DeleteConfirmationDialog } from "@/shared/components/ui/confirmation-dialog";

export default function BarcodeLabelsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const products = useApiResource(
    useCallback(
      () =>
        inventoryApi.list("products", page, {
          search,
          hasBarcode: "true",
          pageSize: "20",
          compact: "true",
          includeStocks: "false",
        }),
      [page, search],
    ),
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [quantity, setQuantity] = useState("1");
  const [size, setSize] = useState<"50x30" | "40x25">("50x30");
  const [adding, setAdding] = useState<string>();
  const [addOpen, setAddOpen] = useState(false);
  const [missingSearch, setMissingSearch] = useState("");
  const [missingPage, setMissingPage] = useState(1);
  const missing = useApiResource(
    useCallback(
      () =>
        addOpen
          ? inventoryApi.list("products", missingPage, {
              search: missingSearch,
              hasBarcode: "false",
              pageSize: "20",
              compact: "true",
              includeStocks: "false",
            })
          : Promise.resolve(null),
      [addOpen, missingPage, missingSearch],
    ),
  );
  const [addProductId, setAddProductId] = useState("");
  const [generatedBarcode, setGeneratedBarcode] = useState("");
  const [preparing, setPreparing] = useState(false);
  const [deleting, setDeleting] = useState<string>();
  const rows = products.data?.items ?? [];
  const chosen = rows.filter((product) => selected.has(product.id));
  const missingProducts = missing.data?.items ?? [];
  const changePage = (next: number) => {
    setSelected(new Set());
    setPage(next);
  };
  const toggle = (id: string, checked: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  const openAddDialog = async (productId = "") => {
    setAddProductId(productId);
    setMissingSearch("");
    setMissingPage(1);
    setGeneratedBarcode("");
    setAddOpen(true);
    setPreparing(true);
    try {
      setGeneratedBarcode(await inventoryApi.newBarcode());
    } finally {
      setPreparing(false);
    }
  };
  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Barcode />
            {t("inventory.barcode.pageTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("inventory.barcode.description")}
          </p>
        </div>
        <Button permission="create" onClick={() => void openAddDialog()}>
          <Plus />
          {t("inventory.barcode.addNew")}
        </Button>
      </header>
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-64 flex-1">
            <Search className="absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="ps-9"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                changePage(1);
              }}
              placeholder={t("inventory.barcode.search")}
            />
          </div>
          <Input
            className="w-32"
            type="number"
            min="1"
            max="500"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            placeholder={t("inventory.barcode.quantity")}
          />
          <Select
            value={size}
            onValueChange={(value) => setSize(value as "50x30" | "40x25")}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50x30">50 × 30 mm</SelectItem>
              <SelectItem value="40x25">40 × 25 mm</SelectItem>
            </SelectContent>
          </Select>
          <Label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium shadow-sm hover:bg-muted">
            <Checkbox
              className="size-5 rounded-md"
              disabled={
                products.isLoading || Boolean(products.error) || !rows.length
              }
              checked={
                rows.length > 0 && rows.every((row) => selected.has(row.id))
              }
              onCheckedChange={(checked) =>
                setSelected(
                  checked ? new Set(rows.map((row) => row.id)) : new Set(),
                )
              }
            />
            {t("inventory.barcode.selectPage", {
              defaultValue: "Select this page",
            })}
          </Label>
          <Button
            permission="print"
            disabled={
              !chosen.length || products.isLoading || Boolean(products.error)
            }
            onClick={() =>
              printProductBarcodes(chosen, Number(quantity) || 1, size)
            }
          >
            <Printer />
            {t("inventory.barcode.printSelected", { count: chosen.length })}
          </Button>
        </CardContent>
      </Card>
      <ResourceState
        isLoading={products.isLoading}
        error={products.error}
        isEmpty={!rows.length}
      />
      {!products.isLoading && !products.error && rows.length > 0 && (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <span className="sr-only">
                    {t("inventory.barcode.selectProduct")}
                  </span>
                </TableHead>
                <TableHead>{t("inventory.fields.product")}</TableHead>
                <TableHead>{t("inventory.fields.sku")}</TableHead>
                <TableHead>{t("inventory.fields.barcode")}</TableHead>
                <TableHead>{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody autoPaginate={false}>
              {rows.map((product) => {
                const checked = selected.has(product.id);
                return (
                  <TableRow
                    key={product.id}
                    data-state={checked ? "selected" : undefined}
                  >
                    <TableCell>
                      <Checkbox
                        className="size-5 rounded-md"
                        checked={checked}
                        onCheckedChange={(value) =>
                          toggle(product.id, Boolean(value))
                        }
                        aria-label={t("inventory.barcode.selectProduct")}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>
                      <span dir="ltr">{product.sku}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex w-64 items-center justify-center rounded border bg-white p-2">
                        <ProductBarcode value={String(product.barcode)} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {product.barcode && (
                          <DeleteConfirmationDialog
                            description={t("inventory.barcode.deleteConfirm")}
                            onConfirm={async () => {
                              setDeleting(product.id);
                              try {
                                await inventoryApi.removeBarcode(product.id);
                                setSelected((current) => {
                                  const next = new Set(current);
                                  next.delete(product.id);
                                  return next;
                                });
                                if (rows.length === 1 && page > 1)
                                  changePage(page - 1);
                                else await products.refresh();
                              } finally {
                                setDeleting(undefined);
                              }
                            }}
                          >
                            <Button
                              data-action="delete"
                              variant="outline"
                              className="h-10 border-destructive/25 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                              disabled={deleting === product.id}
                            >
                              <Trash2 className="size-4" />
                              {t("inventory.barcode.delete")}
                            </Button>
                          </DeleteConfirmationDialog>
                        )}
                        {product.barcode && (
                          <Button
                            permission="print"
                            className="h-10 text-xs"
                            disabled={deleting === product.id}
                            onClick={() =>
                              printProductBarcodes(
                                [product],
                                Number(quantity) || 1,
                                size,
                              )
                            }
                          >
                            <Printer />
                            {t("inventory.barcode.print")}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      {!products.isLoading && !products.error && products.data && (
        <PaginationControls
          page={page}
          totalPages={products.data.pagination.totalPages}
          total={products.data.pagination.total}
          onPageChange={changePage}
        />
      )}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Barcode />
              {t("inventory.barcode.addNew")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex min-h-32 items-center justify-center rounded-xl border bg-white p-3">
              {preparing ? (
                <RefreshCw className="animate-spin text-primary" />
              ) : generatedBarcode ? (
                <ProductBarcode value={generatedBarcode} />
              ) : null}
            </div>
            <Button
              permission="create"
              type="button"
              variant="outline"
              className="w-full"
              disabled={preparing || Boolean(adding)}
              onClick={async () => {
                setPreparing(true);
                try {
                  setGeneratedBarcode(await inventoryApi.newBarcode());
                } finally {
                  setPreparing(false);
                }
              }}
            >
              <RefreshCw className={preparing ? "animate-spin" : ""} />
              {t("inventory.barcode.generate")}
            </Button>
            <Input
              value={missingSearch}
              placeholder={t("inventory.barcode.selectProduct")}
              aria-label={t("inventory.barcode.selectProduct")}
              onChange={(event) => {
                setMissingSearch(event.target.value);
                setMissingPage(1);
                setAddProductId("");
              }}
            />
            <ResourceState
              isLoading={missing.isLoading}
              error={missing.error}
              isEmpty={false}
            />
            {!missing.isLoading &&
              !missing.error &&
              (missingProducts.length ? (
                <Select value={addProductId} onValueChange={setAddProductId}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("inventory.barcode.selectProduct")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {missingProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} · {product.sku}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  {t("inventory.barcode.noMissing")}
                </div>
              ))}
            {!missing.isLoading && !missing.error && missing.data && (
              <PaginationControls
                page={missingPage}
                totalPages={missing.data.pagination.totalPages}
                total={missing.data.pagination.total}
                onPageChange={(next) => {
                  setMissingPage(next);
                  setAddProductId("");
                }}
              />
            )}
            <Button
              permission="update"
              className="w-full"
              disabled={
                !addProductId ||
                !generatedBarcode ||
                Boolean(adding) ||
                missing.isLoading ||
                Boolean(missing.error) ||
                preparing
              }
              onClick={async () => {
                setAdding(addProductId);
                try {
                  await inventoryApi.addBarcode(addProductId, generatedBarcode);
                  await products.refresh();
                  setAddOpen(false);
                } finally {
                  setAdding(undefined);
                }
              }}
            >
              <Plus />
              {t("inventory.barcode.confirmAdd")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
