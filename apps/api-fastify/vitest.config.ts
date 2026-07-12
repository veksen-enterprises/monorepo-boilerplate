import { mergeConfig } from "vitest/config";
import { baseConfig } from "@repo/vitest-config";

// pglite's first boot (WASM init + running migrations) can exceed vitest's default 5s
// timeout on a cold CI runner. Integration tests over a real DB need headroom.
export default mergeConfig(baseConfig, {
  test: {
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
