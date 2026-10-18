import { useCallback, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowDown,
  Bell,
  CalendarDays,
  CheckCheck,
  CircleCheck,
  Clock3,
  Lightbulb,
  ListTodo,
  LoaderCircle,
  Send,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "@/app/store/hooks";
import { apiErrorMessage } from "@/shared/api/client";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ResourceState } from "@/shared/components/ui/table-resource-state";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { employeePortalApi } from "../api/employee-portal.api";

const inactiveStatuses = new Set(["completed", "cancelled", "rejected"]);
const taskFilters = ["active", "all", "completed"] as const;

export default function EmployeePortalPage() {
  const { t, i18n } = useTranslation();
  const user = useAppSelector((state) => state.auth.user);
  const tasks = useApiResource(
    useCallback(() => employeePortalApi.tasks(), []),
  );
  const ideas = useApiResource(
    useCallback(() => employeePortalApi.ideas(), []),
  );
  const warnings = useApiResource(
    useCallback(() => employeePortalApi.warnings(), []),
  );
  const ideaTitleRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const l = (key: string) => t(`employeePortal.${key}`);
  const allTasks = tasks.data ?? [];
  const activeTasks = allTasks.filter(
    (task) => !inactiveStatuses.has(task.status),
  );
  const completedTasks = allTasks.filter((task) => task.status === "completed");
  const completion = allTasks.length
    ? Math.round((completedTasks.length / allTasks.length) * 100)
    : 0;
  const date = (value: string) =>
    new Intl.DateTimeFormat(i18n.resolvedLanguage, {
      dateStyle: "medium",
    }).format(new Date(value));
  const number = (value: number) =>
    new Intl.NumberFormat(i18n.resolvedLanguage).format(value);
  const focusIdea = () => {
    ideaTitleRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    ideaTitleRef.current?.focus({ preventScroll: true });
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") ?? "").trim();
    const description = String(data.get("description") ?? "").trim();
    if (title.length < 2 || description.length < 5) {
      toast.error(l("ideaValidation"));
      return;
    }
    setSaving(true);
    try {
      await employeePortalApi.submitIdea({ title, description });
      form.reset();
      toast.success(l("ideaSent"));
      await ideas.refresh();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };
  const stats = [
    {
      label: l("activeTasks"),
      value: activeTasks.length,
      resource: tasks,
      icon: ListTodo,
      color: "bg-primary/10 text-primary",
      hint: l("activeHint"),
    },
    {
      label: l("completedTasks"),
      value: completedTasks.length,
      resource: tasks,
      icon: CircleCheck,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      hint: l("completedHint"),
    },
    {
      label: l("myIdeas"),
      value: ideas.data?.length ?? 0,
      resource: ideas,
      icon: Lightbulb,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      hint: l("ideasHint"),
    },
    {
      label: l("notices"),
      value: warnings.data?.length ?? 0,
      resource: warnings,
      icon: Bell,
      color: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
      hint: l("noticesHint"),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-6" dir={i18n.dir()}>
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-teal-950 via-teal-900 to-teal-800 px-6 py-8 text-white sm:px-9 sm:py-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -end-20 -top-36 size-96 rounded-full border-[48px] border-white/5"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 end-40 size-64 rounded-full border-[40px] border-white/5"
        />
        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
          <div className="max-w-xl space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-teal-100">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                <Sparkles className="size-3.5" />
                {l("title")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" />
                {date(new Date().toISOString())}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-semibold leading-snug tracking-tight sm:text-4xl">
                {t("employeePortal.welcome", {
                  name: user?.name ?? l("title"),
                })}
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-7 text-teal-100/85">
                {l("welcomeDescription")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                variant="secondary"
                className="rounded-full bg-white px-5 text-teal-950 hover:bg-teal-50"
                onClick={() =>
                  document
                    .getElementById("portal-tasks")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              >
                {l("myTasks")}
                <ArrowDown className="size-4" />
              </Button>
              <Button
                permission="create"
                variant="ghost"
                className="rounded-full border border-white/25 px-5 text-white hover:bg-white/10 hover:text-white"
                onClick={focusIdea}
              >
                <Lightbulb className="size-4" />
                {l("submitIdea")}
              </Button>
            </div>
          </div>
          <div className="w-full shrink-0 rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm lg:w-64">
            <div className="mb-5 flex items-center justify-between gap-4">
              <span className="grid size-11 place-items-center rounded-xl bg-teal-300/10 text-teal-200">
                <CheckCheck className="size-6" />
              </span>
              {tasks.isLoading ? (
                <Skeleton className="h-9 w-16 bg-white/10" />
              ) : (
                <span className="text-3xl font-semibold tabular-nums">
                  {tasks.error
                    ? "—"
                    : new Intl.NumberFormat(i18n.resolvedLanguage, {
                        style: "percent",
                        maximumFractionDigits: 0,
                      }).format(completion / 100)}
                </span>
              )}
            </div>
            <p className="text-sm font-medium">{l("taskProgress")}</p>
            <p className="mt-1 text-xs leading-5 text-teal-100/75">
              {l("progressHint")}
            </p>
            <div
              role="progressbar"
              aria-label={l("taskProgress")}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={
                tasks.isLoading || tasks.error ? undefined : completion
              }
              className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15"
            >
              <div
                className="h-full rounded-full bg-teal-300 transition-all motion-reduce:transition-none"
                style={{ width: `${tasks.error ? 0 : completion}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map(({ label, value, resource, icon: Icon, color, hint }) => (
          <Card key={label} className="rounded-2xl">
            <CardContent className="p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-xl ${color}`}
                >
                  <Icon className="size-5" />
                </span>
                {resource.isLoading ? (
                  <Skeleton className="h-8 w-10" />
                ) : (
                  <span className="text-3xl font-semibold tracking-tight tabular-nums">
                    {resource.error ? "—" : number(value)}
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold">{label}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {hint}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          <Card
            id="portal-tasks"
            className="scroll-mt-6 overflow-hidden rounded-2xl"
          >
            <CardHeader className="gap-1 border-b border-border/60">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ListTodo className="size-5 text-primary" />
                  {l("myTasks")}
                </CardTitle>
                {!tasks.isLoading && !tasks.error && (
                  <Badge
                    variant="secondary"
                    className="rounded-full tabular-nums"
                  >
                    {number(allTasks.length)}
                  </Badge>
                )}
              </div>
              <CardDescription>{l("tasksDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Tabs defaultValue="active" dir={i18n.dir()}>
                <TabsList
                  className="mb-4 w-full justify-start sm:w-auto"
                  aria-label={l("myTasks")}
                >
                  {taskFilters.map((filter) => (
                    <TabsTrigger
                      key={filter}
                      value={filter}
                      className="flex-1 sm:flex-none"
                    >
                      {l(filter)}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {taskFilters.map((filter) => {
                  const filtered =
                    filter === "active"
                      ? activeTasks
                      : filter === "completed"
                        ? completedTasks
                        : allTasks;
                  const sorted = [...filtered].sort(
                    (a, b) =>
                      (a.dueDate ? new Date(a.dueDate).getTime() : Infinity) -
                      (b.dueDate ? new Date(b.dueDate).getTime() : Infinity),
                  );
                  return (
                    <TabsContent
                      key={filter}
                      value={filter}
                      className="mt-0 space-y-3"
                    >
                      <ResourceState
                        isLoading={tasks.isLoading}
                        error={tasks.error}
                        isEmpty={false}
                      />
                      {!tasks.isLoading &&
                        !tasks.error &&
                        (sorted.length ? (
                          sorted.map((task) => {
                            const overdue =
                              task.dueDate &&
                              new Date(task.dueDate).getTime() < Date.now() &&
                              !inactiveStatuses.has(task.status);
                            return (
                              <article
                                key={task.id}
                                className="rounded-xl border border-border/70 p-4 transition-colors hover:bg-muted/30"
                              >
                                <div className="flex items-start gap-3">
                                  <span
                                    className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full ${task.status === "completed" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-primary/8 text-primary"}`}
                                  >
                                    {task.status === "completed" ? (
                                      <CircleCheck className="size-4" />
                                    ) : (
                                      <Clock3 className="size-4" />
                                    )}
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                      <h3 className="break-words text-sm font-semibold leading-6">
                                        {task.title}
                                      </h3>
                                      <Badge
                                        variant="secondary"
                                        className="rounded-md text-[10px]"
                                      >
                                        {t(`tasks.statuses.${task.status}`, {
                                          defaultValue: task.status,
                                        })}
                                      </Badge>
                                    </div>
                                    <p className="mt-1 line-clamp-2 break-words text-xs leading-6 text-muted-foreground">
                                      {task.description}
                                    </p>
                                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                                      {task.dueDate && (
                                        <span
                                          className={`inline-flex items-center gap-1.5 ${overdue ? "font-medium text-destructive" : ""}`}
                                        >
                                          <CalendarDays className="size-3.5" />
                                          {l("due")} {date(task.dueDate)}
                                          {overdue && (
                                            <span>· {l("overdue")}</span>
                                          )}
                                        </span>
                                      )}
                                      <span>
                                        {l("assignedBy")} {task.createdBy.name}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </article>
                            );
                          })
                        ) : (
                          <div className="flex flex-col items-center rounded-xl border border-dashed px-5 py-10 text-center">
                            <CircleCheck className="mb-3 size-8 text-primary/60" />
                            <p className="text-sm font-medium">
                              {l(
                                filter === "all"
                                  ? "noTasks"
                                  : "noFilteredTasks",
                              )}
                            </p>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {l("emptyTasksHint")}
                            </p>
                          </div>
                        ))}
                      {tasks.error && (
                        <Button
                          variant="outline"
                          onClick={() => void tasks.refresh()}
                        >
                          {t("common.retry")}
                        </Button>
                      )}
                    </TabsContent>
                  );
                })}
              </Tabs>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-2xl">
            <CardHeader className="border-b border-border/60">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="size-5 text-primary" />
                {l("warnings")}
              </CardTitle>
              <CardDescription>{l("noticesDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-4 sm:p-6">
              <ResourceState
                isLoading={warnings.isLoading}
                error={warnings.error}
                isEmpty={false}
              />
              {!warnings.isLoading &&
                !warnings.error &&
                (!warnings.data?.length ? (
                  <div className="flex items-center gap-3 rounded-xl bg-emerald-500/5 p-5">
                    <ShieldCheck className="size-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-sm text-muted-foreground">
                      {l("noWarnings")}
                    </p>
                  </div>
                ) : (
                  warnings.data.map(({ warning, warningId }) => (
                    <article
                      key={warningId}
                      className={`rounded-xl border p-4 ${warning.severity === "urgent" ? "border-destructive/25 bg-destructive/5" : warning.severity === "warning" ? "border-amber-500/20 bg-amber-500/5" : "border-primary/15 bg-primary/5"}`}
                    >
                      <div className="flex items-start gap-3">
                        <TriangleAlert
                          className={`mt-0.5 size-4 shrink-0 ${warning.severity === "urgent" ? "text-destructive" : "text-amber-600 dark:text-amber-400"}`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="break-words text-sm font-semibold">
                              {warning.title}
                            </h3>
                            <Badge
                              variant={
                                warning.severity === "urgent"
                                  ? "destructive"
                                  : "outline"
                              }
                              className="text-[10px]"
                            >
                              {t(
                                `employeePortal.severities.${warning.severity}`,
                                { defaultValue: warning.severity },
                              )}
                            </Badge>
                          </div>
                          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">
                            {warning.message}
                          </p>
                          <p className="mt-3 text-xs text-muted-foreground">
                            {warning.sender.name} · {date(warning.createdAt)}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))
                ))}
              {warnings.error && (
                <Button
                  variant="outline"
                  onClick={() => void warnings.refresh()}
                >
                  {t("common.retry")}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          <Card className="overflow-hidden rounded-2xl">
            <CardHeader className="bg-primary/5">
              <span className="mb-3 grid size-11 place-items-center rounded-2xl border border-primary/10 bg-card text-primary">
                <Lightbulb className="size-5" />
              </span>
              <CardTitle className="text-lg">{l("submitIdea")}</CardTitle>
              <CardDescription className="leading-6">
                {l("ideaHint")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form className="space-y-4" onSubmit={submit} aria-busy={saving}>
                <div className="space-y-2">
                  <Label htmlFor="portal-idea-title">{l("ideaTitle")}</Label>
                  <Input
                    ref={ideaTitleRef}
                    id="portal-idea-title"
                    name="title"
                    placeholder={l("titlePlaceholder")}
                    minLength={2}
                    maxLength={200}
                    required
                    disabled={saving}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portal-idea-description">
                    {l("ideaDescription")}
                  </Label>
                  <Textarea
                    id="portal-idea-description"
                    name="description"
                    placeholder={l("descriptionPlaceholder")}
                    minLength={5}
                    maxLength={10000}
                    rows={5}
                    required
                    disabled={saving}
                    className="resize-y rounded-xl"
                  />
                </div>
                <Button
                  type="submit"
                  permission="create"
                  className="w-full rounded-xl"
                  disabled={saving}
                >
                  {saving ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4 rtl:rotate-180" />
                  )}
                  {l(saving ? "sending" : "sendIdea")}
                </Button>
              </form>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">{l("myIdeas")}</CardTitle>
              <CardDescription>{l("ideasDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ResourceState
                isLoading={ideas.isLoading}
                error={ideas.error}
                isEmpty={false}
              />
              {!ideas.isLoading &&
                !ideas.error &&
                (!ideas.data?.length ? (
                  <div className="rounded-xl border border-dashed p-5 text-center text-sm leading-6 text-muted-foreground">
                    {l("noIdeas")}
                  </div>
                ) : (
                  ideas.data.map((idea) => (
                    <article
                      key={idea.id}
                      className="border-b border-border/60 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-2 size-2 shrink-0 rounded-full bg-primary/50" />
                        <div className="min-w-0 flex-1">
                          <h3 className="break-words text-sm font-medium leading-6">
                            {idea.title}
                          </h3>
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                            <time
                              dateTime={idea.createdAt}
                              className="text-xs text-muted-foreground"
                            >
                              {date(idea.createdAt)}
                            </time>
                            <Badge
                              variant="outline"
                              className="rounded-md text-[10px]"
                            >
                              {t(`employeePortal.ideaStatuses.${idea.status}`, {
                                defaultValue: idea.status,
                              })}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))
                ))}
              {ideas.error && (
                <Button variant="outline" onClick={() => void ideas.refresh()}>
                  {t("common.retry")}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
