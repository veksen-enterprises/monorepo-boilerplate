---
globs: "*"
---

# Research Rules

## When to Research

- Unfamiliar library or API
- Unfamiliar codebase pattern
- Integrating a third-party service
- A fix attempt has failed

## How to Research

1. Read the project's own code first — grep for existing usage patterns.
2. Read official documentation (use WebFetch or the context7 MCP). Don't rely on training data for library APIs — they change.
3. Read dependency source code when docs are insufficient, especially for event handling, lifecycle hooks, and edge cases in UI component libraries.
4. Use subagents for deep research to avoid polluting main context.
5. Summarize findings before implementing.

## Third-Party Component Rule

When working with third-party UI components (especially Base UI), check the library's event-handling order before wiring custom handlers. Read the source/docs to understand event propagation and controlled/uncontrolled state. Propose an approach before implementing.

## Planning

For non-trivial changes (>20 lines, new feature, architectural): write a plan stating which files change, the approach, and the risks. Wait for confirmation. Use `/plan`.
