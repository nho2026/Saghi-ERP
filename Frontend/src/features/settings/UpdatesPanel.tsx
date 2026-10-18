import { useSettingsTranslation } from "./useSettingsTranslation";
import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
export type UpdateState = {
  status: string;
  version: string;
  latestVersion?: string;
  releaseNotes?: string;
  progress: number;
  message: string;
  automatic: boolean;
};
declare global {
  interface Window {
    electronUpdater?: {
      state: () => Promise<UpdateState>;
      check: () => Promise<UpdateState>;
      download: () => Promise<UpdateState>;
      install: (language?: string) => Promise<UpdateState>;
      automatic: (value: boolean) => Promise<UpdateState>;
      meeting: (active: boolean) => Promise<boolean>;
      onState: (callback: (value: UpdateState) => void) => () => void;
    };
  }
}
export function UpdatesPanel() {
  const { tr, i18n } = useSettingsTranslation();
  const [state, setState] = useState<UpdateState>();
  const [error, setError] = useState("");
  const updater = window.electronUpdater;
  useEffect(() => {
    if (!updater) return;
    const unsubscribe = updater.onState(setState);
    void updater
      .state()
      .then(setState)
      .catch(() => setError("Unable to read updater state."));
    return unsubscribe;
  }, [updater]);
  const run = async (action: () => Promise<UpdateState>) => {
    setError("");
    try {
      setState(await action());
    } catch {
      setError("Update action failed. Please try again.");
    }
  };
  return (
    <Card className="p-5 space-y-3">
      <h2 className="font-semibold">{tr("Desktop app updates")}</h2>
      {!updater ? (
        <p className="text-sm text-muted-foreground">
          {tr("Open the installed Electron app to check for desktop updates.")}
        </p>
      ) : (
        <>
          <p className="text-sm">
            {tr("Current version")}: {state?.version ?? "…"}
            {state?.latestVersion &&
              ` · ${tr("Latest")}: ${state.latestVersion}`}
          </p>
          <p role="status" className="text-sm text-muted-foreground">
            {tr(error || state?.message || "")}
          </p>
          {state?.status === "downloading" && (
            <Badge variant="secondary" role="status" aria-live="polite">
              {tr("Downloading")}: {state.progress}%
            </Badge>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              permission="settings.update"
              variant="outline"
              disabled={
                !state ||
                [
                  "unavailable",
                  "checking",
                  "downloading",
                  "ready",
                  "available",
                ].includes(state.status)
              }
              onClick={() => void run(updater.check)}
            >
              {tr("Check for updates")}
            </Button>
            {state?.status === "available" && (
              <Button
                permission="settings.update"
                onClick={() => void run(updater.download)}
              >
                {tr("Download update")}
              </Button>
            )}
            {state?.status === "ready" && (
              <Button
                permission="settings.update"
                onClick={() =>
                  void run(() => updater.install(i18n.resolvedLanguage))
                }
              >
                {tr("Restart and install")}
              </Button>
            )}
          </div>
          <Label className="flex items-center gap-2 text-sm">
            <Checkbox
              disabled={!state}
              checked={state?.automatic ?? true}
              onCheckedChange={(checked) =>
                void run(() => updater.automatic(checked === true))
              }
            />
            {tr("Automatically check for updates")}
          </Label>
          {state?.releaseNotes && (
            <div>
              <h3 className="text-sm font-semibold">{tr("Release notes")}</h3>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {state.releaseNotes.replace(/<[^>]*>/g, "")}
              </p>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
