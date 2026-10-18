import { useServerTable } from "@/shared/hooks/useServerTable";
import { useState } from "react";
import {
  CalendarX2,
  Plus,
  RefreshCw,
  Settings2,
  Trash2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { attendanceApi, type Device } from "../api/attendance.api";
import { DeleteConfirmationDialog } from "../components/DeleteConfirmationDialog";
import { apiErrorMessage } from "@/shared/api/client";
import { ResourceState } from "@/shared/components/ui/table-resource-state";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Badge } from "@/shared/components/ui/badge";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { PaginationControls } from "@/shared/components/ui/pagination-controls";
export default function DevicesPage() {
  const { t } = useTranslation();
  const devices = useServerTable<Device>("/attendance/devices");
  const pagination = devices.pagination;
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [deleting, setDeleting] = useState<Device | null>(null),
    [clearingEvents, setClearingEvents] = useState<Device | null>(null),
    [managing, setManaging] = useState<Device | null>(null);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      await attendanceApi.addDevice({
        name: f.get("name"),
        ipAddress: f.get("ipAddress"),
        port: Number(f.get("port")),
        username: f.get("username"),
        password: f.get("password"),
      });
      setOpen(false);
      await devices.refresh();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };
  const saveDevice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!managing) return;
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const password = String(f.get("password") ?? "").trim();
    try {
      await attendanceApi.updateDevice(managing.id, {
        name: f.get("name"),
        ipAddress: f.get("ipAddress"),
        port: Number(f.get("port")),
        username: f.get("username"),
        ...(password ? { password } : {}),
      });
      setManaging(null);
      await devices.refresh();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };
  const testDevice = async (device: Device) => {
    const toastId = toast.loading(
      t("attendance.device.testing", { name: device.name }),
    );
    try {
      await attendanceApi.testDevice(device.id);
      await devices.refresh();
      toast.success(t("attendance.device.online", { name: device.name }), {
        id: toastId,
      });
    } catch (cause) {
      await devices.refresh();
      toast.error(t("attendance.device.testFailed"), {
        id: toastId,
        description: apiErrorMessage(cause),
      });
    }
  };
  return (
    <>
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button permission="create">
              <Plus />
              {t("attendance.device.setup")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("attendance.device.connectTitle")}</DialogTitle>
            </DialogHeader>
            <form className="space-y-3" onSubmit={submit}>
              <Input
                name="name"
                placeholder={t("attendance.device.namePlaceholder")}
                required
              />
              <div className="grid grid-cols-[1fr_100px] gap-2">
                <Input name="ipAddress" placeholder="192.168.1.64" required />
                <Input name="port" type="number" defaultValue="80" required />
              </div>
              <Input name="username" defaultValue="admin" required />
              <Input
                name="password"
                type="password"
                placeholder={t("attendance.device.passwordPlaceholder")}
                required
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button permission="create" disabled={busy} className="w-full">
                {busy
                  ? t("attendance.device.connecting")
                  : t("attendance.device.connectSave")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ResourceState
          isLoading={devices.isLoading}
          error={devices.error}
          isEmpty={!devices.data?.length}
        />
        {(devices.data ?? []).map((d) => (
          <Card
            key={d.id}
            className="group overflow-hidden rounded-2xl border-border/70 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
          >
            <CardContent className="p-0">
              <div className="flex items-start justify-between gap-4 p-5 pb-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`grid size-12 shrink-0 place-items-center rounded-2xl ring-1 ring-inset ${d.status === "online" ? "bg-emerald-500/10 text-emerald-700 ring-emerald-600/15 dark:text-emerald-400" : "bg-muted text-muted-foreground ring-border"}`}
                  >
                    {d.status === "online" ? (
                      <Wifi className="size-5" />
                    ) : (
                      <WifiOff className="size-5" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold tracking-tight">
                      {d.name}
                    </h2>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {d.model}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`shrink-0 gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${d.status === "online" ? "border-emerald-600/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}`}
                >
                  <span
                    className={`size-1.5 rounded-full ${d.status === "online" ? "bg-emerald-500" : "bg-slate-400"}`}
                  />
                  {d.status}
                </Badge>
              </div>
              <div className="mx-5 rounded-xl border border-border/60 bg-muted/35 px-3.5 py-3">
                <p
                  className="font-mono text-sm font-medium tracking-tight"
                  dir="ltr"
                >
                  {d.ipAddress}:{d.port}
                </p>
                <p className="mt-1 truncate text-[11px] text-muted-foreground">
                  {d.serialNumber ?? t("attendance.device.serialUnavailable")}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-border/60 px-5 py-4">
                <Button
                  permission="update"
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-xl"
                  onClick={() => setManaging(d)}
                >
                  <Settings2 className="size-4" />
                  {t("common.manage")}
                </Button>
                <Button
                  permission="test"
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2 rounded-xl"
                  onClick={() => void testDevice(d)}
                >
                  <RefreshCw className="size-4" />
                  {t("common.test")}
                </Button>
                <Button
                  permission="attendance.events.delete"
                  title={t("attendance.device.clearEvents")}
                  aria-label={t("attendance.device.clearEvents")}
                  variant="ghost"
                  size="icon"
                  className="shrink-0 rounded-xl text-amber-600 hover:bg-amber-500/10 hover:text-amber-700"
                  onClick={() => setClearingEvents(d)}
                >
                  <CalendarX2 className="size-4" />
                </Button>
                <Button
                  data-action="delete"
                  title={t("common.delete")}
                  aria-label={t("common.delete")}
                  variant="ghost"
                  size="icon"
                  className="shrink-0 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setDeleting(d)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <PaginationControls
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={pagination.onPageChange}
      />
      <Dialog
        open={!!managing}
        onOpenChange={(value) => {
          if (!value) {
            setManaging(null);
            setError("");
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 />
              {t("attendance.device.editTitle", { name: managing?.name })}
            </DialogTitle>
          </DialogHeader>
          {managing && (
            <form className="space-y-4" onSubmit={saveDevice}>
              <div>
                <label className="mb-1.5 block text-xs font-semibold">
                  {t("attendance.device.name")}
                </label>
                <Input name="name" defaultValue={managing.name} required />
              </div>
              <div className="grid grid-cols-[1fr_100px] gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold">
                    {t("attendance.device.ipAddress")}
                  </label>
                  <Input
                    name="ipAddress"
                    dir="ltr"
                    defaultValue={managing.ipAddress}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold">
                    {t("attendance.device.port")}
                  </label>
                  <Input
                    name="port"
                    type="number"
                    min="1"
                    max="65535"
                    defaultValue={managing.port}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold">
                    {t("attendance.device.username")}
                  </label>
                  <Input
                    name="username"
                    defaultValue={managing.username}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold">
                    {t("attendance.device.password")}
                  </label>
                  <Input
                    name="password"
                    type="password"
                    placeholder={t("attendance.device.passwordUnchanged")}
                  />
                </div>
              </div>
              {error && (
                <p className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                  {error}
                </p>
              )}
              <Button permission="update" className="w-full" disabled={busy}>
                {busy
                  ? t("attendance.schedule.saving")
                  : t("attendance.device.saveChanges")}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <DeleteConfirmationDialog
        permission="attendance.events.delete"
        open={!!clearingEvents}
        title={t("attendance.device.clearEventsTitle")}
        description={t("attendance.device.clearEventsDescription", {
          name: clearingEvents?.name,
        })}
        onOpenChange={(value) => {
          if (!value) setClearingEvents(null);
        }}
        onConfirm={async (password) => {
          if (!clearingEvents) return;
          const response = await attendanceApi.clearDeviceEvents(
            clearingEvents.id,
            password,
          );
          toast.success(t("attendance.device.eventsCleared"), {
            description: t("attendance.device.eventsDeletedCount", {
              count: response.data.deleted,
            }),
          });
        }}
      />
      <DeleteConfirmationDialog
        open={!!deleting}
        title={t("attendance.device.deleteTitle")}
        description={t("attendance.device.deleteDescription", {
          name: deleting?.name ?? t("attendance.device.thisDevice"),
        })}
        onOpenChange={(value) => {
          if (!value) setDeleting(null);
        }}
        onConfirm={async (password) => {
          if (!deleting) return;
          await attendanceApi.deleteDevice(deleting.id, password);
          await devices.refresh();
        }}
      />
    </>
  );
}
