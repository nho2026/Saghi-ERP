import assert from "node:assert/strict";
import { test } from "node:test";

let currentUser;
let lookup;
let userLookups = 0;
// Isolate the middleware from the real database. No credentials or live data.
globalThis.__nhoPrisma = {
  user: {
    async findUnique(args) {
      lookup = args;
      userLookups++;
      return structuredClone(currentUser);
    },
  },
  department: {
    async count() {
      return 0;
    },
  },
};
const { requireAuth } =
  await import("../src/shared/middleware/auth.middleware.js");
const { signToken } = await import("../src/shared/security/token.js");
const { presentUser } = await import("../src/modules/auth/auth.presenter.js");

function user(roleName, keys = []) {
  return {
    id: "test-user",
    name: "Test",
    username: "test",
    status: "active",
    roles: [
      {
        role: {
          id: "test-role",
          name: roleName,
          permissions: keys.map((key) => ({ permission: { key } })),
        },
      },
    ],
  };
}
async function request({
  token = signToken("test-user"),
  method = "GET",
  url = "/api/users",
} = {}) {
  const req = {
    headers: {},
    cookies: { access_token: token },
    method,
    originalUrl: url,
    body: {},
  };
  const res = {
    statusCode: 200,
    headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    append(name, value) {
      this.headers[name] = value;
    },
  };
  let allowed = false;
  await requireAuth(req, res, () => {
    allowed = true;
  });
  return { req, res, allowed };
}

test("superadmin can access APIs with no loaded permission catalog", async () => {
  currentUser = user("Super Administrator");
  const { req, res, allowed } = await request({
    method: "DELETE",
    url: "/api/users/other",
  });
  assert(allowed);
  assert(req.permissionKeys.has("*"));
  assert(presentUser(req.user).permissions.includes("*"));
  assert.match(res.headers["Server-Timing"], /^auth;dur=\d+\.\d$/);
  const permissions = lookup.include.roles.include.role.include.permissions;
  assert.deepEqual(permissions.where, {
    role: { name: { not: "Super Administrator" } },
  });
  assert.deepEqual(permissions.select, {
    permission: { select: { key: true } },
  });
});

test("regular users retain granted access and cannot perform ungranted actions", async () => {
  currentUser = user("Reader", ["users.view"]);
  assert((await request()).allowed);
  const denied = await request({ method: "DELETE", url: "/api/users/other" });
  assert.equal(denied.res.statusCode, 403);
  assert.equal(denied.allowed, false);
});

test("account and role changes take effect on the next request", async () => {
  currentUser = user("Super Administrator");
  assert((await request()).allowed);
  currentUser = user("Reader");
  assert.equal((await request()).res.statusCode, 403);
  currentUser.status = "inactive";
  assert.equal((await request()).res.statusCode, 401);
  currentUser = null;
  assert.equal((await request()).res.statusCode, 401);
});

test("missing credentials do not query the database", async () => {
  const before = userLookups;
  const result = await request({ token: null });
  assert.equal(result.res.statusCode, 401);
  assert.equal(result.allowed, false);
  assert.equal(userLookups, before);
});
