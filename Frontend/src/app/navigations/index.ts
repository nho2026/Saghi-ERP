import {
  ArrowLeftRight,
  ArrowRightLeft,
  BadgeDollarSign,
  Barcode,
  BookOpenText,
  Boxes,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CalendarPlus,
  ChartLine,
  ChartNoAxesCombined,
  ContactRound,
  CreditCard,
  FileText,
  FlaskConical,
  Goal,
  HandCoins,
  HeartPulse,
  LayoutDashboard,
  Landmark,
  ListTodo,
  MessageCircle,
  Package,
  Radio,
  ReceiptText,
  ScrollText,
  Settings,
  ShieldCheck,
  Star,
  Stethoscope,
  Tags,
  TriangleAlert,
  UserCheck,
  UsersRound,
  Video,
  WalletCards,
  Warehouse,
  ShoppingCart,
} from "lucide-react";
import { warehousePages } from "@/features/inventory/warehouse-pages";

export const primaryNavigation = [
  {
    to: "/dashboard",
    label: "navigation.dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/meetings",
    label: "navigation.liveMeetings",
    icon: Video,
  },
  {
    to: "/targets",
    label: "navigation.targets",
    icon: Goal,
  },
];
export const taskNavigation = [
  {
    to: "/tasks/dashboard",
    label: "navigation.taskDashboard",
    icon: LayoutDashboard,
  },
  { to: "/tasks/review", label: "navigation.taskReview", icon: ListTodo },
  {
    to: "/tasks",
    label: "tasks.list",
    icon: ListTodo,
  },
  {
    to: "/tasks/reports",
    label: "tasks.report.title",
    icon: ChartNoAxesCombined,
  },
];
export const attendanceNavigation = [
  {
    to: "/attendance/devices",
    label: "attendancePage.devices",
    icon: Radio,
  },
  {
    to: "/attendance/users",
    label: "attendancePage.users",
    icon: UsersRound,
  },
  {
    to: "/attendance/events",
    label: "attendancePage.events",
    icon: CalendarClock,
  },
];
export const hrNavigation = [
  { to: "/hr", label: "navigation.hrDashboard", icon: LayoutDashboard },
  {
    to: "/employees",
    label: "navigation.employees",
    icon: UsersRound,
  },
  {
    to: "/positions",
    label: "navigation.positions",
    icon: BriefcaseBusiness,
  },
  {
    to: "/salaries",
    label: "navigation.salaries",
    icon: BadgeDollarSign,
  },
  {
    to: "/hr-attendance",
    label: "navigation.hrAttendance",
    icon: UserCheck,
  },
  {
    to: "/payrolls",
    label: "navigation.payrolls",
    icon: ContactRound,
  },
  {
    to: "/salary-advances",
    label: "navigation.salaryAdvances",
    icon: BadgeDollarSign,
  },
  {
    to: "/hr/warnings",
    label: "hrWarnings.title",
    icon: TriangleAlert,
  },
];
export const laboratoryNavigation = [
  {
    to: "/laboratory",
    label: "laboratory.dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/laboratory/reception",
    label: "laboratory.reception",
    icon: FlaskConical,
  },
  {
    to: "/laboratory/queue",
    label: "laboratory.queue",
    icon: FlaskConical,
  },
  {
    to: "/laboratory/tickets",
    label: "laboratory.accountingTickets",
    icon: CreditCard,
  },
  {
    to: "/laboratory/display",
    label: "laboratory.ticketDisplay",
    icon: LayoutDashboard,
  },
  {
    to: "/laboratory/accounting",
    label: "laboratory.accounting",
    icon: CreditCard,
  },
  {
    to: "/laboratory/room",
    label: "laboratory.room",
    icon: FlaskConical,
  },
  {
    to: "/laboratory/completed",
    label: "laboratory.completed",
    icon: FlaskConical,
  },
  {
    to: "/laboratory/received",
    label: "laboratory.received",
    icon: ContactRound,
  },
  {
    to: "/laboratory/tests",
    label: "laboratory.tests",
    icon: FlaskConical,
  },
];
export const icuNavigation = [
  { to: "/icu/dashboard", label: "icu.navDashboard", icon: LayoutDashboard },
  { to: "/icu/cases", label: "icu.navCases", icon: HeartPulse },
  { to: "/icu/staff", label: "icu.navStaff", icon: UsersRound },
  {
    to: "/icu/operation-types",
    label: "icu.navOperationTypes",
    icon: Stethoscope,
  },
  { to: "/icu/storage", label: "icu.navStorage", icon: Warehouse },
  {
    to: "/icu/item-reduction",
    label: "icu.navItemReduction",
    icon: Package,
  },
];
export const healthcareNavigation = [
  {
    to: "/departments",
    label: "navigation.departments",
    icon: Building2,
  },
  {
    to: "/health-staff",
    label: "navigation.healthStaff",
    icon: Stethoscope,
  },
  {
    to: "/feedback",
    label: "feedback.title",
    icon: Star,
  },
];
export const crmNavigation = [
  {
    to: "/crm",
    label: "navigation.crmDashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/crm/whatsapp",
    label: "navigation.crmWhatsapp",
    icon: MessageCircle,
  },
  {
    to: "/crm/leads",
    label: "navigation.crmLeads",
    icon: ContactRound,
  },
  {
    to: "/crm/leads/progress",
    label: "navigation.leadProgressOverview",
    icon: ChartLine,
  },
  {
    to: "/crm/patients",
    label: "navigation.crmPatients",
    icon: UsersRound,
  },
  {
    to: "/crm/appointments",
    label: "navigation.doctorAppointments",
    icon: CalendarPlus,
  },
  {
    to: "/crm/payments",
    label: "navigation.crmPayments",
    icon: CreditCard,
  },
  {
    to: "/crm/follow-up",
    label: "postDischargeFollowUp.title",
    icon: CalendarClock,
  },
  {
    to: "/crm/referrals",
    label: "navigation.crmReferrals",
    icon: ArrowRightLeft,
  },
  {
    to: "/crm/forms",
    label: "navigation.crmForms",
    icon: FileText,
  },
  {
    to: "/crm/today-patients",
    label: "todayPatients.title",
    icon: CalendarClock,
  },
  {
    to: "/crm/surgery-appointments",
    label: "navigation.surgeryAppointments",
    icon: CalendarClock,
  },
  {
    to: "/crm/surgeries",
    label: "navigation.surgeries",
    icon: HeartPulse,
  },
];
export const accountingNavigation = [
  {
    to: "/accounting",
    label: "navigation.accountantDashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/accounting/overview",
    label: "financeOverview.title",
    icon: ChartNoAxesCombined,
  },
  {
    to: "/accounting/income-expenses",
    label: "incomeExpenses.title",
    icon: WalletCards,
  },
  {
    to: "/accounting/accounts",
    label: "navigation.chartOfAccounts",
    icon: Landmark,
  },
  {
    to: "/accounting/journals",
    label: "navigation.journalEntries",
    icon: BookOpenText,
  },
  {
    to: "/accounting/customers",
    label: "navigation.customers",
    icon: UsersRound,
  },
  {
    to: "/accounting/invoices",
    label: "navigation.invoices",
    icon: ReceiptText,
  },
  {
    to: "/accounting/payments",
    label: "navigation.payments",
    icon: CreditCard,
  },
  {
    to: "/accounting/service-advances",
    label: "navigation.serviceAdvances",
    icon: BadgeDollarSign,
  },
  {
    to: "/accounting/reports",
    label: "navigation.financialReports",
    icon: ChartNoAxesCombined,
  },
];
export const warehouseDashboardNavigation = [
  {
    to: "/warehouses",
    label: "warehouseDashboard.navigation",
    icon: LayoutDashboard,
  },
];
export const buyNavigation = [
  {
    to: "/inventory/department-requests",
    label: "departmentRequest.title",
    icon: Building2,
  },
  {
    to: "/warehouses/buy/product",
    label: "warehouseModule.buyProduct",
    icon: ShoppingCart,
  },
  {
    to: "/warehouses/buy/debts",
    label: "warehouseModule.buyDebts",
    icon: HandCoins,
  },
  {
    to: "/warehouses/buy/order",
    label: "warehouseModule.order",
    icon: ListTodo,
  },
  {
    to: "/warehouses/buy/department-orders",
    label: "warehouseModule.departmentOrders",
    icon: Building2,
  },
];
export const productNavigation = [
  {
    to: "/inventory/products",
    label: "warehouseModule.addProduct",
    icon: Package,
  },
  {
    to: "/warehouses/product/special",
    label: "warehouseModule.addSpecialProduct",
    icon: Star,
  },
  {
    to: "/warehouses/product/transfer",
    label: "warehouseModule.transferProduct",
    icon: ArrowLeftRight,
  },
];
export const storageNavigation = [
  {
    to: "/inventory/stock",
    label: "warehouseModule.storage",
    icon: Boxes,
  },
  {
    to: "/warehouses/storage/special-price",
    label: "warehouseModule.editSpecialPrice",
    icon: Tags,
  },
  {
    to: "/inventory/warehouses",
    label: "warehouseModule.addStorage",
    icon: Warehouse,
  },
  {
    to: "/warehouses/storage/expire-soon",
    label: "warehouseModule.expireSoon",
    icon: CalendarClock,
  },
  {
    to: "/warehouses/storage/threshold",
    label: "warehouseModule.threshold",
    icon: TriangleAlert,
  },
];
export const warehouseExtraNavigation = warehousePages.map((page) => ({
  to: page.path,
  label: page.label,
  icon:
    page.section === "reports"
      ? ChartNoAxesCombined
      : page.section === "cases"
        ? HeartPulse
        : page.section === "utilities"
          ? Settings
          : page.label === "warehouseModule.productionCompanies"
            ? Building2
            : UsersRound,
}));
export const warehouseDirectoryNavigation = [
  ...warehouseExtraNavigation.filter((item) =>
    warehousePages.some((page) => page.path === item.to && !page.section),
  ),
  {
    to: "/inventory/categories",
    label: "warehouseModule.categories",
    icon: Tags,
  },
];
export const warehouseGroups = [
  {
    key: "cases",
    icon: HeartPulse,
  },
  {
    key: "utilities",
    icon: Settings,
  },
  {
    key: "reports",
    icon: ChartNoAxesCombined,
  },
] as const;
export const inventoryNavigation = [
  {
    to: "/inventory/brands",
    label: "navigation.productBrands",
    icon: Tags,
  },
  {
    to: "/inventory/barcodes",
    label: "navigation.barcodes",
    icon: Barcode,
  },
];
export const posNavigation = [
  {
    to: "/pos/checkout",
    label: "navigation.newSale",
    icon: ShoppingCart,
  },
  {
    to: "/pos/sales",
    label: "navigation.salesHistory",
    icon: ReceiptText,
  },
];
export const accessNavigation = [
  {
    to: "/users",
    label: "navigation.users",
    icon: UsersRound,
  },
  {
    to: "/roles",
    label: "navigation.roles",
    icon: ShieldCheck,
  },
  {
    to: "/system-logs",
    label: "navigation.systemLogs",
    icon: ScrollText,
  },
];

