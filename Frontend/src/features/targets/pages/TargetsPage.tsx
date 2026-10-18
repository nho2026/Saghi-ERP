import { hasPermission } from "@/features/auth/access";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Goal,
  Plus,
  TrendingUp,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { storedUser } from "@/features/auth/access";
import {
  targetsApi,
  type EmployeeTarget,
  type TargetEmployee,
} from "../api/targets.api";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { FormDatePicker } from "@/shared/components/ui/form-date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

const statusStyle: Record<string, string> = {
  active: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  completed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  paused: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  cancelled: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
};

export default function TargetsPage() {
  const { t } = useTranslation();
  const user = storedUser();
  const manager = hasPermission(user, "targets.manage_all");
  const canAssign = manager || Boolean(user?.employee?.isDepartmentLeader);
  const [targets, setTargets] = useState<EmployeeTarget[]>([]);
  const [employees, setEmployees] = useState<TargetEmployee[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rewardTarget, setRewardTarget] = useState<{
    target: EmployeeTarget;
    value: number;
  } | null>(null);
  const load = useCallback(async () => {
    try {
      const [items, staff] = await Promise.all([
        targetsApi.list(),
        canAssign ? targetsApi.assignees() : Promise.resolve([]),
      ]);
      setTargets(items);
      setEmployees(staff);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load targets.",
      );
    } finally {
      setLoading(false);
    }
  }, [canAssign]);
  useEffect(() => {
    void load();
  }, [load]);
  const summary = useMemo(
    () => ({
      active: targets.filter((x) => x.status === "active").length,
      completed: targets.filter((x) => x.status === "completed").length,
      people: new Set(targets.map((x) => x.employee.id)).size,
    }),
    [targets],
  );
  const summaryCards: [string, number, LucideIcon][] = [
    ["Active targets", summary.active, Goal],
    ["Completed", summary.completed, TrendingUp],
    ["People", summary.people, UsersRound],
  ];
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      await targetsApi.create({
        title: data.get("title"),
        description: data.get("description") || null,
        metric: data.get("metric"),
        unit: data.get("unit"),
        targetValue: Number(data.get("targetValue")),
        currentValue: Number(data.get("currentValue") || 0),
        startDate: data.get("startDate"),
        dueDate: data.get("dueDate"),
        employeeId: data.get("employeeId"),
      });
      setOpen(false);
      form.reset();
      await load();
      toast.success("Target assigned successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to assign target.",
      );
    }
  };
  const updateProgress = async (target: EmployeeTarget, value: number) => {
    try {
      await targetsApi.update(target.id, { currentValue: value });
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update progress.",
      );
    }
  };
  return (
    <div className="mx-auto max-w-[1500px] space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">
            Performance
          </p>
          <h1 className="mt-1 text-2xl font-bold">
            {t("pageText.employeeTargets")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set measurable goals and monitor progress for leaders and employees.
          </p>
        </div>
        {canAssign && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button permission="create" className="rounded-xl">
                <Plus /> Assign target
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t("pageText.assignNewTarget")}</DialogTitle>
              </DialogHeader>
              <form className="grid gap-4" onSubmit={submit}>
                <label className="grid gap-1.5 text-sm font-medium">
                  Target title
                  <Input
                    name="title"
                    required
                    placeholder={t("pageText.targetTitlePlaceholder")}
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-medium">
                  Description
                  <textarea
                    name="description"
                    className="min-h-24 rounded-md border bg-background p-3 font-normal"
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-sm font-medium">
                    Assign to
                    <Select name="employeeId" required>
                      <SelectTrigger className="h-10">
                        <SelectValue
                          placeholder={t("pageText.selectEmployee")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((x) => (
                          <SelectItem key={x.id} value={x.id}>
                            {x.firstName} {x.lastName}
                            {x.department?.managerId === x.id
                              ? " (Department leader)"
                              : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>
                  <label className="grid gap-1.5 text-sm font-medium">
                    Metric
                    <Input
                      name="metric"
                      required
                      placeholder={t("pageText.targetMetricPlaceholder")}
                    />
                  </label>
                  <label className="grid gap-1.5 text-sm font-medium">
                    Target value
                    <Input
                      name="targetValue"
                      type="number"
                      min="0.01"
                      step="any"
                      required
                    />
                  </label>
                  <label className="grid gap-1.5 text-sm font-medium">
                    Unit
                    <Input
                      name="unit"
                      required
                      placeholder={t("pageText.targetUnitPlaceholder")}
                    />
                  </label>
                  <label className="grid gap-1.5 text-sm font-medium">
                    Start date
                    <FormDatePicker name="startDate" required />
                  </label>
                  <label className="grid gap-1.5 text-sm font-medium">
                    Due date
                    <FormDatePicker name="dueDate" required />
                  </label>
                </div>
                <Button permission="create" type="submit">
                  {t("pageText.assignTarget")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        {summaryCards.map(([label, value, Icon]) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <strong className="text-2xl">{value}</strong>
            </div>
          </div>
        ))}
      </div>
      {loading ? (
        <div className="py-20 text-center text-muted-foreground">
          Loading targets…
        </div>
      ) : targets.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card py-20 text-center">
          <Goal className="mx-auto mb-3 size-9 text-muted-foreground" />
          <p className="font-semibold">{t("pageText.noTargets")}</p>
          <p className="text-sm text-muted-foreground">
            Assign the first measurable target to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {targets.map((target) => {
            const percent = Math.min(
              100,
              Math.round((target.currentValue / target.targetValue) * 100),
            );
            return (
              <article
                key={target.id}
                className="rounded-2xl border bg-card p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold">{target.title}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {target.employee.firstName} {target.employee.lastName} ·{" "}
                      {target.employee.position?.name ??
                        target.employee.employeeCode}
                    </p>
                  </div>
                  <Badge className={statusStyle[target.status]}>
                    {target.status}
                  </Badge>
                </div>
                <p className="mt-4 line-clamp-2 min-h-10 text-sm text-muted-foreground">
                  {target.description || target.metric}
                </p>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-bold">
                      {target.currentValue.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {" "}
                      / {target.targetValue.toLocaleString()} {target.unit}
                    </span>
                  </div>
                  <strong className="text-sm text-primary">{percent}%</strong>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-primary to-teal-500 transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 border-t pt-4">
                  <p className="text-[11px] text-muted-foreground">
                    Due {new Date(target.dueDate).toLocaleDateString()}
                  </p>
                  <Input
                    className="h-8 w-28"
                    type="number"
                    min="0"
                    step="any"
                    disabled={!hasPermission(user, "targets.update")}
                    defaultValue={target.currentValue}
                    onBlur={(e) => {
                      const value = Number(e.target.value);
                      if (value !== target.currentValue) {
                        if (
                          canAssign &&
                          value >= target.targetValue &&
                          target.status !== "completed"
                        )
                          setRewardTarget({ target, value });
                        else void updateProgress(target, value);
                      }
                    }}
                    aria-label="Current progress"
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
      <Dialog
        open={Boolean(rewardTarget)}
        onOpenChange={(value) => {
          if (!value) setRewardTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("pageText.targetReached")}</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!rewardTarget) return;
              const form = new FormData(event.currentTarget);
              const amount = Number(form.get("amount") || 0);
              const reason = String(form.get("reason") || "");
              try {
                await targetsApi.update(rewardTarget.target.id, {
                  currentValue: rewardTarget.value,
                  ...(amount > 0
                    ? { rewardAmount: amount, rewardReason: reason }
                    : {}),
                });
                setRewardTarget(null);
                await load();
                toast.success(
                  amount > 0
                    ? "Target completed and reward added."
                    : "Target completed.",
                );
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Unable to complete target.",
                );
              }
            }}
          >
            <p className="text-sm text-muted-foreground">
              You can complete the target without a reward, or enter an amount
              and reason to include it in this month's payroll.
            </p>
            <label className="grid gap-1 text-sm font-medium">
              Reward amount (optional)
              <Input
                name="amount"
                type="number"
                min="0"
                step="0.01"
                disabled={!hasPermission(user, "targets.reward")}
              />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Reward reason
              <textarea
                name="reason"
                className="min-h-24 rounded-md border bg-background p-3"
              />
            </label>
            <Button permission="update">{t("pageText.completeTarget")}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
