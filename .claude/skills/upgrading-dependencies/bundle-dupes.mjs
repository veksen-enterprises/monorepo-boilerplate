// Reports packages duplicated inside a shipped Vite bundle.
//
//   node .claude/skills/upgrading-dependencies/bundle-dupes.mjs            # apps/app
//   node .claude/skills/upgrading-dependencies/bundle-dupes.mjs apps/<x>   # another Vite app
//
// `vite build` emits no sourcemaps here, so this runs its own build of the app
// with sourcemaps on, into a temp dir, and leaves `dist/` alone. Workspace
// packages the app imports from their `dist/` (such as @repo/ui) must be built
// first: `npm run build -- --filter=app`.
//
// Two kinds of duplication:
//   installs: one package bundled from more than one install path (two versions,
//             or one version installed twice because the root slot holds another).
//   chunks:   one source file emitted into more than one chunk.
// Sizes are source sizes from the sourcemaps, before minification.
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../..");
const appDir = resolve(root, process.argv[2] ?? "apps/app");
const kb = (b) => `${(b / 1024).toFixed(1)} KB`;

function packageOf(path) {
  const i = path.lastIndexOf("/node_modules/");
  if (i < 0) return null;
  const [first, second] = path.slice(i + 14).split("/");
  const name = first.startsWith("@") ? `${first}/${second}` : first;
  return { name, install: path.slice(0, i + 14) + name };
}

function versionAt(install) {
  try {
    return JSON.parse(readFileSync(join(install, "package.json"), "utf8"))
      .version;
  } catch {
    return "?";
  }
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}

function sizeOf(file, content) {
  if (content != null) return content.length;
  try {
    return statSync(file).size;
  } catch {
    return 0;
  }
}

// Each entry: { file: absolute source path, bytes, chunk }.
function fromSourcemaps(dir) {
  return walk(dir)
    .filter((f) => f.endsWith(".js.map"))
    .flatMap((mapFile) => {
      const map = JSON.parse(readFileSync(mapFile, "utf8"));
      const base = resolve(dirname(mapFile), map.sourceRoot || "");
      return map.sources.map((src, i) => {
        const file = resolve(base, src);
        return {
          file,
          bytes: sizeOf(file, map.sourcesContent?.[i]),
          chunk: mapFile,
        };
      });
    });
}

if (
  !["vite.config.ts", "vite.config.js", "vite.config.mjs"].some((f) =>
    existsSync(join(appDir, f)),
  )
) {
  console.error(`${appDir} has no vite.config; only Vite apps ship a bundle.`);
  process.exit(1);
}

const out = mkdtempSync(join(tmpdir(), "bundle-dupes-"));
// The TanStack Router plugin resolves src/routes from the working directory.
process.chdir(appDir);
const { build } = await import(
  createRequire(join(appDir, "package.json")).resolve("vite")
);
await build({
  root: appDir,
  logLevel: "error",
  build: { outDir: out, emptyOutDir: true, sourcemap: true },
});
const entries = fromSourcemaps(out);
rmSync(out, { recursive: true, force: true });
if (entries.length === 0) {
  console.error("the build emitted no .js.map files; nothing to measure.");
  process.exit(1);
}

const installs = new Map(); // package name -> Map(install path -> bytes)
const chunksOf = new Map(); // source file -> { bytes, chunks }
for (const { file, bytes, chunk } of entries) {
  const seen = chunksOf.get(file) ?? { bytes, chunks: new Set() };
  seen.chunks.add(chunk);
  chunksOf.set(file, seen);
  const pkg = packageOf(file);
  if (!pkg) continue;
  const byInstall = installs.get(pkg.name) ?? new Map();
  byInstall.set(pkg.install, (byInstall.get(pkg.install) ?? 0) + bytes);
  installs.set(pkg.name, byInstall);
}

const label = appDir.replace(root + "/", "");
console.log(
  `${label}: ${kb(entries.reduce((n, e) => n + e.bytes, 0))} across ${entries.length} modules`,
);
const duplicated = [...installs].filter(([, byInstall]) => byInstall.size > 1);
console.log(
  `packages bundled from more than one install: ${duplicated.length}`,
);
for (const [name, byInstall] of duplicated) {
  const copies = [...byInstall].map(
    ([install, bytes]) =>
      `${versionAt(install)} @ ${install.replace(root + "/", "")} (${kb(bytes)})`,
  );
  console.log(`  ${name}: ${copies.join(" | ")}`);
}
const multiChunk = [...chunksOf].filter(([, f]) => f.chunks.size > 1);
const extra = multiChunk.reduce(
  (n, [, f]) => n + (f.chunks.size - 1) * f.bytes,
  0,
);
console.log(
  `source files emitted into more than one chunk: ${multiChunk.length} (${kb(extra)} extra)`,
);
