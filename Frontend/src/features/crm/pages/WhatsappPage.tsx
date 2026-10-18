import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageCircle,
  RefreshCw,
  Search,
  Send,
  Phone,
  UserRound,
  Inbox,
  Check,
  CheckCheck,
  Clock3,
  CircleAlert,
  Image,
  FileText,
  Mic,
  Video,
  ArrowLeft,
  ExternalLink,
  Camera as Instagram,
  Paperclip,
  Square,
  X,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { toast } from "sonner";
import { whatsappApi, type WhatsappConversation } from "../api/whatsapp.api";
import { apiErrorMessage } from "@/shared/api/client";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Textarea } from "@/shared/components/ui/textarea";
import { hasPermission, storedUser } from "@/features/auth/access";
import {
  WhatsappIcon,
  MessengerIcon,
  TiktokIcon,
} from "../components/InboxChannelIcons";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

const channelLabels = {
  whatsapp: "WhatsApp",
  messenger: "Messenger",
  instagram: "Instagram",
  tiktok: "TikTok",
};
const channelIcons = {
  whatsapp: WhatsappIcon,
  messenger: MessengerIcon,
  instagram: Instagram,
  tiktok: TiktokIcon,
};
function ChannelIcon({
  channel,
  className,
}: {
  channel: WhatsappConversation["channel"];
  className?: string;
}) {
  const Icon = channelIcons[channel] ?? MessageCircle;
  return <Icon className={className} />;
}

function Attachment({
  id,
  type,
  label,
}: {
  id: string;
  type: string;
  label: string;
}) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  return (
    <div className="mt-2">
      {url ? (
        type === "audio" ? (
          <audio controls src={url} className="max-w-full" />
        ) : type === "video" ? (
          <video controls src={url} className="max-h-64 max-w-full" />
        ) : type === "image" ? (
          <img src={url} alt={label} className="max-h-64 rounded-lg" />
        ) : (
          <a href={url} download={label} className="underline">
            {label}
          </a>
        )
      ) : (
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          className="gap-2 text-foreground"
          onClick={async () => {
            setBusy(true);
            try {
              setUrl(URL.createObjectURL(await whatsappApi.media(id)));
            } catch (error) {
              toast.error(apiErrorMessage(error));
            } finally {
              setBusy(false);
            }
          }}
        >
          <Download className="size-3" />
          {label}
        </Button>
      )}
    </div>
  );
}

