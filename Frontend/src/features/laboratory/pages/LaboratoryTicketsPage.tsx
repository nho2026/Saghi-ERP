import queueCallSound from "@/assets/sounds/queue_call.mp3";
import { io } from "socket.io-client";
import { apiBaseUrl } from "@/shared/api/base-url";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Ticket,
  Megaphone,
  Clock3,
  CheckCircle2,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { hasPermission, storedUser } from "@/features/auth/access";
import { apiErrorMessage } from "@/shared/api/client";
import { labApi } from "../api";

export default function LaboratoryTicketsPage({
  display = false,
}: {
  display?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const screen = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  useEffect(() => {
    const changed = () =>
      setFullscreen(document.fullscreenElement === screen.current);
    document.addEventListener("fullscreenchange", changed);
    return () => document.removeEventListener("fullscreenchange", changed);
  }, []);
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement === screen.current)
        await document.exitFullscreen();
      else await screen.current?.requestFullscreen();
    } catch {
      setError(t("laboratory.fullscreenUnavailable"));
    }
  };
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const soundAllowed = useRef(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const toggleSound = async () => {
    if (soundAllowed.current) {
      soundAllowed.current = false;
      setSoundEnabled(false);
      audioRef.current?.pause();
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.currentTime = 0;
      await audio.play();
      soundAllowed.current = true;
      setSoundEnabled(true);
    } catch {
      soundAllowed.current = false;
      setSoundEnabled(false);
    }
  };
  const navigate = useNavigate();
  const resource = useApiResource(
    useCallback(() => labApi.accountingQueue(), []),
  );
  const refresh = resource.refresh;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const canCall = hasPermission(storedUser(), "laboratory.display.call");
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    const audio = new Audio(queueCallSound);
    audio.preload = "auto";
    audioRef.current = audio;
    const base = new URL(apiBaseUrl, window.location.href);
    const socket = io(`${base.origin}/laboratory`, {
      path: "/api/socket.io",
      transports: ["websocket"],
      withCredentials: true,
      reconnection: true,
    });
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setConnected(false));
    socket.on("laboratory:changed", () => void refresh());
    socket.on("laboratory:ticket-called", () => {
      if (!display || !soundAllowed.current) return;
      audio.currentTime = 0;
      void audio.play().catch(() => {
        soundAllowed.current = false;
        setSoundEnabled(false);
      });
    });
    return () => {
      socket.disconnect();
      audio.pause();
      audioRef.current = null;
    };
  }, [refresh, display]);
  const tickets = resource.data?.tickets ?? [];
  const called = [...tickets]
    .filter((ticket) => ticket.accountingCalledAt)
    .sort(
      (a, b) =>
        Date.parse(b.accountingCalledAt!) - Date.parse(a.accountingCalledAt!),
    );
  const call = async (id: string) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await labApi.callTicket(id);
      await refresh();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div
      ref={screen}
      className={`w-full space-y-6 pb-6 ${fullscreen ? "h-screen overflow-y-auto bg-background p-6 sm:p-10" : ""}`}
    >
      <header
        dir="ltr"
        className="flex flex-row-reverse flex-wrap items-center justify-between gap-4"
      >
        <div dir={i18n.dir()}>
          <h1 className="text-2xl font-bold">
            {t(
              display
                ? "laboratory.ticketDisplay"
                : "laboratory.accountingTickets",
            )}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("laboratory.ticketQueueHint")} · {resource.data?.total ?? 0}
          </p>
        </div>
        <div dir={i18n.dir()} className="flex flex-wrap items-center gap-2">
          {display && (
            <Button
              variant="outline"
              onClick={() => void toggleSound()}
              aria-pressed={soundEnabled}
            >
              {soundEnabled ? (
                <Volume2 className="size-4" />
              ) : (
                <VolumeX className="size-4" />
              )}
              {t(
                soundEnabled
                  ? "laboratory.soundEnabled"
                  : "laboratory.enableSound",
              )}
            </Button>
          )}
          {display && (
            <Button variant="outline" onClick={() => void toggleFullscreen()}>
              {fullscreen ? (
                <Minimize className="size-4" />
              ) : (
                <Maximize className="size-4" />
              )}
              {t(
                fullscreen
                  ? "laboratory.exitFullscreen"
                  : "laboratory.fullscreen",
              )}
            </Button>
          )}
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${connected ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"}`}
          >
            <span
              className={`size-2 rounded-full ${connected ? "bg-emerald-500" : "bg-amber-500"}`}
            />
            {t(
              connected
                ? "laboratory.liveConnected"
                : "laboratory.liveReconnecting",
            )}
          </span>
          {!display && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate("/laboratory/display")}
              >
                {t("laboratory.ticketDisplay")}
              </Button>
              {canCall && (
                <Button
                  disabled={
                    busy ||
                    !tickets.some((ticket) => !ticket.accountingCalledAt)
                  }
                  onClick={() => {
                    const next = tickets.find(
                      (ticket) => !ticket.accountingCalledAt,
                    );
                    if (next) void call(next.id);
                  }}
                >
                  {t("laboratory.callNextTicket")}
                </Button>
              )}
            </div>
          )}
        </div>
      </header>
      {(error || resource.error) && (
        <p role="alert" className="text-destructive">
          {error || resource.error}
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            label: "laboratory.accountingTickets",
            value: resource.data?.total ?? 0,
            icon: Ticket,
            style: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
          },
          {
            label: "laboratory.ticketWaiting",
            value: tickets.filter((ticket) => !ticket.accountingCalledAt)
              .length,
            icon: Clock3,
            style:
              "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
          },
          {
            label: "laboratory.ticketCalled",
            value: called.length,
            icon: Megaphone,
            style:
              "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
          },
        ].map(({ label, value, icon: Icon, style }) => (
          <Card key={label} className="flex items-center gap-4 rounded-2xl p-5">
            <span className={`rounded-xl p-3 ${style}`}>
              <Icon className="size-6" />
            </span>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {t(label)}
              </p>
              <p className="mt-1 text-3xl font-bold tabular-nums">
                {resource.isLoading && !resource.data ? "…" : value}
              </p>
            </div>
          </Card>
        ))}
      </div>
      {display && (
        <section
          aria-live="polite"
          className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
        >
          {[
            ...called,
            ...tickets.filter((ticket) => !ticket.accountingCalledAt),
          ].map((ticket) => {
            const isCalled = Boolean(ticket.accountingCalledAt);
            return (
              <Card
                key={ticket.id}
                className={`relative flex min-h-64 flex-col justify-between overflow-hidden rounded-3xl p-6 ${isCalled ? "border-0 bg-linear-to-br from-teal-950 via-teal-800 to-teal-600 text-white shadow-lg shadow-teal-950/10" : "border-amber-200 bg-card dark:border-amber-900"}`}
              >
                <Ticket
                  aria-hidden="true"
                  className={`absolute -end-4 -top-4 size-32 rotate-12 ${isCalled ? "text-white/5" : "text-amber-500/5"}`}
                />
                <div className="relative flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${isCalled ? "bg-white/15" : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"}`}
                  >
                    {t(
                      isCalled
                        ? "laboratory.ticketCalled"
                        : "laboratory.ticketWaiting",
                    )}
                  </span>
                  {isCalled ? (
                    <Megaphone className="size-5 text-teal-200" />
                  ) : (
                    <Clock3 className="size-5 text-amber-500" />
                  )}
                </div>
                <p
                  className={`relative py-6 text-center text-7xl font-bold tracking-tight tabular-nums ${isCalled ? "text-white" : "text-foreground"}`}
                >
                  {String(ticket.queueNumber).padStart(3, "0")}
                </p>
                <div
                  className={`relative flex justify-between gap-2 border-t pt-4 text-xs ${isCalled ? "border-white/15 text-teal-100" : "border-border text-muted-foreground"}`}
                >
                  <span>{ticket.queueDay}</span>
                  <span>
                    {isCalled
                      ? new Date(ticket.accountingCalledAt!).toLocaleTimeString(
                          i18n.language,
                        )
                      : t("laboratory.ticketWaiting")}
                  </span>
                </div>
              </Card>
            );
          })}
        </section>
      )}
      {!display && (
        <>
          <section className="space-y-4" aria-live="polite">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Megaphone className="size-5 text-primary" />
              {t("laboratory.nowCalling")}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {called.slice(0, 3).map((ticket) => (
                <Card
                  key={ticket.id}
                  className="relative overflow-hidden rounded-3xl border-0 bg-linear-to-br from-teal-950 via-teal-800 to-teal-600 p-6 text-white shadow-lg shadow-teal-950/10"
                >
                  <Ticket
                    aria-hidden="true"
                    className="absolute -end-4 -top-4 size-32 rotate-12 text-white/5"
                  />
                  <div className="relative flex items-center justify-between gap-3">
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                      {t("laboratory.ticketCalled")}
                    </span>
                    <Megaphone className="size-5 text-teal-200" />
                  </div>
                  <p className="relative py-5 text-center text-7xl font-bold tracking-tight tabular-nums">
                    {String(ticket.queueNumber).padStart(3, "0")}
                  </p>
                  <div className="relative flex justify-between border-t border-white/15 pt-4 text-xs text-teal-100">
                    <span>{ticket.queueDay}</span>
                    <span>
                      {new Date(ticket.accountingCalledAt!).toLocaleTimeString(
                        i18n.language,
                      )}
                    </span>
                  </div>
                </Card>
              ))}
              {!called.length && (
                <Card className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-3xl border-dashed p-6 text-center md:col-span-2 xl:col-span-3">
                  <span className="rounded-2xl bg-primary/10 p-4">
                    <Megaphone className="size-7 text-primary" />
                  </span>
                  <p className="font-semibold">
                    {t("laboratory.noCalledTickets")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("laboratory.watchTicketDisplay")}
                  </p>
                </Card>
              )}
            </div>
          </section>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Clock3 className="size-5 text-amber-600" />
            {t("laboratory.ticketWaiting")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {(display
              ? tickets.filter((ticket) => !ticket.accountingCalledAt)
              : tickets
            ).map((ticket) => (
              <Card
                key={ticket.id}
                className={`space-y-3 rounded-2xl border-t-4 border-t-amber-400 p-5 ${ticket.accountingCalledAt ? "border-teal-300 bg-teal-50 dark:border-teal-700 dark:bg-teal-950" : ""}`}
              >
                <div className="flex justify-between gap-3">
                  <p className="text-4xl font-bold tabular-nums text-primary">
                    {String(ticket.queueNumber).padStart(3, "0")}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {ticket.queueDay}
                  </span>
                </div>
                <p className="text-sm font-medium">
                  {t(
                    ticket.accountingCalledAt
                      ? "laboratory.ticketCalled"
                      : "laboratory.ticketWaiting",
                  )}
                </p>
                {!display && (
                  <>
                    <p className="font-medium">
                      {ticket.patient.firstName} {ticket.patient.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {ticket.invoice.invoiceNumber} ·{" "}
                      {ticket.invoice.balanceAmount} {ticket.invoice.currency}
                    </p>
                    {canCall && (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          disabled={busy}
                          onClick={() => void call(ticket.id)}
                        >
                          {t(
                            ticket.accountingCalledAt
                              ? "laboratory.recallTicket"
                              : "laboratory.callTicket",
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            navigate(
                              `/laboratory/accounting?orderId=${ticket.id}`,
                            )
                          }
                        >
                          {t("laboratory.payment")}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </Card>
            ))}
          </div>
        </>
      )}
      {!resource.isLoading && !tickets.length && (
        <Card className="flex flex-col items-center gap-3 rounded-2xl p-8 text-center">
          <CheckCircle2 className="size-10 text-primary" />
          <p className="font-semibold">{t("laboratory.noWaitingTickets")}</p>
          <p className="text-sm text-muted-foreground">
            {t("laboratory.watchTicketDisplay")}
          </p>
        </Card>
      )}
    </div>
  );
}
