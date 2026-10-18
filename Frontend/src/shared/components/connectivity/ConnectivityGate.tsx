import { useSyncExternalStore, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { WifiOff } from "lucide-react";

import {
  connectionSnapshot,
  subscribeToConnection,
} from "./connectivity-store";

export default function ConnectivityGate({
  children,
}: {
  children: ReactNode;
}) {
  const status = useSyncExternalStore(
    subscribeToConnection,
    connectionSnapshot,
    () => "checking",
  );
  const { t, i18n } = useTranslation();

  if (status === "online") return children;
  const message =
    status === "checking"
      ? "checking"
      : status === "unreachable"
        ? "unreachable"
        : "offline";

  return (
    <main
      className="fixed inset-0 z-[99999] flex min-h-dvh items-center justify-center bg-background p-6 text-foreground"
      dir={i18n.dir()}
      role="status"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="max-w-md space-y-4 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-muted">
          <WifiOff
            className="size-9 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        <h1 className="text-2xl font-bold">
          {t(`connectivity.${message}Title`)}
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          {t(`connectivity.${message}Description`)}
        </p>
      </div>
    </main>
  );
}
