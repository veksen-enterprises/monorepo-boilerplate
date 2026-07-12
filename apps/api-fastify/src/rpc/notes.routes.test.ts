import { createClient, createRouterTransport } from "@connectrpc/connect";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotesService as NotesServiceDesc } from "@repo/proto/notes/v1/notes_pb.js";
import { setupTestDb } from "../test-helpers/setup-test-db.js";
import { makeNotesRoutes } from "./notes.routes.js";

const verifyToken = vi.hoisted(() => vi.fn());
vi.mock("@clerk/backend", () => ({ verifyToken }));

async function makeClient() {
  const db = await setupTestDb();
  const transport = createRouterTransport(makeNotesRoutes(db));
  return createClient(NotesServiceDesc, transport);
}

describe("NotesService RPC", () => {
  beforeEach(() => {
    verifyToken.mockReset();
    process.env.CLERK_SECRET_KEY = "sk_test_placeholder";
  });

  it("creates a note and lists it", async () => {
    const client = await makeClient();

    const created = await client.createNote({ title: "Buy milk", body: "2%" });

    expect(created.note?.title).toBe("Buy milk");
    const { notes } = await client.listNotes({});
    expect(notes).toHaveLength(1);
  });

  it("rejects an empty title with InvalidArgument", async () => {
    const client = await makeClient();

    await expect(client.createNote({ title: "  " })).rejects.toThrow(/title/i);
  });

  it("returns NotFound for an unknown note", async () => {
    const client = await makeClient();

    await expect(client.getNote({ id: crypto.randomUUID() })).rejects.toThrow(
      /not found/i,
    );
  });

  it("rejects an unauthenticated delete", async () => {
    const client = await makeClient();
    const created = await client.createNote({ title: "temp" });

    await expect(
      client.deleteNote({ id: created.note?.id ?? "" }),
    ).rejects.toThrow(/authentication/i);
  });

  it("lets the authenticated owner delete their note", async () => {
    verifyToken.mockResolvedValue({ sub: "user_1" });
    const client = await makeClient();
    const headers = { authorization: "Bearer test-token" };
    const created = await client.createNote({ title: "temp" }, { headers });

    await client.deleteNote({ id: created.note?.id ?? "" }, { headers });

    await expect(
      client.getNote({ id: created.note?.id ?? "" }),
    ).rejects.toThrow(/not found/i);
  });
});
