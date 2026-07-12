import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    // generate reads the schema, not the DB; a placeholder is fine for db:generate.
    url: process.env.DATABASE_URL ?? "postgresql://localhost:5432/placeholder",
  },
});
