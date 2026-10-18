import BuildingDashboardPage from "@/features/building-expenses/BuildingDashboardPage";
import BuildingExpensesPage from "@/features/building-expenses/BuildingExpensesPage";
import TaskReviewPage from "@/features/tasks/pages/TaskReviewPage";
import AccountantDashboardPage from "@/features/accounting/pages/AccountantDashboardPage";
import HrDashboardPage from "@/features/hr/pages/HrDashboardPage";
import LaboratoryTicketsPage from "@/features/laboratory/pages/LaboratoryTicketsPage";
import LaboratoryDashboardPage from "@/features/laboratory/pages/LaboratoryDashboardPage";
import LaboratoryPage from "@/features/laboratory/pages/LaboratoryPage";
import LaboratoryTestsPage from "@/features/laboratory/pages/LaboratoryTestsPage";
import { AlertSounds } from "@/shared/components/feedback/AlertSounds";
import TodayPatientsPage from "@/features/healthcare/pages/TodayPatientsPage";
import PatientProductsReportPage from "@/features/inventory/pages/PatientProductsReportPage";
import ItemReductionPage from "@/features/inventory/pages/ItemReductionPage";
import SurgeryBypassPage from "@/features/inventory/pages/SurgeryBypassPage";
import IcuPage from "@/features/inventory/pages/IcuPage";
import IcuModulePage from "@/features/icu/IcuModulePage";
import ThresholdPage from "@/features/inventory/pages/ThresholdPage";
import DirectoryPage from "@/features/inventory/pages/DirectoryPage";
import RetailersPage from "@/features/inventory/pages/RetailersPage";
import ExpireSoonPage from "@/features/inventory/pages/ExpireSoonPage";
import SpecialPricesPage from "@/features/inventory/pages/SpecialPricesPage";
import StoragePage from "@/features/inventory/pages/StoragePage";
import TransferProductPage from "@/features/inventory/pages/TransferProductPage";
import AddSpecialProductPage from "@/features/inventory/pages/AddSpecialProductPage";
import OrderPage from "@/features/inventory/pages/OrderPage";
import BuyDebtsPage from "@/features/inventory/pages/BuyDebtsPage";
import BuyProductPage from "@/features/inventory/pages/BuyProductPage";
import WarehouseDashboardPage from "@/features/inventory/pages/WarehouseDashboardPage";
import { warehousePages } from "@/features/inventory/warehouse-pages";
import TopProductsPage from "@/features/inventory/pages/TopProductsPage";

import DepartmentOrdersPage from "@/features/inventory/pages/DepartmentOrdersPage";
import SettingsPage from "@/features/settings/SettingsPage";
import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "@/app/layouts/DashboardLayout";
import LoginPage from "@/features/auth/pages/LoginPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import UsersPage from "@/features/access-control/pages/UsersPage";
import RolesPage from "@/features/access-control/pages/RolesPage";
import ProfilePage from "@/features/auth/pages/ProfilePage";
import AttendanceShell from "@/features/attendance/pages/AttendanceShell";
import DevicesPage from "@/features/attendance/pages/DevicesPage";
import DeviceUsersPage from "@/features/attendance/pages/DeviceUsersPage";
import EventsPage from "@/features/attendance/pages/EventsPage";
import HrPage from "@/features/hr/pages/HrPage";
import HrReportsPage from "@/features/hr/pages/HrReportsPage";
import HealthcarePage from "@/features/healthcare/pages/HealthcarePage";
import FinanceOverview from "@/features/accounting/pages/FinanceOverview";
import IncomeExpensesPage from "@/features/accounting/pages/IncomeExpensesPage";
import AccountingPage from "@/features/accounting/pages/AccountingPage";
import BillingPage from "@/features/accounting/pages/BillingPage";
import ServiceAdvancesPage from "@/features/accounting/pages/ServiceAdvancesPage";
import InventoryPage from "@/features/inventory/pages/InventoryPage";
import BarcodeLabelsPage from "@/features/inventory/pages/BarcodeLabelsPage";
import PosPage from "@/features/inventory/pages/PosPage";
import HealthPosPage from "@/features/inventory/pages/HealthPosPage";
import TasksPage from "@/features/tasks/pages/TasksPage";
import TaskReportsPage from "@/features/tasks/pages/TaskReportsPage";
import TaskDetailPage from "@/features/tasks/pages/TaskDetailPage";
import FeedbackPage from "@/features/feedback/pages/FeedbackPage";
import EmployeePortalPage from "@/features/employee-portal/pages/EmployeePortalPage";
import DepartmentRequestsPage from "@/features/employee-portal/pages/DepartmentRequestsPage";
import HrWarningsPage from "@/features/hr/pages/HrWarningsPage";
import HrAttendancePage from "@/features/hr/pages/HrAttendancePage";
import PayrollPage from "@/features/hr/pages/PayrollPage";
import TargetsPage from "@/features/targets/pages/TargetsPage";
import CrmPage from "@/features/crm/pages/CrmPage";
import CrmDashboardPage from "@/features/crm/pages/CrmDashboardPage";
import PatientPrescriptionsPage from "@/features/crm/pages/PatientPrescriptionsPage";
import FollowUpPatientsPage from "@/features/crm/pages/FollowUpPatientsPage";
import PatientProfilePage from "@/features/crm/pages/PatientProfilePage";
import CrmFormsPage from "@/features/crm/pages/CrmFormsPage";
import LeadProgressPage from "@/features/crm/pages/LeadProgressPage";
import LeadDetailPage from "@/features/crm/pages/LeadDetailPage";
import WhatsappPage from "@/features/crm/pages/WhatsappPage";
import SystemLogsPage from "@/features/system-logs/pages/SystemLogsPage";
import { SingleAlertToaster } from "@/shared/components/feedback/SingleAlertToaster";
import { DirectionProvider } from "@radix-ui/react-direction";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { RequireAccess } from "@/features/auth/RequireAccess";

