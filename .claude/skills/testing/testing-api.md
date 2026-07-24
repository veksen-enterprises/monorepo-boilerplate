---
globs: "apps/api/**/*.test.*,apps/api/**/*.spec.*,apps/server/**/*.test.*,**/src/routes/**/*.test.*,**/src/services/**/*.test.*"
---

# Testing Backend / API Code

No backend is wired into this starter — this is the convention for **when you add one**
(Fastify, Hono, Express, Nest; your call). Stack: Vitest, plus your framework's HTTP-test tool
and a real database in tests. Cross-cutting rules live in `testing-philosophy.md`; pure
transforms/validators (mappers, Zod schemas) are utility functions — test them per
`testing-utilities.md`. This file covers the two backend-specific layers: the **HTTP boundary**
and the **service/data layer**.

## The HTTP / route layer — integration through the real app

A route handler is an **adapter** between HTTP and your business logic. The contract is the
endpoint, not the function — so test it the way a client calls it: a real request through the
full pipeline (routing, body parsing, validation, auth, middleware, serialization). Don't call
the handler function directly; that skips everything that actually breaks in production.

Use your framework's in-process test client — no network, full pipeline:

```ts
// supertest (Express/Connect-style)
import request from "supertest";
import { createApp } from "../app";

it("returns 200 with the place list", async () => {
  const app = createApp();

  const res = await request(app).get("/places");

  expect(res.status).toBe(200);
  expect(res.body).toHaveLength(2);
});

// or the framework's own injector (Fastify)
const res = await app.inject({ method: "GET", url: "/places" });
expect(res.statusCode).toBe(200);
```

**What to test per endpoint** — the wiring, not the business logic:

1. **Happy path** — valid request → correct status + response shape.
2. **Not found** — nonexistent resource → 404.
3. **Auth** — protected endpoint without/with credentials → 401/403 vs 200 (only reachable through
   the real pipeline). Drive it with a test auth header/token, not a mocked guard.
4. **Validation** — invalid body/params → 400 with the error (only reachable through real body
   parsing/schema validation).
5. **Scoping** — the correct subset is returned (e.g. another tenant's rows excluded).

**Do NOT test business-logic edge cases here.** If the logic lives in a service, test the edge
cases there — one happy path plus endpoint-specific errors is enough at the HTTP layer (Khorikov:
"one happy path per application service method" in integration tests).

## The service / data layer — real database, mock only what you don't own

Services hold the business logic and own data access. Test the **public contract**: given a known
DB state and mocked collaborators, call the method and assert the return value or the resulting DB
state. Don't assert which queries ran.

**The database is a managed dependency (Khorikov) — use a real one, never a fake.** A naive
in-memory/sqlite stub doesn't enforce foreign keys, unique indexes, or Postgres-specific behavior
(enums, JSON operators, `LIKE`, arrays), so tests pass while real queries are broken. Use real
Postgres via [`@testcontainers/postgresql`](https://node.testcontainers.org/), or
[pglite](https://github.com/electric-sql/pglite) (real Postgres in-process — fast, still enforces
constraints). Run real migrations against it.

Mock only **unmanaged dependencies** — things you don't own or deploy: third-party APIs, email/SMS,
payment gateways, external queues. Do NOT mock your own DB, your own modules, or the query builder.

**Write → read back → assert** is the strongest pattern:

```ts
it("creates a queue item and persists it as queued", async () => {
  const db = await setupTestDb(); // real Postgres (testcontainers / pglite) + migrations
  const mailer = { send: vi.fn() }; // unmanaged dep — mocked
  const service = new QueueService(db, mailer);

  const item = await service.create({ title: "Ada" });

  expect(item.title).toBe("Ada"); // return value
  const persisted = await db.query.queueItems.findFirst({
    where: eq(queueItems.id, item.id),
  });
  expect(persisted?.status).toBe("queued"); // persisted state
});
```

**What to test per method:** happy path (return value + DB state), edge cases (empty, null,
boundary), state transitions (write → read back), ordering/filtering/pagination (insert several,
assert the subset and order), error paths (invalid input, missing record, conflict), and side
effects to external systems.

**`toHaveBeenCalledWith` / spy verification** — only for an **outgoing command to an unmanaged
dependency**, where the call IS the behavior (an email was sent, a webhook fired). There's no
return value to check, so the call is the assertion. Everywhere else assert the DB state or the
return value, never the internal query calls (see `testing-philosophy.md`).

### If you layer repositories (ports-and-adapters)

The pattern above tests services against a real DB. If your codebase separates a **repository**
layer (services depend on repos, repos own the SQL), a lighter split works too — it just moves the
seam:

- **Service unit tests** mock the repository (`mockDeep<XRepository>()` / `vi.fn()`), call the
  method, and assert the **return value**. Only reach for `toHaveBeenCalledWith` on the repo where
  the service _transforms_ input before passing it down (a default, a computed field) — skip it for
  pass-throughs like `repo.getById(id)`.
- **Repository tests** are integration tests against a **real database** (testcontainers / pglite),
  write → read back → assert. No mocks — this is where the SQL is actually exercised.
- Likewise at the HTTP layer, if you mock the service, assert its call args only where the handler
  transforms input (Zod defaults, URI decoding, pulling `userId` off the session).

Both layerings are valid; pick one per project and be consistent. Either way the SQL is exercised
against a real database somewhere, and behavior is asserted over call-shape.

## Test data

Use small factory functions with sensible defaults and targeted overrides — never copy seed rows
into tests:

```ts
function makeHub(overrides = {}) {
  return {
    name: "Test Hub",
    countryCode: "CA",
    timezone: "America/Toronto",
    ...overrides,
  };
}
```

## Naming

Name tests after behavior: `should return items ordered by priority`, not `should call
findMany`. See the naming table in `testing-philosophy.md`.
