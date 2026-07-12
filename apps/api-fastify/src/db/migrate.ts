import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { loadEnv } from "../config/env.js";
import { createDb } from "./client.js";

const env = loadEnv();
const migrationsFolder = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../drizzle",
);

await migrate(createDb(env.DATABASE_URL), { migrationsFolder });
console.log("migrations applied");
process.exit(0);
