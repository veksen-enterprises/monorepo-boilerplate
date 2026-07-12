import { createFileRoute } from "@tanstack/react-router";
import { NotesPanel } from "../components/notes-panel";

export const Route = createFileRoute("/notes")({
  component: NotesRoute,
});

function NotesRoute() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Notes</h1>
        <p className="text-neutral-400">
          Backed by the Connect RPC API — swap between the Fastify and Go
          backends with no client change. Deleting a note requires signing in
          with Clerk.
        </p>
      </header>
      <NotesPanel />
    </main>
  );
}
