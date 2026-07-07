---
description: Deploy this project to Vercel and report the live URL
---

Deploy this repository to Vercel and give the user the resulting URL.

- **Context**
  - This project is a **Vite/React** frontend backed by an **Express** + **`node:sqlite`** API in `server/`, wired for **Vercel** via `vercel.json` (`@vercel/static-build` for the frontend, `@vercel/node` for `server/index.js`, `/api/*` routed to the function).
  - Vercel's serverless functions have a **read-only filesystem** outside `/tmp`, and `/tmp` **does not persist** across invocations or cold starts, so the SQLite-backed accounts/sessions/scores are **demo-only** in this deployment — they can reset at any time.
  - Do **not** try to "fix" this by adding a **hosted database** unless the user asks; that's a bigger, separate change.

- **Steps**
  - Check for the **Vercel CLI** (`vercel --version`); if missing, use **`npx vercel`** for the remaining steps instead of installing it globally.
  - Check auth with **`vercel whoami`**.
    - If not logged in, tell the user to run **`vercel login`** themselves (it requires an interactive browser/email confirmation you cannot complete on their behalf) and **stop** until they confirm they're logged in.
  - From the repo root, run **`vercel --prod --yes`** (first run will also **link the project** — accept sensible defaults, or prompt the user if a choice isn't obvious).
  - **Report back**:
    - The **production URL** Vercel prints.
    - A one-line reminder that **signup/login/score data** on this deployment is **not durable** (serverless filesystem is ephemeral) — **guest mode is unaffected**.
