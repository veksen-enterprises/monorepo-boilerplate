#!/bin/bash
# PreToolUse(Bash): force tooling through npm scripts so the agent, hooks, and CI
# all run the identical command. Blocks direct turbo/oxlint/oxfmt/vitest invocations.
#
# Only the leading program of each command segment is inspected, so tool names that
# appear inside arguments (e.g. a commit message mentioning "oxfmt") are not blocked.
cmd=$(jq -r '.tool_input.command // ""')

# Split on shell separators (&& || ; | and newlines) into one segment per line.
segments=$(printf '%s' "$cmd" | sed -E 's/(\&\&|\|\||;|\|)/\n/g')

blocked=0
while IFS= read -r seg; do
  # Strip leading whitespace, then take the first token.
  seg="${seg#"${seg%%[![:space:]]*}"}"
  first=$(printf '%s' "$seg" | awk '{print $1}')
  # `npx <tool>` — inspect the tool, not npx.
  if [ "$first" = "npx" ]; then
    first=$(printf '%s' "$seg" | awk '{print $2}')
  fi
  case "$first" in
    turbo | oxlint | oxfmt | vitest) blocked=1 ;;
  esac
done <<EOF
$segments
EOF

if [ "$blocked" -eq 1 ]; then
  echo "Blocked: do not invoke turbo/oxlint/oxfmt/vitest directly. Use the project's npm scripts instead (e.g. npm run lint, npm run format, npm run test, npm run check-types, npm run build)." >&2
  exit 2
fi
exit 0
