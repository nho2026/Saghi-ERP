import { createPatient } from "../patient/patient-code.js";
import { prisma } from "../../../shared/database/client.js";

const select = {
  id: true,
  code: true,
  name: true,
  phone: true,
  secondaryPhone: true,
  source: true,
  age: true,
  dateOfBirth: true,
  gender: true,
  maritalStatus: true,
  preferredLanguage: true,
  address: true,
  country: true,
  city: true,
  email: true,
  leadSourceChannel: true,
  contactMethod: true,
  patientType: true,
  referralPersona: true,
  referralName: true,
  referralPhone: true,
  referralAddress: true,
  referralNote: true,
  interest: true,
  competitorsNote: true,
  notes: true,
  satisfactionScore: true,
  knowledgeRating: true,
  budgetRange: true,
  decisionInfluencers: true,
  painPoints: true,
  status: true,
  convertedPatient: true,
  statusHistory: { orderBy: { createdAt: "desc" } },
  attachments: { orderBy: { createdAt: "desc" } },
  createdAt: true,
  updatedAt: true,
};

export const leadModel = {
  counts: (where = {}) =>
    prisma.crmLead.groupBy({ where, by: ["status"], _count: { _all: true } }),
  findAll: (skip, take, where) =>
    Promise.all([
      prisma.crmLead.findMany({
        select,
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.crmLead.count({ where }),
    ]),
  findById: (id) => prisma.crmLead.findUniqueOrThrow({ where: { id }, select }),
  create: (data) =>
    prisma.$transaction(async (tx) => {
      const lead = await tx.crmLead.create({ data });
      await tx.crmLeadStatusHistory.create({
        data: { leadId: lead.id, toStatus: lead.status },
      });
      return tx.crmLead.findUniqueOrThrow({ where: { id: lead.id }, select });
    }),
  update: (id, data) =>
    prisma.$transaction(async (tx) => {
      const current = await tx.crmLead.findUniqueOrThrow({ where: { id } });
      await tx.crmLead.update({ where: { id }, data });
      if (data.status && data.status !== current.status) {
        await tx.crmLeadStatusHistory.create({
          data: {
            leadId: id,
            fromStatus: current.status,
            toStatus: data.status,
          },
        });
      }
      return tx.crmLead.findUniqueOrThrow({ where: { id }, select });
    }),
  remove: (id) => prisma.crmLead.delete({ where: { id } }),
  addAttachments: (leadId, attachments) =>
    prisma.$transaction(async (tx) => {
      await tx.crmLead.findUniqueOrThrow({ where: { id: leadId } });
      await tx.crmLeadAttachment.createMany({
        data: attachments.map((attachment) => ({ leadId, ...attachment })),
      });
      return tx.crmLead.findUniqueOrThrow({ where: { id: leadId }, select });
    }),
  findAttachment: (id) =>
    prisma.crmLeadAttachment.findUniqueOrThrow({ where: { id } }),
  removeAttachment: (id) => prisma.crmLeadAttachment.delete({ where: { id } }),
  convert: (lead, data) =>
    prisma.$transaction(async (tx) => {
      const parts = lead.name.trim().split(/\s+/);
      const firstName = parts.shift() || lead.name;
      const lastName = parts.join(" ") || "Patient";
      const patient = await createPatient(tx, {
        firstName,
        lastName,
        phone: lead.phone,
        email: lead.email,
        dateOfBirth: lead.age
          ? new Date(Date.UTC(new Date().getUTCFullYear() - lead.age, 0, 1))
          : null,
        gender: lead.gender,
        address: lead.address,
        medicalNotes: lead.notes
          ? `Converted from CRM lead. ${lead.notes}`
          : "Converted from CRM lead.",
        status: "active",
      });
      const updated = await tx.crmLead.update({
        where: { id: lead.id },
        data: { ...data, convertedPatientId: patient.id },
      });
      if (lead.status !== "converted") {
        await tx.crmLeadStatusHistory.create({
          data: {
            leadId: lead.id,
            fromStatus: lead.status,
            toStatus: "converted",
          },
        });
      }
      return tx.crmLead.findUniqueOrThrow({
        where: { id: updated.id },
        select,
      });
    }),
};
