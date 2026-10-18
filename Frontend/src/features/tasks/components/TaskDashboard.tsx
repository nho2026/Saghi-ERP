import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Plus,
  Search,
  FolderKanban,
  Clock3,
  ArrowRight,
  CheckCheck,
} from "lucide-react";
import { tasksApi, type TaskDepartment, type TaskItem } from "../api/tasks.api";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";

const closed = (task: TaskItem) =>
  ["completed", "rejected", "cancelled"].includes(task.status);
export default function TaskDashboard({
  departments,
  canManage,
  onAddProject,
  onProject,
}: {
  departments: TaskDepartment[];
  canManage: boolean;
  onAddProject: () => void;
  onProject: (departmentId: string, projectId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const resource = useApiResource(
    useCallback(async () => {
      const first = await tasksApi.list({ page: 1, pageSize: 100 });
      const tasks = [...first.items];
      for (let page = 2; page <= first.pagination.totalPages; page++) {
        tasks.push(...(await tasksApi.list({ page, pageSize: 100 })).items);
      }
      return tasks;
    }, []),
  );
  const tasks = useMemo(() => resource.data ?? [], [resource.data]);
  const projects = departments.flatMap((d) =>
    d.projects.map((p) => ({ ...p, departmentName: d.name })),
  );
  const done = tasks.filter((t) => t.status === "completed").length;
  const running = tasks.filter((t) =>
    ["in_progress", "review"].includes(t.status),
  ).length;
  const pending = tasks.filter((t) => t.status === "todo").length;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const minutes = tasks.reduce(
    (sum, task) =>
      sum + task.timeEntries.reduce((total, entry) => total + entry.minutes, 0),
    0,
  );
  const upcoming = tasks
    .filter((t) => t.dueDate && !closed(t))
    .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!))[0];
  const team = useMemo(() => {
    const members = new Map<
      string,
      { name: string; task: TaskItem; count: number }
    >();
    for (const task of tasks)
      for (const { employee } of task.assignees) {
        const previous = members.get(employee.id);
        members.set(employee.id, {
          name: `${employee.firstName} ${employee.lastName}`,
          task: previous?.task ?? task,
          count: (previous?.count ?? 0) + 1,
        });
      }
    return [...members.entries()].slice(0, 5);
  }, [tasks]);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 6 + index);
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    return {
      date,
      count: tasks.filter(
        (t) =>
          t.completedAt &&
          new Date(t.completedAt) >= date &&
          new Date(t.completedAt) < next,
      ).length,
    };
  });
  const max = Math.max(1, ...days.map((d) => d.count));
  const loadingValue = (n: number) => (resource.isLoading ? "—" : n);
  return (
    <div className="min-w-0 flex-1 bg-muted/30 p-4 md:p-6">
      <div className="mx-auto max-w-350 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-card p-3">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute inset-s-3 top-3 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects"
              aria-label="Search projects"
              className="rounded-full border-0 bg-muted/40 ps-9"
            />
          </div>
          <Badge variant="outline" className="gap-2 rounded-full px-3 py-2">
            <span className="size-2 rounded-full bg-emerald-500" />
            Task workspace
          </Badge>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Plan, prioritize, and accomplish your tasks with ease.
            </p>
          </div>
          {canManage && (
            <Button
              onClick={onAddProject}
              className="rounded-full bg-emerald-800 px-5 text-white hover:bg-emerald-900"
            >
              <Plus className="size-4" />
              Add Project
            </Button>
          )}
        </div>
        {resource.error && (
          <Card className="flex items-center justify-between gap-3 p-4 text-destructive">
            <p>{resource.error}</p>
            <Button variant="outline" onClick={() => void resource.refresh()}>
              Retry
            </Button>
          </Card>
        )}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Projects",
              value: projects.length,
              note: `${departments.length} departments`,
              green: true,
            },
            {
              label: "Completed Tasks",
              value: done,
              note: "Approved and completed",
            },
            {
              label: "Running Tasks",
              value: running,
              note: "In progress & in review",
            },
            {
              label: "Pending Tasks",
              value: pending,
              note: "Ready to get started",
            },
          ].map((stat) => (
            <Card
              key={stat.label}
              className={`rounded-2xl border-0 p-5 shadow-none ${stat.green ? "bg-linear-to-br from-[#003c30] to-[#008260] text-white" : "bg-card"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-medium">{stat.label}</h2>
                <ArrowUpRight
                  className={`size-7 rounded-full border p-1 ${stat.green ? "border-white/30" : "border-border"}`}
                />
              </div>
              <p className="mt-4 text-4xl font-medium tracking-tight">
                {stat.green ? stat.value : loadingValue(stat.value)}
              </p>
              <p
                className={`mt-3 text-xs ${stat.green ? "text-emerald-200" : "text-muted-foreground"}`}
              >
                {stat.note}
              </p>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-12">
          <div className="grid gap-4 md:grid-cols-2 xl:col-span-9">
            <Card className="rounded-2xl border-0 p-5 shadow-none">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Task Analytics</h2>
                <span className="text-xs text-muted-foreground">
                  Last 7 days
                </span>
              </div>
              <div
                className="mt-6 flex h-36 items-end justify-between gap-3"
                role="img"
                aria-label={days
                  .map(
                    (d) =>
                      `${d.date.toLocaleDateString()}: ${d.count} completed`,
                  )
                  .join(", ")}
              >
                {days.map(({ date, count }, i) => (
                  <div
                    key={i}
                    className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                  >
                    <span className="text-xs text-muted-foreground">
                      {loadingValue(count)}
                    </span>
                    <div
                      className={`w-full max-w-12 rounded-full ${i === 6 ? "bg-emerald-950" : "bg-emerald-600/80"}`}
                      style={{
                        height: `${Math.max(4, (count / max) * 90)}px`,
                        ...(count === 0
                          ? {
                              background:
                                "repeating-linear-gradient(135deg, transparent, transparent 3px, #9caea5 3px, #9caea5 4px)",
                              height: "16px",
                            }
                          : {}),
                      }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {date.toLocaleDateString(undefined, { weekday: "short" })}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Tasks completed per day
              </p>
            </Card>
            <Card className="flex flex-col rounded-2xl border-0 p-5 shadow-none">
              <h2 className="font-semibold">Upcoming Deadline</h2>
              {upcoming ? (
                <>
                  <p className="mt-6 text-xl font-medium text-emerald-800 dark:text-emerald-300">
                    {upcoming.title}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {new Date(upcoming.dueDate!).toLocaleDateString()} ·{" "}
                    {upcoming.project?.name ?? "Task"}
                  </p>
                  <Button
                    asChild
                    className="mt-auto rounded-full bg-emerald-800 text-white hover:bg-emerald-900"
                  >
                    <Link to={`/tasks/${upcoming.id}`}>
                      View task
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8 text-muted-foreground">
                  <CheckCheck className="size-9 text-emerald-600" />
                  <p className="text-sm">
                    {resource.isLoading
                      ? "Loading deadlines…"
                      : "No upcoming deadlines"}
                  </p>
                </div>
              )}
            </Card>
            <Card className="rounded-2xl border-0 p-5 shadow-none">
              <h2 className="mb-5 font-semibold">Team Collaboration</h2>
              <div className="space-y-4">
                {team.map(([id, member], i) => (
                  <Link
                    key={id}
                    to={`/tasks/${member.task.id}`}
                    className="flex items-center gap-3 rounded-lg p-1 hover:bg-muted"
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold ${i % 2 ? "bg-orange-100 text-orange-800" : "bg-emerald-100 text-emerald-900"}`}
                    >
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {member.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {member.task.title}
                      </p>
                    </div>
                    <Badge variant="outline">{member.count} tasks</Badge>
                  </Link>
                ))}
                {!team.length && (
                  <p className="py-10 text-center text-sm text-muted-foreground">
                    {resource.isLoading
                      ? "Loading team…"
                      : "Assign tasks to see your team here."}
                  </p>
                )}
              </div>
            </Card>
            <Card className="rounded-2xl border-0 p-5 shadow-none">
              <h2 className="font-semibold">Task Progress</h2>
              <div className="relative mx-auto mt-6 max-w-72">
                <svg
                  viewBox="0 0 220 130"
                  className="w-full"
                  role="img"
                  aria-label={`${progress}% of tasks completed`}
                >
                  <path
                    d="M 25 110 A 85 85 0 0 1 195 110"
                    fill="none"
                    stroke="currentColor"
                    className="text-muted"
                    strokeWidth="28"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 25 110 A 85 85 0 0 1 195 110"
                    fill="none"
                    stroke="#1b8059"
                    strokeWidth="28"
                    strokeLinecap={progress ? "round" : "butt"}
                    pathLength="100"
                    strokeDasharray={`${progress} 100`}
                  />
                </svg>
                <div className="absolute inset-x-0 bottom-2 text-center">
                  <p className="text-4xl font-semibold">
                    {resource.isLoading ? "—" : `${progress}%`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tasks completed
                  </p>
                </div>
              </div>
              <div className="mt-5 flex justify-center gap-5 text-xs text-muted-foreground">
                <span>● {done} complete</span>
                <span>● {running} running</span>
                <span>● {pending} pending</span>
              </div>
            </Card>
          </div>
          <div className="flex flex-col gap-4 xl:col-span-3">
            <Card className="flex-1 rounded-2xl border-0 p-5 shadow-none">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-semibold">Projects</h2>
                {canManage && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 rounded-full text-xs"
                    onClick={onAddProject}
                  >
                    <Plus className="size-3" />
                    New
                  </Button>
                )}
              </div>
              <div className="max-h-80 space-y-2 overflow-y-auto">
                {projects
                  .filter((p) =>
                    `${p.name} ${p.departmentName}`
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  )
                  .map((project) => (
                    <Button
                      key={project.id}
                      variant="ghost"
                      className="h-auto w-full justify-start gap-3 whitespace-normal px-1 py-3 text-start"
                      onClick={() =>
                        onProject(project.departmentId, project.id)
                      }
                    >
                      <FolderKanban className="size-5 shrink-0 text-emerald-600" />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">
                          {project.name}
                        </span>
                        <span className="block text-xs font-normal text-muted-foreground">
                          {project.departmentName}
                        </span>
                      </span>
                    </Button>
                  ))}
                {!projects.some((p) =>
                  `${p.name} ${p.departmentName}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                ) && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    {search ? "No matching projects" : "No projects yet"}
                  </p>
                )}
              </div>
            </Card>
            <Card className="relative overflow-hidden rounded-2xl border-0 bg-emerald-950 p-6 text-white shadow-none">
              <div className="pointer-events-none absolute -end-16 -top-12 size-56 rounded-full border-[24px] border-emerald-800/40" />
              <h2 className="relative flex items-center gap-2 text-sm">
                <Clock3 className="size-4" />
                Time Tracked
              </h2>
              <p className="relative my-5 text-4xl font-medium tabular-nums">
                {resource.isLoading
                  ? "—"
                  : `${Math.floor(minutes / 60)
                      .toString()
                      .padStart(
                        2,
                        "0",
                      )}:${(minutes % 60).toString().padStart(2, "0")}`}
              </p>
              <p className="relative text-xs text-emerald-200">
                Hours & minutes logged across your tasks
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
