import { useSearchParams } from "react-router-dom";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react";
import { apiClient, apiErrorMessage } from "@/shared/api/client";
import { useApiResource } from "@/shared/hooks/useApiResource";
import { randomId } from "@/shared/lib/random-id";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/shared/components/ui/table";
import { hasPermission, storedUser } from "@/features/auth/access";
import { choiceLabel, labApi, type LabChoice, type LabOrder } from "../api";
import { LabLookup } from "./LabLookup";

export function ReceptionForm({
  onSaved,
  onBusy,
}: {
  onSaved: (order: LabOrder) => void;
  onBusy: (busy: boolean) => void;
}) {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const patientId = params.get("patientId");
  const leadId = params.get("leadId");
  const appointmentId = params.get("appointmentId");
  const [sourceOverride, setSource] = useState<string>();
  const [selectedOverride, setSelected] = useState<LabChoice | null>();
  const [appointmentOverride, setAppointment] = useState<LabChoice | null>();
  const [firstNameOverride, setFirstName] = useState<string>();
  const [lastNameOverride, setLastName] = useState<string>();
  const [phoneOverride, setPhone] = useState<string>();
  const [address, setAddress] = useState("");
  const [tests, setTests] = useState<LabChoice[]>([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const requestId = useRef(randomId());
  const locked = useRef(false);
  const canNewPatient = hasPermission(storedUser(), "crm.patients.create");
  const canLead = hasPermission(storedUser(), "crm.leads.update");
  const initial = useApiResource(
    useCallback(async () => {
      const choiceId = leadId ?? patientId;
      const [choices, appointments] = await Promise.all([
        choiceId
          ? apiClient
              .get<LabChoice[]>(
                `/laboratory/lookups/${leadId ? "leads" : "patients"}`,
                { params: { id: choiceId } },
              )
              .then((r) => r.data)
          : [],
        appointmentId
          ? apiClient
              .get<LabChoice[]>("/laboratory/lookups/appointments", {
                params: { id: appointmentId },
              })
              .then((r) => r.data)
          : [],
      ]);
      let choice: LabChoice | undefined = choices[0];
      if (!choice && appointments[0]?.patientPhone) {
        const patients = await apiClient.get<LabChoice[]>(
          "/laboratory/lookups/patients",
          { params: { search: appointments[0].patientPhone } },
        );
        choice = patients.data.find(
          (patient) =>
            patient.phone?.replace(/\D/g, "") ===
            appointments[0].patientPhone?.replace(/\D/g, ""),
        );
      }
      return { choice, appointment: appointments[0] };
    }, [patientId, leadId, appointmentId]),
  );
  const source =
    sourceOverride ??
    (leadId
      ? "lead"
      : initial.data?.choice
        ? "patient"
        : appointmentId && canNewPatient
          ? "new"
          : "patient");
  const selected =
    selectedOverride === undefined
      ? initial.data?.choice
      : (selectedOverride ?? undefined);
  const appointment =
    appointmentOverride === undefined
      ? initial.data?.appointment
      : (appointmentOverride ?? undefined);
  const nameParts =
    initial.data?.appointment?.patientName?.trim().split(/\s+/) ?? [];
  const firstName = firstNameOverride ?? nameParts[0] ?? "";
  const lastName = lastNameOverride ?? nameParts.slice(1).join(" ");
  const phone = phoneOverride ?? initial.data?.appointment?.patientPhone ?? "";
  const patientPhone = source === "new" ? phone : selected?.phone;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (locked.current) return;
    if (!tests.length || (source !== "new" && !selected)) {
      setError(t("laboratory.selectPatientTests"));
      return;
    }
    locked.current = true;
    setSaving(true);
    onBusy(true);
    setError("");
    try {
      const order = await labApi.createOrder({
        requestId: requestId.current,
        ...(source === "new"
          ? { patient: { firstName, lastName, phone, address } }
          : source === "lead"
            ? { leadId: selected!.id }
            : { patientId: selected!.id }),
        appointmentId: appointment?.id,
        testIds: tests.map((test) => test.id),
        notes,
      });
      onSaved(order);
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      locked.current = false;
      setSaving(false);
      onBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-5">
      {(error || initial.error) && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error || initial.error}
        </p>
      )}
      <fieldset disabled={saving} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>{t("laboratory.patientSource")}</Label>
            <Select
              value={source}
              onValueChange={(next) => {
                setSource(next);
                setSelected(null);
                setAppointment(null);
              }}
            >
              <SelectTrigger aria-label={t("laboratory.patientSource")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patient">
                  {t("laboratory.existingPatient")}
                </SelectItem>
                {canLead && (
                  <SelectItem value="lead">
                    {t("laboratory.fromLead")}
                  </SelectItem>
                )}
                {canNewPatient && (
                  <SelectItem value="new">{t("laboratory.walkIn")}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          {source !== "new" && (
            <div className="flex flex-col gap-2">
              <Label>
                {t(
                  source === "lead" ? "laboratory.lead" : "laboratory.patient",
                )}
              </Label>
              <LabLookup
                key={source}
                resource={source === "lead" ? "leads" : "patients"}
                selected={selected}
                onSelect={(choice) => {
                  setSelected(choice);
                  setAppointment(null);
                }}
                label={t(
                  source === "lead"
                    ? "laboratory.selectLead"
                    : "laboratory.selectPatient",
                )}
                disabled={saving}
              />
            </div>
          )}
          {source === "new" && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lab-first-name">
                  {t("laboratory.firstName")}
                </Label>
                <Input
                  id="lab-first-name"
                  required
                  maxLength={191}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lab-last-name">
                  {t("laboratory.lastName")}
                </Label>
                <Input
                  id="lab-last-name"
                  required
                  maxLength={191}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lab-phone">{t("laboratory.phone")}</Label>
                <Input
                  id="lab-phone"
                  type="tel"
                  required
                  maxLength={50}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </>
          )}
          {source !== "new" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="lab-existing-phone">
                {t("laboratory.phone")}
              </Label>
              <Input
                id="lab-existing-phone"
                type="tel"
                value={selected?.phone ?? ""}
                readOnly
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="lab-address">
              {t("laboratory.addressOptional")}
            </Label>
            <Input
              id="lab-address"
              maxLength={500}
              value={source === "new" ? address : (selected?.address ?? "")}
              readOnly={source !== "new"}
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t("laboratory.appointmentOptional")}</Label>
            <LabLookup
              resource="appointments"
              selected={appointment}
              phone={patientPhone}
              onSelect={setAppointment}
              label={t("laboratory.selectAppointment")}
              disabled={saving || !patientPhone}
            />
            {appointment && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setAppointment(null)}
              >
                {t("laboratory.clearAppointment")}
              </Button>
            )}
          </div>
        </div>
        {source === "lead" && (
          <p className="text-sm text-muted-foreground">
            {t("laboratory.leadConversionHint")}
          </p>
        )}
        <div className="flex flex-col gap-2">
          <Label>{t("laboratory.tests")}</Label>
          <LabLookup
            resource="tests"
            onSelect={(test) =>
              setTests((rows) =>
                rows.some((row) => row.id === test.id) ? rows : [...rows, test],
              )
            }
            label={t("laboratory.addTest")}
            disabled={saving}
          />
        </div>
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("laboratory.test")}</TableHead>
                <TableHead>{t("laboratory.price")}</TableHead>
                <TableHead>
                  <span className="sr-only">{t("laboratory.remove")}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody autoPaginate={false}>
              {tests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell>{choiceLabel(test)}</TableCell>
                  <TableCell>{test.price}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`${t("laboratory.remove")} ${test.name}`}
                      onClick={() =>
                        setTests((rows) =>
                          rows.filter((row) => row.id !== test.id),
                        )
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="lab-order-notes">{t("laboratory.notes")}</Label>
          <Textarea
            id="lab-order-notes"
            value={notes}
            maxLength={5000}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </fieldset>
      <Button
        permission="laboratory.orders.create"
        type="submit"
        disabled={
          saving ||
          initial.isLoading ||
          !tests.length ||
          (source !== "new" && !selected)
        }
      >
        <Plus className="size-4" />
        {t(saving ? "laboratory.saving" : "laboratory.createInvoiceTicket")}
      </Button>
    </form>
  );
}
