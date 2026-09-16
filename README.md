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
- **Prod:** rewrite in `apps/web/vercel.json`

## Deploy (Vercel)

Set the project root to `apps/web` (or use the included `vercel.json`). Build command
`pnpm build`, output `dist`. No secrets required for the MVP.

## License

MIT
