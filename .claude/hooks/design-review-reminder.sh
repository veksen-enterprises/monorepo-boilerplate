#!/bin/bash
# Advisory PostToolUse hook: when an agent edits a UI-layer file, surface a
# reminder (next to the tool result) to honor the design rules and verify before
# finishing. Non-blocking — it never refuses the edit, it just keeps design.md
# in view during the work instead of hoping the agent remembers at the end.

file=$(jq -r '.tool_input.file_path // empty')
[ -z "$file" ] && exit 0

# UI layer = component/route .tsx under the app or shared lib, or any stylesheet.
# Tests describe code rather than ship UI, so they're out of scope.
case "$file" in
  *.test.tsx | *.test.ts) exit 0 ;;
  *packages/ui/src/*.tsx | *apps/*/src/*.tsx | *.css) ;;
  *) exit 0 ;;
esac

read -r -d '' msg <<'EOF'
This edit touched the UI layer. Before declaring the task done: honor
.claude/rules/design.md (tokens over raw hex/grays, focus-visible, tabular-nums,
all four async states, CVA + @repo/ui) and .claude/rules/design-anti-slop.md
(no reflex purple accent, real content, authored not generic). Run
`npm run lint:design` and run `/design-review` on the diff — it is a hard gate
for UI changes, not optional.
EOF

jq -n --arg ctx "$msg" '{
  hookSpecificOutput: {
    hookEventName: "PostToolUse",
    additionalContext: $ctx
  }
}'
exit 0
