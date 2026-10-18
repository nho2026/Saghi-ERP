import {
  LayoutDashboard,
  Package,
  ClipboardList,
  ShoppingCart,
  ReceiptText,
  Building2,
  WalletCards,
} from "lucide-react";

export const buildingNavigation = [
  {
    to: "/building-expenses",
    label: "buildingExpenses.navigation.dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/building-expenses/products",
    label: "buildingExpenses.navigation.products",
    icon: Package,
  },
  {
    to: "/building-expenses/requests",
    label: "buildingExpenses.navigation.requests",
    icon: ClipboardList,
  },
  {
    to: "/building-expenses/purchases",
    label: "buildingExpenses.navigation.purchases",
    icon: ShoppingCart,
  },
  {
    to: "/building-expenses/sales",
    label: "buildingExpenses.navigation.sales",
    icon: ReceiptText,
  },
  {
    to: "/building-expenses/departments",
    label: "buildingExpenses.navigation.departmentProducts",
    icon: Building2,
  },
  {
    to: "/building-expenses/expenses",
    label: "buildingExpenses.navigation.expenses",
    icon: WalletCards,
  },
];
