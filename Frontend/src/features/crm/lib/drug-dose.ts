export type DrugDoseParameters = {
  doseMgKgDay: number | null;
  dosesPerDay: number | null;
  concentrationMg: number | null;
  concentrationMl: number | null;
};

export function calculateDose(weight: number, product: DrugDoseParameters) {
  const { doseMgKgDay, dosesPerDay, concentrationMg, concentrationMl } =
    product;
  if (
    ![weight, doseMgKgDay, dosesPerDay, concentrationMg, concentrationMl].every(
      (value) =>
        typeof value === "number" && Number.isFinite(value) && value > 0,
    ) ||
    !Number.isInteger(dosesPerDay) ||
    dosesPerDay! > 24
  )
    return null;
  const daily = weight * doseMgKgDay!;
  const perDose = daily / dosesPerDay!;
  const concentration = concentrationMg! / concentrationMl!;
  // mL/dose = (kg × mg/kg/day) / (doses/day × (mg / mL)).
  const ml =
    (weight * doseMgKgDay!) /
    (dosesPerDay! * (concentrationMg! / concentrationMl!));
  return [daily, perDose, concentration, ml].every(
    (value) => Number.isFinite(value) && value > 0,
  )
    ? { daily, perDose, concentration, ml }
    : null;
}
