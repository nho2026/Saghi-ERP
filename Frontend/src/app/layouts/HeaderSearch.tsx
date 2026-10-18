import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

import { searchSystemRecords } from "./system-search";
type Result = { title: string; detail: string; to: string };
export function HeaderSearch({
  menus,
  onNavigate,
}: {
  menus: { label: string; to: string }[];
  onNavigate: (to: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [records, setRecords] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const menusRef = useRef(menus);
  menusRef.current = menus;
  const resultsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const term = query.trim();
    const timer = window.setTimeout(async () => {
      setRecords([]);
      setFailed(false);
      if (!open || term.length < 2) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const responses = await searchSystemRecords(
        term,
        menusRef.current,
        t,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      setRecords(
        responses.flatMap((response) =>
          response.status === "fulfilled" ? response.value : [],
        ),
      );
      setFailed(responses.some((response) => response.status === "rejected"));
      setLoading(false);
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, open, t]);
  const term = query.trim().toLocaleLowerCase();
  const matching = menus
    .filter((menu) => t(menu.label).toLocaleLowerCase().includes(term))
    .slice(0, 12);
  const go = (to: string) => {
    setOpen(false);
    setQuery("");
    setRecords([]);
    onNavigate(to);
  };
  return (
    <>
      <Button
        variant="outline"
        className="ms-auto shrink-0 h-10 w-10 justify-start gap-3 rounded-full bg-muted/40 text-muted-foreground md:w-64"
        onClick={() => setOpen(true)}
        aria-label={t("globalSearch.title")}
      >
        <Search className="size-4 shrink-0" />
        <span className="hidden flex-1 text-start text-xs md:block">
          {t("globalSearch.title")}
        </span>
        <kbd className="hidden text-[10px] md:block">⌘ K</kbd>
      </Button>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          if (!value) {
            setQuery("");
            setRecords([]);
          }
        }}
      >
        <DialogContent
          dir={i18n.dir()}
          className="flex max-h-[80dvh] flex-col overflow-hidden p-0 sm:max-w-2xl"
        >
          <DialogHeader className="px-5 pt-5">
            <DialogTitle>{t("globalSearch.title")}</DialogTitle>
          </DialogHeader>
          <div className="px-5">
            <Input
              autoFocus
              placeholder={t("globalSearch.placeholder")}
              aria-label={t("globalSearch.title")}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setRecords([]);
                setLoading(event.target.value.trim().length >= 2);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  resultsRef.current
                    ?.querySelector<HTMLButtonElement>("button")
                    ?.focus();
                }
              }}
            />
          </div>
          <ScrollArea className="min-h-0 max-h-[60dvh] [&_[data-radix-scroll-area-viewport]]:max-h-[60dvh]">
            <div
              ref={resultsRef}
              className="space-y-4 p-5"
              onKeyDown={(event) => {
                if (!["ArrowUp", "ArrowDown"].includes(event.key)) return;
                event.preventDefault();
                const buttons = Array.from(
                  resultsRef.current?.querySelectorAll<HTMLButtonElement>(
                    "button",
                  ) ?? [],
                );
                const index = buttons.indexOf(
                  document.activeElement as HTMLButtonElement,
                );
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
              <section>
                <h3 className="mb-2 text-xs font-semibold text-muted-foreground">
                  {t("globalSearch.menus")}
                </h3>
                {matching.map((menu) => (
                  <Button
                    key={menu.to}
                    variant="ghost"
                    className="h-auto min-h-10 w-full justify-start whitespace-normal text-start"
                    onClick={() => go(menu.to)}
                  >
                    {t(menu.label)}
                  </Button>
                ))}
              </section>
              <section>
                <h3 className="mb-2 text-xs font-semibold text-muted-foreground">
                  {t("globalSearch.records")}
                </h3>
                {loading && (
                  <p role="status" className="text-sm text-muted-foreground">
                    {t("resourceState.loading")}
                  </p>
                )}
                {records.map((record, index) => (
                  <Button
                    key={`${record.to}:${index}`}
                    variant="ghost"
                    className="h-auto w-full flex-col items-start gap-1 whitespace-normal py-3 text-start"
                    onClick={() => go(record.to)}
                  >
                    <span>{record.title}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {record.detail}
                    </span>
                  </Button>
                ))}
                {query.trim().length < 2 && (
                  <p className="text-sm text-muted-foreground">
                    {t("globalSearch.hint")}
                  </p>
                )}
                {failed && (
                  <p role="alert" className="text-sm text-destructive">
                    {t("globalSearch.failed")}
                  </p>
                )}
                {!loading && term.length >= 2 && !records.length && (
                  <p className="text-sm text-muted-foreground">
                    {t("resourceState.notFound")}
                  </p>
                )}
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
