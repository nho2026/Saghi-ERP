type Order = {
  kind: string;
  status: string;
  paidAmount: string | number;
  items: { price: number; quantity: number }[];
};
const cents = (value: string | number) => Math.round(Number(value) * 100);
export const orderTotalCents = (order: Order) =>
  order.items.reduce((sum, item) => sum + cents(item.price) * item.quantity, 0);
export const orderDebt = (order: Order) =>
  Math.max(0, orderTotalCents(order) - cents(order.paidAmount)) / 100;

export function buildingFinancials(
  expenses: { amount: number | string }[],
  orders: Order[],
) {
  const completed = orders.filter((order) => order.status === "completed");
  const purchases = completed.filter((order) => order.kind === "purchase");
  const sales = completed.filter((order) => order.kind === "sale");
  const operating = expenses.reduce(
    (sum, expense) => sum + cents(expense.amount),
    0,
  );
  const purchased = purchases.reduce(
    (sum, order) => sum + orderTotalCents(order),
    0,
  );
  const purchasePaid = purchases.reduce(
    (sum, order) =>
      sum + Math.min(orderTotalCents(order), cents(order.paidAmount)),
    0,
  );
  return {
    operatingExpenses: operating / 100,
    purchases: purchased / 100,
    totalExpenses: (operating + purchased) / 100,
    totalPaid: (operating + purchasePaid) / 100,
    purchaseDebt: (purchased - purchasePaid) / 100,
    salesReceivable:
      sales.reduce(
        (sum, order) =>
          sum + Math.max(0, orderTotalCents(order) - cents(order.paidAmount)),
        0,
      ) / 100,
    salesCollected:
      sales.reduce((sum, order) => sum + cents(order.paidAmount), 0) / 100,
  };
}
