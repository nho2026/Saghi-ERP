import { useServerTable } from "@/shared/hooks/useServerTable";
import { assignablePermissionCatalog } from "@/features/auth/permission-policy";
import { useCallback, useMemo, useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2, LayoutGrid, List } from "lucide-react";
import { useTranslation } from "react-i18next";
import { permissionsApi, rolesApi } from "../api/access.api";
import type { Permission, Role } from "../types/access.types";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { apiErrorMessage } from "@/shared/api/client";
import { hasPermission, storedUser } from "@/features/auth/access";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { DeleteConfirmationDialog } from "@/shared/components/ui/confirmation-dialog";
import { ResourceState } from "@/shared/components/ui/table-resource-state";
import { PaginationControls } from "@/shared/components/ui/pagination-controls";

export default function RolesPage() {
  const { t } = useTranslation();
  const user = storedUser();
  const canCreate = hasPermission(user, "roles.create");
  const canUpdate = hasPermission(user, "roles.update");
  const canAssign = hasPermission(user, "roles.assign_permissions");
  const canDelete = hasPermission(user, "roles.delete");
  const roles = useServerTable<Role>("/roles");
  const permissions = useApiResource(
    useCallback(
      () =>
        hasPermission(storedUser(), "permissions.view")
          ? permissionsApi.list()
          : Promise.resolve([]),
      [],
    ),
  );
  const pagination = roles.pagination;
  const [editing, setEditing] = useState<Role | null | undefined>();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"table" | "cards">("table");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const groups = useMemo(
    () =>
      (permissions.data ?? [])
        .filter((permission) =>
          assignablePermissionCatalog.some(({ key }) => key === permission.key),
        )
        .reduce<Record<string, Permission[]>>((result, permission) => {
          (result[permission.module] ??= []).push(permission);
          return result;
        }, {}),
    [permissions.data],
  );
  const openEditor = (role: Role | null) => {
    setEditing(role);
    setSelected(new Set(role?.permissionItems?.map(({ id }) => id) ?? []));
    setError("");
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    try {
      if (editing) {
        if (canUpdate) await rolesApi.update(editing.id, { name, description });
        if (canAssign)
          await rolesApi.assignPermissions(editing.id, [...selected]);
      } else {
        await rolesApi.create({
          name,
          description,
          permissionIds: [...selected],
        });
      }
      setEditing(undefined);
      await roles.refresh();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("rolesAdmin.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("rolesAdmin.description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            permission="view"
            variant={view === "table" ? "default" : "outline"}
            size="icon"
            title={t("crm.actions.table")}
            aria-label={t("crm.actions.table")}
            aria-pressed={view === "table"}
            onClick={() => setView("table")}
          >
            <List className="size-4" />
          </Button>
          <Button
            permission="view"
            variant={view === "cards" ? "default" : "outline"}
            size="icon"
            title={t("crm.actions.grid")}
            aria-label={t("crm.actions.grid")}
            aria-pressed={view === "cards"}
            onClick={() => setView("cards")}
          >
            <LayoutGrid className="size-4" />
          </Button>
          {canCreate && (
            <Button permission="create" onClick={() => openEditor(null)}>
              <Plus />
              {t("rolesAdmin.new")}
            </Button>
          )}
        </div>
      </div>
      <ResourceState
        isLoading={roles.isLoading}
        error={roles.error}
        isEmpty={!roles.data?.length}
      />
      {!roles.isLoading && !roles.error && view === "table" && (
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("rolesTable.name")}</TableHead>
                <TableHead>{t("rolesTable.description")}</TableHead>
                <TableHead>{t("rolesTable.users")}</TableHead>
                <TableHead>{t("rolesTable.permissions")}</TableHead>
                {(canUpdate || canAssign || canDelete) && (
                  <TableHead className="text-end">
                    {t("rolesTable.actions")}
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody autoPaginate={false}>
              {(roles.data ?? []).map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="whitespace-nowrap font-medium">
                    {role.name}
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p
                      className="truncate text-muted-foreground"
                      title={role.description || t("rolesAdmin.noDescription")}
                    >
                      {role.description || t("rolesAdmin.noDescription")}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{role.users}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{role.permissions}</Badge>
                  </TableCell>
                  {(canUpdate || canAssign || canDelete) && (
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {(canUpdate || canAssign) && (
                          <Button
                            permission={
                              canUpdate ? "update" : "assign_permissions"
                            }
                            data-action="edit"
                            variant="ghost"
                            size="icon"
                            aria-label={t("rolesAdmin.manage")}
                            title={t("rolesAdmin.manage")}
                            onClick={() => openEditor(role)}
                          >
                            <Pencil />
                          </Button>
                        )}
                        {canDelete && role.name !== "Super Administrator" && (
                          <DeleteConfirmationDialog
                            description={t("rolesTable.deleteDescription", {
                              name: role.name,
                            })}
                            onConfirm={async () => {
                              await rolesApi.remove(role.id);
                              await roles.refresh();
                            }}
                          >
                            <Button
                              data-action="delete"
                              variant="ghost"
                              size="icon"
                              aria-label={t("rolesTable.delete")}
                              title={t("rolesTable.delete")}
                              className="text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </DeleteConfirmationDialog>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {!roles.isLoading && !roles.error && view === "cards" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(roles.data ?? []).map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <CardTitle className="text-base">{role.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {role.description || t("rolesAdmin.noDescription")}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {t("rolesAdmin.usersCount", { count: role.users })}
                  </Badge>
                  <Badge variant="outline">
                    {t("rolesAdmin.permissionsCount", {
                      count: role.permissions,
                    })}
                  </Badge>
                </div>
                <div className="flex justify-end gap-2 border-t pt-3">
                  {(canUpdate || canAssign) && (
                    <Button
                      permission={canUpdate ? "update" : "assign_permissions"}
                      data-action="edit"
                      variant="ghost"
                      size="icon"
                      title={t("rolesAdmin.manage")}
                      aria-label={t("rolesAdmin.manage")}
                      onClick={() => openEditor(role)}
                    >
                      <Pencil />
                    </Button>
                  )}
                  {canDelete && role.name !== "Super Administrator" && (
                    <DeleteConfirmationDialog
                      description={t("rolesTable.deleteDescription", {
                        name: role.name,
                      })}
                      onConfirm={async () => {
                        await rolesApi.remove(role.id);
                        await roles.refresh();
                      }}
                    >
                      <Button
                        data-action="delete"
                        variant="ghost"
                        size="icon"
                        title={t("rolesTable.delete")}
                        aria-label={t("rolesTable.delete")}
                        className="text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </DeleteConfirmationDialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <PaginationControls
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={pagination.onPageChange}
      />
      <Dialog
        open={editing !== undefined}
        onOpenChange={(open) => !open && !busy && setEditing(undefined)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? t("rolesAdmin.manage") : t("rolesAdmin.new")}
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={submit}>
            <Input
              name="name"
              defaultValue={editing?.name}
              placeholder={t("pageText.roleName")}
              required
              disabled={Boolean(editing) && !canUpdate}
            />
            <Textarea
              name="description"
              defaultValue={editing?.description ?? ""}
              placeholder={t("pageText.description")}
              disabled={Boolean(editing) && !canUpdate}
              className="min-h-20"
            />
            {canAssign && (
              <div className="max-h-72 space-y-4 overflow-y-auto rounded-xl border p-4">
                {Object.entries(groups).map(([module, items]) => (
                  <fieldset key={module} className="space-y-2">
                    <legend className="mb-2 text-sm font-bold text-primary">
                      {module}
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {items?.map((permission) => (
                        <label
                          key={permission.id}
                          className="flex cursor-pointer items-center gap-2 rounded-lg bg-muted/50 p-2 text-xs"
                        >
                          <Checkbox
                            checked={selected.has(permission.id)}
                            onCheckedChange={(checked) =>
                              setSelected((current) => {
                                const next = new Set(current);
                                if (checked) next.add(permission.id);
                                else next.delete(permission.id);
                                return next;
                              })
                            }
                          />
                          <span>{permission.name}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              permission={
                editing
                  ? canUpdate
                    ? "update"
                    : "assign_permissions"
                  : "create"
              }
              className="w-full"
              disabled={busy}
            >
              {busy ? t("usersAdmin.saving") : t("common.save")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
