#!/bin/bash
# PreToolUse(Bash): block destructive commands and commits made directly on main/master.
cmd=$(jq -r '.tool_input.command // ""')

case "$cmd" in
  *"rm -rf /"*|*"rm -rf ~"*|*"rm -rf ."*|*"git reset --hard"*|*"git push --force"*|*"git push -f "*)
    echo "Blocked: destructive command. Use a safer alternative (e.g. --force-with-lease on a feature branch)." >&2
    exit 2
    ;;
esac

# Block commits while HEAD is on main/master. Checks the actual branch, not the
# commit message, so messages that mention "main" are not falsely blocked.
if echo "$cmd" | grep -qE '(^|\s|&&|\|\||;)\s*git\s+commit'; then
  branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
  if [ "$branch" = "main" ] || [ "$branch" = "master" ]; then
    echo "Blocked: cannot commit directly to '$branch'. Create a feature branch first (git checkout -b <type>/<desc>)." >&2
    exit 2
  fi
fi

exit 0
