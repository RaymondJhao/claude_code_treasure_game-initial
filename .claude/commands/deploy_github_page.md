---
description: Deploy this project's frontend to GitHub Pages and report the live URL
---

Deploy this repository's frontend to GitHub Pages and give the user the resulting URL.

- **Context**
  - This project is a **Vite/React** frontend backed by an **Express** + **`node:sqlite`** API in `server/`. GitHub Pages only serves **static files** — it cannot run the Express API.
  - Deploying here means **guest mode only**: signup/signin/score persistence will **not** work because there's no server process for `/api/*` to reach. Do **not** try to work around this with client-side hacks; that's a bigger, separate change. If the user needs working auth/score, point them at **`/deploy_vercel`** instead.
  - GitHub Pages **project sites** are served from `https://<user>.github.io/<repo>/`, so Vite needs `base: '/<repo>/'` in `vite.config.ts` or built asset URLs will 404. Skip this if deploying to a **user/org root page** (`<user>.github.io`) or a **custom domain**.
  - Re-check rather than assuming: at last check, this repo had **no git history** and **no GitHub remote configured**, and the **`gh` CLI was not installed** in this environment. Any of these may have changed — verify with `git status`, `git remote -v`, and `gh --version` before proceeding.
  - Use the **`gh-pages`** npm package to publish the built `build/` directory to a `gh-pages` branch — simpler and safer than a manual subtree push.

- **Steps**
  - Check `git status`.
    - If this isn't a git repo yet, run `git init` and make an initial commit of the working tree. Respect the existing `.gitignore` (don't force-add ignored paths like `node_modules/`, `build/`, `.vercel/`, `server/data/`).
  - Check `git remote -v` for `origin`.
    - If missing, check `gh --version` and `gh auth status`.
      - If `gh` is installed and authenticated: run `gh repo create` (ask the user for the repo name and visibility — public/private — if not obvious).
      - Otherwise: tell the user to create an empty repo on github.com and give you its URL, and **stop** until they confirm. Then `git remote add origin <url>`.
  - Push the source branch: `git push -u origin <current-branch>` (so the actual code is on GitHub, not just the built output).
  - Determine the repo name from the remote URL. If this is a project page (not a custom domain or user/org root page), check `vite.config.ts`'s `build` block for a `base` matching `/<repo>/` — add it if missing and commit that change.
  - Add `gh-pages` as a devDependency if not already present: `npm install -D gh-pages`.
  - Run `npm run build`.
  - Publish: `npx gh-pages -d build`.
  - **Report back**:
    - The **Pages URL**: `https://<user>.github.io/<repo>/` (or the custom domain, if one is configured).
    - A one-line reminder that **signup/login/score data will not work** on this deployment (no backend) — **guest mode is unaffected**. Mention **`/deploy_vercel`** as the option for a fully working deployment.
