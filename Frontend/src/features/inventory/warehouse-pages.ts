export const warehousePages = [
  {
    path: "/warehouses/retailers",
    label: "warehouseModule.retailers",
    section: null,
  },
  {
    path: "/warehouses/production-companies",
    label: "warehouseModule.productionCompanies",
    section: null,
  },
  {
    path: "/warehouses/customers",
    label: "warehouseModule.customers",
    section: null,
  },
  {
    path: "/warehouses/cases/icu",
    label: "warehouseModule.icu",
    section: "cases",
  },
  {
    path: "/warehouses/cases/picu",
    label: "warehouseModule.picu",
    section: "cases",
  },
  {
    path: "/warehouses/cases/cardiac-sw",
    label: "warehouseModule.cardiacSw",
    section: "cases",
  },
  {
    path: "/warehouses/cases/cardiac-surgery",
    label: "warehouseModule.cardiacSurgery",
    section: "cases",
  },
  {
    path: "/warehouses/cases/cardiology",
    label: "warehouseModule.cardiology",
    section: "cases",
  },
  {
    path: "/warehouses/cases/surgery-bypass",
    label: "warehouseModule.surgeryBypass",
    section: "cases",
  },
  {
    path: "/warehouses/utilities/item-reduction",
    label: "warehouseModule.itemReduction",
    section: "utilities",
  },
  {
    path: "/warehouses/utilities/all-item-reductions",
    label: "warehouseModule.allItemReductions",
    section: "utilities",
  },
  {
    path: "/warehouses/reports/products-per-patient",
    label: "warehouseModule.productsPerPatient",
    section: "reports",
  },
  {
    path: "/warehouses/reports/top-products",
    label: "warehouseModule.topProducts",
    section: "reports",
  },
] as const;
