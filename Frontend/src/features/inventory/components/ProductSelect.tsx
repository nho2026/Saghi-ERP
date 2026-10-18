import type { RecordItem } from "../api/inventory.api";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown } from "lucide-react";
import { apiClient, apiErrorMessage } from "@/shared/api/client";
import type { Page } from "@/shared/api/pagination";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";

export function ProductSelect({
  selected,
  onChange,
  disabled,
  className,
}: {
  selected?: RecordItem;
  onChange: (product: RecordItem) => void;
  disabled?: boolean;
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<RecordItem[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const pagingLocked = useRef(false);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = window.setTimeout(
      async () => {
        try {
          const { data } = await apiClient.get<Page<RecordItem>>(
            "/inventory/products",
            {
              params: {
                page,
                pageSize: 20,
                search,
                status: "active",
                compact: "true",
                includeStocks: "false",
              },
              signal: controller.signal,
            },
          );
          if (controller.signal.aborted) return;
          setItems((previous) =>
            page === 1
              ? data.items
              : [
                  ...new Map(
                    [...previous, ...data.items].map((item) => [item.id, item]),
                  ).values(),
                ],
          );
          setHasMore(data.pagination.page < data.pagination.totalPages);
        } catch (cause) {
          if (!controller.signal.aborted) setError(apiErrorMessage(cause));
        } finally {
          if (!controller.signal.aborted) {
            pagingLocked.current = false;
            setLoading(false);
          }
        }
      },
      search ? 250 : 0,
    );
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, search, page, retry]);

  const choose = (product: RecordItem) => {
    onChange(product);
    setOpen(false);
  };
  return (
    <Popover
      modal
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setSearch("");
          setPage(1);
          setItems([]);
          setHasMore(false);
          setError("");
          setLoading(true);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          aria-label={t("buyProductForm.selectProduct")}
          className={`h-10 w-full justify-between ${className ?? ""}`}
        >
          <span className="truncate">
            {selected ? selected.name : t("buyProductForm.selectProduct")}
          </span>
          <ChevronDown className="size-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        dir={i18n.dir()}
        className="flex max-h-[var(--radix-popover-content-available-height)] w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] flex-col overflow-hidden p-2"
      >
        <Input
          aria-label={t("common.searchOptions")}
          placeholder={t("common.searchOptions")}
          className="shrink-0"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
            setItems([]);
            setHasMore(false);
            setError("");
            setLoading(true);
          }}
        />
        <div
          className="mt-2 min-h-0 max-h-72 overflow-x-hidden overflow-y-auto overscroll-contain"
          aria-busy={loading}
          onScroll={(event) => {
            const list = event.currentTarget;
            if (!hasMore || loading || error || pagingLocked.current) return;
            if (list.scrollHeight - list.scrollTop - list.clientHeight <= 64) {
              pagingLocked.current = true;
              setLoading(true);
              setPage((previous) => previous + 1);
            }
          }}
        >
          {items.map((product) => (
            <Button
              key={product.id}
              type="button"
              variant="ghost"
              aria-pressed={selected?.id === product.id}
              className="h-auto min-h-10 w-full justify-start gap-2 px-3 py-2 text-start"
              onClick={() => choose(product)}
            >
              <Check
                className={`size-4 shrink-0 ${selected?.id === product.id ? "" : "opacity-0"}`}
              />
              <span className="min-w-0 flex-1 whitespace-normal break-words">
                {product.name}
              </span>
            </Button>
          ))}
          {loading && (
            <p role="status" className="p-3 text-sm text-muted-foreground">
              {t("common.loading")}
            </p>
          )}
          {!loading && !error && !items.length && (
            <p role="status" className="p-3 text-sm">
              {t("common.noOptionsFound")}
            </p>
          )}
          {error && (
            <p role="alert" className="p-3 text-sm text-destructive">
              {error}
            </p>
          )}
          {!loading && error && (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setLoading(true);
                setError("");
                setRetry((previous) => previous + 1);
              }}
            >
              {t("common.retry", { defaultValue: "Retry" })}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
