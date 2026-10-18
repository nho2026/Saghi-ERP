import { randomId } from "@/shared/lib/random-id";
import {
  loadSettings,
  useSettings,
  settingsSnapshot,
} from "@/features/settings/settings";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { io, type Socket } from "socket.io-client";
import {
  Camera,
  CameraOff,
  CalendarDays,
  Clock3,
  Copy,
  FileUp,
  History,
  KeyRound,
  LogOut,
  Maximize2,
  MessageSquare,
  Mic,
  MicOff,
  Minimize2,
  MonitorUp,
  Plus,
  Radio,
  Send,
  ShieldCheck,
  SwitchCamera,
  Users,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  meetingsApi,
  type Meeting,
  type MeetingDepartment,
} from "../api/meetings.api";
import { apiErrorMessage } from "@/shared/api/client";
import { Button } from "@/shared/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { hasPermission, storedUser } from "@/features/auth/access";

type Peer = { id: string; name: string };
type ChatItem = {
  id: string;
  sender: string;
  text?: string;
  fileName?: string;
  fileUrl?: string;
  fileType?: string;
  at: string;
};
type JoinReply = {
  ok: boolean;
  message?: string;
  meeting?: Meeting;
  peers?: Peer[];
  self?: Peer;
};
type IncomingFile = { name: string; type: string; chunks: string[] };

const socketUrl =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(
    /\/api\/?$/,
    "",
  ) ||
  (window.location.protocol === "file:"
    ? "http://192.168.1.90:4000"
    : undefined);
const rtcConfig: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    ...(import.meta.env.VITE_TURN_URL
      ? [
          {
            urls: import.meta.env.VITE_TURN_URL,
            username: import.meta.env.VITE_TURN_USERNAME,
            credential: import.meta.env.VITE_TURN_CREDENTIAL,
          },
        ]
      : []),
  ],
};

function VideoTile({
  stream,
  label,
  muted = false,
  speaking = false,
}: {
  stream: MediaStream;
  label: string;
  muted?: boolean;
  speaking?: boolean;
}) {
  const { t } = useTranslation();
  const ref = useRef<HTMLVideoElement>(null);
  const tileRef = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    const updateFullscreen = () =>
      setFullscreen(document.fullscreenElement === tileRef.current);
    document.addEventListener("fullscreenchange", updateFullscreen);
    return () =>
      document.removeEventListener("fullscreenchange", updateFullscreen);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement === tileRef.current) {
        await document.exitFullscreen();
      } else {
        await tileRef.current?.requestFullscreen();
      }
    } catch {
      toast.error(t("liveMeetings.errors.fullscreen"));
    }
  };

  return (
    <div
      ref={tileRef}
      className={`group relative aspect-video overflow-hidden rounded-2xl border bg-slate-950 shadow-sm transition fullscreen:aspect-auto fullscreen:h-screen fullscreen:w-screen fullscreen:rounded-none fullscreen:border-0 ${speaking ? "border-emerald-400 ring-2 ring-emerald-400/70" : ""}`}
    >
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={muted}
        className="h-full w-full object-contain"
      />
      <span className="absolute bottom-2 inset-s-2 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white">
        {label}
      </span>
      <button
        type="button"
        onClick={() => void toggleFullscreen()}
        className="absolute end-3 top-3 grid size-10 place-items-center rounded-xl border border-white/20 bg-black/60 text-white shadow-lg backdrop-blur-sm transition hover:scale-105 hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        title={t(
          fullscreen
            ? "liveMeetings.exitFullscreen"
            : "liveMeetings.showFullscreen",
        )}
        aria-label={t(
          fullscreen
            ? "liveMeetings.exitFullscreen"
            : "liveMeetings.showFullscreen",
        )}
      >
        {fullscreen ? (
          <Minimize2 className="size-5" />
        ) : (
          <Maximize2 className="size-5" />
        )}
      </button>
    </div>
  );
}

function AudioStream({ stream }: { stream: MediaStream }) {
  const ref = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return <audio ref={ref} autoPlay />;
}

