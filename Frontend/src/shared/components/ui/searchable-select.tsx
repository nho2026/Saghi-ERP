import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

type Option = { value: string; label: string; searchText?: string };

export function SearchableSelect({
  name,
  id,
  options,
  defaultValue = "",
  placeholder,
  searchPlaceholder,
  required,
  searchable,
  pageSize,
}: {
  name: string;
  id?: string;
  options: Option[];
  defaultValue?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
  searchable?: boolean;
  pageSize?: number;
}) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(pageSize ?? Infinity);
  const showSearch = searchable ?? options.length > 7;
  const selected = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    const term = showSearch ? search.trim().toLowerCase() : "";
    if (!term) return options;
    return options.filter((option) =>
      `${option.label} ${option.searchText ?? ""}`.toLowerCase().includes(term),
    );
  }, [options, search, showSearch]);
  const visibleOptions = filtered.slice(0, visibleCount);

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Popover
        modal
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setSearch("");
            setVisibleCount(pageSize ?? Infinity);
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            id={id}
            aria-label={placeholder}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-required={required}
            className="w-full justify-between px-3 font-normal"
          >
            <span
              className={cn("truncate", !selected && "text-muted-foreground")}
            >
              {selected?.label ?? placeholder ?? t("common.selectOption")}
            </span>
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          dir={i18n.dir()}
          className="flex max-h-[min(320px,var(--radix-popover-content-available-height))] w-[var(--radix-popover-trigger-width)] flex-col overflow-hidden p-0"
        >
          {showSearch && (
            <div className="relative shrink-0 border-b p-2">
              <Search className="absolute inset-s-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label={searchPlaceholder ?? t("common.searchOptions")}
                autoFocus
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setVisibleCount(pageSize ?? Infinity);
                }}
                placeholder={searchPlaceholder ?? t("common.searchOptions")}
                className="border-0 ps-9 shadow-none focus-visible:ring-0"
              />
            </div>
          )}
          <ScrollArea className="min-h-0 max-h-60 [&_[data-radix-scroll-area-viewport]]:h-auto [&_[data-radix-scroll-area-viewport]]:max-h-[min(240px,calc(var(--radix-popover-content-available-height)-80px))]">
            <div className="p-1">
              {visibleOptions.length ? (
                <>
                  {visibleOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant="ghost"
                      type="button"
                      onClick={() => {
                        setValue(option.value);
                        setSearch("");
                        setOpen(false);
                      }}
                      className="flex h-auto min-h-9 w-full items-center justify-start gap-2 whitespace-normal rounded-md px-2 py-2 text-start text-sm"
                    >
                      <Check
                        className={cn(
                          "size-4 text-primary",
                          value !== option.value && "opacity-0",
                        )}
                      />
                      <span>{option.label}</span>
                    </Button>
                  ))}
                  {visibleOptions.length < filtered.length && pageSize && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="mt-1 w-full border-t text-primary"
                      onClick={() =>
                        setVisibleCount((current) => current + pageSize)
                      }
                    >
                      {t("common.loadMore", { defaultValue: "Load more" })}
                    </Button>
                  )}
                </>
              ) : (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  {t("common.noOptionsFound")}
                </p>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </>
  );
}
