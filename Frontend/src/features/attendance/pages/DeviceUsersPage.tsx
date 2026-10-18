import { useServerTable } from "@/shared/hooks/useServerTable";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CreditCard,
  Fingerprint,
  KeyRound,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  ScanFace,
  Trash2,
} from "lucide-react";
import { attendanceApi, type Person } from "../api/attendance.api";
import { toast } from "sonner";
import { hrApi } from "@/features/hr/api/hr.api";
import { DeleteConfirmationDialog } from "../components/DeleteConfirmationDialog";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { apiErrorMessage } from "@/shared/api/client";
import { TableResourceState } from "@/shared/components/ui/table-resource-state";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

type Credential = "card" | "fingerprint" | "face" | "pin";

export default function DeviceUsersPage() {
  const { t, i18n } = useTranslation();
  const devices = useApiResource(
    useCallback(() => attendanceApi.devices(), []),
  );
  const [deviceFilter, setDeviceFilter] = useState("");
  const selectedDeviceId = deviceFilter || devices.data?.[0]?.id || "";
  const people = useApiResource(
    useCallback(
      () =>
        selectedDeviceId
          ? attendanceApi.people(selectedDeviceId)
          : Promise.resolve([]),
      [selectedDeviceId],
    ),
  );
  const [syncing, setSyncing] = useState(false);
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const pagedPeople = useServerTable<Person>(
    "/attendance/people",
    {
      deviceId: selectedDeviceId,
      search: employeeSearch,
      employeeId: employeeFilter === "all" ? undefined : employeeFilter,
    },
    Boolean(selectedDeviceId),
  );
  const filteredPeople = pagedPeople.data ?? [];
  const employees = useApiResource(
    useCallback(() => hrApi.employees.list(), []),
  );
  const linkedEmployeeIds = useMemo(
    () =>
      new Set(
        (people.data ?? [])
          .map((person) => person.employeeId)
          .filter((id): id is string => Boolean(id)),
      ),
    [people.data],
  );
  const unlinkedEmployees = useMemo(
    () =>
      (employees.data ?? []).filter(
        (employee) => !linkedEmployeeIds.has(employee.id),
      ),
    [employees.data, linkedEmployeeIds],
  );
  const [open, setOpen] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [employeeNo, setEmployeeNo] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [credential, setCredential] = useState<{
    person: Person;
    method: Credential;
  } | null>(null);
  const [credentialBusy, setCredentialBusy] = useState(false);
  const [credentialError, setCredentialError] = useState("");
  const [removingCredential, setRemovingCredential] = useState<{
    person: Person;
    method: Credential;
  } | null>(null);
  const [removeBusy, setRemoveBusy] = useState(false);
  const [removeError, setRemoveError] = useState("");
  const [deleting, setDeleting] = useState<Person | null>(null);
  const [editing, setEditing] = useState<Person | null>(null);
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState("");
  const nextEmployeeNo = (selectedDeviceId: string) => {
    const highest = (people.data ?? [])
      .filter((person) => person.deviceId === selectedDeviceId)
      .reduce((maximum, person) => {
        const value = Number(person.employeeNo);
        return Number.isSafeInteger(value) ? Math.max(maximum, value) : maximum;
      }, 0);
    return String(highest + 1);
  };
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const employeeNo = String(f.get("employeeNo") ?? "").trim();
    const duplicate = people.data?.find(
      (person) =>
        person.deviceId === deviceId && person.employeeNo === employeeNo,
    );
    if (duplicate) {
      setError(
        `Employee #${employeeNo} already exists on this device as ${duplicate.name}. Use a different employee number or edit that user.`,
      );
      setBusy(false);
      return;
    }
    try {
      await attendanceApi.addPerson({
        deviceId,
        employeeId: f.get("employeeId") || undefined,
        employeeNo,
        name: f.get("name"),
        cardNo: f.get("cardNo") || undefined,
      });
      setOpen(false);
      setEmployeeNo("");
      await Promise.all([people.refresh(), pagedPeople.refresh()]);
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };
  const startCredential = (person: Person, method: Credential) => {
    setCredentialError("");
    setCredential({ person, method });
  };
  const enroll = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!credential) return;
    setCredentialBusy(true);
    setCredentialError("");
    const form = new FormData(e.currentTarget);
    try {
      await attendanceApi.enroll(
        credential.person.id,
        credential.method,
        credential.method === "card"
          ? { cardNo: String(form.get("cardNo") ?? "") }
          : credential.method === "pin"
            ? { pin: String(form.get("pin") ?? "") }
            : {},
      );
      setCredential(null);
      await Promise.all([people.refresh(), pagedPeople.refresh()]);
    } catch (cause) {
      setCredentialError(apiErrorMessage(cause));
    } finally {
      setCredentialBusy(false);
    }
  };
  const update = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;
    setEditBusy(true);
    setEditError("");
    const form = new FormData(e.currentTarget);
    try {
      await attendanceApi.updatePerson(editing.id, {
        employeeId: form.get("employeeId") || null,
        name: String(form.get("name") ?? "").trim(),
        cardNo: String(form.get("cardNo") ?? "").trim() || null,
      });
      setEditing(null);
      await Promise.all([people.refresh(), pagedPeople.refresh()]);
    } catch (cause) {
      setEditError(apiErrorMessage(cause));
    } finally {
      setEditBusy(false);
    }
  };
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <Select
            value={selectedDeviceId}
            disabled={syncing || !devices.data?.length}
            onValueChange={(value) => {
              setDeviceFilter(value);
              setEmployeeFilter("all");
              setEmployeeSearch("");
            }}
          >
            <SelectTrigger
              className="w-full sm:w-64"
              aria-label={t("table.headers.device")}
            >
              <SelectValue placeholder={t("deviceUsers.chooseDevice")} />
            </SelectTrigger>
            <SelectContent>
              {(devices.data ?? []).map((device) => (
                <SelectItem key={device.id} value={device.id}>
                  {device.name} ({device.ipAddress})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            permission="sync"
            variant="outline"
            disabled={syncing || !selectedDeviceId}
            onClick={async () => {
              setSyncing(true);
              try {
                const result = await attendanceApi.syncPeople(selectedDeviceId);
                await Promise.all([people.refresh(), pagedPeople.refresh()]);
                if (result.errors.length) {
                  toast.warning(t("attendanceFilters.syncPartial"), {
                    description: result.errors
                      .map((error) => `${error.deviceName}: ${error.message}`)
                      .join(" · "),
                  });
                } else {
                  toast.success(
                    t("deviceUsers.syncComplete", { count: result.synced }),
                  );
                }
              } catch (error) {
                toast.error(t("attendanceFilters.syncFailed"), {
                  description: apiErrorMessage(error),
                });
              } finally {
                setSyncing(false);
              }
            }}
          >
            <RefreshCw className={syncing ? "size-4 animate-spin" : "size-4"} />
            {t("attendanceFilters.sync")}
          </Button>
          <Input
            className="w-full sm:w-72"
            value={employeeSearch}
            onChange={(event) => setEmployeeSearch(event.target.value)}
            placeholder={t("attendanceFilters.searchEmployee")}
            aria-label={t("attendanceFilters.searchEmployee")}
          />
          <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
            <SelectTrigger
              className="w-full sm:w-64"
              aria-label={t("table.headers.employee")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("attendanceFilters.allEmployees")}
              </SelectItem>
              <SelectItem value="unlinked">
                {t("deviceUsers.notLinked")}
              </SelectItem>
              {(employees.data ?? []).map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {String(employee.employeeCode)} — {String(employee.firstName)}{" "}
                  {String(employee.lastName)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog
            open={open}
            onOpenChange={(value) => {
              setOpen(value);
              setError("");
              if (value) {
                const selectedDevice =
                  selectedDeviceId ||
                  deviceId ||
                  (devices.data?.length === 1 ? devices.data[0].id : "");
                if (selectedDevice) {
                  setDeviceId(selectedDevice);
                  setEmployeeNo(nextEmployeeNo(selectedDevice));
                }
              } else {
                setEmployeeNo("");
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                permission="create"
                className="ms-auto gap-2"
                disabled={!selectedDeviceId || people.isLoading}
              >
                <Plus className="size-4" />
                {t("deviceUsers.add")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("deviceUsers.addTitle")}</DialogTitle>
              </DialogHeader>
              <form className="space-y-3" onSubmit={submit}>
                <Select
                  value={deviceId}
                  disabled
                  onValueChange={(value) => {
                    setDeviceId(value);
                    setEmployeeNo(nextEmployeeNo(value));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("deviceUsers.chooseDevice")} />
                  </SelectTrigger>
                  <SelectContent>
                    {devices.data?.map((d) => (
                      <SelectItem value={d.id} key={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="employeeNo" value={employeeNo} />
                <Select name="employeeId">
                  <SelectTrigger>
                    <SelectValue placeholder={t("deviceUsers.linkEmployee")} />
                  </SelectTrigger>
                  <SelectContent>
                    {unlinkedEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {String(employee.employeeCode)} —{" "}
                        {String(employee.firstName)} {String(employee.lastName)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  name="name"
                  placeholder={t("deviceUsers.fullName")}
                  required
                />
                <Input
                  name="cardNo"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder={t("deviceUsers.cardOptional")}
                />
                {error && (
                  <p className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                    {error}
                  </p>
                )}
                <Button
                  permission="create"
                  className="w-full"
                  disabled={!deviceId || busy}
                >
                  {busy ? t("deviceUsers.creating") : t("deviceUsers.create")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("table.headers.user")}</TableHead>
              <TableHead>{t("table.headers.device")}</TableHead>
              <TableHead>{t("deviceUsers.erpEmployeeUser")}</TableHead>
              <TableHead>{t("table.headers.credentials")}</TableHead>
              <TableHead className="text-end">{t("table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody {...pagedPeople.tableProps}>
            <TableResourceState
              isLoading={pagedPeople.isLoading}
              error={pagedPeople.error}
              isEmpty={!filteredPeople.length}
              colSpan={5}
            />
            {!pagedPeople.isLoading &&
              !pagedPeople.error &&
              filteredPeople.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <b>{p.name}</b>
                    <small className="block text-muted-foreground">
                      #{p.employeeNo}
                    </small>
                  </TableCell>
                  <TableCell>{p.device?.name}</TableCell>
                  <TableCell>
                    {p.employee ? (
                      <>
                        <b>
                          {p.employee.firstName} {p.employee.lastName}
                        </b>
                        <small className="block text-muted-foreground">
                          {p.employee.employeeCode}
                          {p.employee.user
                            ? ` · @${p.employee.user.username}`
                            : ` · ${t("deviceUsers.noSystemUser")}`}
                        </small>
                      </>
                    ) : (
                      <span className="text-destructive">
                        {t("deviceUsers.notLinked")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {[
                        {
                          method: "card" as Credential,
                          active: Boolean(p.cardNo),
                          Icon: CreditCard,
                        },
                        {
                          method: "fingerprint" as Credential,
                          active: p.hasFingerprint,
                          Icon: Fingerprint,
                        },
                        {
                          method: "face" as Credential,
                          active: p.hasFace,
                          Icon: ScanFace,
                        },
                        {
                          method: "pin" as Credential,
                          active: p.hasPassword,
                          Icon: KeyRound,
                        },
                      ].map(({ method, active, Icon }) => (
                        <DropdownMenu key={method} dir={i18n.dir()}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              title={t(
                                `attendancePage.credentials.${method}.label`,
                              )}
                              aria-label={`${p.name}: ${t(
                                `attendancePage.credentials.${method}.label`,
                              )} — ${t("table.actions")}`}
                              variant={active ? "secondary" : "ghost"}
                              size="icon"
                              className={`border-0 shadow-none ${active ? "bg-primary/25 text-primary hover:bg-primary/35 data-[state=open]:bg-primary/35" : ""}`}
                            >
                              <Icon className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem
                              permission="create"
                              onSelect={() => startCredential(p, method)}
                            >
                              <Icon className="size-4" />
                              {t(`attendancePage.credentials.${method}.set`)}
                            </DropdownMenuItem>
                            {active && (
                              <DropdownMenuItem
                                permission="delete"
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                onSelect={() => {
                                  setRemoveError("");
                                  setRemovingCredential({ person: p, method });
                                }}
                              >
                                <Trash2 className="size-3.5" />
                                {t("attendancePage.removeCredential", {
                                  credential: t(
                                    `attendancePage.credentials.${method}.label`,
                                  ),
                                })}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex flex-wrap items-center gap-2 justify-end">
                      <Button
                        data-action="edit"
                        title={t("deviceUsers.edit")}
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditError("");
                          setEditing(p);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        data-action="delete"
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setDeleting(p)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <Dialog
          open={!!credential}
          onOpenChange={(value) => {
            if (!value && !credentialBusy) setCredential(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {credential?.method === "card"
                  ? t("deviceUsers.setCard")
                  : credential?.method === "fingerprint"
                    ? t("deviceUsers.captureFingerprint")
                    : credential?.method === "face"
                      ? t("deviceUsers.captureFace")
                      : t("deviceUsers.setPin")}
              </DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={enroll}>
              <p className="text-sm text-muted-foreground">
                {t("deviceUsers.assigningTo")}{" "}
                <b className="text-foreground">{credential?.person.name}</b> on
                {t("deviceUsers.onTerminal")}
              </p>
              {credential?.method === "card" ? (
                <Input
                  name="cardNo"
                  inputMode="numeric"
                  pattern="[0-9]+"
                  placeholder={t("deviceUsers.cardNumberPlaceholder")}
                  autoFocus
                  required
                />
              ) : credential?.method === "pin" ? (
                <Input
                  name="pin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]{4,8}"
                  minLength={4}
                  maxLength={8}
                  placeholder={t("deviceUsers.pinPlaceholder")}
                  autoComplete="new-password"
                  autoFocus
                  required
                />
              ) : (
                <div className="rounded-xl border bg-muted/40 p-4 text-sm">
                  {credential?.method === "fingerprint"
                    ? t("deviceUsers.fingerprintInstruction")
                    : t("deviceUsers.faceInstruction")}
                </div>
              )}
              {credentialError && (
                <p className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                  {credentialError}
                </p>
              )}
              <Button
                permission="create"
                className="w-full gap-2"
                disabled={credentialBusy}
              >
                {credentialBusy && (
                  <LoaderCircle className="size-4 animate-spin" />
                )}
                {credentialBusy
                  ? t("deviceUsers.waiting")
                  : t("deviceUsers.start")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog
          open={!!editing}
          onOpenChange={(value) => {
            if (!value && !editBusy) setEditing(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("deviceUsers.editTitle")}</DialogTitle>
            </DialogHeader>
            {editing && (
              <form className="space-y-3" onSubmit={update}>
                <Input
                  value={editing.employeeNo}
                  aria-label="Employee number"
                  disabled
                />
                <Select
                  name="employeeId"
                  defaultValue={editing.employeeId ?? undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("deviceUsers.linkEmployee")} />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.data
                      ?.filter(
                        (employee) =>
                          employee.id === editing.employeeId ||
                          !linkedEmployeeIds.has(employee.id),
                      )
                      .map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {String(employee.employeeCode)} —{" "}
                          {String(employee.firstName)}{" "}
                          {String(employee.lastName)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Input
                  name="name"
                  defaultValue={editing.name}
                  placeholder={t("deviceUsers.fullName")}
                  required
                />
                <Input
                  name="cardNo"
                  defaultValue={editing.cardNo ?? ""}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder={t("deviceUsers.cardOptional")}
                />
                <p className="text-xs text-muted-foreground">
                  {t("deviceUsers.updateDescription")}
                </p>
                {editError && (
                  <p className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                    {editError}
                  </p>
                )}
                <Button
                  permission="update"
                  className="w-full gap-2"
                  disabled={editBusy}
                >
                  {editBusy && <LoaderCircle className="size-4 animate-spin" />}
                  {editBusy
                    ? t("deviceUsers.updating")
                    : t("deviceUsers.update")}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
        <DeleteConfirmationDialog
          open={!!deleting}
          title={t("deviceUsers.deleteTitle")}
          description={t("deviceUsers.deleteDescription", {
            name: deleting?.name ?? t("deviceUsers.thisUser"),
          })}
          onOpenChange={(value) => {
            if (!value) setDeleting(null);
          }}
          onConfirm={async (password) => {
            if (!deleting) return;
            await attendanceApi.deletePerson(deleting.id, password);
            await Promise.all([people.refresh(), pagedPeople.refresh()]);
          }}
        />
        <Dialog
          open={!!removingCredential}
          onOpenChange={(value) => {
            if (!value && !removeBusy) setRemovingCredential(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t("attendancePage.removeCredentialTitle")}
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              {t("attendancePage.removeCredentialDescription", {
                credential: removingCredential
                  ? t(
                      `attendancePage.credentials.${removingCredential.method}.label`,
                    )
                  : "",
                name: removingCredential?.person.name ?? "",
              })}
            </p>
            {removeError && (
              <p className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                {removeError}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                disabled={removeBusy}
                onClick={() => setRemovingCredential(null)}
              >
                {t("common.cancel", { defaultValue: "Cancel" })}
              </Button>
              <Button
                permission="delete"
                variant="destructive"
                disabled={removeBusy}
                onClick={async () => {
                  if (!removingCredential) return;
                  setRemoveBusy(true);
                  setRemoveError("");
                  try {
                    await attendanceApi.removeCredential(
                      removingCredential.person.id,
                      removingCredential.method,
                    );
                    setRemovingCredential(null);
                    await Promise.all([
                      people.refresh(),
                      pagedPeople.refresh(),
                    ]);
                  } catch (cause) {
                    setRemoveError(apiErrorMessage(cause));
                  } finally {
                    setRemoveBusy(false);
                  }
                }}
              >
                {removeBusy && <LoaderCircle className="size-4 animate-spin" />}
                {removeBusy
                  ? t("attendancePage.removingCredential")
                  : t("attendancePage.removeFromDevice")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
