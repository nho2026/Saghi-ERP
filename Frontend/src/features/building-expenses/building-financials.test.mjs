import test from "node:test";
import assert from "node:assert/strict";
import { buildingFinancials, orderDebt } from "./building-financials.ts";
const order = (kind, status, paidAmount) => ({
  kind,
  status,
  paidAmount,
  items: [{ price: 25, quantity: 4 }],
});
test("costs include completed purchases; payables and receivables stay separate", () => {
  assert.deepEqual(
    buildingFinancials(
      [{ amount: "20.00" }],
      [
        order("purchase", "completed", 30),
        order("sale", "completed", 60),
        order("purchase", "draft", 0),
        order("purchase", "ordered", 0),
        order("purchase", "cancelled", 0),
      ],
    ),
    {
      operatingExpenses: 20,
      purchases: 100,
      totalExpenses: 120,
      totalPaid: 50,
      purchaseDebt: 70,
      salesReceivable: 40,
      salesCollected: 60,
    },
  );
});
test("payments reduce debt without changing expense totals", () => {
  const result = buildingFinancials([], [order("purchase", "completed", 100)]);
  assert.equal(result.totalExpenses, 100);
  assert.equal(result.purchaseDebt, 0);
  assert.equal(result.totalPaid, 100);
  assert.equal(orderDebt(order("purchase", "completed", 100)), 0);
});
test("empty totals and fractional currency are exact", () => {
  assert.equal(buildingFinancials([], []).totalExpenses, 0);
  assert.equal(
    buildingFinancials([{ amount: 0.1 }, { amount: 0.2 }], []).totalExpenses,
    0.3,
  );
});
