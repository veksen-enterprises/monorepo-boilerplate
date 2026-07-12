import { Code, ConnectError, type ConnectRouter } from "@connectrpc/connect";
import { NotesService as NotesServiceDesc } from "@repo/proto/notes/v1/notes_pb.js";
import type { Database } from "../db/client.js";
import type { NoteRow } from "../db/schema.js";
import { NotesService } from "../services/notes.service.js";
import { userIdFromContext } from "./auth.js";

function toProto(row: NoteRow) {
  return {
    id: row.id,
    authorId: row.authorId ?? "",
    title: row.title,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
  };
}

// Implements notes.v1.NotesService against the shared @repo/proto contract.
// Returned as a router-registration function so it can be mounted on Fastify and
// also driven in-memory by createRouterTransport in tests.
export function makeNotesRoutes(db: Database) {
  const service = new NotesService(db);

  return (router: ConnectRouter) => {
    router.service(NotesServiceDesc, {
      async listNotes() {
        const rows = await service.list();
        return { notes: rows.map(toProto) };
      },

      async getNote(req) {
        const row = await service.get(req.id);
        if (!row) {
          throw new ConnectError("note not found", Code.NotFound);
        }
        return { note: toProto(row) };
      },

      async createNote(req, ctx) {
        if (!req.title.trim()) {
          throw new ConnectError("title is required", Code.InvalidArgument);
        }
        const authorId = await userIdFromContext(ctx);
        const row = await service.create({
          title: req.title,
          body: req.body,
          authorId,
        });
        return { note: toProto(row) };
      },

      async deleteNote(req, ctx) {
        const authorId = await userIdFromContext(ctx);
        if (!authorId) {
          throw new ConnectError(
            "authentication required",
            Code.Unauthenticated,
          );
        }
        const deleted = await service.deleteOwnedBy(req.id, authorId);
        if (!deleted) {
          throw new ConnectError("note not found", Code.NotFound);
        }
        return {};
      },
    });
  };
}
