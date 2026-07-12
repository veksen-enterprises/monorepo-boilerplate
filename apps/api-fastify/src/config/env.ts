export interface Env {
  DATABASE_URL: string;
  PORT: number;
  HOST: string;
  CLERK_SECRET_KEY?: string;
  CLERK_PUBLISHABLE_KEY?: string;
}

// Validate the environment once at boot and fail fast if a required var is missing.
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const DATABASE_URL = source.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }
  return {
    DATABASE_URL,
    PORT: Number(source.PORT ?? 3001),
    HOST: source.HOST ?? "0.0.0.0",
    CLERK_SECRET_KEY: source.CLERK_SECRET_KEY,
    CLERK_PUBLISHABLE_KEY: source.CLERK_PUBLISHABLE_KEY,
  };
}
