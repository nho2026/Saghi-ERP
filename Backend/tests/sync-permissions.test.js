import assert from "node:assert/strict";
import { test } from "node:test";
import { syncPermissionCatalog } from "../src/shared/security/sync-permissions.js";

function database(failures) {
  const batches = [];
  return {
    batches,
    permission: { upsert: (args) => args },
    async $transaction(operations) {
      batches.push(operations);
      const error = failures.shift();
      if (error) throw error;
    },
  };
}

test("startup recovers from a temporary database outage before completing sync", async () => {
  const db = database([{ code: "P1001" }, { code: "P1017" }]);
  const waits = [];
  const warnings = [];
  await syncPermissionCatalog({
    db,
    wait: async (ms) => waits.push(ms),
    warn: (message) => warnings.push(message),
  });
  assert.deepEqual(waits, [1000, 2000]);
  assert.equal(db.batches.length, 3);
  assert(db.batches[0].length > 0);
  assert.notEqual(db.batches[0], db.batches[1]);
  assert.deepEqual(db.batches[0], db.batches[2]);
  assert.match(warnings[0], /P1001.*startup is waiting/);
});

test("persistent database outages exhaust bounded retries and fail startup", async () => {
  const error = Object.assign(new Error("Database unavailable"), {
    code: "P1001",
  });
  const db = database(Array(6).fill(error));
  const waits = [];
  await assert.rejects(
    syncPermissionCatalog({
      db,
      wait: async (ms) => waits.push(ms),
      warn: () => {},
    }),
    (actual) => actual === error,
  );
  assert.equal(db.batches.length, 6);
  assert.deepEqual(waits, [1000, 2000, 4000, 8000, 15000]);
});

test("schema and credential errors fail immediately without retrying", async () => {
  for (const code of ["P1000", "P2021", "P2002", undefined]) {
    const error = Object.assign(new Error("Permanent failure"), { code });
    const db = database([error]);
    await assert.rejects(
      syncPermissionCatalog({
        db,
        wait: async () => assert.fail("Must not retry permanent errors"),
        warn: () => assert.fail("Must not report a retry"),
      }),
      (actual) => actual === error,
    );
    assert.equal(db.batches.length, 1);
  }
});
