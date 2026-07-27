#!/usr/bin/env bash
# One-time setup for the sandcastle RALPH loop.
#
# Run this yourself — it touches your Claude login and your GitHub repo, which is
# deliberately not something the agent does on your behalf.
#
#   ./scripts/sandcastle-setup.sh
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Checking prerequisites"
docker info >/dev/null 2>&1 || { echo "Docker is not running. Start Docker Desktop."; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "gh is not authenticated. Run: gh auth login"; exit 1; }
command -v claude >/dev/null 2>&1 || { echo "claude CLI not found on PATH."; exit 1; }

node_major="$(node --version | sed 's/^v\([0-9]*\).*/\1/')"
[ "$node_major" = "24" ] || { echo "Node 24.x required (found $(node --version)). Run: nvm use"; exit 1; }

echo "==> Creating labels (idempotent)"
gh label create ready-for-agent \
  --color 0E8A16 \
  --description "Actionable and safe for the autonomous loop to pick up" \
  --force
gh label create ready-for-human \
  --color D93F0B \
  --description "Needs a human — credentials, judgment calls, or unsafe to automate" \
  --force

echo "==> Writing .sandcastle/.env"
if [ -f .sandcastle/.env ]; then
  echo "    .sandcastle/.env already exists — leaving it alone."
else
  cp .sandcastle/.env.example .sandcastle/.env
  echo ""
  echo "    Now fill in .sandcastle/.env:"
  echo ""
  echo "      GH_TOKEN                — try: gh auth token"
  echo "      CLAUDE_CODE_OAUTH_TOKEN — run: claude setup-token"
  echo ""
  echo "    Both are secrets. .sandcastle/.env is gitignored; keep it that way."
fi

# Must match IMAGE_NAME in .sandcastle/main.mts. sandcastle would otherwise tag
# the image after the checkout directory, which is wrong in a worktree.
image="sandcastle:$(node -p "require('./package.json').name")"

echo "==> Building the sandbox image '$image' (Node 24 + Go + gh)"
npx sandcastle docker build-image --image-name "$image"

# `sandcastle docker build-image` exits 0 even when the underlying docker build
# fails, so the exit code proves nothing. Verify by running the toolchain.
echo "==> Verifying the toolchain inside the image"
docker run --rm --entrypoint sh "$image" -c \
  'node --version && go version && gh --version | head -1' \
  || { echo "    Image '$image' is unusable — read the build output above."; exit 1; }

echo ""
echo "Done. Next:"
echo "  1. Fill .sandcastle/.env if you haven't."
echo "  2. Label a small, self-contained issue 'ready-for-agent'."
echo "  3. npm run sandcastle"
echo "  4. tail -f \"\$(ls -t .sandcastle/logs/*.log | head -1)\""
