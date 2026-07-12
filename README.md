# Turborepo Tailwind CSS starter

> **Using this as a boilerplate?** Follow [`docs/getting-started.md`](docs/getting-started.md)
> to backfill the placeholders (vision, context, design tokens, database, MCP, skills) and
> strip the demo. Agents: `CLAUDE.md` is the charter; `/bootstrap` runs the setup flow.

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `app`: a [Vite](https://vite.dev/) + React app with [Tailwind CSS](https://tailwindcss.com/)
- `@repo/ui`: a React component library with [Base UI](https://base-ui.com/) and [Tailwind CSS](https://tailwindcss.com/) shared by apps
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo
- `@repo/tailwind-config`: shared Tailwind CSS configuration
- `@repo/vitest-config`: shared Vitest configuration

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Building packages/ui

This example is set up to produce compiled styles for `ui` components into the `dist` directory. This was chosen for several reasons:

- Make sharing one `tailwind.config.ts` to apps and packages as easy as possible.
- Make package compilation simple by only depending on `tsc` and `tailwindcss`.
- Maintain clear package export boundaries.

Another option is to consume `packages/ui` directly from source without building. If using this option, you will need to update the `tailwind.config.ts` in your apps to be aware of your package locations, so it can find all usages of the `tailwindcss` class names for CSS compilation.

For example:

```js
  content: [
    // app content
    `src/**/*.{js,ts,jsx,tsx}`,
    // include packages if not transpiling
    "../../packages/ui/*.{js,ts,jsx,tsx}",
  ],
```

If you choose this strategy, you can remove the `tailwindcss` and `autoprefixer` dependencies from the `ui` package.

### Utilities

This Turborepo has some additional tools already setup for you:

- [Base UI](https://base-ui.com/) for unstyled, accessible components
- [Tailwind CSS](https://tailwindcss.com/) for styles
- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [OxLint](https://oxc.rs/docs/guide/usage/linter) for code linting
- [OxFmt](https://oxc.rs/docs/guide/usage/formatter) for code formatting
- [Vitest](https://vitest.dev/) for testing
