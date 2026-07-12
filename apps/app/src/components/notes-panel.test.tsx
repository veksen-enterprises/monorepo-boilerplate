import { createRouterTransport } from "@connectrpc/connect";
import { TransportProvider } from "@connectrpc/connect-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { NotesService } from "@repo/proto/notes/v1/notes_pb.js";
import { NotesPanel } from "./notes-panel";

interface Note {
  id: string;
  authorId: string;
  title: string;
  body: string;
  createdAt: string;
}

afterEach(cleanup);

// Wrap the panel in the real providers with an in-memory Connect transport backed by a
// fake service — the same pattern the backends use, so no server or network is involved.
function renderPanel(options?: { seed?: Note[]; failList?: boolean }) {
  const notes: Note[] = options?.seed ? [...options.seed] : [];
  const transport = createRouterTransport((router) => {
    router.service(NotesService, {
      listNotes() {
        if (options?.failList) throw new Error("upstream unavailable");
        return { notes };
      },
      createNote(req) {
        const note: Note = {
          id: String(notes.length + 1),
          authorId: "",
          title: req.title,
          body: req.body,
          createdAt: "2026-01-01T00:00:00Z",
        };
        notes.push(note);
        return { note };
      },
      deleteNote(req) {
        const index = notes.findIndex((n) => n.id === req.id);
        if (index >= 0) notes.splice(index, 1);
        return {};
      },
      getNote(req) {
        const note = notes.find((n) => n.id === req.id);
        if (!note) throw new Error("not found");
        return { note };
      },
    });
  });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <TransportProvider transport={transport}>
        <NotesPanel />
      </TransportProvider>
    </QueryClientProvider>,
  );
}

describe("NotesPanel", () => {
  it("shows a note returned by the service", async () => {
    renderPanel({
      seed: [
        {
          id: "1",
          authorId: "",
          title: "Water the plants",
          body: "",
          createdAt: "",
        },
      ],
    });

    expect(await screen.findByText("Water the plants")).toBeDefined();
  });

  it("shows the empty state when there are no notes", async () => {
    renderPanel();

    expect(await screen.findByText(/no notes yet/i)).toBeDefined();
  });

  it("adds a note and renders it", async () => {
    const user = userEvent.setup();
    renderPanel();
    await screen.findByText(/no notes yet/i);

    await user.type(screen.getByLabelText("New note"), "Book dentist");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(await screen.findByText("Book dentist")).toBeDefined();
  });

  it("shows an error state when loading fails", async () => {
    renderPanel({ failList: true });

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/couldn.t load notes/i);
  });
});
