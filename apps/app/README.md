# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [oxc](https://oxc.rs) for Fast Refresh on Vite 8 (which is [Rolldown](https://vite.dev/guide/rolldown)-native). The React Compiler runs through [@rolldown/plugin-babel](https://www.npmjs.com/package/@rolldown/plugin-babel) — see `vite.config.ts`.
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Linting

This app uses [OxLint](https://oxc.rs/docs/guide/usage/linter) for linting. The configuration is in `oxlint.json` which extends the root config and adds the TanStack Router plugin.