const secured = (element: ReactNode) => (
  <RequireAccess>{element}</RequireAccess>
);

export default function App() {
  const { i18n } = useTranslation();
  const direction = i18n.resolvedLanguage?.startsWith("en") ? "ltr" : "rtl";
  return (
    <DirectionProvider dir={direction}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<DashboardLayout />}>
          <Route
            path="/icu"
            element={<Navigate to="/icu/dashboard" replace />}
          />
          <Route
            path="/icu/dashboard"
            element={secured(<IcuModulePage page="dashboard" />)}
          />
          <Route
            path="/icu/cases"
            element={secured(<IcuPage key="icu-module-cases" moduleMode />)}
          />
          <Route
            path="/icu/staff"
            element={secured(<IcuModulePage page="staff" />)}
          />
          <Route
            path="/icu/operation-types"
            element={secured(<IcuModulePage page="operation-types" />)}
          />
          <Route
            path="/icu/storage"
            element={secured(<IcuModulePage page="storage" />)}
          />
          <Route
            path="/icu/item-reduction"
            element={secured(<IcuModulePage page="item-reduction" />)}
          />
          <Route
            path="/building-expenses"
            element={secured(<BuildingDashboardPage />)}
          />
          <Route
            path="/building-expenses/products"
            element={secured(
              <BuildingExpensesPage key="products" page="products" />,
            )}
          />
          <Route
            path="/building-expenses/requests"
            element={secured(
              <BuildingExpensesPage key="requests" page="requests" />,
            )}
          />
          <Route
            path="/building-expenses/purchases"
            element={secured(
              <BuildingExpensesPage key="purchases" page="purchases" />,
            )}
          />
          <Route
            path="/building-expenses/sales"
            element={secured(<BuildingExpensesPage key="sales" page="sales" />)}
          />
          <Route
            path="/building-expenses/departments"
            element={secured(
              <BuildingExpensesPage key="departments" page="departments" />,
            )}
          />
          <Route
            path="/building-expenses/expenses"
            element={secured(
              <BuildingExpensesPage key="expenses" page="expenses" />,
            )}
          />
          <Route
            path="/laboratory/tickets"
            element={secured(<LaboratoryTicketsPage />)}
          />
          <Route
            path="/laboratory/display"
            element={secured(<LaboratoryTicketsPage display />)}
          />
          <Route
            path="/laboratory"
            element={secured(<LaboratoryDashboardPage />)}
          />
          <Route
            path="/laboratory/reception"
            element={secured(
              <LaboratoryPage key="lab-reception" mode="reception" />,
            )}
          />
          <Route
            path="/laboratory/accounting"
            element={secured(
              <LaboratoryPage key="lab-accounting" mode="accounting" />,
            )}
          />
          <Route
            path="/laboratory/room"
            element={secured(<LaboratoryPage key="lab-room" mode="room" />)}
          />
          <Route
            path="/laboratory/queue"
            element={secured(<LaboratoryPage key="lab-queue" mode="queue" />)}
          />
          <Route
            path="/laboratory/completed"
            element={secured(
              <LaboratoryPage key="lab-completed" mode="completed" />,
            )}
          />
          <Route
            path="/laboratory/received"
            element={secured(
              <LaboratoryPage key="lab-received" mode="received" />,
            )}
          />
          <Route
            path="/laboratory/tests"
            element={secured(<LaboratoryTestsPage />)}
          />
          <Route path="/dashboard" element={secured(<DashboardPage />)} />
          <Route path="/profile" element={secured(<ProfilePage />)} />
          <Route
            path="/inventory/department-requests"
            element={secured(<DepartmentRequestsPage />)}
          />
          <Route
            path="/employee-portal"
            element={secured(<EmployeePortalPage />)}
          />
          <Route path="/tasks/review" element={secured(<TaskReviewPage />)} />
          <Route path="/tasks/dashboard" element={secured(<TasksPage />)} />
          <Route path="/tasks" element={secured(<TasksPage />)} />
          <Route path="/meetings" element={secured(null)} />
          <Route path="/targets" element={secured(<TargetsPage />)} />
          <Route path="/tasks/:id" element={secured(<TaskDetailPage />)} />
          <Route path="/tasks/reports" element={secured(<TaskReportsPage />)} />
          <Route path="/feedback" element={secured(<FeedbackPage />)} />
          <Route path="/users" element={secured(<UsersPage />)} />
          <Route path="/roles" element={secured(<RolesPage />)} />
          <Route path="/system-logs" element={secured(<SystemLogsPage />)} />
          <Route path="/hr" element={secured(<HrDashboardPage />)} />
          <Route
            path="/employees"
            element={secured(<HrPage resource="employees" />)}
          />
          <Route
            path="/positions"
            element={secured(<HrPage resource="positions" />)}
          />
          <Route
            path="/salaries"
            element={secured(<HrPage resource="salaries" />)}
          />
          <Route
            path="/hr-attendance"
            element={secured(<HrAttendancePage />)}
          />
          <Route path="/payrolls" element={secured(<PayrollPage />)} />
          <Route path="/hr/reports" element={secured(<HrReportsPage />)} />
          <Route path="/hr/warnings" element={secured(<HrWarningsPage />)} />
          <Route
            path="/salary-advances"
            element={secured(<HrPage resource="advances" />)}
          />
          <Route
            path="/departments"
            element={secured(<HealthcarePage resource="departments" />)}
          />
          <Route path="/settings" element={secured(<SettingsPage />)} />
          <Route
            path="/health-staff"
            element={secured(<HealthcarePage resource="staff" />)}
          />
          <Route
            path="/appointments"
            element={<Navigate to="/crm/appointments" replace />}
          />
          <Route path="/crm" element={secured(<CrmDashboardPage />)} />
          <Route
            path="/crm/leads"
            element={secured(<CrmPage resource="leads" />)}
          />
          <Route path="/crm/whatsapp" element={secured(<WhatsappPage />)} />
          <Route
            path="/crm/leads/progress"
            element={secured(<LeadProgressPage />)}
          />
          <Route path="/crm/leads/:id" element={secured(<LeadDetailPage />)} />
          <Route
            path="/crm/follow-up"
            element={secured(<FollowUpPatientsPage />)}
          />
          <Route
            path="/crm/patients"
            element={secured(<CrmPage resource="patients" />)}
          />
          <Route
            path="/crm/patients/:id/medications"
            element={secured(<PatientPrescriptionsPage />)}
          />
          <Route
            path="/crm/patients/:id"
            element={secured(<PatientProfilePage />)}
          />
          <Route
            path="/crm/referrals"
            element={secured(<CrmPage resource="referrals" />)}
          />
          <Route path="/crm/forms" element={secured(<CrmFormsPage />)} />
          <Route
            path="/crm/today-patients"
            element={secured(<TodayPatientsPage />)}
          />
          <Route
            path="/crm/appointments"
            element={secured(<HealthcarePage resource="appointments" />)}
          />
          <Route
            path="/crm/surgery-appointments"
            element={secured(<CrmPage resource="surgery-appointments" />)}
          />
          <Route
            path="/crm/payments"
            element={secured(<CrmPage resource="payments" />)}
          />
          <Route
            path="/crm/surgeries"
            element={secured(<CrmPage resource="surgeries" />)}
          />
          <Route
            path="/accounting"
            element={secured(<AccountantDashboardPage />)}
          />
          <Route
            path="/accounting/overview"
            element={secured(<FinanceOverview />)}
          />
          <Route
            path="/accounting/income-expenses"
            element={secured(<IncomeExpensesPage />)}
          />
          <Route
            path="/accounting/accounts"
            element={secured(<AccountingPage resource="accounts" />)}
          />
          <Route
            path="/accounting/journals"
            element={secured(<AccountingPage resource="journals" />)}
          />
          <Route
            path="/accounting/customers"
            element={secured(<BillingPage resource="customers" />)}
          />
          <Route
            path="/accounting/invoices"
            element={secured(<BillingPage resource="invoices" />)}
          />
          <Route
            path="/accounting/payments"
            element={secured(<BillingPage resource="payments" />)}
          />
          <Route
            path="/accounting/service-advances"
            element={secured(<ServiceAdvancesPage />)}
          />
          <Route
            path="/accounting/reports"
            element={secured(<AccountingPage resource="reports" />)}
          />
          <Route
            path="/warehouses/buy/product"
            element={secured(<BuyProductPage />)}
          />
          <Route
            path="/warehouses/buy/debts"
            element={secured(<BuyDebtsPage />)}
          />
          <Route
            path="/warehouses/buy/order"
            element={secured(<OrderPage />)}
          />
          <Route
            path="/warehouses/buy/department-orders"
            element={secured(<DepartmentOrdersPage />)}
          />
          <Route
            path="/warehouses/product/special"
            element={secured(<AddSpecialProductPage />)}
          />
          <Route
            path="/warehouses/product/transfer"
            element={secured(<TransferProductPage />)}
          />
          <Route
            path="/warehouses/storage/special-price"
            element={secured(<SpecialPricesPage />)}
          />
          <Route
            path="/warehouses/storage/expire-soon"
            element={secured(<ExpireSoonPage />)}
          />
          <Route
            path="/warehouses/storage/threshold"
            element={secured(<ThresholdPage />)}
          />
          <Route
            path="/warehouses"
            element={secured(<WarehouseDashboardPage />)}
          />
          {warehousePages.map((page) => (
            <Route
              key={page.path}
              path={page.path}
              element={secured(
                page.path === "/warehouses/cases/surgery-bypass" ? (
                  <SurgeryBypassPage />
                ) : page.path === "/warehouses/cases/icu" ? (
                  <IcuPage key="icu" />
                ) : page.path === "/warehouses/cases/picu" ? (
                  <IcuPage key="picu" unit="picu" />
                ) : page.path === "/warehouses/cases/cardiac-surgery" ? (
                  <IcuPage key="cardiac-surgery" unit="cardiac-surgery" />
                ) : page.path === "/warehouses/cases/cardiology" ? (
                  <IcuPage key="cardiology" unit="cardiology" />
                ) : page.path === "/warehouses/cases/cardiac-sw" ? (
                  <IcuPage key="cardiac-sw" unit="cardiac-sw" />
                ) : page.path === "/warehouses/retailers" ? (
                  <RetailersPage />
                ) : page.path === "/warehouses/production-companies" ? (
                  <DirectoryPage
                    key="companies"
                    resource="production-companies"
                  />
                ) : page.path === "/warehouses/customers" ? (
                  <DirectoryPage key="customers" resource="customers" />
                ) : page.section === "utilities" ? (
                  <ItemReductionPage />
                ) : page.path === "/warehouses/reports/products-per-patient" ? (
                  <PatientProductsReportPage />
                ) : (
                  <TopProductsPage />
                ),
              )}
            />
          ))}
          <Route
            path="/inventory/products"
            element={secured(<InventoryPage resource="products" />)}
          />
          <Route
            path="/inventory/barcodes"
            element={secured(<BarcodeLabelsPage />)}
          />
          <Route
            path="/inventory/categories"
            element={secured(<InventoryPage resource="categories" />)}
          />
          <Route
            path="/inventory/brands"
            element={secured(<InventoryPage resource="brands" />)}
          />
          <Route
            path="/inventory/warehouses"
            element={secured(<InventoryPage resource="warehouses" />)}
          />
          <Route path="/inventory/stock" element={secured(<StoragePage />)} />
          <Route
            path="/inventory/movements"
            element={<Navigate to="/inventory/stock" replace />}
          />
          <Route
            path="/pos/sales"
            element={secured(<PosPage mode="sales" />)}
          />
          <Route path="/attendance" element={secured(<AttendanceShell />)}>
            <Route index element={<Navigate to="devices" replace />} />
            <Route path="devices" element={secured(<DevicesPage />)} />
            <Route path="users" element={secured(<DeviceUsersPage />)} />
            <Route path="events" element={secured(<EventsPage />)} />
          </Route>
        </Route>
        <Route path="/pos/checkout" element={secured(<HealthPosPage />)} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <AlertSounds />
      <SingleAlertToaster
        dir={direction}
        richColors
        position="top-center"
        closeButton
      />
    </DirectionProvider>
  );
}