export default function WhatsappPage() {
  const { t, i18n } = useTranslation();
  const tr = (key: string) => t(`whatsappInbox.${key}`);
  const time = (value: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  const messageLabel = (value: string) =>
    t(`whatsappInbox.${value}`, { defaultValue: tr("unknown") });
  const conversations = useApiResource(
    useCallback(() => whatsappApi.conversations(), []),
  );
  const status = useApiResource(useCallback(() => whatsappApi.status(), []));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<WhatsappConversation | null>(null);
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("all");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState(600);
  const fileInput = useRef<HTMLInputElement>(null);
  const [attachment, setAttachment] = useState<{
    file: File;
    voice: boolean;
  } | null>(null);
  const [preview, setPreview] = useState("");
  const [recording, setRecording] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const tracks = useRef<MediaStream | null>(null);
  const recordingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [call, setCall] = useState<"voice" | "video" | null>(null);
  useEffect(() => {
    const resize = () => {
      if (panel.current)
        setPanelHeight(
          Math.max(
            380,
            window.innerHeight - panel.current.getBoundingClientRect().top - 24,
          ),
        );
    };
    resize();
    window.addEventListener("resize", resize);
    const observer = new ResizeObserver(resize);
    if (panel.current?.parentElement)
      observer.observe(panel.current.parentElement);
    return () => {
      window.removeEventListener("resize", resize);
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    let active = true;
    const url = attachment ? URL.createObjectURL(attachment.file) : "";
    queueMicrotask(() => {
      if (active) setPreview(url);
    });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [attachment]);
  useEffect(
    () => () => {
      if (recordingTimer.current) clearTimeout(recordingTimer.current);
      if (recorder.current?.state === "recording") recorder.current.stop();
      tracks.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  const [detailError, setDetailError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const request = useRef(0);
  const end = useRef<HTMLDivElement>(null);
  const channelAvailable = selected?.channel === "whatsapp" && !selected.isDemo;
  const canSend =
    hasPermission(storedUser(), "crm.whatsapp.send") && channelAvailable;
  const canViewLead = hasPermission(storedUser(), "crm.leads.view");
  const name = (item: WhatsappConversation) =>
    item.profileName || item.lead?.name || `+${item.phone}`;
  const initials = (value: string) =>
    value
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  const clock = (value: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Asia/Baghdad",
    }).format(new Date(value));
  const day = (value: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      dateStyle: "medium",
      timeZone: "Asia/Baghdad",
    }).format(new Date(value));
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [selected]);
  const openConversation = useCallback(async (id: string) => {
    const current = ++request.current;
    setAttachment(null);
    if (recorder.current?.state === "recording") recorder.current.stop();
    setSelectedId(id);
    setSelected(null);
    setDraft("");
    setDetailLoading(true);
    setDetailError("");
    try {
      const data = await whatsappApi.conversation(id);
      if (request.current === current) setSelected(data);
    } catch (error) {
      if (request.current === current) setDetailError(apiErrorMessage(error));
    } finally {
      if (request.current === current) setDetailLoading(false);
    }
  }, []);
  useEffect(() => {
    if (
      !selectedId &&
      request.current === 0 &&
      conversations.data?.[0] &&
      window.matchMedia("(min-width: 768px)").matches
    )
      void openConversation(conversations.data[0].id);
  }, [conversations.data, openConversation, selectedId]);
  const refreshConversations = conversations.refresh;
  useEffect(() => {
    let active = true;
    let running = false;
    const refreshInbox = async () => {
      if (running || document.hidden || sending || detailLoading) return;
      running = true;
      const current = request.current;
      try {
        await Promise.all([
          refreshConversations(),
          selectedId
            ? whatsappApi
                .conversation(selectedId)
                .then((data) => {
                  if (active && current === request.current) {
                    setSelected((previous) =>
                      JSON.stringify(previous) === JSON.stringify(data)
                        ? previous
                        : data,
                    );
                    setDetailError("");
                  }
                })
                .catch((error: unknown) => {
                  if (active && current === request.current)
                    setDetailError(apiErrorMessage(error));
                })
            : Promise.resolve(),
        ]);
      } finally {
        running = false;
      }
    };
    const timer = window.setInterval(() => {
      void refreshInbox();
    }, 5000);
    const onVisible = () => {
      if (!document.hidden) void refreshInbox();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [selectedId, refreshConversations, sending, detailLoading]);
  const rows = (conversations.data ?? []).filter(
    (item) =>
      (channel === "all" || item.channel === channel) &&
      `${item.profileName ?? ""} ${item.phone} ${item.lead?.code ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const recordVoice = async () => {
    if (recorder.current?.state === "recording") {
      recorder.current.stop();
      return;
    }
    const current = request.current;
    try {
      if (
        !navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === "undefined"
      )
        throw new Error(tr("microphoneUnavailable"));
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (request.current !== current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      tracks.current = stream;
      const mimeType = [
        "audio/webm;codecs=opus",
        "audio/ogg;codecs=opus",
        "audio/mp4",
      ].find((type) => MediaRecorder.isTypeSupported(type));
      if (!mimeType) {
        stream.getTracks().forEach((track) => track.stop());
        throw new Error(tr("microphoneUnavailable"));
      }
      const media = new MediaRecorder(stream, { mimeType });
      recorder.current = media;
      const chunks: BlobPart[] = [];
      media.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      media.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        if (recordingTimer.current) clearTimeout(recordingTimer.current);
        setRecording(false);
        if (current === request.current)
          setAttachment({
            file: new File(
              chunks,
              "voice." +
                (mimeType.includes("mp4")
                  ? "mp4"
                  : mimeType.includes("ogg")
                    ? "ogg"
                    : "webm"),
              { type: mimeType },
            ),
            voice: true,
          });
      };
      media.start();
      setRecording(true);
      setAttachment(null);
      recordingTimer.current = setTimeout(() => {
        if (media.state === "recording") media.stop();
      }, 300000);
    } catch (error) {
      tracks.current?.getTracks().forEach((track) => track.stop());
      toast.error(
        error instanceof Error ? error.message : tr("microphoneUnavailable"),
      );
    }
  };
  const send = async () => {
    if (
      !selected ||
      (!draft.trim() && !attachment) ||
      recording ||
      sending ||
      !canSend
    )
      return;
    const current = request.current;
    setSending(true);
    try {
      if (attachment)
        await whatsappApi.sendFile(
          selected.id,
          attachment.file,
          draft.trim(),
          attachment.voice,
        );
      else await whatsappApi.send(selected.id, draft.trim());
      if (current === request.current) {
        setDraft("");
        setAttachment(null);
        await openConversation(selected.id);
      }
      await conversations.refresh();
      toast.success(tr("sentSuccess"));
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setSending(false);
    }
  };
  return (
    <div className="space-y-4" dir={i18n.dir()}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Inbox className="size-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{tr("title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {tr("subtitle")}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            void conversations.refresh();
            void status.refresh();
            if (selectedId) void openConversation(selectedId);
          }}
        >
          <RefreshCw
            className={`size-4 ${conversations.isLoading ? "animate-spin" : ""}`}
          />
          {tr("refresh")}
        </Button>
      </div>
      {conversations.error && (
        <Card
          role="alert"
          className="border-destructive p-4 text-sm text-destructive"
        >
          {conversations.error}
        </Card>
      )}
      <Card
        ref={panel}
        style={{ height: panelHeight }}
        className="grid min-h-0 overflow-hidden rounded-2xl border shadow-sm md:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_260px]"
      >
        <aside
          className={`min-h-0 flex-col border-e bg-card ${selectedId ? "hidden md:flex" : "flex"}`}
        >
          <div className="space-y-4 border-b p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{tr("conversations")}</h2>
              <Badge variant="secondary">
                {conversations.data?.length ?? 0}
              </Badge>
            </div>
            <div className="relative">
              <Search className="absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={tr("search")}
                aria-label={tr("search")}
                className="rounded-xl bg-muted/40 ps-9"
              />
            </div>
            <div
              className="grid grid-cols-2 gap-1.5"
              aria-label={tr("channel")}
            >
              {[
                { id: "all", label: tr("allChannels"), Icon: Inbox },
                { id: "whatsapp", label: "WhatsApp", Icon: WhatsappIcon },
                { id: "messenger", label: "Messenger", Icon: MessengerIcon },
                { id: "instagram", label: "Instagram", Icon: Instagram },
                { id: "tiktok", label: "TikTok", Icon: TiktokIcon },
              ].map(({ id, label, Icon }) => (
                <Button
                  key={id}
                  variant={channel === id ? "secondary" : "ghost"}
                  size="sm"
                  aria-pressed={channel === id}
                  onClick={() => {
                    setChannel(id);
                    request.current++;
                    setSelectedId(null);
                    setSelected(null);
                    setDetailError("");
                    setDetailLoading(false);
                    setDraft("");
                    setAttachment(null);
                    if (recorder.current?.state === "recording")
                      recorder.current.stop();
                  }}
                  className="justify-start gap-2 px-2 text-xs"
                >
                  <Icon
                    className={`size-3.5 ${id === "whatsapp" ? "text-emerald-600" : id === "messenger" ? "text-blue-500" : id === "instagram" ? "text-pink-500" : ""}`}
                  />
                  {label}
                </Button>
              ))}
            </div>
          </div>
          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-1 p-2">
              {rows.map((item) => {
                const last = item.messages[0];
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    onClick={() => void openConversation(item.id)}
                    aria-pressed={selectedId === item.id}
                    className={`h-auto w-full justify-start gap-3 rounded-xl p-3 text-start whitespace-normal ${selectedId === item.id ? "bg-primary/10 hover:bg-primary/15" : ""}`}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="size-11">
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                          {initials(name(item))}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={`absolute -bottom-1 -end-1 grid size-6 place-items-center rounded-full bg-card shadow-sm ring-1 ring-border ${item.channel === "whatsapp" ? "text-emerald-600" : item.channel === "messenger" ? "text-blue-500" : item.channel === "instagram" ? "text-pink-500" : "text-foreground"}`}
                      >
                        <ChannelIcon
                          channel={item.channel}
                          className="size-[18px]"
                        />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold">
                          {name(item)}
                        </span>
                        <time className="ms-auto shrink-0 text-[10px] font-normal text-muted-foreground">
                          {clock(item.lastMessageAt)}
                        </time>
                      </div>
                      <p className="mt-1 truncate text-xs font-normal text-muted-foreground">
                        {last?.direction === "outbound" && (
                          <Check className="me-1 inline size-3" />
                        )}
                        {last?.body ||
                          messageLabel(last?.messageType || "unknown")}
                      </p>
                      <p
                        className="mt-1 text-[10px] font-normal text-muted-foreground"
                        dir="ltr"
                      >
                        +{item.phone}
                      </p>
                    </div>
                  </Button>
                );
              })}
              {!rows.length && (
                <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                  <Inbox className="mx-auto mb-3 size-8 opacity-40" />
                  {conversations.isLoading
                    ? tr("loading")
                    : channel === "messenger" ||
                        channel === "instagram" ||
                        channel === "tiktok"
                      ? tr("notConnected")
                      : search
                        ? tr("noMatches")
                        : tr("empty")}
                </div>
              )}
            </div>
          </ScrollArea>
        </aside>
        <section
          className={`min-h-0 min-w-0 flex-col ${selectedId ? "flex" : "hidden md:flex"}`}
        >
          <header className="flex min-h-20 items-center gap-3 border-b px-5 py-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label={tr("backToInbox")}
              onClick={() => {
                request.current++;
                setSelectedId(null);
                setSelected(null);
              }}
            >
              <ArrowLeft className="size-4 rtl:rotate-180" />
            </Button>
            {selected ? (
              <>
                <Avatar className="size-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {initials(name(selected))}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">{name(selected)}</h2>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ChannelIcon
                      channel={selected.channel}
                      className="size-3"
                    />
                    {channelLabels[selected.channel]} ·{" "}
                    <span dir="ltr">+{selected.phone}</span>
                  </p>
                </div>
                {canSend && (
                  <div className="ms-auto flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title={tr("voiceCall")}
                      aria-label={tr("voiceCall")}
                      onClick={() => setCall("voice")}
                    >
                      <Phone className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title={tr("videoCall")}
                      aria-label={tr("videoCall")}
                      onClick={() => setCall("video")}
                    >
                      <Video className="size-4" />
                    </Button>
                  </div>
                )}
                {selected.lead && canViewLead && (
                  <Button
                    asChild
                    variant="outline"
                    size="icon"
                    className="ms-auto"
                    aria-label={tr("openProfile")}
                  >
                    <Link to={`/crm/leads/${selected.lead.id}`}>
                      <ExternalLink className="size-4" />
                    </Link>
                  </Button>
                )}
              </>
            ) : (
              <h2 className="font-semibold">{tr("conversations")}</h2>
            )}
          </header>
          <ScrollArea className="min-h-0 flex-1 bg-muted/25">
            <div className="mx-auto max-w-3xl space-y-4 px-5 py-6 lg:px-8">
              {detailLoading ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  {tr("loading")}
                </p>
              ) : detailError ? (
                <div
                  role="alert"
                  className="py-10 text-center text-sm text-destructive"
                >
                  {detailError}
                  <Button
                    variant="outline"
                    className="mx-auto mt-3 flex"
                    onClick={() =>
                      selectedId && void openConversation(selectedId)
                    }
                  >
                    {tr("refresh")}
                  </Button>
                </div>
              ) : selected ? (
                selected.messages.map((message, index) => {
                  const outgoing = message.direction === "outbound";
                  const Icon =
                    (
                      {
                        image: Image,
                        document: FileText,
                        audio: Mic,
                        video: Video,
                      } as Record<string, typeof Image>
                    )[message.messageType] || MessageCircle;
                  const StatusIcon =
                    message.status === "read" || message.status === "delivered"
                      ? CheckCheck
                      : message.status === "failed"
                        ? CircleAlert
                        : message.status === "pending"
                          ? Clock3
                          : Check;
                  return (
                    <div key={message.id}>
                      {(index === 0 ||
                        day(selected.messages[index - 1].sentAt) !==
                          day(message.sentAt)) && (
                        <div className="mb-6 mt-2 text-center">
                          <span className="rounded-full border bg-card px-3 py-1 text-[11px] text-muted-foreground">
                            {day(message.sentAt)}
                          </span>
                        </div>
                      )}
                      <div
                        className={`flex items-end gap-2 ${outgoing ? "flex-row-reverse" : ""}`}
                      >
                        <Avatar className="size-7 shrink-0">
                          <AvatarFallback className="bg-card text-[9px]">
                            {outgoing ? (
                              <UserRound className="size-3.5" />
                            ) : (
                              initials(name(selected))
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm sm:max-w-[75%] ${outgoing ? "rounded-ee-sm bg-primary text-primary-foreground" : "rounded-es-sm border bg-card"}`}
                        >
                          {message.messageType !== "text" && (
                            <div className="mb-2 flex items-center gap-2 text-xs">
                              <Icon className="size-4" />
                              {messageLabel(message.messageType)}
                            </div>
                          )}
                          <p
                            dir="auto"
                            className="whitespace-pre-wrap break-words"
                          >
                            {message.body || messageLabel(message.messageType)}
                          </p>
                          {["image", "audio", "video", "document"].includes(
                            message.messageType,
                          ) && (
                            <Attachment
                              id={message.id}
                              type={message.messageType}
                              label={
                                message.body ||
                                messageLabel(message.messageType)
                              }
                            />
                          )}
                          <div
                            className={`mt-2 flex items-center justify-end gap-1.5 text-[10px] ${outgoing ? "text-primary-foreground/75" : "text-muted-foreground"}`}
                          >
                            <time title={time(message.sentAt)}>
                              {clock(message.sentAt)}
                            </time>
                            {outgoing && (
                              <StatusIcon
                                className="size-3.5"
                                aria-label={messageLabel(message.status)}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 text-center text-muted-foreground">
                  <MessageCircle className="mx-auto mb-4 size-10 opacity-40" />
                  {channel === "messenger" ||
                  channel === "instagram" ||
                  channel === "tiktok"
                    ? tr("notConnected")
                    : tr("selectConversation")}
                </div>
              )}
              <div ref={end} />
            </div>
          </ScrollArea>
          <div className="border-t bg-card p-4">
            {(!status.data?.configured ||
              !channelAvailable ||
              status.error) && (
              <p className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                <CircleAlert className="size-3.5 shrink-0" />
                {selected?.isDemo
                  ? tr("demoReadOnly")
                  : selected && !channelAvailable
                    ? tr("notConnected")
                    : status.error || tr("channelUnavailable")}
              </p>
            )}
            {attachment && (
              <div className="mb-2 flex items-center gap-2 rounded-lg border p-2 text-xs">
                <Paperclip className="size-4" />
                <span className="min-w-0 flex-1 truncate">
                  {attachment.file.name}
                </span>
                {attachment.voice && preview && (
                  <audio controls src={preview} className="h-8 max-w-[60%]" />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={tr("removeAttachment")}
                  onClick={() => setAttachment(null)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            )}
            {recording && (
              <p role="status" className="mb-2 text-xs text-destructive">
                {tr("recording")}
              </p>
            )}
            <input
              ref={fileInput}
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,video/mp4,video/3gpp,audio/*,.pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  if (file.size > 16 * 1024 * 1024)
                    toast.error(tr("fileTooLarge"));
                  else setAttachment({ file, voice: false });
                }
                event.target.value = "";
              }}
            />
            <div className="flex items-end gap-3 rounded-xl border bg-muted/20 p-2">
              <Button
                permission="send"
                variant="ghost"
                size="icon"
                aria-label={tr("attachFile")}
                title={tr("attachFile")}
                disabled={
                  !selected ||
                  !status.data?.configured ||
                  !channelAvailable ||
                  sending ||
                  recording
                }
                onClick={() => fileInput.current?.click()}
              >
                <Paperclip className="size-4" />
              </Button>
              <Button
                permission="send"
                variant={recording ? "destructive" : "ghost"}
                size="icon"
                aria-label={recording ? tr("stopRecording") : tr("recordVoice")}
                title={recording ? tr("stopRecording") : tr("recordVoice")}
                disabled={
                  !selected ||
                  !status.data?.configured ||
                  !channelAvailable ||
                  sending
                }
                onClick={() => void recordVoice()}
              >
                {recording ? (
                  <Square className="size-4" />
                ) : (
                  <Mic className="size-4" />
                )}
              </Button>

              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    void send();
                  }
                }}
                placeholder={tr("compose")}
                aria-label={tr("compose")}
                className="min-h-12 max-h-32 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
                disabled={
                  !selected ||
                  !status.data?.configured ||
                  !channelAvailable ||
                  sending ||
                  !canSend
                }
              />
              <Button
                permission="send"
                size="icon"
                className="mb-1 shrink-0 rounded-xl"
                aria-label={tr("send")}
                onClick={() => void send()}
                disabled={
                  !selected ||
                  (!draft.trim() && !attachment) ||
                  recording ||
                  !status.data?.configured ||
                  !channelAvailable ||
                  sending
                }
              >
                <Send className="size-4 rtl:rotate-180" />
              </Button>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              {tr("composeHint")}
            </p>
          </div>
        </section>
        <aside className="hidden min-h-0 flex-col border-s bg-card xl:flex">
          <div className="flex h-20 items-center gap-2 border-b px-5 text-sm font-semibold">
            <UserRound className="size-4 text-muted-foreground" />
            {tr("contactProfile")}
          </div>
          {selected && (
            <div className="space-y-6 p-5">
              <div className="text-center">
                <Avatar className="mx-auto size-20">
                  <AvatarFallback className="bg-primary/10 text-2xl text-primary">
                    {initials(name(selected))}
                  </AvatarFallback>
                </Avatar>
                <h3 className="mt-4 break-words font-semibold">
                  {name(selected)}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {tr("contact")}
                </p>
                {selected.lead && (
                  <Badge variant="secondary" className="mt-3">
                    {selected.lead.status}
                  </Badge>
                )}
              </div>
              <div className="space-y-4 border-t pt-5">
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {tr("phone")}
                  </p>
                  <p className="flex items-center gap-2 text-xs">
                    <Phone className="size-3.5 text-muted-foreground" />
                    <span dir="ltr">+{selected.phone}</span>
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {tr("channel")}
                  </p>
                  <p className="flex items-center gap-2 text-xs">
                    <ChannelIcon
                      channel={selected.channel}
                      className="size-3.5"
                    />
                    {channelLabels[selected.channel]}
                  </p>
                </div>
                {selected.lead && (
                  <div>
                    <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                      {tr("leadCode")}
                    </p>
                    <p className="break-all text-xs">{selected.lead.code}</p>
                  </div>
                )}
              </div>
              {selected.lead && canViewLead && (
                <Button asChild variant="outline" className="w-full gap-2">
                  <Link to={`/crm/leads/${selected.lead.id}`}>
                    <ExternalLink className="size-3.5" />
                    {tr("openProfile")}
                  </Link>
                </Button>
              )}
            </div>
          )}
        </aside>
      </Card>
      <Dialog
        open={Boolean(call)}
        onOpenChange={(open) => {
          if (!open) setCall(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {call === "video" ? tr("videoCall") : tr("voiceCall")}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {tr("callExternalHelp")}
          </p>
          <Button
            onClick={() => {
              if (!selected) return;
              const url = `https://web.whatsapp.com/send?phone=${encodeURIComponent(selected.phone)}`;
              if (window.electronWindow?.openWhatsapp)
                void window.electronWindow.openWhatsapp(selected.phone);
              else window.open(url, "_blank", "noopener,noreferrer");
              setCall(null);
            }}
          >
            {tr("openWhatsapp")}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
