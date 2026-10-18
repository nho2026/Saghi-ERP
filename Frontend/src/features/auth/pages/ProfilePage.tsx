import { useServerTable } from "@/shared/hooks/useServerTable";
import type { AttendanceEvent } from "@/features/attendance/api/attendance.api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  BriefcaseBusiness,
  CalendarDays,
  KeyRound,
  Mail,
  MapPin,
  Pencil,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { apiErrorMessage } from "@/shared/api/client";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { TableResourceState } from "@/shared/components/ui/table-resource-state";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { changeOwnPassword, getProfile, updateProfile } from "../api/auth.api";
import type { AuthUser } from "../types/auth.types";
import { employeePortalApi } from "@/features/employee-portal/api/employee-portal.api";

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const profile = useApiResource(useCallback(() => getProfile(), []));
  const events = useServerTable<AttendanceEvent>("/auth/profile/events");
  const warnings = useApiResource(
    useCallback(() => employeePortalApi.warnings(), []),
  );
  const [user, setUser] = useState<AuthUser | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (profile.data) setUser(profile.data);
  }, [profile.data]);
  const initials = useMemo(
    () =>
      user?.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() ?? "—",
    [user?.name],
  );
  const employee = user?.employee;
  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      const updated = await updateProfile({
        name: String(form.get("name")),
        email: String(form.get("email")),
        department: String(form.get("department") || "") || null,
      });
      setUser(updated);
      sessionStorage.setItem("nho-current-user", JSON.stringify(updated));
      setEditing(false);
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };
  const savePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const next = String(form.get("newPassword"));
    if (next !== String(form.get("confirmPassword")))
      return toast.error(t("profile.passwordMismatch"));
    setSaving(true);
    try {
      await changeOwnPassword(user.id, {
        currentPassword: String(form.get("currentPassword")),
        newPassword: next,
      });
      formElement.reset();
      toast.success(t("profile.passwordUpdated"));
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-6">
      <Card className="overflow-hidden border-0 shadow-sm">
        <div className="h-32 bg-[linear-gradient(120deg,#1C9B49,#1596b7,#1C9B49)]" />
        <CardContent className="relative grid grid-cols-[auto_minmax(0,1fr)] items-end gap-4 px-4 pb-5 sm:gap-5 sm:px-6 sm:pb-6 md:grid-cols-[auto_minmax(0,1fr)_auto]">
          <Avatar className="-mt-10 size-20 border-4 sm:-mt-14 sm:size-28 border-card shadow-lg">
            <AvatarFallback className="bg-primary text-3xl font-bold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-bold">
                {user?.name ?? t("resourceState.loading")}
              </h1>
              <Badge>{user?.status ?? "active"}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              @{user?.username} · {user?.role ?? t("profile.noRole")}
            </p>
          </div>
          <Button
            data-action="edit"
            className="col-span-2 w-full md:col-span-1 md:w-auto"
            variant={editing ? "secondary" : "outline"}
            onClick={() => setEditing((value) => !value)}
          >
            <Pencil />
            {editing ? t("profile.cancel") : t("profile.edit")}
          </Button>
        </CardContent>
      </Card>
      <div className="grid min-w-0 gap-5 lg:grid-cols-12 lg:items-stretch">
        <Card className="min-w-0 rounded-2xl lg:col-span-7">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRound className="text-primary" />
              {t("profile.personalInformation")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.isLoading ? (
              <div className="h-36 animate-pulse rounded-xl bg-muted" />
            ) : (
              <form
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={saveProfile}
              >
                <Label className="flex flex-col gap-2 text-xs font-medium">
                  {t("profile.fullName")}
                  <Input
                    name="name"
                    defaultValue={user?.name ?? ""}
                    disabled={!editing}
                    required
                  />
                </Label>
                <Label className="flex flex-col gap-2 text-xs font-medium">
                  {t("profile.email")}
                  <Input
                    name="email"
                    type="email"
                    defaultValue={user?.email ?? ""}
                    disabled={!editing}
                    required
                  />
                </Label>
                <Label className="flex flex-col gap-2 text-xs font-medium sm:col-span-2">
                  {t("profile.department")}
                  <Input
                    name="department"
                    defaultValue={
                      user?.department ?? employee?.department?.name ?? ""
                    }
                    disabled={!editing}
                  />
                </Label>
                {editing && (
                  <Button
                    permission="update"
                    className="sm:col-span-2"
                    disabled={saving}
                  >
                    {saving ? t("profile.saving") : t("profile.save")}
                  </Button>
                )}
              </form>
            )}
          </CardContent>
        </Card>
        <Card className="min-w-0 rounded-2xl lg:col-span-5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BriefcaseBusiness className="text-primary" />
              {t("profile.employment")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              [ShieldCheck, t("profile.role"), user?.role],
              [UserRound, t("profile.employeeCode"), employee?.employeeCode],
              [
                BriefcaseBusiness,
                t("profile.position"),
                employee?.position?.name,
              ],
              [MapPin, t("profile.department"), employee?.department?.name],
              [
                CalendarDays,
                t("profile.hireDate"),
                employee?.hireDate
                  ? new Intl.DateTimeFormat(i18n.resolvedLanguage, {
                      dateStyle: "medium",
                    }).format(new Date(employee.hireDate))
                  : null,
              ],
              [Mail, t("profile.email"), user?.email],
            ].map(([Icon, label, value], index) => {
              const ItemIcon = Icon as typeof ShieldCheck;
              return (
                <div
                  className="flex min-w-0 items-start gap-3 rounded-xl bg-muted/60 p-3"
                  key={index}
                >
                  <ItemIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <small className="block text-muted-foreground">
                      {String(label)}
                    </small>
                    <b className="block break-words text-sm font-semibold">
                      {String(value || "—")}
                    </b>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-hidden rounded-2xl lg:col-span-8 lg:row-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="text-primary" />
              {t("profile.recentAttendance")}
            </CardTitle>
          </CardHeader>
          <CardContent className="min-w-0 overflow-x-auto p-0">
            <Table className="min-w-[560px]">
              <TableHeader>
                <TableRow>
                  <TableHead>{t("profile.event")}</TableHead>
                  <TableHead>{t("profile.device")}</TableHead>
                  <TableHead>{t("profile.verification")}</TableHead>
                  <TableHead>{t("profile.dateTime")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody {...events.tableProps}>
                <TableResourceState
                  isLoading={events.isLoading}
                  error={events.error}
                  isEmpty={!events.data?.length}
                  colSpan={4}
                />
                {events.data?.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Badge variant="secondary">
                        {t(`profile.${event.eventType}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>{event.device.name}</TableCell>
                    <TableCell>{event.verification || "—"}</TableCell>
                    <TableCell>
                      {new Intl.DateTimeFormat(i18n.resolvedLanguage, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(event.occurredAt))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="min-w-0 rounded-2xl lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="text-primary" />
              {t("profile.security")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={savePassword}>
              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-currentPassword">
                  {t("profile.currentPassword")}
                </Label>
                <Input
                  id="profile-currentPassword"
                  autoComplete="current-password"
                  name="currentPassword"
                  type="password"
                  placeholder={t("profile.currentPassword")}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-newPassword">
                  {t("profile.newPassword")}
                </Label>
                <Input
                  id="profile-newPassword"
                  autoComplete="new-password"
                  name="newPassword"
                  type="password"
                  minLength={8}
                  placeholder={t("profile.newPassword")}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-confirmPassword">
                  {t("profile.confirmPassword")}
                </Label>
                <Input
                  id="profile-confirmPassword"
                  autoComplete="new-password"
                  name="confirmPassword"
                  type="password"
                  minLength={8}
                  placeholder={t("profile.confirmPassword")}
                  required
                />
              </div>
              <Button
                permission="update"
                className="w-full"
                variant="outline"
                disabled={saving}
              >
                {t("profile.changePassword")}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card className="min-w-0 rounded-2xl lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base">
              {t("employeePortal.warnings")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!warnings.data?.length ? (
              <p className="text-sm text-muted-foreground">
                {t("employeePortal.noWarnings")}
              </p>
            ) : (
              warnings.data.slice(0, 5).map((item) => (
                <div
                  key={item.warningId}
                  className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3"
                >
                  <div className="flex justify-between gap-2">
                    <b className="text-sm">{item.warning.title}</b>
                    <Badge
                      variant={
                        item.warning.severity === "urgent"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {item.warning.severity}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs">{item.warning.message}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
