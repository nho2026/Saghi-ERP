import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

type MonthPickerProps = {
  value: string;
  onValueChange: (value: string) => void;
  locale?: string;
  label?: string;
  className?: string;
};

const parseMonth = (value: string) => {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  const year = Number(match?.[1]);
  const month = Number(match?.[2]) - 1;
  const valid = Number.isInteger(year) && month >= 0 && month <= 11;
  const now = new Date();
  return valid
    ? { year, month }
    : { year: now.getFullYear(), month: now.getMonth() };
};

export function MonthPicker({
  value,
  onValueChange,
  locale,
  label,
  className,
}: MonthPickerProps) {
  const { t, i18n } = useTranslation();
  const language = locale || i18n.resolvedLanguage || i18n.language;
  const dateLocale = language.split("-")[0] === "ku" ? "ckb-IQ" : language;
  const pickerLabel = label || t("monthPicker.selectMonth");
  const selected = parseMonth(value);
  const [open, setOpen] = useState(false);
  const [visibleYear, setVisibleYear] = useState(selected.year);
  const formatter = useMemo(
    () => new Intl.DateTimeFormat(dateLocale, { month: "short" }),
    [dateLocale],
  );
  const displayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(dateLocale, { month: "long", year: "numeric" }),
    [dateLocale],
  );
  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, month) =>
        formatter.format(new Date(2020, month, 1)),
      ),
    [formatter],
  );

  const selectMonth = (month: number) => {
    onValueChange(
      `${new Intl.NumberFormat(dateLocale, { useGrouping: false }).format(visibleYear)}-${String(month + 1).padStart(2, "0")}`,
    );
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) setVisibleYear(parseMonth(value).year);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={pickerLabel}
          className={cn(
            "h-11 min-w-48 justify-start gap-2 bg-background font-medium shadow-sm",
            className,
          )}
        >
          <CalendarDays className="size-4 text-muted-foreground" />
          {displayFormatter.format(new Date(selected.year, selected.month, 1))}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="end" dir={i18n.dir()}>
        <div className="mb-3 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            aria-label={t("monthPicker.previousYear")}
            onClick={() => setVisibleYear((year) => year - 1)}
          >
            <ChevronLeft className="size-4 rtl:rotate-180" />
          </Button>
          <span className="text-sm font-semibold tabular-nums">
            {new Intl.NumberFormat(dateLocale, { useGrouping: false }).format(
              visibleYear,
            )}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            aria-label={t("monthPicker.nextYear")}
            onClick={() => setVisibleYear((year) => year + 1)}
          >
            <ChevronRight className="size-4 rtl:rotate-180" />
          </Button>
        </div>
        <div
          className="grid grid-cols-3 gap-1"
          role="grid"
          aria-label={pickerLabel}
        >
          {months.map((name, month) => {
            const active =
              selected.year === visibleYear && selected.month === month;
            return (
              <Button
                key={month}
                type="button"
                variant={active ? "default" : "ghost"}
                className="h-9 text-xs"
                aria-pressed={active}
                onClick={() => selectMonth(month)}
              >
                {name}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
