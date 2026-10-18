import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Check } from "lucide-react";
import { apiClient, apiErrorMessage } from "@/shared/api/client";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { choiceLabel, type LabChoice } from "../api";

export function LabLookup({
  resource,
  selected,
  onSelect,
  label,
  phone,
  disabled,
}: {
  resource: string;
  selected?: LabChoice;
  onSelect: (choice: LabChoice) => void;
  label: string;
  phone?: string;
  disabled?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<LabChoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = window.setTimeout(
      async () => {
        try {
          const result = await apiClient.get<LabChoice[]>(
            `/laboratory/lookups/${resource}`,
            { params: { search, phone }, signal: controller.signal },
          );
          if (!controller.signal.aborted) setItems(result.data);
        } catch (cause) {
          if (!controller.signal.aborted) setError(apiErrorMessage(cause));
        } finally {
          if (!controller.signal.aborted) setLoading(false);
        }
      },
      search ? 250 : 0,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [open, search, phone, resource]);
  return (
    <Popover
      modal
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setSearch("");
          setItems([]);
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
          className="w-full justify-between"
          aria-label={label}
        >
          <span className="truncate">
            {selected ? choiceLabel(selected) : label}
          </span>
          <ChevronDown className="size-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        dir={i18n.dir()}
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-56 max-w-[calc(100vw-2rem)] p-2"
      >
        <Input
          value={search}
          aria-label={t("common.searchOptions")}
          placeholder={t("common.searchOptions")}
          onChange={(event) => {
            setSearch(event.target.value);
            setLoading(true);
            setError("");
          }}
        />
        <div className="mt-2 max-h-64 overflow-y-auto">
          {items.map((choice) => (
            <Button
              type="button"
              variant="ghost"
              key={choice.id}
              className="h-auto w-full justify-start text-start"
              onClick={() => {
                onSelect(choice);
                setOpen(false);
              }}
            >
              <Check
                className={`size-4 shrink-0 ${selected?.id === choice.id ? "" : "opacity-0"}`}
              />
              <span className="min-w-0 whitespace-normal break-words">
                {choiceLabel(choice)}
              </span>
            </Button>
          ))}
          {loading && (
            <p role="status" className="p-3 text-sm">
              {t("common.loading")}
            </p>
          )}
          {!loading && !items.length && !error && (
            <p role="status" className="p-3 text-sm">
              {t("common.noOptionsFound")}
            </p>
          )}
          {error && (
            <p role="alert" className="p-3 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
