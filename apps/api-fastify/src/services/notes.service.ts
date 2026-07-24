import { and, eq } from "drizzle-orm";
import type { Database } from "../db/client.js";
import { notes, type NoteRow } from "../db/schema.js";

export interface CreateNoteInput {
  title: string;
  body?: string;
  authorId?: string | null;
}

// Business logic + data access. The database is a managed dependency — tests run it
// for real (pglite), so nothing here is mocked. See .claude/skills/testing/testing-api.md.
export class NotesService {
  constructor(private readonly db: Database) {}

  list(): Promise<NoteRow[]> {
    return this.db.select().from(notes).orderBy(notes.createdAt);
  }

  get(id: string): Promise<NoteRow | undefined> {
    return this.db.query.notes.findFirst({ where: eq(notes.id, id) });
  }

  async create(input: CreateNoteInput): Promise<NoteRow> {
    const rows = await this.db
      .insert(notes)
      .values({
        title: input.title,
        body: input.body ?? "",
        authorId: input.authorId ?? null,
      })
      .returning();
    const row = rows[0];
    if (!row) {
      throw new Error("insert returned no row");
    }
    return row;
  }

  async deleteOwnedBy(id: string, authorId: string): Promise<boolean> {
    const deleted = await this.db
      .delete(notes)
      .where(and(eq(notes.id, id), eq(notes.authorId, authorId)))
      .returning();
    return deleted.length > 0;
  }
}
