export function nextPatientNumber(rows) {
  return (
    rows.reduce((max, { patientCode }) => {
      if (!/^PAT-[0-9]+$/.test(patientCode)) return max;
      const number = BigInt(patientCode.slice(4));
      return number > max ? number : max;
    }, 0n) + 1n
  );
}
export async function createPatient(db, data) {
  let next = nextPatientNumber(
    await db.patient.findMany({ select: { patientCode: true } }),
  );
  for (let attempt = 0; attempt < 10; attempt++, next++) {
    try {
      return await db.patient.create({
        data: { ...data, patientCode: `PAT-${next}` },
      });
    } catch (error) {
      if (
        error.code !== "P2002" ||
        !String(error.meta?.target ?? "").includes("patientCode")
      )
        throw error;
    }
  }
  throw Object.assign(
    new Error("Unable to allocate a patient code. Please retry."),
    { status: 409 },
  );
}
