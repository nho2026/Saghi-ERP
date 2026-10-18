export const bookWithProgress = (db, patientId, status, create) =>
  db.$transaction(async (tx) => {
    const appointment = await create(tx);
    await tx.patient.update({ where: { id: patientId }, data: { status } });
    return appointment;
  });
