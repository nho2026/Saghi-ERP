// Exercises the real database workflow and rolls every verification record back.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile, unlink } from "node:fs/promises";
import {
  addAttachment,
  getAttachment,
} from "../src/modules/laboratory/laboratory.attachments.js";
import { prisma } from "../src/shared/database/client.js";
import {
  createLaboratoryOrder,
  advanceLaboratoryOrder,
  recordLaboratoryPayment,
} from "../src/modules/laboratory/laboratory.service.js";
import { createBillingPayment } from "../src/modules/accounting/billing/billing.model.js";
import { getSettings } from "../src/modules/settings/settings.service.js";

const rollback = new Error("LABORATORY_VERIFICATION_ROLLBACK");
try {
  await prisma.$transaction(
    async (tx) => {
      const db = {
        $transaction: (run) => run(tx),
        laboratoryOrder: tx.laboratoryOrder,
      };
      const finance = await getSettings("finance", tx);
      const system = await getSettings("system", tx);
      const policy = { ...finance, timezone: system.timezone };
      const code = `VERIFY-${randomUUID()}`;
      const labTest = await tx.laboratoryTest.create({
        data: {
          code,
          name: "Verification test",
          specimen: "Verification sample",
          price: 100,
        },
      });
      const input = {
        requestId: randomUUID(),
        patient: {
          firstName: "Verification",
          lastName: "Patient",
          phone: "VERIFY-PHONE",
        },
        testIds: [labTest.id],
        notes: "Verification only",
      };
      const order = await createLaboratoryOrder(
        db,
        input,
        "Verification",
        policy,
      );
      assert.equal(order.status, "awaiting_payment");
      assert.equal(order.invoice.totalAmount, 100);
      assert.ok(order.patient.patientCode.startsWith("PAT-"));
      assert.equal(
        (await createLaboratoryOrder(db, input, "Verification", policy)).id,
        order.id,
      );
      await assert.rejects(
        advanceLaboratoryOrder(db, order.id, "collecting", "Verification"),
        { status: 409 },
      );
      await createBillingPayment(
        tx,
        {
          invoiceId: order.invoiceId,
          amount: 40,
          method: finance.paymentMethods[0],
        },
        () => {},
      );
      assert.equal(
        (
          await tx.laboratoryOrder.findUniqueOrThrow({
            where: { id: order.id },
          })
        ).status,
        "awaiting_payment",
      );
      await createBillingPayment(
        tx,
        {
          invoiceId: order.invoiceId,
          amount: 60,
          method: finance.paymentMethods[0],
        },
        () => {},
      );
      const paymentInput = {
        requestId: randomUUID(),
        amount: 10,
        method: finance.paymentMethods[0],
      };
      const extra = await createLaboratoryOrder(
        db,
        {
          requestId: randomUUID(),
          patientId: order.patientId,
          testIds: [labTest.id],
          notes: "Verification",
        },
        "Verification",
        policy,
      );
      await recordLaboratoryPayment(db, extra.id, paymentInput, finance);
      await recordLaboratoryPayment(db, extra.id, paymentInput, finance);
      assert.equal(
        (
          await tx.billingInvoice.findUniqueOrThrow({
            where: { id: extra.invoiceId },
          })
        ).paidAmount,
        10,
      );
      await advanceLaboratoryOrder(db, order.id, "collecting", "Verification");
      await advanceLaboratoryOrder(db, order.id, "processing", "Verification");
      await assert.rejects(
        advanceLaboratoryOrder(db, order.id, "completed", "Verification"),
        /every test/,
      );
      await tx.laboratoryOrderItem.updateMany({
        where: { orderId: order.id },
        data: { result: "Verification result" },
      });
      assert.equal(
        (
          await advanceLaboratoryOrder(
            db,
            order.id,
            "completed",
            "Verification",
          )
        ).status,
        "completed",
      );
      const pdf = Buffer.from("%PDF-1.7\nVerification only");
      await addAttachment(
        order.id,
        { buffer: pdf, originalname: "verification.pdf", size: pdf.length },
        "Verification",
        db,
      );
      const attached = await tx.laboratoryOrder.findUnique({
        where: { id: order.id },
      });
      const file = await getAttachment(
        order.id,
        attached.attachments[0].id,
        db,
      );
      try {
        assert.equal(file.mime, "application/pdf");
        assert.equal(file.name, "verification.pdf");
        assert.deepEqual(await readFile(file.path), pdf);
        await assert.rejects(
          getAttachment("missing-order", file.id, db),
          /Attachment not found/,
        );
      } finally {
        await unlink(file.path);
      }
      assert.equal(
        (await advanceLaboratoryOrder(db, order.id, "received", "Verification"))
          .status,
        "received",
      );
      assert.equal(
        (await advanceLaboratoryOrder(db, order.id, "called", "Verification"))
          .contactedByName,
        "Verification",
      );
      assert.equal(
        (
          await advanceLaboratoryOrder(
            db,
            order.id,
            "delivered",
            "Verification",
          )
        ).status,
        "delivered",
      );
      const appointment = await tx.appointment.create({
        data: {
          patientName: "Verification Patient",
          patientPhone: "VERIFY-PHONE",
          scheduledAt: new Date(),
        },
      });
      const linked = await createLaboratoryOrder(
        db,
        {
          requestId: randomUUID(),
          patientId: order.patientId,
          appointmentId: appointment.id,
          testIds: [labTest.id],
          notes: "Verification",
        },
        "Verification",
        policy,
      );
      assert.equal(linked.appointment.id, appointment.id);
      assert.equal(linked.queueNumber, order.queueNumber + 2);
      const lead = await tx.crmLead.create({
        data: {
          code: `VERIFY-${randomUUID()}`,
          name: "Verification Lead",
          phone: "VERIFY-LEAD",
        },
      });
      const fromLead = await createLaboratoryOrder(
        db,
        {
          requestId: randomUUID(),
          leadId: lead.id,
          testIds: [labTest.id],
          notes: "Verification",
        },
        "Verification",
        policy,
      );
      assert.equal(
        (await tx.crmLead.findUniqueOrThrow({ where: { id: lead.id } }))
          .convertedPatientId,
        fromLead.patientId,
      );
      const reuse = await createLaboratoryOrder(
        db,
        {
          requestId: randomUUID(),
          leadId: lead.id,
          testIds: [labTest.id],
          notes: "Verification",
        },
        "Verification",
        policy,
      );
      assert.equal(reuse.patientId, fromLead.patientId);
      throw rollback;
    },
    { timeout: 30000 },
  );
} catch (error) {
  if (error === rollback)
    console.log(
      "Verified laboratory reception, invoices, queue numbers, payments, results, appointments and lead conversion. All verification records rolled back.",
    );
  else {
    console.error(error.message);
    process.exitCode = 1;
  }
} finally {
  await prisma.$disconnect();
}
