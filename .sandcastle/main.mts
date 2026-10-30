import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { claudeCode, run } from "@ai-hero/sandcastle";
import { docker } from "@ai-hero/sandcastle/sandboxes/docker";

const LAUNCH_BRANCH = "main";

// sandcastle defaults the image tag to the checkout *directory* basename, which is
// wrong whenever the working copy isn't named after the repo (git worktrees,
// conductor workspaces, a plain `git clone foo bar`). Key it to the package name
// instead so it stays correct after this boilerplate is forked and renamed.
const { name: repoName } = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as { name: string };
const IMAGE_NAME = `sandcastle:${repoName}`;

// sandcastle only consults `baseBranch` when the worker branch does not yet exist,
// and it never fetches on our behalf — its own docstring puts currency on the
// caller. Without this fetch a stale local `main` silently becomes the base.
execSync(`git fetch origin ${LAUNCH_BRANCH}`, { stdio: "inherit" });

await run({
  name: "worker",

  agent: claudeCode("claude-opus-5"),

  sandbox: docker({
    imageName: IMAGE_NAME,
    env: {
      // The worktree's .git is bind-mounted and shared with the host repo, so a
      // `git remote set-url` inside the sandbox would rewrite the *real* remote.
      // Env-scoped config rewrites SSH->HTTPS for this process only, and lets gh
      // mint the credential from GH_TOKEN. origin is an SSH URL and the sandbox
      // has no SSH key, so without this the agent cannot push at all.
      GIT_CONFIG_COUNT: "2",
      GIT_CONFIG_KEY_0: "url.https://github.com/.insteadOf",
      GIT_CONFIG_VALUE_0: "git@github.com:",
      GIT_CONFIG_KEY_1: "credential.https://github.com.helper",
      GIT_CONFIG_VALUE_1: "!gh auth git-credential",

      // testcontainers-go starts sibling containers on the host daemon, then dials
      // the published port. Inside the sandbox `localhost` is the wrong host;
      // Docker Desktop always resolves host.docker.internal to the host.
      TESTCONTAINERS_HOST_OVERRIDE: "host.docker.internal",
    },

    // apps/api-go's store tests call testcontainers, which needs a real daemon.
    // Dropping this mount + group is safe if you also stop running Go tests in
    // the sandbox — see docs/sandcastle.md for the sidecar alternative.
    mounts: [
      { hostPath: "/var/run/docker.sock", sandboxPath: "/var/run/docker.sock" },
    ],
    groups: ["docker"],
  }),

  promptFile: "./.sandcastle/prompt.md",

  // One issue per launch. The worker opens its own PR and waits for CI, so the
  // next launch starts from a main that already contains this one's work.
  maxIterations: 1,

  // A fresh branch per launch, cut from the ref we just fetched. Never
  // merge-to-head: the agent lands its work through a PR, not into your checkout.
  branchStrategy: {
    type: "branch",
    branch: `sandcastle/worker/${Date.now()}`,
    baseBranch: `origin/${LAUNCH_BRANCH}`,
  },

  copyToWorktree: ["node_modules"],

  hooks: {
    sandbox: {
      onSandboxReady: [{ command: "npm install" }],
    },
  },
});
