import { captureWhatsappBody } from "./modules/crm/whatsapp/whatsapp.ai.js";
import { laboratoryChangeMiddleware } from "./modules/laboratory/laboratory.realtime.js";
import laboratoryRoutes from "./modules/laboratory/laboratory.routes.js";
import icuRoutes from "./modules/icu/icu.routes.js";
import settingsRoutes from "./modules/settings/settings.routes.js";
import express from "express";
import buildingExpenseRoutes from "./modules/building-expenses/building.routes.js";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "node:path";
import { env } from "./config/environment.js";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/access-control/users/users.routes.js";
import roleRoutes from "./modules/access-control/roles/roles.routes.js";
import permissionRoutes from "./modules/access-control/roles/permissions.routes.js";
import attendanceRoutes from "./modules/attendance/attendance.routes.js";
import employeeRoutes from "./modules/hr/hr.routes.js";
import healthcareRoutes from "./modules/healthcare/healthcare.routes.js";
import publicRoutes from "./modules/healthcare/public.routes.js";
import accountingRoutes from "./modules/accounting/accounting/accounting.routes.js";
import billingRoutes from "./modules/accounting/billing/billing.routes.js";
import advancesRoutes from "./modules/accounting/advances/advances.routes.js";
import cashFlowRoutes from "./modules/accounting/cash-flow/cash-flow.routes.js";
import { requireAuth } from "./shared/middleware/auth.middleware.js";
import inventoryRoutes from "./modules/inventory/inventory.routes.js";
import posRoutes from "./modules/pos/pos.routes.js";
import taskRoutes from "./modules/task-management/task-management.routes.js";
import feedbackRoutes from "./modules/feedback/feedback.routes.js";
import publicFeedbackRoutes from "./modules/feedback/public-feedback.routes.js";
import notificationRoutes from "./modules/notifications/notifications.routes.js";
import employeePortalRoutes from "./modules/employee-portal/employee-portal.routes.js";
import meetingRoutes from "./modules/meetings/meetings.routes.js";
import targetRoutes from "./modules/targets/targets.routes.js";
import crmRoutes from "./modules/crm/crm.routes.js";
import whatsappRoutes from "./modules/crm/whatsapp/whatsapp.routes.js";
import systemLogRoutes from "./modules/system-logs/system-logs.routes.js";
import { requestLog } from "./shared/middleware/request-log.middleware.js";
import { auditApiRequest } from "./shared/middleware/audit-log.middleware.js";
import { errorHandler } from "./shared/errors/error.middleware.js";

export const app = express();

app.use(requestLog);
app.use(helmet());
const allowedOrigins = new Set([
  env.frontendUrl,
  ...env.publicWebsiteUrls,
  "http://127.0.0.1:3000",
  "http://localhost:3000",
]);
app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        !env.production ||
        allowedOrigins.has(origin) ||
        env.publicWebsiteUrls.includes(origin)
      )
        return callback(null, true);
      callback(new Error("Origin is not allowed by CORS."));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "12mb", verify: captureWhatsappBody }));
app.use(cookieParser());
app.use(auditApiRequest);
app.use(
  "/public",
  express.static(path.resolve(process.cwd(), "public"), {
    maxAge: env.production ? "7d" : 0,
  }),
);
app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() }),
);
app.use("/api/settings", settingsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/laboratory", laboratoryChangeMiddleware, laboratoryRoutes);
app.use("/api/icu", icuRoutes);
app.use("/api/healthcare", healthcareRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/accounting", accountingRoutes);
app.use("/api/billing", laboratoryChangeMiddleware, billingRoutes);
app.use("/api/advances", advancesRoutes);
// Accounting retains the cash-flow API path for existing clients.
app.use("/api/finance/cash-flow", requireAuth, cashFlowRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/building-expenses", buildingExpenseRoutes);
app.use("/api/pos", posRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/public/feedback", publicFeedbackRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/employee-portal", employeePortalRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/targets", targetRoutes);
app.use("/api/crm/whatsapp", whatsappRoutes);
app.use("/api/crm", crmRoutes);
app.use("/api/system-logs", systemLogRoutes);
app.use((_req, res) => res.status(404).json({ message: "Route not found." }));
app.use(errorHandler);
