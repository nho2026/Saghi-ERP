import { useEffect, useRef } from "react";
import { useSonner } from "sonner";
import success from "@/assets/sounds/success.mp3";
import error from "@/assets/sounds/error.mp3";
import info from "@/assets/sounds/info.mp3";

const sources = { success, error, info };
type Sound = keyof typeof sources;
export function AlertSounds() {
  const { toasts } = useSonner();
  const seen = useRef(new WeakSet<object>());
  const audio = useRef<HTMLAudioElement | null>(null);
  const lastPlayed = useRef({ type: "", at: 0 });
  useEffect(() => {
    let next: Sound | undefined;
    for (const toast of toasts) {
      if (seen.current.has(toast) || toast.delete) continue;
      seen.current.add(toast);
      if (
        toast.type === "success" ||
        toast.type === "error" ||
        toast.type === "info"
      )
        next = toast.type;
    }
    if (!next) return;
    const now = Date.now();
    if (lastPlayed.current.type === next && now - lastPlayed.current.at < 800)
      return;
    lastPlayed.current = { type: next, at: now };
    audio.current?.pause();
    const player = new Audio(sources[next]);
    player.volume = 0.5;
    audio.current = player;
    // Browser autoplay restrictions must never break the user's action.
    void player.play().catch(() => undefined);
  }, [toasts]);
  useEffect(
    () => () => {
      audio.current?.pause();
    },
    [],
  );
  return null;
}
