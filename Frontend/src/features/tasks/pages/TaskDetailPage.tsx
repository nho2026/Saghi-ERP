import { hasPermission } from "@/features/auth/access";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Clock3,
  Mail,
  Paperclip,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { tasksApi, type TaskItem } from "../api/tasks.api";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { storedUser } from "@/features/auth/access";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

const dateTime = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString() : "—";
const hours = (minutes: number) =>
  `${(minutes / 60).toFixed(minutes % 60 ? 1 : 0)} h`;

export default function TaskDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [task, setTask] = useState<TaskItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewNote, setReviewNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState("none");
  const [adjustmentEmployeeId, setAdjustmentEmployeeId] = useState("");
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const currentUser = storedUser();
  const isHr = hasPermission(currentUser, "tasks.list.manage_all");

  const load = useCallback(async () => {
    if (!id) return;
    const result = await tasksApi.get(id);
    setTask(result);
    setReviewNote(result.reviewNote ?? "");
  }, [id]);

  useEffect(() => {
    if (!id) return;
    // The request callback owns the loading/result state for this route id.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
      .catch((error) =>
        toast.error(
          error instanceof Error ? error.message : t("tasks.loadFailed"),
        ),
      )
      .finally(() => setLoading(false));
  }, [id, load, t]);

  const trackedMinutes = useMemo(
    () => task?.timeEntries.reduce((sum, entry) => sum + entry.minutes, 0) ?? 0,
    [task],
  );
  const updateReview = async (status: string) => {
    setSaving(true);
    try {
      const adjustment =
        status === "completed" && adjustmentType !== "none"
          ? {
              employeeId: adjustmentEmployeeId,
              type: adjustmentType,
              amount: Number(adjustmentAmount),
              reason: adjustmentReason,
            }
          : undefined;
      if (
        adjustment &&
        (!adjustment.employeeId ||
          !adjustment.amount ||
          !adjustment.reason.trim())
      )
        throw new Error(
          "Employee, amount, and reason are required for the adjustment.",
        );
      await tasksApi.update(id!, {
        status,
        reviewNote: reviewNote || null,
        adjustment,
      });
      await load();
      toast.success(
        status === "completed"
          ? t("tasks.reviewApproved")
          : status === "rejected"
            ? t("tasks.statuses.rejected")
            : t("tasks.statuses." + status),
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("tasks.saveFailed"),
      );
    } finally {
      setSaving(false);
    }
  };
  if (loading)
    return (
      <div className="p-10 text-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  if (!task)
    return (
      <div className="space-y-4 p-6">
        <Button asChild variant="outline">
          <Link to="/tasks">
            <ArrowLeft />
            {t("tasks.backToTasks")}
          </Link>
        </Button>
        <p>{t("tasks.notFound")}</p>
      </div>
    );

  const dates = [
    [t("tasks.fields.startDate"), task.startDate],
    [t("tasks.fields.dueDate"), task.dueDate],
    [t("tasks.completedAt"), task.completedAt],
    [t("tasks.createdAt"), task.createdAt],
    [t("tasks.updatedAt"), task.updatedAt],
  ];

  return (
    <div className="space-y-5 p-4 md:p-6">
      <Button asChild variant="ghost" className="px-0">
        <Link to="/tasks">
          <ArrowLeft />
          {t("tasks.backToTasks")}
        </Link>
      </Button>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{task.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("tasks.createdBy", { name: task.createdBy.name })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{t(`tasks.priorities.${task.priority}`)}</Badge>
          <Badge variant="outline">
            {t(
              `tasks.statuses.${task.status === "cancelled" ? "rejected" : task.status}`,
            )}
          </Badge>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>{t("tasks.taskInformation")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  {t("tasks.fields.description")}
                </h3>
                <p className="whitespace-pre-wrap leading-7">
                  {task.description}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Info
                  icon={<Clock3 />}
                  label={t("tasks.fields.estimatedHours")}
                  value={
                    task.estimatedMinutes == null
                      ? "—"
                      : hours(task.estimatedMinutes)
                  }
                />
                <Info
                  icon={<Clock3 />}
                  label={t("tasks.trackedHours")}
                  value={hours(trackedMinutes)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("tasks.employeeInformation")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {task.assignees.length ? (
                task.assignees.map(({ employee, assignedAt }) => (
                  <div key={employee.id} className="rounded-xl border p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-full bg-primary/10">
                        <UserRound className="size-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">
                          {employee.firstName} {employee.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {employee.employeeCode}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <Line
                        icon={<BriefcaseBusiness />}
                        value={employee.position?.name ?? "—"}
                      />
                      <Line
                        icon={<Building2 />}
                        value={employee.department?.name ?? "—"}
                      />
                      {employee.user?.email && (
                        <Line icon={<Mail />} value={employee.user.email} />
                      )}
                      <Line
                        icon={<CalendarDays />}
                        value={`${t("tasks.hireDate")}: ${dateTime(employee.hireDate)}`}
                      />
                      <Line
                        icon={<UserRound />}
                        value={`${t("tasks.employeeStatus")}: ${employee.status}`}
                      />
                      <Line
                        icon={<CalendarDays />}
                        value={`${t("tasks.assignedAt")}: ${dateTime(assignedAt)}`}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">
                  {t("tasks.noAssignees")}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("tasks.timeEntries")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {task.timeEntries.length ? (
                task.timeEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-wrap justify-between gap-2 rounded-lg border p-3 text-sm"
                  >
                    <div>
                      <div className="font-medium">
                        {entry.employee.firstName} {entry.employee.lastName}
                      </div>
                      <div className="text-muted-foreground">
                        {entry.note || "—"}
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="font-semibold">
                        {hours(entry.minutes)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {dateTime(entry.workDate)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">
                  {t("tasks.noTimeEntries")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>{t("tasks.hrReview")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                className="min-h-24 w-full rounded-md border bg-background p-3 text-sm"
                value={reviewNote}
                onChange={(event) => setReviewNote(event.target.value)}
                placeholder={t("tasks.reviewNote")}
                disabled={isHr && task.status !== "review"}
              />
              {isHr && task.status === "review" && (
                <div className="grid gap-3 rounded-lg border p-3">
                  <label className="grid gap-1 text-xs font-medium">
                    Payroll action
                    <Select
                      value={adjustmentType}
                      onValueChange={setAdjustmentType}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          {t("pageText.noAdjustment")}
                        </SelectItem>
                        <SelectItem value="reward">
                          {t("pageText.reward")}
                        </SelectItem>
                        <SelectItem value="punishment">
                          {t("pageText.punishment")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </label>
                  {adjustmentType !== "none" && (
                    <>
                      <label className="grid gap-1 text-xs font-medium">
                        Employee
                        <Select
                          value={adjustmentEmployeeId}
                          onValueChange={setAdjustmentEmployeeId}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("pageText.selectEmployee")}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {task.assignees.map(({ employee }) => (
                              <SelectItem key={employee.id} value={employee.id}>
                                {employee.firstName} {employee.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </label>
                      <label className="grid gap-1 text-xs font-medium">
                        Amount
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={adjustmentAmount}
                          onChange={(e) => setAdjustmentAmount(e.target.value)}
                        />
                      </label>
                      <label className="grid gap-1 text-xs font-medium">
                        Reason
                        <textarea
                          className="min-h-20 rounded-md border bg-background p-2 text-sm"
                          value={adjustmentReason}
                          onChange={(e) => setAdjustmentReason(e.target.value)}
                        />
                      </label>
                    </>
                  )}
                </div>
              )}
              {task.reviewedBy && (
                <p className="text-xs text-muted-foreground">
                  {t("tasks.reviewedBy", { name: task.reviewedBy.name })} ·{" "}
                  {dateTime(task.reviewedAt)}
                </p>
              )}
              {(isHr ||
                task.assignees.some(
                  ({ employee }) => employee.id === currentUser?.employee?.id,
                )) &&
                task.status !== "completed" && (
                  <div className="flex flex-wrap gap-2">
                    {["todo", "in_progress", "incomplete", "review"].map(
                      (status) => (
                        <Button
                          key={status}
                          permission="update"
                          variant="outline"
                          disabled={saving || task.status === status}
                          onClick={() => void updateReview(status)}
                        >
                          {status === "review"
                            ? t("tasks.submitForReview")
                            : t(`tasks.statuses.${status}`)}
                        </Button>
                      ),
                    )}
                  </div>
                )}
              {isHr &&
                hasPermission(currentUser, "tasks.list.approve") &&
                task.status === "review" && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      permission="approve"
                      disabled={
                        saving ||
                        !hasPermission(currentUser, "tasks.list.update")
                      }
                      onClick={() => void updateReview("completed")}
                    >
                      {t("tasks.approveCompletion")}
                    </Button>
                    <Button
                      permission="approve"
                      variant="outline"
                      disabled={
                        saving ||
                        !hasPermission(currentUser, "tasks.list.update")
                      }
                      onClick={() => void updateReview("rejected")}
                    >
                      {t("tasks.statuses.rejected")}
                    </Button>
                  </div>
                )}
              {task.status === "review" && (
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {t("tasks.awaitingHrReview")}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("tasks.dates")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dates.map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="text-sm font-medium">{dateTime(value)}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("tasks.fields.attachments")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {task.attachments.length ? (
                task.attachments.map((file) => (
                  <a
                    key={file.id}
                    href={file.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted"
                  >
                    <Paperclip className="size-4 text-primary" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {file.fileName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.ceil(file.fileSize / 1024)} KB
                      </div>
                    </div>
                  </a>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("tasks.noAttachments")}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("tasks.comments")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {task.comments.length ? (
                task.comments.map((comment) => (
                  <div key={comment.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {comment.author.name}
                      </span>
                      <span>{dateTime(comment.createdAt)}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm">
                      {comment.body}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("tasks.noComments")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}
function Line({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2 [&_svg]:size-4">
      {icon}
      <span>{value}</span>
    </div>
  );
}
