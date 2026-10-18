import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { ScrollArea } from "./scroll-area";
export function SearchableFilter({
  value,
  onValueChange,
  options,
  label,
  className,
  searchable,
  pageSize,
  onSearchChange,
  onLoadMore,
  hasMore = false,
  loading = false,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  label: string;
  className?: string;
  searchable?: boolean;
  pageSize?: number;
  onSearchChange?: (value: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(pageSize ?? Infinity);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const loadLock = useRef(false);
  useEffect(() => {
    if (!loading) loadLock.current = false;
  }, [loading]);
  const showSearch = searchable ?? options.length > 7;
  const filtered = options.filter((option) =>
    option.label
      .toLocaleLowerCase()
      .includes(
        showSearch && !onSearchChange ? search.trim().toLocaleLowerCase() : "",
      ),
  );
  return (
    <Popover
      modal
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        setSearch("");
        setVisibleCount(pageSize ?? Infinity);
        if (!value) onSearchChange?.("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={label}
          aria-expanded={open}
          className={className}
        >
          <span className="min-w-0 flex-1 truncate text-start">
            {options.find((option) => option.value === value)?.label ?? label}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        dir={i18n.dir()}
        className="flex max-h-[min(320px,var(--radix-popover-content-available-height))] w-[var(--radix-popover-trigger-width)] min-w-48 flex-col gap-2 overflow-hidden p-2"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          if (showSearch) input.current?.focus();
          else
            list.current?.querySelector<HTMLButtonElement>("button")?.focus();
        }}
      >
        {showSearch && (
          <Input
            ref={input}
            className="shrink-0"
            aria-label={`${t("common.searchOptions")} ${label}`}
            placeholder={t("common.searchOptions")}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setVisibleCount(pageSize ?? Infinity);
              onSearchChange?.(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                list.current
                  ?.querySelector<HTMLButtonElement>("button")
                  ?.focus();
              }
            }}
          />
        )}
        <ScrollArea
          onScrollCapture={(event) => {
            const viewport = event.target as HTMLElement;
            if (
              viewport.hasAttribute("data-radix-scroll-area-viewport") &&
              viewport.scrollHeight -
                viewport.scrollTop -
                viewport.clientHeight <
                80
            ) {
              if (onLoadMore && hasMore && !loading && !loadLock.current) {
                loadLock.current = true;
                onLoadMore();
              } else if (!onLoadMore && pageSize) {
                setVisibleCount((count) =>
                  Math.min(count + pageSize, filtered.length),
                );
              }
            }
          }}
          className="min-h-0 max-h-60 [&_[data-radix-scroll-area-viewport]]:h-auto [&_[data-radix-scroll-area-viewport]]:max-h-[min(240px,calc(var(--radix-popover-content-available-height)-80px))]"
        >
          <div
            ref={list}
            className="space-y-0.5"
            onKeyDown={(event) => {
              if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
              event.preventDefault();
              const buttons = Array.from(
                list.current?.querySelectorAll<HTMLButtonElement>("button") ??
                  [],
              );
              const index = buttons.indexOf(
                document.activeElement as HTMLButtonElement,
              );
              if (event.key === "ArrowUp" && index === 0 && showSearch)
                input.current?.focus();
              else
                buttons[
                  Math.max(
                    0,
                    Math.min(
                      buttons.length - 1,
                      index + (event.key === "ArrowDown" ? 1 : -1),
                    ),
                  )
                ]?.focus();
            }}
          >
            {filtered.slice(0, visibleCount).map((option) => (
              <Button
                key={option.value}
                type="button"
                variant="ghost"
                aria-pressed={value === option.value}
                className="h-auto min-h-9 w-full justify-start whitespace-normal text-start"
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                  setSearch("");
                }}
              >
                <Check
                  className={`size-4 shrink-0 ${value === option.value ? "" : "invisible"}`}
                />
                <span>{option.label}</span>
              </Button>
            ))}
            {!filtered.length && (
              <p className="p-3 text-sm text-muted-foreground" role="status">
                {t("resourceState.notFound")}
              </p>
            )}
            {onLoadMore && loading && (
              <p className="p-2 text-center text-xs text-muted-foreground">
                {t("resourceState.loading")}
              </p>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
