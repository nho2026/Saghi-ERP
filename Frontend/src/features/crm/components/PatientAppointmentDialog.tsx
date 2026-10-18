import { CalendarPlus, UserRound } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { crmApi, type CrmRecord } from "../api/crm.api";
import { healthcareApi } from "@/features/healthcare/api/healthcare.api";
import { apiErrorMessage } from "@/shared/api/client";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { useSettings } from "@/features/settings/settings";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { SearchableSelect } from "@/shared/components/ui/searchable-select";
import { FormDatePicker } from "@/shared/components/ui/form-date-picker";

export default function PatientAppointmentDialog({
  patient,
  surgery,
  onClose,
  onSaved,
}: {
  patient: CrmRecord;
  surgery: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t, i18n } = useTranslation();
  const settings = useSettings();
  const catalog = useApiResource(
    useCallback(async () => {
      const [lookups, departments] = await Promise.all([
        crmApi.lookups(),
        healthcareApi.departments.list(),
      ]);
      return {
        doctors: lookups.doctors ?? [],
        surgeries: lookups.surgeries ?? [],
        departments,
      };
    }, []),
  );
  const [departmentId, setDepartmentId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const label = (key: string) => t(`patientBooking.${key}`);
  const doctors = (catalog.data?.doctors ?? []).filter(
    (doctor) => surgery || doctor.departmentId === departmentId,
  );
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    const form = new FormData(event.currentTarget);
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      if (surgery && !form.get("surgeryId"))
        throw new Error(
          t("crm.placeholders.selectField", { field: label("surgeryId") }),
        );
      const scheduledAt = new Date(
        String(form.get("scheduledAt")),
      ).toISOString();
      if (surgery)
        await crmApi["surgery-appointments"].create({
          patientId: patient.id,
          doctorId,
          surgeryId: form.get("surgeryId"),
          scheduledAt,
          operatingRoom: form.get("operatingRoom") || null,
          preOpNotes: form.get("notes") || null,
          status: "scheduled",
        });
      else
        await healthcareApi.appointments.create({
          patientId: patient.id,
          patientName:
            `${patient.firstName ?? ""} ${patient.lastName ?? ""}`.trim(),
          patientPhone: String(patient.phone ?? ""),
          patientEmail: patient.email || null,
          doctorId,
          departmentId,
          scheduledAt,
          durationMinutes: Number(form.get("durationMinutes")),
          reason: form.get("notes") || null,
          status: "pending",
        });
      onSaved();
      onClose();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !lock.current) onClose();
      }}
    >
      <DialogContent
        className="max-h-[90dvh] gap-0 overflow-y-auto p-0 sm:max-w-2xl"
        dir={i18n.dir()}
      >
        <DialogHeader className="border-b px-6 py-5 text-start">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <CalendarPlus className="size-5 text-primary" />
            {t(
              `patientProgress.${surgery ? "surgery_appointment" : "appointment_requested"}`,
            )}
          </DialogTitle>
          <DialogDescription>{label("description")}</DialogDescription>
        </DialogHeader>
        <div className="mx-6 mt-5 flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
          <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
            <UserRound className="size-5" />
          </span>
          <div>
            <p className="font-semibold">
              {String(patient.firstName ?? "")} {String(patient.lastName ?? "")}
            </p>
            <p className="text-xs text-muted-foreground">
              {String(patient.patientCode ?? "")} ·{" "}
              <span dir="ltr">{String(patient.phone ?? "")}</span>
            </p>
          </div>
        </div>
        <form onSubmit={submit}>
          <fieldset
            disabled={busy || catalog.isLoading}
            className="grid gap-x-5 gap-y-4 p-6 sm:grid-cols-2"
          >
            {!surgery && (
              <Label className="grid gap-2">
                {label("departmentId")}
                <Select
                  required
                  value={departmentId}
                  onValueChange={(value) => {
                    setDepartmentId(value);
                    setDoctorId("");
                  }}
                >
                  <SelectTrigger aria-label={label("departmentId")}>
                    <SelectValue
                      placeholder={label(
                        catalog.isLoading ? "loading" : "selectDepartment",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(catalog.data?.departments ?? [])
                      .filter(
                        (d) => d.type === "hospital" && d.status === "active",
                      )
                      .map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {String(d.name)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {!catalog.isLoading &&
                  !catalog.error &&
                  !catalog.data?.departments.some(
                    (d) => d.type === "hospital" && d.status === "active",
                  ) && (
                    <span className="text-xs font-normal text-muted-foreground">
                      {label("noDepartments")}
                    </span>
                  )}
              </Label>
            )}
            <Label className="grid gap-2">
              {label("doctorId")}
              <Select
                disabled={!surgery && !departmentId}
                required
                value={doctorId}
                onValueChange={setDoctorId}
              >
                <SelectTrigger aria-label={label("doctorId")}>
                  <SelectValue
                    placeholder={label(
                      !surgery && !departmentId
                        ? "departmentFirst"
                        : "selectDoctor",
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => {
                    const employee = doctor.employee as CrmRecord;
                    return (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {String(employee.firstName)} {String(employee.lastName)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {!catalog.isLoading &&
                !catalog.error &&
                (surgery || departmentId) &&
                !doctors.length && (
                  <span className="text-xs font-normal text-muted-foreground">
                    {label("noDoctors")}
                  </span>
                )}
            </Label>
            {surgery && (
              <Label className="grid gap-2">
                {label("surgeryId")}
                <SearchableSelect
                  name="surgeryId"
                  placeholder={label("selectSurgery")}
                  required
                  options={(catalog.data?.surgeries ?? []).map((s) => ({
                    value: s.id,
                    label: String(s.name),
                  }))}
                />
              </Label>
            )}
            <Label className="grid gap-2">
              {label("scheduledAt")}
              <FormDatePicker name="scheduledAt" includeTime required />
            </Label>
            {surgery ? (
              <Label className="grid gap-2">
                {label("operatingRoom")}
                <SearchableSelect
                  name="operatingRoom"
                  placeholder={label("selectRoom")}
                  options={(settings?.healthcare?.operatingRooms ?? []).map(
                    (room) => ({ value: room, label: room }),
                  )}
                />
              </Label>
            ) : (
              <Label className="grid gap-2">
                {label("durationMinutes")}
                <Input
                  name="durationMinutes"
                  type="number"
                  min={10}
                  max={480}
                  step={1}
                  defaultValue={settings?.healthcare?.appointmentMinutes ?? 30}
                  required
                />
              </Label>
            )}
            <Label className="grid gap-2 sm:col-span-2">
              {label("notes")}
              <Textarea
                name="notes"
                rows={3}
                className="min-h-20 resize-y"
                placeholder={label("notesPlaceholder")}
              />
            </Label>
            {(error || catalog.error) && (
              <p role="alert" className="text-destructive sm:col-span-2">
                {error || catalog.error}
              </p>
            )}
          </fieldset>
          <div className="flex justify-end gap-2 border-t bg-muted/20 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={onClose}
            >
              {label("cancel")}
            </Button>
            <Button
              permission="healthcare.appointments.create"
              type="submit"
              disabled={
                busy ||
                catalog.isLoading ||
                !!catalog.error ||
                !doctorId ||
                (!surgery && !departmentId)
              }
            >
              <CalendarPlus className="size-4" />
              {label(busy ? "saving" : "save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
