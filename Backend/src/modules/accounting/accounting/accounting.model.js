import { paginate } from "../../../shared/database/paginate.js";
import { prisma } from "../../../shared/database/client.js";
const journalInclude = { lines: { include: { account: true } } };
export const accountingModel = {
  listAccounts: (query = {}) =>
    paginate(
      "accountingAccount",
      query,
      {
        include: {
          parent: { select: { id: true, code: true, name: true } },
          _count: { select: { lines: true, children: true } },
        },
        orderBy: { code: "asc" },
      },
      ["code", "name"],
    ),
  createAccount: (data) => prisma.accountingAccount.create({ data }),
  updateAccount: (id, data) =>
    prisma.accountingAccount.update({ where: { id }, data }),
  deleteAccount: (id) => prisma.accountingAccount.delete({ where: { id } }),
  listJournals: (query = {}) =>
    paginate(
      "journalEntry",
      query,
      {
        include: journalInclude,
        orderBy: [{ entryDate: "desc" }, { createdAt: "desc" }],
        take: 1,
      },
      ["entryNumber", "description", "reference"],
    ),
  createJournal: (data) =>
    prisma.journalEntry.create({ data, include: journalInclude }),
  postJournal: (id) =>
    prisma.journalEntry.update({
      where: { id, status: "draft" },
      data: { status: "posted" },
      include: journalInclude,
    }),
  deleteJournal: (id) =>
    prisma.journalEntry.delete({ where: { id, status: "draft" } }),
  reportAccounts: (from, to) =>
    prisma.accountingAccount.findMany({
      include: {
        lines: {
          where: {
            entry: { status: "posted", entryDate: { gte: from, lte: to } },
          },
          select: { debit: true, credit: true },
        },
      },
      orderBy: { code: "asc" },
    }),
};
