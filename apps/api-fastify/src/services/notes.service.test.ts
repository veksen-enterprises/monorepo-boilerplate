import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { notes } from "../db/schema.js";
import { setupTestDb } from "../test-helpers/setup-test-db.js";
import { NotesService } from "./notes.service.js";

describe("NotesService", () => {
  it("creates a note and persists it", async () => {
    const db = await setupTestDb();
    const service = new NotesService(db);

    const note = await service.create({
      title: "Standup",
      body: "ship the api",
    });

    expect(note.title).toBe("Standup");
    const row = await db.query.notes.findFirst({
      where: eq(notes.id, note.id),
    });
    expect(row?.body).toBe("ship the api");
  });

  it("lists notes in creation order", async () => {
    const db = await setupTestDb();
    const service = new NotesService(db);
    await service.create({ title: "first" });
    await service.create({ title: "second" });

    const list = await service.list();

    expect(list.map((n) => n.title)).toEqual(["first", "second"]);
  });

  it("deletes a note only for its owner", async () => {
    const db = await setupTestDb();
    const service = new NotesService(db);
    const note = await service.create({ title: "mine", authorId: "user_1" });

    expect(await service.deleteOwnedBy(note.id, "user_2")).toBe(false);
    expect(await service.deleteOwnedBy(note.id, "user_1")).toBe(true);
  });
});
