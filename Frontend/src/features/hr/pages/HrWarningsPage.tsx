import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { apiErrorMessage } from "@/shared/api/client";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { warningsApi } from "../api/warnings.api";

export default function HrWarningsPage() {
  const { t, i18n } = useTranslation();
  const options = useApiResource(useCallback(() => warningsApi.options(), [])),
    history = useApiResource(useCallback(() => warningsApi.list(), []));
  const [audience, setAudience] = useState("all"),
    [targetId, setTargetId] = useState(""),
    [userIds, setUserIds] = useState<string[]>([]),
    [saving, setSaving] = useState(false);
  const send = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget,
      fd = new FormData(form);
    setSaving(true);
    try {
      await warningsApi.send({
        title: fd.get("title"),
        message: fd.get("message"),
        severity: fd.get("severity"),
        audience,
        targetId: targetId || undefined,
        userIds,
      });
      form.reset();
      setUserIds([]);
      await history.refresh();
      toast.success(t("hrWarnings.sent"));
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };
  const choices =
    audience === "role" ? options.data?.roles : options.data?.departments;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("hrWarnings.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("hrWarnings.subtitle")}
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t("hrWarnings.new")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={send}>
              <Input
                name="title"
                placeholder={t("hrWarnings.warningTitle")}
                required
              />
              <textarea
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                name="message"
                rows={5}
                placeholder={t("hrWarnings.message")}
                required
              />
              <Select name="severity" defaultValue="warning">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["info", "warning", "urgent"].map((x) => (
                    <SelectItem key={x} value={x}>
                      {t(`hrWarnings.severity.${x}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={audience}
                onValueChange={(v) => {
                  setAudience(v);
                  setTargetId("");
                  setUserIds([]);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["all", "role", "department", "users"].map((x) => (
                    <SelectItem key={x} value={x}>
                      {t(`hrWarnings.audience.${x}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(audience === "role" || audience === "department") && (
                <Select value={targetId} onValueChange={setTargetId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("hrWarnings.selectTarget")} />
                  </SelectTrigger>
                  <SelectContent>
                    {choices?.map((x) => (
                      <SelectItem key={x.id} value={x.id}>
                        {x.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {audience === "users" && (
                <div className="max-h-48 space-y-1 overflow-auto rounded-lg border p-2">
                  {options.data?.users.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center gap-2 rounded p-2 text-sm hover:bg-muted"
                    >
                      <input
                        type="checkbox"
                        checked={userIds.includes(user.id)}
                        onChange={(e) =>
                          setUserIds((ids) =>
                            e.target.checked
                              ? [...ids, user.id]
                              : ids.filter((id) => id !== user.id),
                          )
                        }
                      />
                      {user.name}{" "}
                      <small className="text-muted-foreground">
                        {user.employee?.employeeCode}
                      </small>
                    </label>
                  ))}
                </div>
              )}
              <Button permission="create" className="w-full" disabled={saving}>
                {t("hrWarnings.send")}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("hrWarnings.history")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.data?.map((item) => (
              <div key={item.id} className="rounded-xl border p-4">
                <div className="flex justify-between gap-2">
                  <b>{item.title}</b>
                  <Badge
                    variant={
                      item.severity === "urgent" ? "destructive" : "secondary"
                    }
                  >
                    {t(`hrWarnings.severity.${item.severity}`)}
                  </Badge>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm">
                  {item.message}
                </p>
                <small className="mt-2 block text-muted-foreground">
                  {item.sender.name} · {item._count.recipients}{" "}
                  {t("hrWarnings.recipients")} ·{" "}
                  {new Intl.DateTimeFormat(i18n.resolvedLanguage, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(item.createdAt))}
                </small>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
