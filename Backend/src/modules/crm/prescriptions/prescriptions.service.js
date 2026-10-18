import { prescriptionsModel as model } from "./prescriptions.model.js";
import { prescriptionSchema } from "./prescriptions.schema.js";
import { getSettings } from "../../settings/settings.service.js";
import { pricePrescriptionItems } from "./prescriptions.pricing.js";
export const prescriptionsService = {
  list: (id) => model.list(id),
  catalog: () => model.catalog(),
  create: async (patientId, body, user) => {
    const input = prescriptionSchema.parse(body);
    const existing = await model.findByRequestId(input.requestId);
    if (existing) {
      if (existing.patientId !== patientId || existing.prescriberId !== user.id)
        throw Object.assign(
          new Error("Request already belongs to another prescription."),
          { status: 409 },
        );
      return existing;
    }
    const patient = await model.patient(patientId);
    const [products, finance] = await Promise.all([
      model.products([
        ...new Set(input.items.map((item) => item.productId).filter(Boolean)),
      ]),
      getSettings("finance"),
    ]);
    input.items = pricePrescriptionItems(
      input.items,
      products,
      finance.currency,
    );
    const record = await model.create({
      ...input,
      patientId,
      prescriberId: user.id,
      prescriberName: user.name,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientCode: patient.patientCode,
    });
    if (record.patientId !== patientId || record.prescriberId !== user.id)
      throw Object.assign(
        new Error("Request already belongs to another prescription."),
        { status: 409 },
      );
    return record;
  },
};
