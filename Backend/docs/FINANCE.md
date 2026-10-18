# Finance overview

Routes: `/accounting/overview` and `/accounting/income-expenses`.

Deploy the Prisma schema (or apply `scripts/sql/finance-overview.sql` after the
previous department income/expense migration) and regenerate Prisma Client.
The migration also registers `finance.cash-flow.approve`; assign this permission
to expense reviewers in Roles. Super Administrators can approve, but cannot
approve their own expenses.

Source reconciliation runs when finance data is opened/refreshed. It imports
paid patient receipts, billing payments, completed POS receipts net of change,
cash purchases, individual supplier debt payments, and paid payroll. Unique
source keys prevent repeated synchronization from duplicating entries. Source
changes are audited and cancelled/deleted source records leave cancelled ledger
entries. Reconciliation is serialized and concurrent reads share one run.

Source amounts/status cannot be independently edited in Finance. Department,
category, and cash-account assignment remain editable. Unknown departments stay
Unassigned. Sources without currency fields use the configured finance currency
at their first import; existing imported denomination/classification is retained.
Legacy supplier debts use the configured finance currency because purchase
records do not store a denomination. Record references link back to the source
module; audit history retains before/after values and the acting user.

Manual expenses requesting confirmation become Pending. Another authorized user
must approve them. Editing a confirmed expense requires approval again. Cancel
retains the original record and audit history. Historical confirmed manual
entries are preserved. Existing manually entered copies of source payments need
review/cancellation by users; the system cannot infer that two unrelated records
represent the same payment.

Cash-account balances equal opening balance plus confirmed assigned inflows
minus confirmed assigned outflows. Enter the opening balance before transactions
on the opening date; earlier transactions and mismatched currencies cannot be
assigned. Unallocated net movement is displayed separately and is not a verified
cash balance. Account opening records record creator/time and are immutable.

Monthly reports use UTC calendar months and confirmed ledger movements. They
report cash movement, not an accrual profit-and-loss statement. Current customer
invoice balances and supplier debts are independent of reporting year. Storage
valuation remains on Storage and is not counted as cash. Service/salary advances,
insurance receivables, and funding records are not automatically imported: their
settlement links must be defined before automatically combining them with other
receipts to avoid double counting.
