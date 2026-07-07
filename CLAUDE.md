# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A small single-page "Treasure Hunt" game: three treasure chests are rendered, one hides treasure, the other two hide a skeleton. Clicking a chest opens it, adjusts the score (+$100 for treasure, -$50 for skeleton), and ends the game once the treasure is found or all chests are opened. This repo is also used as a teaching sandbox for Claude Code itself — see `README.md` for the walkthrough of prompts/commands used to build it up (screenshot-driven UI edits, `/init`, plan mode, custom slash commands for Vercel/GitHub Pages deploy, etc.).

## Commands

```
npm install     # install dependencies
npm run dev     # starts Vite (port 3000) AND the Express API (port 3001) together via concurrently
npm run build   # production build to ./build
npm start       # runs the Express server, which serves the built frontend + API from one process/port
```

There is no test runner, linter, or `tsconfig.json` configured in this repo. `npm run build` runs Vite/esbuild transpilation only — it does not type-check, so type errors will not fail the build.

`node:sqlite` (used by the backend, see below) is still experimental on the installed Node line (v22.x) and only loads behind the `--experimental-sqlite` CLI flag. This flag is already baked into the `dev:server`/`start` scripts in `package.json` — no manual flag-passing needed.

## Architecture

- **Entry point**: `src/main.tsx` mounts `src/App.tsx` into `#root` (defined in `index.html`) and imports `src/index.css` for global styles.
- **All game logic lives in `src/App.tsx`**: chest state (`Box[]` with `id`/`isOpen`/`hasTreasure`), score, and game-over state are plain `useState` in the single `App` component — there is no router, store, or context. When making changes to game behavior, this is the one file to edit.
- **Auth/session state also lives in `src/App.tsx`** (`session`, `isGuest`, `checkingSession`), backed by `src/lib/api.ts` (fetch wrapper for `/api/signup`, `/api/signin`, `/api/logout`, `/api/me`, `/api/score`) and `src/components/AuthScreen.tsx` (sign up/in form + "Continue as Guest"). Guest mode never calls the API — score is only persisted when `session` is set.
- **Animations** use `motion/react` (Motion, the successor to Framer Motion) directly in JSX (`motion.div`, `whileHover`, `animate`, etc.).
- **Assets**: chest art in `src/assets/`, sound effects in `src/audios/` — imported directly as ES modules and referenced by path (e.g. `import closedChest from './assets/treasure_closed.png'`).

### Backend (`server/`)

This app is no longer purely static. `server/index.js` is an Express app backing `/api/*` for auth and score persistence:

- `server/db.js` — opens `server/data/game.db` via Node's built-in `node:sqlite` module (`DatabaseSync`), not an npm SQLite package (avoids native compilation on Windows). Single `users` table (`id`, `username`, `password_hash`, `salt`, `score`, `created_at`) — score is overwritten per completed game, not tracked as history.
- `server/auth.js` — password hashing via Node's built-in `crypto.scrypt` + per-user random salt, compared with `crypto.timingSafeEqual`.
- Sessions via `express-session`, cookie-based, default in-memory store — restarting the server logs everyone out but never touches persisted account/score data in SQLite.
- `server/data/` is gitignored and created on first run.
- **Dev**: Vite proxies `/api` to Express (`vite.config.ts` `server.proxy`), so both run on one apparent origin (localhost:3000) with no CORS config needed.
- **Production**: Express serves `build/` directly (`npm run build` then `npm start`) — single process, single port.
- **Deployment model change**: this app can no longer be deployed as static files only (e.g. plain GitHub Pages) — auth/score require a persistent Node process. A static-only deploy would still load the page but signup/signin/score would have nothing to talk to.

### UI components (shadcn/ui, Figma-Make-style export)

`src/components/ui/` contains a full shadcn/ui component set (button, dialog, form, sidebar, chart, etc.) plus `src/components/figma/ImageWithFallback.tsx`. These files use **versioned import specifiers** for their dependencies, e.g.:

```ts
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva } from "class-variance-authority@0.7.1";
```

This only resolves because `vite.config.ts` maps each versioned specifier to the real package name via `resolve.alias`. **If you add a new shadcn/ui component or otherwise introduce one of these versioned imports, add a matching alias entry in `vite.config.ts`** (or the import will fail to resolve). The `@` alias also resolves to `./src`.

Most of this UI kit is not currently wired into the app — `Button`, `Input`, `Label`, and `Card` are used (in `App.tsx` and `src/components/AuthScreen.tsx`); the rest are available building blocks rather than active code paths.

### Styling

- `src/index.css` is a **compiled Tailwind CSS v4 build output** (large, generated file with `@layer properties`/utility classes) — do not hand-edit its generated utility layers. It is the stylesheet actually loaded by `main.tsx`.
- `src/styles/globals.css` defines the design-token CSS variables (`--background`, `--primary`, `--radius`, light/dark theme via `.dark`, and the `@theme inline` mapping used by Tailwind v4) but **is not imported anywhere** — it's a leftover template file. If theme tokens need to change, confirm which file is actually taking effect before editing.
- `src/guidelines/Guidelines.md` is an empty template for project-specific design-system rules (currently unfilled).
