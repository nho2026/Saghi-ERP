import { hasPagePermission } from "@/features/auth/access";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { FilePlus2, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  crmFormsApi,
  type DynamicFormField,
  type FormTemplate,
} from "../api/crm.api";
import { storedUser } from "@/features/auth/access";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { DeleteConfirmationDialog } from "@/shared/components/ui/confirmation-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";

let fieldSequence = 0;
const blankField = (): DynamicFormField => ({
  id: `field_${Date.now()}_${fieldSequence++}`,
  label: "",
  type: "text",
  required: false,
});

export default function CrmFormsPage() {
  const { t } = useTranslation();
  const canManage = hasPagePermission(
    storedUser(),
    "create",
    "update",
    "delete",
  );
  const templates = useApiResource(
    useCallback(() => crmFormsApi.templates(), []),
  );
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FormTemplate | null>(null);
  const [fields, setFields] = useState<DynamicFormField[]>([blankField()]);
  const startCreate = () => {
    setEditing(null);
    setFields([blankField()]);
    setOpen(true);
  };
  const startEdit = (template: FormTemplate) => {
    setEditing(template);
    setFields(template.fields);
    setOpen(true);
  };
  const updateField = (index: number, change: Partial<DynamicFormField>) =>
    setFields((current) =>
      current.map((field, position) =>
        position === index ? { ...field, ...change } : field,
      ),
    );
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name")),
      description: String(form.get("description")) || null,
      category: String(form.get("category")),
      status: String(form.get("status")),
      fields,
    };
    try {
      if (editing) await crmFormsApi.update(editing.id, payload);
      else await crmFormsApi.create(payload as Omit<FormTemplate, "id">);
      setOpen(false);
      await templates.refresh();
      toast.success(editing ? "Form updated." : "Form created.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save form.",
      );
    }
  };
  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            CRM form builder
          </p>
          <h1 className="mt-1 text-2xl font-bold">
            Clinical forms & examinations
          </h1>
          <p className="text-sm text-muted-foreground">
            Build reusable forms and submit them from patient profiles.
          </p>
        </div>
        {canManage && (
          <Button permission="create" onClick={startCreate}>
            <Plus />
            New form
          </Button>
        )}
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.data?.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge variant="outline" className="mb-2 capitalize">
                    {template.category}
                  </Badge>
                  <CardTitle>{template.name}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {template.code}
                  </p>
                </div>
                <FilePlus2 className="size-8 text-primary/60" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="min-h-10 text-sm text-muted-foreground">
                {template.description || "No description"}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span>
                  {template.fields.length} fields ·{" "}
                  {template._count?.submissions ?? 0} submissions
                </span>
                <Badge className="capitalize">{template.status}</Badge>
              </div>
              {canManage && (
                <div className="mt-4 flex justify-end gap-2 border-t pt-3">
                  <Button
                    data-action="edit"
                    size="icon"
                    variant="ghost"
                    onClick={() => startEdit(template)}
                  >
                    <Pencil />
                  </Button>
                  <DeleteConfirmationDialog
                    description="Delete this form template? Existing submissions will prevent deletion."
                    onConfirm={async () => {
                      await crmFormsApi.remove(template.id);
                      await templates.refresh();
                    }}
                  >
                    <Button data-action="delete" size="icon" variant="ghost">
                      <Trash2 className="text-destructive" />
                    </Button>
                  </DeleteConfirmationDialog>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
          <DialogHeader className="border-b px-6 py-5">
            <DialogTitle>
              {editing ? "Edit dynamic form" : "Create dynamic form"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
            <div className="grid gap-4 overflow-y-auto p-6 sm:grid-cols-2">
              <Label className="grid gap-2">
                Form name
                <Input name="name" required defaultValue={editing?.name} />
              </Label>
              <Label className="grid gap-2">
                Category
                <Select
                  name="category"
                  defaultValue={editing?.category ?? "clinical"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["clinical", "examination", "assessment", "consent"].map(
                      (value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </Label>
              <Label className="grid gap-2">
                Status
                <Select
                  name="status"
                  defaultValue={editing?.status ?? "active"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      {t("crm.values.active")}
                    </SelectItem>
                    <SelectItem value="inactive">
                      {t("crm.values.inactive")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Label>
              <Label className="grid gap-2 sm:col-span-2">
                Description
                <Textarea
                  name="description"
                  defaultValue={editing?.description ?? undefined}
                />
              </Label>
              <div className="sm:col-span-2">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">{t("pageText.formFields")}</h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setFields((current) => [...current, blankField()])
                    }
                  >
                    <Plus />
                    Add field
                  </Button>
                </div>
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid gap-3 rounded-xl border bg-muted/20 p-3 sm:grid-cols-[1fr_160px_auto_auto]"
                    >
                      <Input
                        value={field.label}
                        placeholder={t("crm.placeholders.fieldLabel")}
                        onChange={(event) =>
                          updateField(index, { label: event.target.value })
                        }
                      />
                      <Select
                        value={field.type}
                        onValueChange={(type) =>
                          updateField(index, {
                            type: type as DynamicFormField["type"],
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "text",
                            "textarea",
                            "number",
                            "date",
                            "select",
                            "checkbox",
                          ].map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Label className="flex items-center gap-2">
                        <Checkbox
                          checked={field.required}
                          onCheckedChange={(checked) =>
                            updateField(index, { required: checked === true })
                          }
                        />
                        Required
                      </Label>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        disabled={fields.length === 1}
                        onClick={() =>
                          setFields((current) =>
                            current.filter((_, position) => position !== index),
                          )
                        }
                      >
                        <X />
                      </Button>
                      {field.type === "select" && (
                        <Input
                          className="sm:col-span-4"
                          placeholder={t("crm.placeholders.commaOptions")}
                          value={field.options?.join(", ") ?? ""}
                          onChange={(event) =>
                            updateField(index, {
                              options: event.target.value
                                .split(",")
                                .map((x) => x.trim())
                                .filter(Boolean),
                            })
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end border-t p-4">
              <Button permission={editing ? "update" : "create"} type="submit">
                {editing ? "Save changes" : "Create form"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
