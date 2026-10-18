import { paginateRows } from "../../../shared/database/paginate.js";
import { accountingModel } from "./accounting.model.js";
const httpError = (message, status) =>
  Object.assign(new Error(message), { status });
export const accountingService = {
  listAccounts: accountingModel.listAccounts,
  createAccount: accountingModel.createAccount,
  updateAccount: accountingModel.updateAccount,
  deleteAccount: accountingModel.deleteAccount,
  listJournals: accountingModel.listJournals,
  async createJournal(input) {
    const debit = input.lines.reduce((s, x) => s + x.debit, 0),
      credit = input.lines.reduce((s, x) => s + x.credit, 0);
    if (Math.abs(debit - credit) > 0.001)
      throw httpError("Journal entry debits and credits must be equal.", 400);
    return accountingModel.createJournal({
      entryNumber: `JE-${Date.now()}`,
      entryDate: input.entryDate,
      description: input.description,
      reference: input.reference || null,
      lines: { create: input.lines },
    });
  },
  postJournal: accountingModel.postJournal,
  deleteJournal: accountingModel.deleteJournal,
  async reports(query) {
    const from = query.from ? new Date(String(query.from)) : new Date(0),
      to = query.to ? new Date(String(query.to)) : new Date();
    const accounts = await accountingModel.reportAccounts(from, to);
    const trialBalance = accounts.map(({ lines, ...account }) => ({
      ...account,
      debit: lines.reduce((s, x) => s + x.debit, 0),
      credit: lines.reduce((s, x) => s + x.credit, 0),
    }));
    const total = (type) =>
      trialBalance
        .filter((x) => x.type === type)
        .reduce((s, x) => s + x.credit - x.debit, 0);
    return {
      totals: {
        debit: trialBalance.reduce((sum, row) => sum + row.debit, 0),
        credit: trialBalance.reduce((sum, row) => sum + row.credit, 0),
      },
      trialBalance:
        query.page === undefined
          ? trialBalance
          : paginateRows(trialBalance, query).items,
      ...(query.page !== undefined && {
        pagination: paginateRows(trialBalance, query).pagination,
      }),
      profitLoss: {
        revenue: total("revenue"),
        expenses: -total("expense"),
        netIncome: total("revenue") + total("expense"),
      },
      balanceSheet: {
        assets: -total("asset"),
        liabilities: total("liability"),
        equity: total("equity"),
      },
    };
  },
};
