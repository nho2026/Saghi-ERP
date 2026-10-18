import { prisma } from "../src/shared/database/client.js";

// Initial catalog price: 10,000 IQD per test, supplied by the laboratory.
// Stable codes make reruns safe without overwriting manually maintained tests.
const catalog = [
  ["CBC", "Complete Blood Count (CBC)"],
  ["ESR", "Erythrocyte Sedimentation Rate (ESR)"],
  ["CRP", "C-Reactive Protein (CRP)"],
  ["ABO-RH", "Blood Group and Rh Type"],
  ["FBS", "Fasting Blood Glucose"],
  ["RBS", "Random Blood Glucose"],
  ["HBA1C", "Hemoglobin A1c (HbA1c)"],
  ["UREA", "Blood Urea"],
  ["CREAT", "Serum Creatinine"],
  ["URIC", "Uric Acid"],
  ["ALT", "Alanine Aminotransferase (ALT)"],
  ["AST", "Aspartate Aminotransferase (AST)"],
  ["ALP", "Alkaline Phosphatase (ALP)"],
  ["GGT", "Gamma-Glutamyl Transferase (GGT)"],
  ["BILI-T", "Total Bilirubin"],
  ["BILI-D", "Direct Bilirubin"],
  ["ALBUMIN", "Serum Albumin"],
  ["PROTEIN", "Total Protein"],
  ["CHOL", "Total Cholesterol"],
  ["TRIG", "Triglycerides"],
  ["HDL", "HDL Cholesterol"],
  ["LDL", "LDL Cholesterol"],
  ["NA", "Sodium"],
  ["K", "Potassium"],
  ["CA", "Calcium"],
  ["MG", "Magnesium"],
  ["PHOS", "Phosphate"],
  ["TSH", "Thyroid-Stimulating Hormone (TSH)"],
  ["FT4", "Free Thyroxine (Free T4)"],
  ["FT3", "Free Triiodothyronine (Free T3)"],
  ["FERRITIN", "Ferritin"],
  ["IRON", "Serum Iron"],
  ["B12", "Vitamin B12"],
  ["VITD", "25-Hydroxy Vitamin D"],
  ["HCG", "Beta-hCG"],
  ["PT-INR", "Prothrombin Time (PT/INR)"],
  ["APTT", "Activated Partial Thromboplastin Time (aPTT)"],
  ["URINALYSIS", "Urinalysis"],
  ["STOOL", "Stool Examination"],
  ["URINE-CULT", "Urine Culture"],
];

try {
  const dryRun = process.argv.includes("--dry-run");
  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.laboratoryTest.findMany({
      select: { code: true, name: true },
    });
    const codes = new Set(existing.map((test) => test.code.toUpperCase()));
    const names = new Set(existing.map((test) => test.name.trim().toLowerCase()));
    const data = catalog
      .map(([suffix, name]) => ({
        code: `LAB-${suffix}`,
        name,
        price: 10000,
        status: "active",
        specimen: "",
      }))
      .filter((test) => !codes.has(test.code) && !names.has(test.name.toLowerCase()));
    const inserted = dryRun ? 0 : (await tx.laboratoryTest.createMany({ data, skipDuplicates: true })).count;
    return { catalog: catalog.length, existing: existing.length, pending: data.length, inserted, dryRun };
  });
  console.log(JSON.stringify(result, null, 2));
  console.log("New tests have price 10,000 IQD and status Active. Existing tests were preserved.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
