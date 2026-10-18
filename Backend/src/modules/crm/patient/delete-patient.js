const relations = {
  laboratoryOrders: "laboratory orders",
  prescriptions: "prescriptions",
  icuCases: "ICU cases",
  surgeryAppointments: "surgery appointments",
  payments: "payments",
};
const conflict = (details) =>
  Object.assign(
    new Error(
      `This patient cannot be deleted because they have ${details || "linked records"}. Mark the patient inactive instead.`,
    ),
    { status: 409 },
  );

export async function deletePatient(db, id) {
  const patient = await db.patient.findUnique({
    where: { id },
    select: {
      _count: {
        select: Object.fromEntries(
          Object.keys(relations).map((key) => [key, true]),
        ),
      },
    },
  });
  if (!patient)
    throw Object.assign(new Error("Patient not found."), { status: 404 });
  const linked = Object.entries(relations)
    .filter(([key]) => patient._count[key] > 0)
    .map(([key, label]) => `${patient._count[key]} ${label}`);
  if (linked.length) throw conflict(linked.join(", "));
  try {
    return await db.patient.delete({ where: { id } });
  } catch (error) {
    // A related record may have been created after the preflight check.
    if (error.code === "P2003") throw conflict();
    throw error;
  }
}
