import { fastifyConnectPlugin } from "@connectrpc/connect-fastify";
import Fastify, { type FastifyInstance } from "fastify";
import type { Database } from "./db/client.js";
import { makeNotesRoutes } from "./rpc/notes.routes.js";

export interface BuildAppOptions {
  db: Database;
  logger?: boolean;
}

// buildApp wires plugins and Connect routes but does NOT listen — it's the test seam.
export async function buildApp(
  opts: BuildAppOptions,
): Promise<FastifyInstance> {
  const app = Fastify({ logger: opts.logger ?? false });

  app.get("/healthz", async () => ({ status: "ok" }));

  await app.register(fastifyConnectPlugin, {
    routes: makeNotesRoutes(opts.db),
  });

  return app;
}
