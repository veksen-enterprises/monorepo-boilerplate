import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

export type Database = PostgresJsDatabase<typeof schema>;

export function createDb(connectionString: string): Database {
  return drizzle(postgres(connectionString), { schema });
}
