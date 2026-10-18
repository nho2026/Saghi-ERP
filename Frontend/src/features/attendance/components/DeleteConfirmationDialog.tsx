import { useSettings } from "@/features/settings/settings";
import { useState } from "react";
import { LoaderCircle, ShieldAlert } from "lucide-react";
import { apiErrorMessage } from "@/shared/api/client";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

export function DeleteConfirmationDialog({
  permission = "delete",
  open,
  title,
  description,
  onOpenChange,
  onConfirm,
  alwaysRequirePassword = false,
}: {
  permission?: string;
  alwaysRequirePassword?: boolean;
  open: boolean;
  title: string;
  description: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: (password: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const settings = useSettings();
  const requirePassword =
    alwaysRequirePassword || settings?.security.passwordForDeletion !== false;
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onConfirm(password);
      setPassword("");
      onOpenChange(false);
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!busy) {
          onOpenChange(value);
          setError("");
          setPassword("");
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="size-5 text-destructive" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <p className="text-sm text-muted-foreground">{description}</p>
          {requirePassword && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold">
                {t("common.superAdminPassword")}
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("common.enterPassword")}
                autoFocus
                required
              />
            </div>
          )}
          {error && (
            <p className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              permission={permission}
              type="submit"
              variant="destructive"
              disabled={(requirePassword && !password) || busy}
            >
              {busy && <LoaderCircle className="size-4 animate-spin" />}
              {busy ? t("common.deleting") : t("common.deletePermanently")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
