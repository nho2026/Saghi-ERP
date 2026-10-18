import TaskReviewPage from "./TaskReviewPage";
import TaskDashboard from "../components/TaskDashboard";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  Link,
  useSearchParams,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  FolderKanban,
  FolderPlus,
  ListTodo,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { storedUser, hasPermission } from "@/features/auth/access";
import { useServerTable } from "@/shared/hooks/useServerTable";
import { apiErrorMessage } from "@/shared/api/client";
import {
  tasksApi,
  type TaskDepartment,
  type TaskEmployee,
  type TaskItem,
} from "../api/tasks.api";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Badge } from "@/shared/components/ui/badge";
import { FormDatePicker } from "@/shared/components/ui/form-date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";

const statuses = [
  "todo",
  "in_progress",
  "incomplete",
  "review",
  "completed",
  "rejected",
];
const priorities = ["low", "medium", "high", "urgent"];
const statusColor: Record<string, string> = {
  incomplete: "bg-amber-100 text-amber-800",
  todo: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-100 text-blue-700",
  review: "bg-purple-100 text-purple-700",
  completed: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

export default function TasksPage() {
  const { t } = useTranslation();
  const user = storedUser();
  const canManage =
    hasPermission(user, "tasks.list.manage_all") ||
    Boolean(user?.employee?.isDepartmentLeader);
  const isHr = hasPermission(user, "tasks.list.manage_all");
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const setParams = useCallback(
    (values: Record<string, string>, options?: { replace?: boolean }) =>
      navigate(
        { pathname: "/tasks", search: new URLSearchParams(values).toString() },
        options,
      ),
    [navigate],
  );
  const [departments, setDepartments] = useState<TaskDepartment[]>([]);
  const [employees, setEmployees] = useState<TaskEmployee[]>([]);
  const [search, setSearch] = useState("");
  const [sidebarSearch, setSidebarSearch] = useState("");
  const sidebarQuery = sidebarSearch.trim().toLocaleLowerCase();
  const visibleDepartments = departments
    .map((department) => ({
      ...department,
      projects:
        !sidebarQuery ||
        department.name.toLocaleLowerCase().includes(sidebarQuery)
          ? department.projects
          : department.projects.filter((project) =>
              project.name.toLocaleLowerCase().includes(sidebarQuery),
            ),
    }))
    .filter(
      (department) =>
        !sidebarQuery ||
        department.name.toLocaleLowerCase().includes(sidebarQuery) ||
        department.projects.length > 0,
    );
  const [projectOpen, setProjectOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [collapsedByProject, setCollapsedByProject] = useState<
    Record<string, string[]>
  >({});
  const reviewPage = params.get("view") === "review";
  const departmentId = params.get("department") ?? "";
  const projectId = params.get("project") ?? "";
  const collapsed = collapsedByProject[projectId] ?? [];
  const activeDepartment =
    departments.find((d) => d.id === departmentId) ?? departments[0];
  const activeProject = activeDepartment?.projects.find(
    (p) => p.id === projectId,
  );
  const table = useServerTable<TaskItem, { counts: Record<string, number> }>(
    "/tasks",
    { search, projectId: projectId || undefined },
    Boolean(projectId),
    100,
  );
  const tasks = table.data ?? [];
  const grouped = useMemo(
    () =>
      Object.fromEntries(
        statuses.map((status) => [
          status,
          tasks.filter(
            (task) =>
              (task.status === "cancelled" ? "rejected" : task.status) ===
              status,
          ),
        ]),
      ),
    [tasks],
  );

  useEffect(() => {
    let live = true;
    tasksApi
      .departments()
      .then((rows) => {
        if (live) setDepartments(rows);
      })
      .catch(() => toast.error(t("tasks.loadFailed")));
    if (canManage)
      tasksApi
        .employees()
        .then((rows) => {
          if (live) setEmployees(rows);
        })
        .catch(() => toast.error(t("tasks.loadFailed")));
    return () => {
      live = false;
    };
  }, [canManage, t]);

  useEffect(() => {
    if (
      !reviewPage &&
      location.pathname !== "/tasks/dashboard" &&
      departments.length &&
      !departments.some((d) => d.id === departmentId)
    )
      setParams({ department: departments[0].id }, { replace: true });
  }, [departments, departmentId, setParams, location.pathname, reviewPage]);
  useEffect(() => {
    if (
      activeDepartment &&
      projectId &&
      !activeDepartment.projects.some((p) => p.id === projectId)
    )
      setParams({ department: activeDepartment.id }, { replace: true });
  }, [activeDepartment, projectId, setParams]);

  const chooseDepartment = (id: string) =>
    setParams({ department: id }, { replace: true });
  const chooseProject = (id: string) =>
    setParams(
      { department: activeDepartment?.id ?? "", project: id },
      { replace: true },
    );
  const createProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const project = await tasksApi.createProject({
        name: String(data.get("name") ?? ""),
        description: String(data.get("description") ?? ""),
        departmentId: String(data.get("departmentId") ?? ""),
      });
      setDepartments((current) =>
        current.map((d) =>
          d.id === project.departmentId
            ? { ...d, projects: [...d.projects, project] }
            : d,
        ),
      );
      setProjectOpen(false);
      setParams({ department: project.departmentId, project: project.id });
    } catch (error) {
      toast.error(apiErrorMessage(error), { id: "api-action-error" });
    }
  };
  const createTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") ?? "").trim();
    const description = String(data.get("description") ?? "").trim();
    const assigneeIds = data.getAll("assigneeIds");
    const startDate = String(data.get("startDate") ?? "");
    const dueDate = String(data.get("dueDate") ?? "");
    if (title.length < 2 || description.length < 2) {
      toast.error(
        "Task name and description must each contain at least 2 characters.",
      );
      return;
    }
    if (!assigneeIds.length) {
      toast.error("Select at least one assignee.");
      return;
    }
    if (startDate && dueDate && dueDate < startDate) {
      toast.error("Due date must be on or after the start date.");
      return;
    }
    try {
      const files = data
        .getAll("files")
        .filter((x): x is File => x instanceof File && x.size > 0);
      const attachments = files.length ? await tasksApi.upload(files) : [];
      await tasksApi.create({
        projectId,
        title,
        description,
        priority: data.get("priority"),
        status: "todo",
        startDate: data.get("startDate") || null,
        dueDate: data.get("dueDate") || null,
        estimatedMinutes: Number(data.get("estimatedHours") || 0) * 60 || null,
        assigneeIds,
        attachments,
      });
      setTaskOpen(false);
      form.reset();
      await table.refresh();
    } catch (error) {
      toast.error(apiErrorMessage(error), { id: "api-action-error" });
    }
  };

  const dashboardView = location.pathname === "/tasks/dashboard";
  return (
    <div
      className={`flex overflow-hidden rounded-xl border bg-card shadow-sm ${dashboardView ? "min-h-full items-start" : "h-full min-h-0 flex-1"}`}
    >
      <aside
        className={`hidden min-h-0 w-64 shrink-0 flex-col overflow-hidden border-e bg-muted/20 p-4 ${dashboardView ? "" : "md:flex"}`}
      >
        <div className="mb-5 flex shrink-0 items-center justify-between">
          <h2 className="text-sm font-semibold">Departments</h2>
          {canManage && (
            <Dialog open={projectOpen} onOpenChange={setProjectOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Create project">
                  <FolderPlus className="size-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New project</DialogTitle>
                </DialogHeader>
                <form className="grid gap-4" onSubmit={createProject}>
                  <label className="grid gap-1 text-sm">
                    Department
                    <Select
                      name="departmentId"
                      defaultValue={activeDepartment?.id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments
                          .filter(
                            (d) =>
                              isHr || d.id === user?.employee?.departmentId,
                          )
                          .map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </label>
                  <label className="grid gap-1 text-sm">
                    Project name
                    <Input name="name" required minLength={2} maxLength={160} />
                  </label>
                  <label className="grid gap-1 text-sm">
                    Description
                    <textarea
                      name="description"
                      className="min-h-20 rounded-md border bg-background p-3"
                    />
                  </label>
                  <Button type="submit">Create project</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <div className="relative mb-3 shrink-0">
          <Search className="pointer-events-none absolute inset-s-3 top-3 size-4 text-muted-foreground" />
          <Input
            value={sidebarSearch}
            onChange={(event) => setSidebarSearch(event.target.value)}
            placeholder="Search departments or projects"
            aria-label="Search departments or projects"
            className="ps-9"
          />
        </div>
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain">
          {visibleDepartments.map((department) => (
            <div key={department.id}>
              <button
                onClick={() => chooseDepartment(department.id)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm ${activeDepartment?.id === department.id ? "bg-primary/10 font-semibold text-primary" : "hover:bg-muted"}`}
              >
                <FolderKanban className="size-4" />
                <span className="flex-1 truncate">{department.name}</span>
                <span className="text-xs text-muted-foreground">
                  {department.projects.length}
                </span>
              </button>
              {(Boolean(sidebarQuery) ||
                activeDepartment?.id === department.id) && (
                <div className="ms-5 mt-1 space-y-1 border-s ps-2">
                  {department.projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() =>
                        setParams(
                          { department: department.id, project: project.id },
                          { replace: true },
                        )
                      }
                      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${projectId === project.id ? "bg-background font-medium shadow-sm" : "text-muted-foreground hover:bg-background"}`}
                    >
                      <span className="truncate">{project.name}</span>
                      <span className="ms-auto text-xs">
                        {project._count?.tasks ?? 0}
                      </span>
                    </button>
                  ))}
                  {!department.projects.length && (
                    <p className="px-2 py-1 text-xs text-muted-foreground">
                      No projects yet
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
          {visibleDepartments.length === 0 && (
            <p
              role="status"
              className="px-2 py-6 text-center text-sm text-muted-foreground"
            >
              No matching departments or projects.
            </p>
          )}
        </nav>
      </aside>

      {reviewPage ? (
        <TaskReviewPage />
      ) : dashboardView ? (
        <TaskDashboard
          departments={departments}
          canManage={canManage}
          onAddProject={() => setProjectOpen(true)}
          onProject={(department, project) =>
            setParams({ department, project })
          }
        />
      ) : (
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b p-4 md:px-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{activeDepartment?.name ?? "Departments"}</span>
                {activeProject && (
                  <>
                    <span>/</span>
                    <span>{activeProject.name}</span>
                  </>
                )}
              </div>
              <h1 className="mt-1 text-xl font-bold">
                {activeProject?.name ??
                  activeDepartment?.name ??
                  t("tasks.title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {activeProject?.description ||
                  "Department projects and task tracking"}
              </p>
            </div>
            <div className="flex gap-2">
              {canManage && activeProject && (
                <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="size-4" /> Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        New task in {activeProject.name}
                      </DialogTitle>
                    </DialogHeader>
                    <form className="grid gap-4" onSubmit={createTask}>
                      <label className="grid gap-1 text-sm">
                        Task name
                        <Input
                          name="title"
                          required
                          minLength={2}
                          maxLength={200}
                        />
                      </label>
                      <label className="grid gap-1 text-sm">
                        Description
                        <textarea
                          name="description"
                          required
                          minLength={2}
                          maxLength={10000}
                          className="min-h-24 rounded-md border bg-background p-3"
                        />
                      </label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="grid gap-1 text-sm">
                          Priority
                          <Select name="priority" defaultValue="medium">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {priorities.map((p) => (
                                <SelectItem key={p} value={p}>
                                  {p}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </label>
                        <label className="grid gap-1 text-sm">
                          Start date
                          <FormDatePicker name="startDate" />
                        </label>
                        <label className="grid gap-1 text-sm">
                          Due date
                          <FormDatePicker name="dueDate" />
                        </label>
                        <label className="grid gap-1 text-sm">
                          Estimated hours
                          <Input
                            name="estimatedHours"
                            type="number"
                            min="0"
                            step="0.25"
                          />
                        </label>
                      </div>
                      <fieldset className="grid gap-2">
                        <legend className="text-sm font-medium">
                          Assignees
                        </legend>
                        <div className="grid max-h-40 gap-2 overflow-y-auto rounded-md border p-3 sm:grid-cols-2">
                          {employees
                            .filter(
                              (employee) =>
                                employee.departmentId === activeDepartment?.id,
                            )
                            .map((employee) => (
                              <label
                                key={employee.id}
                                className="flex items-center gap-2 text-sm"
                              >
                                <Checkbox
                                  name="assigneeIds"
                                  value={employee.id}
                                />
                                <span>
                                  {employee.firstName} {employee.lastName}
                                </span>
                              </label>
                            ))}
                        </div>
                      </fieldset>
                      <label className="grid gap-1 text-sm">
                        Attachments
                        <Input
                          name="files"
                          type="file"
                          multiple
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                        />
                      </label>
                      <Button type="submit">Create task</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {activeDepartment && !activeProject ? (
              <section className="p-5 md:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <FolderKanban className="size-5 text-primary" />
                  <h2 className="font-semibold">Projects</h2>
                </div>
                {activeDepartment.projects.length ? (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {activeDepartment.projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => chooseProject(project.id)}
                        className="rounded-lg border bg-background p-4 text-start transition hover:border-primary/50 hover:shadow-sm"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <FolderKanban className="size-5 text-primary" />
                          <Badge variant="secondary">
                            {project._count?.tasks ?? 0} tasks
                          </Badge>
                        </div>
                        <h3 className="font-semibold">{project.name}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {project.description || "No project description"}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
                    No projects in this department yet.
                    {canManage && " Create a project to organize its tasks."}
                  </div>
                )}
              </section>
            ) : projectId ? (
              <section className="p-4 md:p-6">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <div className="relative min-w-56 flex-1">
                    <Search className="absolute inset-s-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="ps-9"
                      placeholder="Search tasks"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ListTodo className="size-4" /> List
                  </div>
                </div>
                {table.isLoading ? (
                  <div className="py-20 text-center text-muted-foreground">
                    {t("common.loading")}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {statuses.map((status) => {
                      const rows = grouped[status] ?? [];
                      const isCollapsed = collapsed.includes(status);
                      return (
                        <section key={status}>
                          <button
                            onClick={() =>
                              setCollapsedByProject((current) => ({
                                ...current,
                                [projectId]: isCollapsed
                                  ? collapsed.filter((s) => s !== status)
                                  : [...collapsed, status],
                              }))
                            }
                            className="mb-2 flex items-center gap-2"
                          >
                            {isCollapsed ? (
                              <ChevronRight className="size-4" />
                            ) : (
                              <ChevronDown className="size-4" />
                            )}
                            <span
                              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${statusColor[status]}`}
                            >
                              {t(`tasks.statuses.${status}`)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {rows.length}
                            </span>
                          </button>
                          {!isCollapsed && (
                            <div className="overflow-x-auto rounded-lg border">
                              <table className="w-full min-w-[720px] text-sm">
                                <thead className="bg-muted/30 text-muted-foreground">
                                  <tr>
                                    <th className="px-4 py-3 text-left font-medium">
                                      Name
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                      Assignees
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                      Priority
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                      Due date
                                    </th>
                                    <th className="px-4 py-3" />
                                  </tr>
                                </thead>
                                <tbody>
                                  {rows.length === 0 && (
                                    <tr>
                                      <td
                                        colSpan={5}
                                        className="border-t px-4 py-6 text-center text-sm text-muted-foreground"
                                      >
                                        {t("tasks.emptyStatus")}
                                      </td>
                                    </tr>
                                  )}
                                  {rows.map((task) => (
                                    <tr
                                      key={task.id}
                                      className="border-t hover:bg-muted/20"
                                    >
                                      <td className="px-4 py-3">
                                        <Link
                                          to={`/tasks/${task.id}`}
                                          className="font-medium hover:text-primary hover:underline"
                                        >
                                          {task.title}
                                        </Link>
                                        <p className="mt-0.5 max-w-md truncate text-xs text-muted-foreground">
                                          {task.description}
                                        </p>
                                      </td>
                                      <td className="px-4 py-3 text-muted-foreground">
                                        {task.assignees
                                          .map(
                                            ({ employee }) =>
                                              `${employee.firstName} ${employee.lastName}`,
                                          )
                                          .join(", ") || "—"}
                                      </td>
                                      <td className="px-4 py-3">
                                        <Badge variant="outline">
                                          {task.priority}
                                        </Badge>
                                      </td>
                                      <td className="px-4 py-3 text-muted-foreground">
                                        {task.dueDate
                                          ? new Date(
                                              task.dueDate,
                                            ).toLocaleDateString()
                                          : "—"}
                                      </td>
                                      <td className="px-4 py-3 text-right">
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          asChild
                                        >
                                          <Link
                                            to={`/tasks/${task.id}`}
                                            aria-label="View task"
                                          >
                                            <Eye className="size-4" />
                                          </Link>
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </section>
                      );
                    })}
                  </div>
                )}
              </section>
            ) : (
              <div className="p-10 text-center text-muted-foreground">
                Select a department to view its projects.
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
}
