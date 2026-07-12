import { defaultExclude, defineConfig } from "vitest/config";

export const baseConfig = defineConfig({
  test: {
    // Never discover compiled tests in build output (dist), or every test runs twice.
    exclude: [...defaultExclude, "**/dist/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "json-summary", "json"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}"],
    },
  },
});
