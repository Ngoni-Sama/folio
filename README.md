# Folio 📖

A sleek, **tile-based e-book reader** for free, public-domain books — dark-mode-first,
minimal, DeepSeek-inspired. Search thousands of titles, read them in-app, and pick up
exactly where you left off.

> **Legal & ethical:** Folio only uses legal, free sources (Project Gutenberg, Open
> Library). It does **not** integrate shadow libraries (LibGen, Z-Library, Sci-Hub,
> Anna's Archive, etc.). See [CLAUDE.md](./CLAUDE.md).

## Features (MVP)

- 🔍 Parallel search across **Project Gutenberg** + **Open Library**, deduped into a tile grid
- 📚 In-app **EPUB reader** (`epub.js` / `react-reader`) with CFI-based progress
- ⏱️ Resume where you left off — progress persisted per book
- 🗂️ **Library** (filter: reading / finished / unread) and **History**
- 🖍️ **Highlights & notes** with Markdown export
- 🎨 Reading themes (dark / sepia / light), font-size controls
- 💾 100% local persistence via **IndexedDB** — no account required

Sync (Supabase), annotations across devices, and a mobile app (Expo) are on the roadmap.

## Stack

- Monorepo: **pnpm workspaces + Turborepo**
- Web: **React 18 + Vite + TypeScript (strict)**
- Styling: **Tailwind CSS**
- State: **Zustand** (IndexedDB-persisted) + **TanStack Query**
- Reader: **react-reader** (wraps `epub.js`)

## Structure

```
apps/web            # React + Vite web app
packages/core       # Shared logic: source adapters, types, reader helpers
packages/ui         # Design tokens (DeepSeek palette)
packages/config     # Shared tsconfig base
```

## Getting started

```bash
pnpm install
pnpm --filter web dev     # http://localhost:5173
```

Other commands:

```bash
pnpm build         # build all (turbo)
pnpm typecheck     # strict typecheck all packages
pnpm --filter web build
```

## How reading works (CORS)

`www.gutenberg.org` doesn't send CORS headers, so EPUBs are loaded **same-origin**
through `/proxy/gutenberg`:

- **Dev:** Vite dev-server proxy (`apps/web/vite.config.ts`)
- **Prod:** Cloudflare Pages Function (`functions/proxy/gutenberg/[[path]].js`)

## Deploy (Cloudflare Pages — free)

Connect the GitHub repo in the Cloudflare dashboard → **Workers & Pages → Create → Pages**,
then set:

| Setting | Value |
|---------|-------|
| Root directory | *(leave as repo root)* |
| Build command | `pnpm --filter web build` |
| Build output directory | `apps/web/dist` |
| Environment variable | `NODE_VERSION=20` *(a `.node-version` file also sets this)* |

pnpm is auto-detected from `pnpm-lock.yaml`. The Gutenberg proxy runs as a Pages Function
(`functions/proxy/gutenberg/[[path]].js`) — no config needed, no secrets required for the MVP.
Every push to `main` auto-deploys; free SSL + global CDN are included.

CLI alternative:

```bash
pnpm --filter web build
npx wrangler pages deploy apps/web/dist --project-name folio
```

## License

MIT
