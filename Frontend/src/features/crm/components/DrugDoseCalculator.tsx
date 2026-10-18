import { calculateDose } from "../lib/drug-dose";
export { calculateDose } from "../lib/drug-dose";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";

export type DrugProduct = {
  id: string;
  name: string;
  sku: string;
  size: string | null;
  sellingPrice: number;
  unit: string;
  doseMgKgDay: number | null;
  dosesPerDay: number | null;
  concentrationMg: number | null;
  concentrationMl: number | null;
};
export default function DrugDoseCalculator({
  product,
  patientWeightKg,
  onApply,
}: {
  product: DrugProduct;
  patientWeightKg?: number | null;
  onApply: (dosage: string, frequency: string) => void;
}) {
  const { t } = useTranslation();
  const [weight, setWeight] = useState(
    patientWeightKg != null &&
      Number.isFinite(patientWeightKg) &&
      patientWeightKg > 0
      ? String(patientWeightKg)
      : "",
  );
  const result = calculateDose(Number(weight), product);
  const fmt = (value: number) => Number(value.toPrecision(6)).toString();
  return (
    <div className="space-y-2 rounded-lg border p-3">
      <p className="font-semibold">{t("drugDose.title")}</p>
      <p dir="ltr" className="text-xs text-muted-foreground">
        mL/dose = (kg × mg/kg/day) ÷ [doses/day × (mg ÷ mL)]
      </p>
      <Label className="grid gap-1">
        {t("drugDose.weight")}
        <Input
          type="number"
          min="0"
          step="any"
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
        />
      </Label>
      {calculateDose(1, product) ? (
        <>
          <p dir="ltr">
            {product.doseMgKgDay} mg/kg/day · {product.dosesPerDay} doses/day ·{" "}
            {product.concentrationMg} mg/{product.concentrationMl} mL
          </p>
          {result && (
            <div aria-live="polite" dir="ltr">
              <p className="text-xs">
                ({weight} × {product.doseMgKgDay}) ÷ [{product.dosesPerDay} × (
                {product.concentrationMg} ÷ {product.concentrationMl})] ={" "}
                {fmt(result.ml)} mL/dose
              </p>
              <p className="text-lg font-semibold">{fmt(result.ml)} mL/dose</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {t("drugDose.review")}
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={!result}
            onClick={() =>
              result &&
              onApply(
                `${fmt(result.ml)} mL/dose`,
                `${product.dosesPerDay} doses/day`,
              )
            }
          >
            {t("drugDose.apply")}
          </Button>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">{t("drugDose.missing")}</p>
      )}
    </div>
  );
}
