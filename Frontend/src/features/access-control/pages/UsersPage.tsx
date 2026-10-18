import { useServerTable } from "@/shared/hooks/useServerTable";
import { useCallback, useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyholeOpen,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { usersApi, rolesApi } from "../api/access.api";
import type { User } from "../types/access.types";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { apiErrorMessage } from "@/shared/api/client";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { TableResourceState } from "@/shared/components/ui/table-resource-state";
import { DeleteConfirmationDialog } from "@/shared/components/ui/confirmation-dialog";
import { useTranslation } from "react-i18next";
import { hasPermission, storedUser } from "@/features/auth/access";
import { healthcareApi } from "@/features/healthcare/api/healthcare.api";
export default function UsersPage() {
  const { t } = useTranslation();
  const currentUser = storedUser();
  const canAssignRoles = hasPermission(currentUser, "users.assign_roles");
  const canChangePassword = hasPermission(currentUser, "users.password");
  const canCreate = hasPermission(currentUser, "users.create");
  const canUpdate = hasPermission(currentUser, "users.update");
  const canDelete = hasPermission(currentUser, "users.delete");
  const canViewRoles = hasPermission(currentUser, "roles.view");
  const canEditUsers = canCreate || canUpdate;
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const users = useServerTable<User>("/users", { search }),
    roles = useApiResource(
      useCallback(
        () => (canViewRoles ? rolesApi.list() : Promise.resolve([])),
        [canViewRoles],
      ),
    ),
    departments = useApiResource(
      useCallback(
        () =>
          canEditUsers ? healthcareApi.departments.list() : Promise.resolve([]),
        [canEditUsers],
      ),
    );
  const [editing, setEditing] = useState<User | null | undefined>(undefined),
    [roleId, setRoleId] = useState(""),
    [department, setDepartment] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const isHospitalDepartment =
    departments.data?.some(
      (item) =>
        item.name === department &&
        item.type === "hospital" &&
        item.status === "active",
    ) ?? false;
  const storages = useApiResource(
    useCallback(
      () =>
        editing !== undefined && isHospitalDepartment
          ? usersApi.storageOptions()
          : Promise.resolve([]),
      [editing, isHospitalDepartment],
    ),
  );
  const [showPassword, setShowPassword] = useState(false);
  const filtered = users.data ?? [];
  const selectable = filtered.filter((user) => user.id !== currentUser?.id);
  const selectedOnPage = selectable.filter((user) =>
    selectedIds.has(user.id),
  ).length;
  const toggleSelection = (ids: string[], checked: boolean) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      ids.forEach((id) => (checked ? next.add(id) : next.delete(id)));
      return next;
    });
  };
  const deleteSelected = async () => {
    if (deleting || !canDelete || !selectedIds.size) return;
    setDeleting(true);
    setDeleteError("");
    const failed = new Set<string>();
    const errors: string[] = [];
    try {
      for (const id of selectedIds) {
        try {
          await usersApi.remove(id);
        } catch (cause) {
          failed.add(id);
          errors.push(apiErrorMessage(cause));
        }
      }
      setSelectedIds(failed);
      if (errors.length)
        setDeleteError(
          t("usersAdmin.bulkDeleteFailed", {
            count: errors.length,
            error: [...new Set(errors)].join(" "),
          }),
        );
      await users.refresh();
    } finally {
      setDeleting(false);
    }
  };
  const openEditor = (user: User | null) => {
    if (canViewRoles) void roles.refresh();
    if (canEditUsers) void departments.refresh();
    setShowPassword(false);
    setEditing(user);
    setRoleId(user?.roles?.[0]?.id ?? "");
    setDepartment(user?.department ?? "");
    setWarehouseId(user?.warehouseId ?? "");
    setError("");
  };
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const data = {
      username: String(f.get("username")),
      email: String(f.get("email")),
      name: String(f.get("name")),
      department,
      ...((isHospitalDepartment || editing?.warehouseId) && {
        warehouseId: isHospitalDepartment ? warehouseId || null : null,
      }),
      status: String(f.get("status")),
      ...(canAssignRoles && { roleIds: roleId ? [roleId] : [] }),
      ...(!editing && { password: String(f.get("password")) }),
      ...(editing &&
        canChangePassword &&
        f.get("password") && { password: String(f.get("password")) }),
    };
    try {
      if (editing) await usersApi.update(editing.id, data);
      else await usersApi.create(data);
      setEditing(undefined);
      await users.refresh();
    } catch (c) {
      setError(apiErrorMessage(c));
    } finally {
      setBusy(false);
    }
  };
  const unlockAttempts = async (id: string) => {
    setUnlockingId(id);
    setError("");
    setNotice("");
    try {
      await usersApi.unlockAttempts(id);
      setNotice(t("usersAdmin.unlockSuccess"));
    } catch (c) {
      setError(apiErrorMessage(c));
    } finally {
      setUnlockingId(null);
    }
  };
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("usersAdmin.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("usersAdmin.description")}
          </p>
        </div>
        {canCreate && (
          <Button permission="create" onClick={() => openEditor(null)}>
            <Plus />
            {t("usersAdmin.add")}
          </Button>
        )}
      </div>
      <Card>
        <CardContent className="p-0">
          {notice && (
            <p
              role="status"
              className="mx-4 mt-4 text-sm text-muted-foreground"
            >
              {notice}
            </p>
          )}
          <div className="relative m-4 max-w-sm">
            <Search className="absolute inset-s-3 top-1/2 -translate-y-1/2" />
            <Input
              className="ps-9"
              value={search}
              disabled={deleting}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedIds(new Set());
              }}
              placeholder={t("usersAdmin.search")}
            />
          </div>
          {canDelete && selectedIds.size > 0 && (
            <div className="m-4 flex flex-wrap items-center gap-2">
              <DeleteConfirmationDialog
                description={t("usersAdmin.bulkDeleteConfirm", {
                  count: selectedIds.size,
                })}
                onConfirm={deleteSelected}
              >
                <Button
                  data-action="delete"
                  variant="destructive"
                  disabled={deleting}
                >
                  <Trash2 />
                  {t("usersAdmin.deleteSelected", { count: selectedIds.size })}
                </Button>
              </DeleteConfirmationDialog>
              <Button
                variant="outline"
                disabled={deleting}
                onClick={() => setSelectedIds(new Set())}
              >
                {t("usersAdmin.clearSelection")}
              </Button>
            </div>
          )}
          {deleteError && (
            <p role="alert" className="m-4 text-sm text-destructive">
              {deleteError}
            </p>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                {canDelete && (
                  <TableHead className="w-12">
                    <Checkbox
                      aria-label={t("usersAdmin.selectPage")}
                      disabled={
                        deleting ||
                        users.isLoading ||
                        !!users.error ||
                        !selectable.length
                      }
                      checked={
                        selectedOnPage > 0 &&
                        selectedOnPage === selectable.length
                          ? true
                          : selectedOnPage > 0
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={(checked) =>
                        toggleSelection(
                          selectable.map((user) => user.id),
                          checked === true,
                        )
                      }
                    />
                  </TableHead>
                )}
                <TableHead>{t("table.headers.user")}</TableHead>
                <TableHead>{t("table.headers.role")}</TableHead>
                <TableHead>{t("table.headers.department")}</TableHead>
                <TableHead>{t("table.headers.status")}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody {...users.tableProps}>
              <TableResourceState
                isLoading={users.isLoading}
                error={users.error}
                isEmpty={!filtered.length}
                colSpan={canDelete ? 6 : 5}
              />
              {!users.isLoading &&
                !users.error &&
                filtered.map((u) => (
                  <TableRow key={u.id}>
                    {canDelete && (
                      <TableCell>
                        <Checkbox
                          aria-label={t("usersAdmin.selectUser", {
                            name: u.name,
                          })}
                          disabled={deleting || u.id === currentUser?.id}
                          checked={selectedIds.has(u.id)}
                          onCheckedChange={(checked) =>
                            toggleSelection([u.id], checked === true)
                          }
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {u.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <b>{u.name}</b>
                          <small className="block text-muted-foreground">
                            @{u.username} · {u.email}
                          </small>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{u.role ?? "—"}</TableCell>
                    <TableCell>{u.department || "—"}</TableCell>
                    <TableCell>
                      <Badge>{u.status}</Badge>
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="flex flex-wrap items-center gap-2 justify-end">
                        {canUpdate && (
                          <Button
                            data-action="unlock-attempts"
                            variant="ghost"
                            size="icon"
                            aria-label={t("usersAdmin.unlockAttempts")}
                            title={t("usersAdmin.unlockAttempts")}
                            disabled={unlockingId === u.id}
                            onClick={() => void unlockAttempts(u.id)}
                          >
                            <LockKeyholeOpen />
                          </Button>
                        )}
                        {canUpdate && (
                          <Button
                            data-action="edit"
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditor(u)}
                          >
                            <Pencil />
                          </Button>
                        )}
                        {canDelete && (
                          <DeleteConfirmationDialog
                            description={t("usersAdmin.deleteConfirm", {
                              name: u.name,
                            })}
                            onConfirm={async () => {
                              try {
                                setDeleteError("");
                                await usersApi.remove(u.id);
                                toggleSelection([u.id], false);
                                await users.refresh();
                              } catch (c) {
                                setDeleteError(apiErrorMessage(c));
                              }
                            }}
                          >
                            <Button
                              data-action="delete"
                              disabled={deleting || u.id === currentUser?.id}
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                            >
                              <Trash2 className="size-4 text-white" />
                            </Button>
                          </DeleteConfirmationDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog
        open={editing !== undefined}
        onOpenChange={(v) => {
          if (!v) {
            setEditing(undefined);
            setShowPassword(false);
          }
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t(editing ? "usersAdmin.edit" : "usersAdmin.add")}
            </DialogTitle>
          </DialogHeader>
          <form
            key={editing?.id ?? "new"}
            className="space-y-3"
            onSubmit={submit}
          >
            <div className="space-y-2">
              <Label htmlFor="user-name">{t("usersAdmin.fullName")}</Label>
              <Input
                id="user-name"
                name="name"
                defaultValue={editing?.name}
                placeholder={t("usersAdmin.fullName")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-username">{t("usersAdmin.username")}</Label>
              <Input
                id="user-username"
                name="username"
                defaultValue={editing?.username}
                placeholder={t("usersAdmin.username")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">{t("usersAdmin.email")}</Label>
              <Input
                id="user-email"
                name="email"
                type="email"
                defaultValue={editing?.email}
                placeholder={t("usersAdmin.email")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-department">
                {t("usersAdmin.department")}
              </Label>
              <Select
                value={department || "none"}
                onValueChange={(value) =>
                  setDepartment(value === "none" ? "" : value)
                }
              >
                <SelectTrigger id="user-department">
                  <SelectValue placeholder={t("usersAdmin.department")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {departments.data?.map((item) => (
                    <SelectItem key={item.id} value={String(item.name)}>
                      {String(item.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isHospitalDepartment && (
              <div className="space-y-2">
                <Label htmlFor="user-storage">
                  {t("usersAdmin.assignedStorage")}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t("usersAdmin.storageHelp")}
                </p>
                <Select
                  value={warehouseId || "none"}
                  onValueChange={(value) =>
                    setWarehouseId(value === "none" ? "" : value)
                  }
                  disabled={busy || storages.isLoading || !!storages.error}
                >
                  <SelectTrigger id="user-storage">
                    <SelectValue
                      placeholder={t("usersAdmin.assignedStorage")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {t("healthcareAdmin.none")}
                    </SelectItem>
                    {editing?.warehouse &&
                      !storages.data?.some(
                        (item) => item.id === editing.warehouseId,
                      ) && (
                        <SelectItem value={editing.warehouse.id}>
                          {editing.warehouse.name}
                        </SelectItem>
                      )}
                    {storages.data?.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {storages.error && (
                  <p role="alert" className="text-sm text-destructive">
                    {storages.error}
                  </p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="user-password">
                {t(
                  editing ? "usersAdmin.newPasswordOptional" : "auth.password",
                )}
              </Label>
              <div className="relative">
                <Input
                  id="user-password"
                  name="password"
                  className="pe-12"
                  disabled={Boolean(editing) && !canChangePassword}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={8}
                  aria-describedby={editing ? "user-password-help" : undefined}
                  placeholder={t(
                    editing
                      ? "usersAdmin.newPasswordOptional"
                      : "usersAdmin.passwordMinimum",
                  )}
                  required={!editing}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute end-1 top-1/2 -translate-y-1/2"
                  disabled={Boolean(editing) && !canChangePassword}
                  aria-label={t(
                    showPassword ? "auth.hidePassword" : "auth.showPassword",
                  )}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
              {editing && (
                <p
                  id="user-password-help"
                  className="text-xs text-muted-foreground"
                >
                  {t("usersAdmin.passwordUnavailable")}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-role">{t("rolesTable.name")}</Label>
              <Select
                permission="users.assign_roles"
                value={roleId}
                onValueChange={setRoleId}
              >
                <SelectTrigger id="user-role">
                  <SelectValue placeholder={t("usersAdmin.chooseRole")} />
                </SelectTrigger>
                <SelectContent>
                  {roles.data?.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-status">{t("usersAdmin.statusLabel")}</Label>
              <Select name="status" defaultValue={editing?.status ?? "active"}>
                <SelectTrigger id="user-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    {t("dashboard.status.active")}
                  </SelectItem>
                  <SelectItem value="inactive">
                    {t("dashboard.status.inactive")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              permission={editing ? "update" : "create"}
              className="w-full"
              disabled={busy}
            >
              {busy
                ? t("usersAdmin.saving")
                : t(editing ? "usersAdmin.update" : "usersAdmin.create")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
