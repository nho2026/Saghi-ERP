import { useApiResource } from "@/shared/hooks/useApiResource";
import { Label } from "@/shared/components/ui/label";
import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { SlidersHorizontal } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/shared/components/ui/dialog";
import { storedUser, hasPermission } from "@/features/auth/access";
import { apiErrorMessage } from "@/shared/api/client";
import { useServerTable } from "@/shared/hooks/useServerTable";
import { tasksApi, type TaskItem } from "../api/tasks.api";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/components/ui/table";

export default function TaskReviewPage() {
  const { t } = useTranslation();
  const user = storedUser();
  const hr = hasPermission(user, "tasks.list.manage_all");
  const canReview = hr && hasPermission(user, "tasks.list.approve");
  const canUpdate = hasPermission(user, "tasks.list.update");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [department, setDepartment] = useState("all");
  const [project, setProject] = useState("all");
  const [assignee, setAssignee] = useState("all");
  const [priority, setPriority] = useState("all");
  const activeFilterCount = [
    department,
    project,
    assignee,
    priority,
    status,
  ].filter((value) => value !== "all").length;
  const canListAssignees = hr || Boolean(user?.employee?.isDepartmentLeader);
  const departments = useApiResource(
    useCallback(() => tasksApi.departments(), []),
  );
  const employees = useApiResource(
    useCallback(
      () => (canListAssignees ? tasksApi.employees() : Promise.resolve([])),
      [canListAssignees],
    ),
  );
  const projects = (departments.data ?? [])
    .filter((d) => department === "all" || d.id === department)
    .flatMap((d) => d.projects);
  const [saving, setSaving] = useState<string | null>(null);
  const table = useServerTable<TaskItem>("/tasks", {
    search,
    departmentId: department === "all" ? undefined : department,
    projectId: project === "all" ? undefined : project,
    assigneeId: assignee === "all" ? undefined : assignee,
    priority: priority === "all" ? undefined : priority,
    status: status === "all" ? undefined : status,
  });
  async function update(task: TaskItem, next: string) {
    setSaving(task.id);
    try {
      await tasksApi.update(task.id, { status: next });
      await table.refresh();
    } catch (error) {
      toast.error(apiErrorMessage(error), { id: "api-action-error" });
    } finally {
      setSaving(null);
    }
  }
  return (
    <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Tasks & Review</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {canReview
            ? "Review submitted work and manage task progress."
            : "Update your assigned tasks and submit finished work for review."}
        </p>
      </header>
      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          className="min-w-48 flex-1"
          placeholder="Search tasks"
          aria-label="Search tasks"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <SlidersHorizontal className="size-4" />
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Task filters</DialogTitle>
              <DialogDescription>
                Filter tasks by department, project, assignee, priority, and
                status. Changes apply immediately.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  id: "department",
                  label: "Department",
                  value: department,
                  change: (value: string) => {
                    setDepartment(value);
                    setProject("all");
                  },
                  options: (departments.data ?? []).map((d) => ({
                    id: d.id,
                    name: d.name,
                  })),
                },
                {
                  id: "project",
                  label: "Project",
                  value: project,
                  change: setProject,
                  options: projects.map((p) => ({ id: p.id, name: p.name })),
                },
                ...(canListAssignees
                  ? [
                      {
                        id: "assignee",
                        label: "Assignee",
                        value: assignee,
                        change: setAssignee,
                        options: (employees.data ?? []).map((e) => ({
                          id: e.id,
                          name: `${e.firstName} ${e.lastName}`,
                        })),
                      },
                    ]
                  : []),
                {
                  id: "priority",
                  label: "Priority",
                  value: priority,
                  change: setPriority,
                  options: ["low", "medium", "high", "urgent"].map((p) => ({
                    id: p,
                    name: p[0].toUpperCase() + p.slice(1),
                  })),
                },
                {
                  id: "status",
                  label: "Status",
                  value: status,
                  change: setStatus,
                  options: [
                    "todo",
                    "in_progress",
                    "incomplete",
                    "review",
                    "completed",
                    "rejected",
                  ].map((value) => ({
                    id: value,
                    name: t(`tasks.statuses.${value}`),
                  })),
                },
              ].map((filter) => (
                <div key={filter.id} className="space-y-2">
                  <Label htmlFor={`filter-${filter.id}`}>{filter.label}</Label>
                  <Select value={filter.value} onValueChange={filter.change}>
                    <SelectTrigger id={`filter-${filter.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {filter.options.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDepartment("all");
                  setProject("all");
                  setAssignee("all");
                  setPriority("all");
                  setStatus("all");
                  setSearch("");
                }}
              >
                Clear filters
              </Button>
              <DialogClose asChild>
                <Button>Done</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {(departments.error || employees.error) && (
        <p role="alert" className="mb-4 text-sm text-destructive">
          {departments.error || employees.error}
        </p>
      )}
      {table.error && (
        <p role="alert" className="mb-4 text-destructive">
          {table.error}
        </p>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Assignees</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Update status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody {...table.tableProps}>
          {table.isLoading ? (
            <TableRow>
              <TableCell colSpan={5}>Loading tasks…</TableCell>
            </TableRow>
          ) : !table.data?.length ? (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center">
                {t("tasks.emptyStatus")}
              </TableCell>
            </TableRow>
          ) : (
            table.data.map((task) => {
              const own = task.assignees.some(
                ({ employee }) => employee.id === user?.employee?.id,
              );
              return (
                <TableRow key={task.id}>
                  <TableCell>
                    <Link
                      className="font-medium hover:underline"
                      to={`/tasks/${task.id}`}
                    >
                      {task.title}
                    </Link>
                  </TableCell>
                  <TableCell>{task.project?.name ?? "—"}</TableCell>
                  <TableCell>
                    {task.assignees
                      .map(
                        ({ employee }) =>
                          `${employee.firstName} ${employee.lastName}`,
                      )
                      .join(", ")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {t(`tasks.statuses.${task.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {canUpdate &&
                        (own || hr) &&
                        task.status !== "completed" && (
                          <Select
                            value=""
                            onValueChange={(next) => void update(task, next)}
                            disabled={saving !== null}
                          >
                            <SelectTrigger
                              className="w-44"
                              aria-label={`Update ${task.title}`}
                            >
                              <SelectValue placeholder="Update progress" />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                "todo",
                                "in_progress",
                                "incomplete",
                                "review",
                              ].map((s) => (
                                <SelectItem
                                  key={s}
                                  value={s}
                                  disabled={s === task.status}
                                >
                                  {s === "review"
                                    ? "Submit for review"
                                    : t(`tasks.statuses.${s}`)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      {canUpdate && canReview && task.status === "review" && (
                        <>
                          <Button
                            size="sm"
                            disabled={saving !== null}
                            onClick={() => void update(task, "completed")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={saving !== null}
                            onClick={() => void update(task, "rejected")}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </main>
  );
}
