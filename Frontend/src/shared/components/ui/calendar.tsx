import { useTranslation } from "react-i18next";
import { ar, ckb, enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, type DayPickerProps } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";
export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: DayPickerProps) {
  const { i18n, t } = useTranslation();
  const language = (i18n.resolvedLanguage || i18n.language).split("-")[0];
  return (
    <DayPicker
      locale={language === "ku" ? ckb : language === "ar" ? ar : enUS}
      dir={i18n.dir()}
      labels={{
        labelPrevious: () => t("datePicker.previousMonth"),
        labelNext: () => t("datePicker.nextMonth"),
      }}
      showOutsideDays={showOutsideDays}
      className={cn("relative p-3", className)}
      classNames={{
        months: "flex flex-col",
        month: "space-y-3",
        month_caption: "flex h-8 items-center justify-center px-10",
        caption_label: "text-sm font-semibold",
        nav: "pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-between px-3",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "pointer-events-auto size-8 p-0",
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "pointer-events-auto size-8 p-0",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "w-9 text-center text-[11px] font-normal text-muted-foreground",
        week: "mt-1 flex w-full",
        day: "relative size-9 p-0 text-center text-sm",
        day_button: "size-9 rounded-md font-normal hover:bg-accent",
        selected: "rounded-md bg-primary text-primary-foreground",
        range_start: "rounded-s-md bg-primary text-primary-foreground",
        range_end: "rounded-e-md bg-primary text-primary-foreground",
        range_middle: "rounded-none bg-primary/12 text-foreground",
        today: "rounded-md bg-accent text-accent-foreground",
        outside: "text-muted-foreground opacity-40",
        disabled: "text-muted-foreground opacity-40",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="size-4 rtl:rotate-180" />
          ) : (
            <ChevronRight className="size-4 rtl:rotate-180" />
          ),
      }}
      {...props}
    />
  );
}
