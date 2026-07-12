import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@connectrpc/connect-query";
import {
  createNote,
  deleteNote,
  listNotes,
} from "@repo/proto/notes/v1/notes-NotesService_connectquery.js";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";

// Consumes notes.v1.NotesService through the generated connect-query hooks. Handles the
// four async states design.md requires: loading, error, empty, and success.
export function NotesPanel() {
  const [title, setTitle] = useState("");
  const notes = useQuery(listNotes, {});
  const create = useMutation(createNote, {
    onSuccess: () => {
      setTitle("");
      void notes.refetch();
    },
  });
  const remove = useMutation(deleteNote, {
    onSuccess: () => void notes.refetch(),
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    create.mutate({ title, body: "" });
  }

  return (
    <section className="flex flex-col gap-6">
      <form onSubmit={onSubmit} className="flex flex-col gap-1">
        <label htmlFor="new-note" className="text-sm font-medium">
          New note
        </label>
        <div className="flex gap-2">
          <Input
            id="new-note"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Pick up oat milk"
          />
          <Button type="submit" variant="primary" disabled={create.isPending}>
            {create.isPending ? "Adding…" : "Add"}
          </Button>
        </div>
        {create.isError && (
          <p role="alert" className="text-sm text-red-500">
            Couldn’t add the note: {create.error.message}
          </p>
        )}
      </form>

      {notes.isPending ? (
        <p className="text-neutral-400">Loading notes…</p>
      ) : notes.isError ? (
        <div role="alert" className="flex flex-col items-start gap-2">
          <p className="text-red-500">
            Couldn’t load notes: {notes.error.message}
          </p>
          <Button variant="secondary" onClick={() => void notes.refetch()}>
            Try again
          </Button>
        </div>
      ) : notes.data.notes.length === 0 ? (
        <p className="text-neutral-400">
          No notes yet — add your first one above.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {notes.data.notes.map((note) => (
            <li
              key={note.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-neutral-800 px-4 py-3"
            >
              <span>{note.title}</span>
              <Button
                variant="ghost"
                onClick={() => remove.mutate({ id: note.id })}
                disabled={remove.isPending}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