export default function MeetingsPage({
  visible = true,
  onReturn,
}: {
  visible?: boolean;
  onReturn?: () => void;
}) {
  const { t } = useTranslation();
  const user = storedUser();
  const canCreate = hasPermission(user, "meetings.create");
  const socketRef = useRef<Socket | null>(null);
  const peersRef = useRef(new Map<string, RTCPeerConnection>());
  const channelsRef = useRef(new Map<string, RTCDataChannel>());
  const peerNamesRef = useRef(new Map<string, string>());
  const pendingIceRef = useRef(new Map<string, RTCIceCandidateInit[]>());
  const incomingFiles = useRef(new Map<string, IncomingFile>());
  const localStreamsRef = useRef<MediaStream[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [meetingHistory, setMeetingHistory] = useState<Meeting[]>([]);
  const [title, setTitle] = useState("");
  const [departments, setDepartments] = useState<MeetingDepartment[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [active, setActive] = useState<Meeting | null>(null);
  const policy = useSettings()?.meetings;
  const policyRef = useRef(policy);
  policyRef.current = policy;
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">(
    "user",
  );
  const [microphoneStream, setMicrophoneStream] = useState<MediaStream | null>(
    null,
  );
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState(
    new Map<string, { stream: MediaStream; name: string; peerId: string }>(),
  );
  const [participants, setParticipants] = useState<Peer[]>([]);
  const [selfPeerId, setSelfPeerId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [message, setMessage] = useState("");
  const [speakingPeers, setSpeakingPeers] = useState(new Set<string>());
  const [localSpeaking, setLocalSpeaking] = useState(false);
  const [dataPeers, setDataPeers] = useState(0);
  const [chatConnected, setChatConnected] = useState(false);
  const load = useCallback(async () => {
    try {
      const [liveItems, historyItems] = await Promise.all([
        meetingsApi.list(),
        meetingsApi.history(),
      ]);
      setMeetings(liveItems);
      setMeetingHistory(historyItems);
    } catch (e) {
      toast.error(apiErrorMessage(e));
    }
  }, []);
  useEffect(() => {
    if (visible) void load();
  }, [load, visible]);
  useEffect(() => {
    if (visible) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, visible]);
  useEffect(() => {
    if (!canCreate) return;
    void meetingsApi
      .departments()
      .then((items) => {
        setDepartments(items);
        setDepartmentId((current) => current || items[0]?.id || "");
      })
      .catch((error) => toast.error(apiErrorMessage(error)));
  }, [canCreate]);

  const handleData = useCallback((raw: string) => {
    const data = JSON.parse(raw);
    if (data.type === "chat") setMessages((items) => [...items, data.item]);
    if (data.type === "file:start")
      incomingFiles.current.set(data.id, {
        name: data.name,
        type: data.mime,
        chunks: [],
      });
    if (data.type === "file:chunk")
      incomingFiles.current.get(data.id)?.chunks.push(data.chunk);
    if (data.type === "file:end") {
      const file = incomingFiles.current.get(data.id);
      if (!file) return;
      const binary = atob(file.chunks.join(""));
      const bytes = Uint8Array.from(binary, (value) => value.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: file.type }));
      setMessages((items) => [
        ...items,
        {
          id: data.id,
          sender: data.sender,
          fileName: file.name,
          fileUrl: url,
          fileType: file.type,
          at: new Date().toISOString(),
        },
      ]);
      incomingFiles.current.delete(data.id);
    }
  }, []);

  const configureChannel = useCallback(
    (peerId: string, channel: RTCDataChannel) => {
      channelsRef.current.set(peerId, channel);
      channel.onmessage = (event) => handleData(String(event.data));
      const updateCount = () =>
        setDataPeers(
          [...channelsRef.current.values()].filter(
            (item) => item.readyState === "open",
          ).length,
        );
      channel.onopen = updateCount;
      channel.onclose = () => {
        channelsRef.current.delete(peerId);
        updateCount();
      };
      channel.onerror = () => updateCount();
    },
    [handleData],
  );

  const flushIce = useCallback(
    async (peerId: string, pc: RTCPeerConnection) => {
      const candidates = pendingIceRef.current.get(peerId) ?? [];
      pendingIceRef.current.delete(peerId);
      for (const candidate of candidates)
        await pc.addIceCandidate(candidate).catch(() => {});
    },
    [],
  );

  const makeOffer = useCallback(
    async (peerId: string, pc: RTCPeerConnection) => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current?.emit("webrtc:offer", {
        target: peerId,
        payload: offer,
      });
    },
    [],
  );

  const createPeer = useCallback(
    (peerId: string, name: string, initiator: boolean) => {
      const existing = peersRef.current.get(peerId);
      if (existing) return existing;
      peerNamesRef.current.set(peerId, name);
      const pc = new RTCPeerConnection(rtcConfig);
      peersRef.current.set(peerId, pc);
      localStreamsRef.current.forEach((stream) =>
        stream.getTracks().forEach((track) => pc.addTrack(track, stream)),
      );
      pc.onicecandidate = ({ candidate }) =>
        candidate &&
        socketRef.current?.emit("webrtc:ice", {
          target: peerId,
          payload: candidate,
        });
      pc.ontrack = ({ streams }) =>
        streams.forEach((stream) =>
          setRemoteStreams((current) =>
            new Map(current).set(`${peerId}:${stream.id}`, {
              stream,
              name,
              peerId,
            }),
          ),
        );
      pc.ondatachannel = ({ channel }) => configureChannel(peerId, channel);
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected")
          void applyBitrate(pc, policyRef.current);
        if (["failed", "closed"].includes(pc.connectionState))
          setRemoteStreams(
            (current) =>
              new Map(
                [...current].filter(([key]) => !key.startsWith(`${peerId}:`)),
              ),
          );
      };
      if (initiator)
        configureChannel(
          peerId,
          pc.createDataChannel("meeting-data", { ordered: true }),
        );
      return pc;
    },
    [configureChannel],
  );

  const renegotiate = useCallback(async () => {
    for (const [id, pc] of peersRef.current) {
      const activeTracks = localStreamsRef.current.flatMap((stream) =>
        stream.getTracks(),
      );
      for (const sender of pc.getSenders())
        if (sender.track && !activeTracks.includes(sender.track))
          pc.removeTrack(sender);
      for (const stream of localStreamsRef.current)
        for (const track of stream.getTracks())
          if (!pc.getSenders().some((sender) => sender.track === track))
            pc.addTrack(track, stream);
      await makeOffer(id, pc);
      await applyBitrate(pc, policyRef.current);
    }
  }, [makeOffer]);

  const leave = useCallback(() => {
    void window.electronUpdater?.meeting(false);
    socketRef.current?.disconnect();
    socketRef.current = null;
    peersRef.current.forEach((peer) => peer.close());
    peersRef.current.clear();
    channelsRef.current.clear();
    peerNamesRef.current.clear();
    pendingIceRef.current.clear();
    localStreamsRef.current.forEach((stream) =>
      stream.getTracks().forEach((track) => track.stop()),
    );
    localStreamsRef.current = [];
    setCameraStream(null);
    setMicrophoneStream(null);
    setScreenStream(null);
    setRemoteStreams(new Map());
    setParticipants([]);
    setSelfPeerId(null);
    setMessages([]);
    setDataPeers(0);
    setChatConnected(false);
    setSpeakingPeers(new Set());
    setLocalSpeaking(false);
    setActive(null);
  }, []);
  useEffect(() => leave, [leave]);

  const join = async (code: string) => {
    if (!hasPermission(storedUser(), "meetings.join")) return;
    if (!code.trim()) return;
    leave();
    try {
      policyRef.current = (await loadSettings()).meetings;
    } catch {
      toast.error("Unable to load meeting settings.");
      return;
    }
    const socket = io(socketUrl, {
      path: "/api/socket.io",
      withCredentials: true,
      transports: ["polling"],
      timeout: 10_000,
      reconnection: true,
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;
    socket.on("meeting:peer-joined", async ({ id, name }: Peer) => {
      setParticipants((items) => [
        ...items.filter((item) => item.id !== id),
        { id, name },
      ]);
      const pc = createPeer(id, name, true);
      await makeOffer(id, pc);
      await applyBitrate(pc, policyRef.current);
    });
    socket.on("webrtc:offer", async ({ from, name, payload }) => {
      const pc = createPeer(from, name, false);
      await pc.setRemoteDescription(payload);
      await flushIce(from, pc);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("webrtc:answer", { target: from, payload: answer });
    });
    socket.on("webrtc:answer", async ({ from, payload }) => {
      const pc = peersRef.current.get(from);
      if (!pc) return;
      await pc.setRemoteDescription(payload);
      await flushIce(from, pc);
    });
    socket.on("webrtc:ice", async ({ from, payload }) => {
      const pc = peersRef.current.get(from);
      if (pc?.remoteDescription)
        await pc.addIceCandidate(payload).catch(() => {});
      else
        pendingIceRef.current.set(from, [
          ...(pendingIceRef.current.get(from) ?? []),
          payload,
        ]);
    });
    socket.on("meeting:peer-left", ({ id }) => {
      setParticipants((items) => items.filter((item) => item.id !== id));
      peersRef.current.get(id)?.close();
      peersRef.current.delete(id);
      channelsRef.current.delete(id);
      setSpeakingPeers((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
      setRemoteStreams(
        (current) =>
          new Map([...current].filter(([key]) => !key.startsWith(`${id}:`))),
      );
    });
    socket.on("connect_error", (error) =>
      toast.error(
        t("liveMeetings.errors.connection", { message: error.message }),
      ),
    );
    socket.on("disconnect", () => setChatConnected(false));
    socket.on("meeting:chat", (item: ChatItem) =>
      setMessages((items) => [...items, item]),
    );
    socket.on(
      "meeting:speaking",
      ({ id, speaking }: { id: string; speaking: boolean }) =>
        setSpeakingPeers((current) => {
          const next = new Set(current);
          if (speaking) next.add(id);
          else next.delete(id);
          return next;
        }),
    );
    socket.on("meeting:ended", () => {
      toast.info(t("liveMeetings.errors.closed"));
      leave();
      void load();
    });
    socket.emit(
      "meeting:join",
      { roomCode: code.trim().toUpperCase() },
      (reply: JoinReply) => {
        if (!reply.ok || !reply.meeting) {
          toast.error(reply.message || t("liveMeetings.errors.join"));
          leave();
          return;
        }
        setActive(reply.meeting);
        void window.electronUpdater?.meeting(true);
        const defaults = settingsSnapshot()?.meetings;
        if (defaults?.cameraDefault && defaults.videoQuality !== "audio_only")
          void startCamera();
        if (defaults?.microphoneDefault) void startMicrophone();
        setChatConnected(true);
        setRoomCode(reply.meeting.roomCode);
        setParticipants([
          ...(reply.self ? [reply.self] : []),
          ...(reply.peers || []),
        ]);
        setSelfPeerId(reply.self?.id ?? null);
        reply.peers?.forEach((peer) => createPeer(peer.id, peer.name, false));
      },
    );
  };

  const startCamera = async (facing: "user" | "environment" = cameraFacing) => {
    if (policyRef.current?.videoQuality === "audio_only") {
      toast.info("Video is disabled by the meeting audio-only policy.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error(t("liveMeetings.errors.cameraSecure"), { duration: 10_000 });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          ...cameraConstraints(policyRef.current),
        },
        audio: false,
      });
      localStreamsRef.current.push(stream);
      setCameraStream(stream);
      setCameraFacing(facing);
      await renegotiate();
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        toast.error(
          window.electronWindow
            ? t("liveMeetings.errors.cameraBlockedApp")
            : t("liveMeetings.errors.cameraBlockedWeb"),
          {
            duration: 10_000,
            action: {
              label: t(
                window.electronWindow
                  ? "liveMeetings.openSettings"
                  : "liveMeetings.retry",
              ),
              onClick: () =>
                window.electronWindow
                  ? void window.electronWindow.openMediaSettings("camera")
                  : void startCamera(),
            },
          },
        );
      } else if (
        error instanceof DOMException &&
        error.name === "NotFoundError"
      ) {
        toast.error(t("liveMeetings.errors.cameraMissing"), {
          duration: 10_000,
        });
      } else if (
        error instanceof DOMException &&
        ["NotReadableError", "AbortError"].includes(error.name)
      ) {
        toast.error(t("liveMeetings.errors.cameraBusy"), {
          duration: 10_000,
          action: {
            label: t("liveMeetings.retry"),
            onClick: () => void startCamera(),
          },
        });
      } else {
        const detail = error instanceof Error ? ` ${error.message}` : "";
        toast.error(t("liveMeetings.errors.cameraOpen", { detail }), {
          duration: 10_000,
          action: {
            label: t("liveMeetings.retry"),
            onClick: () => void startCamera(),
          },
        });
      }
    }
  };
  const switchCamera = async () => {
    if (!cameraStream) return;
    const nextFacing = cameraFacing === "user" ? "environment" : "user";
    cameraStream.getTracks().forEach((track) => track.stop());
    localStreamsRef.current = localStreamsRef.current.filter(
      (stream) => stream !== cameraStream,
    );
    setCameraStream(null);
    await startCamera(nextFacing);
  };
  const startMicrophone = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error(t("liveMeetings.errors.microphoneSecure"), {
        duration: 10_000,
      });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: policyRef.current?.echoCancellation ?? true,
          noiseSuppression: policyRef.current?.noiseSuppression ?? true,
          channelCount: policyRef.current?.audioQuality === "high" ? 2 : 1,
          sampleRate: policyRef.current?.audioQuality === "low" ? 16000 : 48000,
          autoGainControl: true,
        },
        video: false,
      });
      localStreamsRef.current.push(stream);
      setMicrophoneStream(stream);
      await renegotiate();
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        toast.error(
          window.electronWindow
            ? t("liveMeetings.errors.microphoneBlockedApp")
            : t("liveMeetings.errors.microphoneBlockedWeb"),
          {
            duration: 10_000,
            action: {
              label: t(
                window.electronWindow
                  ? "liveMeetings.openSettings"
                  : "liveMeetings.retry",
              ),
              onClick: () =>
                window.electronWindow
                  ? void window.electronWindow.openMediaSettings("microphone")
                  : void startMicrophone(),
            },
          },
        );
      } else if (
        error instanceof DOMException &&
        error.name === "NotFoundError"
      ) {
        toast.error(t("liveMeetings.errors.microphoneMissing"), {
          duration: 10_000,
        });
      } else if (
        error instanceof DOMException &&
        ["NotReadableError", "AbortError"].includes(error.name)
      ) {
        toast.error(t("liveMeetings.errors.microphoneBusy"), {
          duration: 10_000,
          action: {
            label: t("liveMeetings.retry"),
            onClick: () => void startMicrophone(),
          },
        });
      } else {
        const detail = error instanceof Error ? ` ${error.message}` : "";
        toast.error(t("liveMeetings.errors.microphoneOpen", { detail }), {
          duration: 10_000,
          action: {
            label: t("liveMeetings.retry"),
            onClick: () => void startMicrophone(),
          },
        });
      }
    }
  };
  const startScreen = async () => {
    if (policyRef.current?.screenSharing === false) {
      toast.info("Screen sharing is disabled in meeting settings.");
      return;
    }
    if (!window.isSecureContext) {
      toast.error(t("liveMeetings.errors.screenSecure"));
      return;
    }
    if (typeof navigator.mediaDevices?.getDisplayMedia !== "function") {
      toast.error(t("liveMeetings.errors.screenUnsupported"), {
        duration: 10_000,
      });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: {
            ideal: policyRef.current?.screenQuality === "video" ? 30 : 5,
          },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: true,
      });
      stream.getVideoTracks()[0].contentHint =
        policyRef.current?.screenQuality === "video" ? "motion" : "detail";
      localStreamsRef.current.push(stream);
      setScreenStream(stream);
      stream.getVideoTracks()[0].onended = () =>
        stopStream(stream, setScreenStream);
      await renegotiate();
    } catch (error) {
      const message =
        error instanceof DOMException && error.name === "NotAllowedError"
          ? t("liveMeetings.errors.screenDenied")
          : t("liveMeetings.errors.screenStart");
      toast.error(message);
    }
  };
  const stopStream = async (
    stream: MediaStream,
    setter: (value: null) => void,
  ) => {
    stream.getTracks().forEach((track) => track.stop());
    localStreamsRef.current = localStreamsRef.current.filter(
      (item) => item !== stream,
    );
    setter(null);
    await renegotiate();
  };
  useEffect(() => {
    if (!microphoneStream) return;
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    context.createMediaStreamSource(microphoneStream).connect(analyser);
    const levels = new Uint8Array(analyser.frequencyBinCount);
    let frame = 0;
    let lastSpeaking = false;
    const detect = () => {
      analyser.getByteFrequencyData(levels);
      const average =
        levels.reduce((total, level) => total + level, 0) / levels.length;
      const speaking = average > 12;
      if (speaking !== lastSpeaking) {
        lastSpeaking = speaking;
        setLocalSpeaking(speaking);
        socketRef.current?.emit("meeting:speaking", { speaking });
      }
      frame = requestAnimationFrame(detect);
    };
    detect();
    return () => {
      cancelAnimationFrame(frame);
      if (lastSpeaking)
        socketRef.current?.emit("meeting:speaking", { speaking: false });
      setLocalSpeaking(false);
      void context.close();
    };
  }, [microphoneStream]);
  const broadcast = (payload: unknown) => {
    let sent = 0;
    channelsRef.current.forEach((channel) => {
      if (channel.readyState !== "open") return;
      channel.send(JSON.stringify(payload));
      sent += 1;
    });
    return sent;
  };
  const sendMessage = () => {
    if (!hasPermission(storedUser(), "meetings.chat")) return;
    const text = message.trim();
    const socket = socketRef.current;
    if (!text) return;
    if (!socket?.connected || !chatConnected) {
      toast.error(t("liveMeetings.errors.chatReconnecting"));
      return;
    }
    socket.emit(
      "meeting:chat",
      { text },
      (reply: { ok: boolean; message?: string }) => {
        if (!reply.ok) {
          toast.error(reply.message || t("liveMeetings.errors.sendMessage"));
          return;
        }
        setMessage("");
      },
    );
  };
  const endMeeting = () => {
    if (!hasPermission(storedUser(), "meetings.end")) return;
    if (!active || !socketRef.current) return;
    socketRef.current.emit(
      "meeting:end",
      { roomCode: active.roomCode },
      (reply: { ok: boolean; message?: string }) => {
        if (!reply.ok)
          toast.error(reply.message || t("liveMeetings.errors.endMeeting"));
      },
    );
  };
  const sendFile = async (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024)
      return toast.error(t("liveMeetings.errors.fileSize"));
    const id = randomId();
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
      reader.readAsDataURL(file);
    });
    broadcast({ type: "file:start", id, name: file.name, mime: file.type });
    for (let i = 0; i < base64.length; i += 12000)
      broadcast({ type: "file:chunk", id, chunk: base64.slice(i, i + 12000) });
    broadcast({
      type: "file:end",
      id,
      sender: user?.name || t("liveMeetings.user"),
    });
    setMessages((items) => [
      ...items,
      {
        id,
        sender: user?.name || t("liveMeetings.user"),
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        fileType: file.type,
        at: new Date().toISOString(),
      },
    ]);
  };

  if (!active && !visible) return null;

  if (!active)
    return (
      <div className="space-y-8 pb-8">
        <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-linear-to-br from-primary/10 via-card to-card p-6 shadow-sm md:p-8">
          <div className="pointer-events-none absolute -end-16 -top-20 size-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Video className="size-7" />
            </span>
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">
                {t("liveMeetings.title")}
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                {t("liveMeetings.subtitle")}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`grid gap-5 ${canCreate ? "lg:grid-cols-[1.35fr_0.65fr]" : ""}`}
        >
          {canCreate && (
            <Card className="overflow-hidden border-primary/20">
              <CardHeader className="border-b bg-primary/[0.04]">
                <CardTitle className="flex items-center gap-2">
                  <Radio className="size-5 text-primary" />
                  {t("liveMeetings.createDepartmentMeeting")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t("liveMeetings.createHint")}
                </p>
              </CardHeader>
              <CardContent className="grid gap-3 p-6 md:grid-cols-[1fr_220px_auto]">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("liveMeetings.meetingTitle")}
                />
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("liveMeetings.selectDepartment")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  permission="meetings.create"
                  onClick={async () => {
                    try {
                      const meeting = await meetingsApi.create(
                        title,
                        departmentId,
                      );
                      setTitle("");
                      await load();
                      await join(meeting.roomCode);
                    } catch (e) {
                      toast.error(apiErrorMessage(e));
                    }
                  }}
                  disabled={title.trim().length < 2 || !departmentId}
                >
                  <Plus /> {t("liveMeetings.create")}
                </Button>
              </CardContent>
            </Card>
          )}
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="size-5 text-primary" />
                {t("liveMeetings.joinWithCode")}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t("liveMeetings.joinHint")}
              </p>
            </CardHeader>
            <CardContent className="flex gap-2 p-6">
              <Input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder={t("liveMeetings.roomCode")}
              />
              <Button
                permission="meetings.join"
                onClick={() => void join(roomCode)}
              >
                {t("liveMeetings.joinRoom")}
              </Button>
            </CardContent>
          </Card>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Radio className="size-5 text-emerald-500" />
                {t("liveMeetings.activeMeetings")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("liveMeetings.activeMeetingsHint")}
              </p>
            </div>
            <span className="rounded-full border bg-card px-3 py-1 text-sm font-medium">
              {meetings.length}
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {meetings.map((meeting) => (
              <button
                key={meeting.id}
                disabled={!hasPermission(user, "meetings.join")}
                onClick={() => void join(meeting.roomCode)}
                className="group rounded-2xl border bg-card p-5 text-start shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <b>{meeting.title}</b>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-600">
                    {t("liveMeetings.live")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {meeting.department?.name ?? "—"} · {meeting.creator.name}
                </p>
                <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="size-4" />
                  {t("liveMeetings.connectedCount", {
                    count: meeting.participants?.length || 0,
                  })}{" "}
                  · {meeting.roomCode}
                </p>
              </button>
            ))}
            {!meetings.length && (
              <div className="col-span-full rounded-2xl border border-dashed bg-muted/20 p-10 text-center">
                <Video className="mx-auto mb-3 size-9 text-muted-foreground/60" />
                <p className="font-medium">
                  {t("liveMeetings.noActiveMeetings")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("liveMeetings.noActiveMeetingsHint")}
                </p>
              </div>
            )}
          </div>
        </section>

        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between space-y-0 border-b bg-muted/20">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="size-5 text-primary" />
                {t("liveMeetings.history")}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("liveMeetings.historyHint")}
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              {meetingHistory.length}
            </span>
          </CardHeader>
          <CardContent className="p-0">
            {meetingHistory.length ? (
              <div className="divide-y">
                {meetingHistory.map((meeting) => {
                  const attendees = new Set(
                    meeting.participants
                      ?.map((item) => item.userId)
                      .filter(Boolean),
                  ).size;
                  const end = meeting.endedAt
                    ? new Date(meeting.endedAt)
                    : null;
                  const minutes = end
                    ? Math.max(
                        1,
                        Math.round(
                          (end.getTime() -
                            new Date(meeting.createdAt).getTime()) /
                            60000,
                        ),
                      )
                    : 0;
                  return (
                    <div
                      key={meeting.id}
                      className="grid gap-4 p-5 transition-colors hover:bg-muted/25 md:grid-cols-[minmax(220px,1fr)_repeat(3,auto)] md:items-center md:px-6"
                    >
                      <div>
                        <p className="font-semibold">{meeting.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {meeting.department?.name ?? "—"} · {meeting.creator.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="size-4" />
                        {new Intl.DateTimeFormat(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(meeting.createdAt))}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="size-4" />
                        {t("liveMeetings.attendeeCount", { count: attendees })}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock3 className="size-4" />
                        {t("liveMeetings.durationMinutes", { count: minutes })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-10 text-center">
                <ShieldCheck className="mx-auto mb-3 size-9 text-muted-foreground/60" />
                <p className="font-medium">{t("liveMeetings.noHistory")}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("liveMeetings.noHistoryHint")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );

  return (
    <>
      {!visible &&
        createPortal(
          <Card
            dir={document.documentElement.dir || "ltr"}
            className="fixed bottom-4 end-4 z-50 w-[min(24rem,calc(100vw-2rem))] shadow-xl"
          >
            <CardContent className="space-y-3 p-4">
              <Button
                variant="ghost"
                className="h-auto w-full justify-start whitespace-normal text-start"
                onClick={onReturn}
              >
                <Video className="shrink-0 text-primary" />
                <span>
                  {t("liveMeetings.title")} · {active.title}
                </span>
              </Button>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    microphoneStream
                      ? void stopStream(microphoneStream, setMicrophoneStream)
                      : void startMicrophone()
                  }
                >
                  {microphoneStream ? <MicOff /> : <Mic />}
                  {t(
                    microphoneStream
                      ? "liveMeetings.mute"
                      : "liveMeetings.microphone",
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    cameraStream
                      ? void stopStream(cameraStream, setCameraStream)
                      : void startCamera()
                  }
                >
                  {cameraStream ? <CameraOff /> : <Camera />}
                  {t(
                    cameraStream
                      ? "liveMeetings.stopCamera"
                      : "liveMeetings.camera",
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    screenStream
                      ? void stopStream(screenStream, setScreenStream)
                      : void startScreen()
                  }
                >
                  <MonitorUp />
                  {t(
                    screenStream
                      ? "liveMeetings.stopSharing"
                      : "liveMeetings.shareScreen",
                  )}
                </Button>
                <Button variant="destructive" size="sm" onClick={leave}>
                  <LogOut /> {t("liveMeetings.leave")}
                </Button>
              </div>
            </CardContent>
          </Card>,
          document.body,
        )}
      <div
        style={{ display: visible ? undefined : "none" }}
        className="grid min-h-[calc(100svh-7.5rem)] gap-4 xl:grid-cols-[1fr_340px]"
      >
        <section className="flex min-w-0 flex-col gap-4">
          <div className="sticky bottom-3 z-20 order-2 flex flex-wrap items-center justify-center gap-2 rounded-2xl border bg-card/95 p-3 shadow-lg backdrop-blur-xl xl:static xl:order-1 xl:justify-start xl:shadow-sm">
            <div className="me-auto">
              <b>{active.title}</b>
              <p className="text-xs text-muted-foreground">
                {active.department?.name ?? "—"} ·{" "}
                {t("liveMeetings.room", { code: active.roomCode })}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                navigator.clipboard.writeText(active.roomCode);
                toast.success(t("liveMeetings.roomCodeCopied"));
              }}
            >
              <Copy />
            </Button>
            {cameraStream ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => void switchCamera()}
                  title={t("liveMeetings.switchCameraTitle")}
                >
                  <SwitchCamera /> {t("liveMeetings.switch")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => void stopStream(cameraStream, setCameraStream)}
                >
                  <CameraOff /> {t("liveMeetings.stopCamera")}
                </Button>
              </>
            ) : (
              <Button onClick={() => void startCamera()}>
                <Camera /> {t("liveMeetings.camera")}
              </Button>
            )}
            {screenStream ? (
              <Button
                variant="outline"
                onClick={() => void stopStream(screenStream, setScreenStream)}
              >
                <MonitorUp /> {t("liveMeetings.stopSharing")}
              </Button>
            ) : (
              <Button onClick={() => void startScreen()}>
                <MonitorUp /> {t("liveMeetings.shareScreen")}
              </Button>
            )}
            <Button
              variant={microphoneStream ? "outline" : "default"}
              onClick={() =>
                microphoneStream
                  ? void stopStream(microphoneStream, () => {
                      setMicrophoneStream(null);
                    })
                  : void startMicrophone()
              }
            >
              {microphoneStream ? <MicOff /> : <Mic />}
              {t(
                microphoneStream
                  ? "liveMeetings.mute"
                  : "liveMeetings.microphone",
              )}
            </Button>
            {(user?.permissions?.includes("*") ||
              active.creator.id === user?.id) && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button permission="meetings.end" variant="destructive">
                    {t("liveMeetings.endMeeting")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("liveMeetings.closeMeetingTitle")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("liveMeetings.closeMeetingDescription")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      permission="meetings.end"
                      onClick={endMeeting}
                    >
                      {t("liveMeetings.closeMeeting")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button variant="outline" onClick={leave}>
              <LogOut /> {t("liveMeetings.leave")}
            </Button>
          </div>
          <div className="order-1 grid gap-3 md:grid-cols-2 xl:order-2">
            {cameraStream && (
              <VideoTile
                stream={cameraStream}
                label={`${user?.name} · ${t("liveMeetings.camera")}`}
                muted
                speaking={localSpeaking}
              />
            )}
            {screenStream && (
              <VideoTile
                stream={screenStream}
                label={`${user?.name} · ${t("liveMeetings.screen")}`}
                muted
              />
            )}
            {[...remoteStreams].map(([key, value]) =>
              value.stream.getVideoTracks().length ? (
                <VideoTile
                  key={key}
                  stream={value.stream}
                  label={value.name}
                  speaking={speakingPeers.has(value.peerId)}
                />
              ) : (
                <AudioStream key={key} stream={value.stream} />
              ),
            )}
            {!cameraStream &&
              !screenStream &&
              ![...remoteStreams.values()].some(
                ({ stream }) => stream.getVideoTracks().length,
              ) && (
                <div className="col-span-full grid min-h-80 place-items-center rounded-2xl border border-dashed bg-muted/20 text-center text-muted-foreground">
                  <div>
                    <Video className="mx-auto mb-3 size-10" />
                    <p>{t("liveMeetings.noSharing")}</p>
                  </div>
                </div>
              )}
          </div>
        </section>
        <aside className="flex min-h-130 flex-col overflow-hidden rounded-3xl border bg-card shadow-lg xl:max-h-[calc(100svh-9rem)]">
          <div className="border-b p-4">
            <div className="mb-3 flex items-center gap-2 font-semibold">
              <Users className="size-4 text-primary" />{" "}
              {t("liveMeetings.participants", { count: participants.length })}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {participants.map((participant) => (
                <span
                  key={participant.id}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition ${speakingPeers.has(participant.id) || (participant.id === selfPeerId && localSpeaking) ? "bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-400" : "bg-primary/8 text-primary"}`}
                >
                  {(speakingPeers.has(participant.id) ||
                    (participant.id === selfPeerId && localSpeaking)) && (
                    <Mic className="size-3 animate-pulse" />
                  )}
                  {participant.name}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 border-b p-4">
            <span className="flex items-center gap-2 font-semibold">
              <MessageSquare className="size-4 text-primary" />{" "}
              {t("liveMeetings.meetingChat")}
            </span>
            <span
              className={`text-[10px] font-medium ${chatConnected ? "text-emerald-600" : "text-amber-600"}`}
            >
              {t(
                chatConnected
                  ? "liveMeetings.connected"
                  : "liveMeetings.connecting",
              )}
            </span>
          </div>
          <div className="content-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto bg-muted/15 p-4">
            {messages.length === 0 && (
              <div className="grid h-full min-h-48 place-items-center text-center text-muted-foreground">
                <div>
                  <MessageSquare className="mx-auto mb-2 size-8 opacity-50" />
                  <p className="text-sm font-medium">
                    {t("liveMeetings.noMessages")}
                  </p>
                  <p className="mt-1 text-xs">
                    {t("liveMeetings.startConversation")}
                  </p>
                </div>
              </div>
            )}
            {messages.map((item) => (
              <div
                key={item.id}
                className={`w-fit max-w-[88%] rounded-2xl p-3 shadow-sm ${item.sender === user?.name ? "ms-auto rounded-ee-md bg-primary text-primary-foreground" : "me-auto rounded-es-md border bg-card"}`}
              >
                <div className="mb-1 flex justify-between gap-2 text-xs">
                  <b>{item.sender}</b>
                  <span
                    className={
                      item.sender === user?.name
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }
                  >
                    {new Date(item.at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {item.text && <p className="text-sm">{item.text}</p>}
                {item.fileName &&
                  (item.fileUrl ? (
                    item.fileType?.startsWith("image/") ? (
                      <div className="mt-2 overflow-hidden rounded-xl border bg-background">
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          title={t("liveMeetings.openFullImage")}
                        >
                          <img
                            src={item.fileUrl}
                            alt={item.fileName}
                            loading="lazy"
                            className="max-h-72 w-full cursor-zoom-in object-contain transition hover:opacity-90"
                          />
                        </a>
                        <a
                          className="block truncate border-t px-3 py-2 text-xs font-medium text-primary hover:underline"
                          href={item.fileUrl}
                          download={item.fileName}
                        >
                          {item.fileName}
                        </a>
                      </div>
                    ) : (
                      <a
                        className="text-sm font-medium text-primary hover:underline"
                        href={item.fileUrl}
                        download={item.fileName}
                      >
                        {item.fileName}
                      </a>
                    )
                  ) : (
                    <p className="text-sm">
                      {t("liveMeetings.sentFile", { fileName: item.fileName })}
                    </p>
                  ))}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="border-t bg-card p-3">
            <div className="flex items-center gap-2 rounded-2xl border bg-muted/25 p-1.5 shadow-inner">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={t("liveMeetings.writeMessage")}
                className="border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              <Button
                permission="meetings.chat"
                size="icon"
                onClick={sendMessage}
                disabled={!chatConnected || !message.trim()}
              >
                <Send />
              </Button>
              <label
                className={`grid size-9 shrink-0 place-items-center rounded-md border ${dataPeers ? "cursor-pointer hover:bg-muted" : "cursor-not-allowed opacity-50"}`}
              >
                <FileUp className="size-4" />
                <input
                  type="file"
                  className="hidden"
                  disabled={!dataPeers}
                  onChange={(e) => {
                    void sendFile(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              {t("liveMeetings.securityNote")}
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

function cameraConstraints(
  policy: { videoQuality: string; maxVideoQuality: string } | undefined,
): MediaTrackConstraints {
  const levels: Record<string, number> = {
    "360p": 360,
    "720p": 720,
    "1080p": 1080,
  };
  const height = Math.min(
    levels[policy?.videoQuality ?? ""] ?? 720,
    levels[policy?.maxVideoQuality ?? ""] ?? 1080,
  );
  return {
    height: { ideal: height, max: height },
    width: {
      ideal: Math.round((height * 16) / 9),
      max: Math.round((height * 16) / 9),
    },
    frameRate: { ideal: 30, max: 30 },
  };
}
async function applyBitrate(
  pc: RTCPeerConnection,
  policy:
    | { videoQuality: string; maxVideoQuality: string; audioQuality: string }
    | undefined,
) {
  for (const sender of pc.getSenders()) {
    if (!sender.track) continue;
    const parameters = sender.getParameters();
    if (!parameters.encodings?.length) continue;
    const height = Number(
      cameraConstraints(policy).height &&
        (cameraConstraints(policy).height as ConstrainULongRange).max,
    );
    const bitrate =
      sender.track.kind === "audio"
        ? policy?.audioQuality === "low"
          ? 24000
          : policy?.audioQuality === "high"
            ? 128000
            : 64000
        : sender.track.contentHint === "detail" ||
            sender.track.contentHint === "motion"
          ? 3000000
          : height <= 360
            ? 500000
            : height <= 720
              ? 1500000
              : 3000000;
    parameters.encodings.forEach((encoding) => {
      encoding.maxBitrate = bitrate;
    });
    await sender.setParameters(parameters).catch(() => {});
  }
}
