import { prisma } from "../../../shared/database/client.js";
export const patientProductsModel = {
  listCases: () =>
    prisma.inventoryIcuCase.findMany({
      select: {
        id: true,
        patientId: true,
        patientName: true,
        unit: true,
        entry: true,
        items: true,
        patient: { select: { patientCode: true } },
      },
      orderBy: [{ entry: "desc" }, { id: "desc" }],
    }),
};
