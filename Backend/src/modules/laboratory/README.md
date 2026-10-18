# Laboratory

Reception selects an existing patient, converts a CRM lead, or registers a walk-in patient. Creating a request saves the patient link, optional appointment, test snapshots, billing invoice, and hospital-day queue number in one transaction. Retries with the same request ID return the original request.

Accounting records partial or full payments against the existing billing invoice. Full payment releases the request to the laboratory queue, including payments made through the standard billing module. Laboratory staff collect the sample, start processing, enter results, and complete the request. Every test needs a result before completion. Finished results are read-only and appear on the patient profile.

Routes:

- `/laboratory/reception`: requests, registration, invoice and 80 mm queue-ticket printing.
- `/laboratory/accounting`: invoice balances and payments.
- `/laboratory/queue`: paid requests, sample collection, processing and results.
- `/laboratory/received`: completed result attachments awaiting a patient call, contacted patients, and results handed over.
- `/laboratory/tests`: test catalog, prices, specimens, units and reference ranges. Inactivate tests instead of deleting their history.

Permissions are under `laboratory.orders`, `laboratory.payments` and `laboratory.tests`. Reception also needs `crm.patients.create` to register walk-ins and `crm.leads.update` to convert leads. Role grants are never added automatically. Super Administrators have access automatically.

Request details support PDF and JPG/PNG/GIF/WebP attachments, up to 5 MB each and 20 per request. Uploading requires `laboratory.orders.update`; viewing and downloading require `laboratory.orders.view`. Metadata is saved in the database, and files are stored privately in `Backend/storage/laboratory` outside the public directory. Include this directory in backups with the database. Attach files after saving a reception request, or while recording laboratory results.

For another database, run `npm run db:generate` and `npm run db:setup-laboratory` from `Backend`. Setup only creates missing laboratory tables, constraints and permission catalog entries. Configure real tests and prices before registering requests.

Validation: `node --test test/laboratory.test.js`. `npm run verify:laboratory` verifies the real database workflow inside a transaction and rolls back all verification records.

After completing laboratory work, attach the PDF or image result report and use Send to Received. This is blocked without a PDF or image result report. Received staff call the patient, mark contact only after reaching them, then mark results handed over when the patient collects them. Contact and handover timestamps and staff names are saved. Finished results remain visible on the patient profile throughout these stages.
