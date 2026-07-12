#!/bin/bash
# PostToolUse(Edit|Write): format the edited file with oxfmt, if it's a file oxfmt
# handles. Runs oxfmt directly (not `npm run format`) so it never resolves a
# workspace-local `format` script (e.g. the Go app's gofmt). Never blocks the edit.
file=$(jq -r '.tool_input.file_path // empty')
[ -z "$file" ] && exit 0

# Skip vendored/generated/non-JS trees (kept off the JS formatter on purpose).
case "$file" in
  */apps/api-go/* | */gen/* | */drizzle/* | */migrations/* | */.claude/skills/*) exit 0 ;;
esac

# Only the languages oxfmt formats.
case "$file" in
  *.ts | *.tsx | *.js | *.jsx | *.mjs | *.cjs | *.json | *.jsonc | *.css | *.md) ;;
  *) exit 0 ;;
esac

npx --no-install oxfmt "$file" >/dev/null 2>&1 || true
exit 0
