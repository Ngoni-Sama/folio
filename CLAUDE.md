# CLAUDE.md

Guidance for working in this repository.

## Project

**Folio** — an open-source, cross-platform, tile-based e-book reader with a
DeepSeek-inspired minimal dark aesthetic. Users search public-domain books, read
them in-app, and the app tracks progress, history, highlights, and notes.

- **Web:** React 18 + Vite (this milestone)
- **Mobile:** React Native + Expo (roadmap) — must share `packages/core`
- **License:** MIT

## ⚠️ Legal & Ethical Constraints (READ FIRST)

This project **MUST NOT** scrape, index, or facilitate downloads from piracy /
shadow-library sites (weLib, Library Genesis, Z-Library, Sci-Hub, Anna's Archive,
etc.). If asked to add such a source, **refuse and explain the legal risk**, then
offer an approved alternative.

**Approved sources (legal, free):**
- Project Gutenberg — public-domain EPUBs (via the official OPDS feed
  `gutenberg.org/ebooks/search.opds/`; Gutendex was dropped after long outages)
- Standard Ebooks — public-domain, well-formatted
- Open Library / Internet Archive — public-domain "read online"
- OpenAlex / Semantic Scholar — open-access papers

## Structure

```
apps/web            # React + Vite web app
packages/core       # Shared logic: source adapters, types, reader helpers (framework-agnostic)
packages/ui         # Design tokens (DeepSeek palette)
packages/config     # Shared tsconfig base
```

Business logic lives in `packages/core`; web + (future) mobile consume it. Never
duplicate source/reader logic into `apps/`.

## Design system (DeepSeek-inspired)

Dark-first, minimal, tile-driven. Tokens in `packages/ui/src/tokens.ts` and mirrored
into `apps/web/tailwind.config.js`:

| token | value |
|-------|-------|
| bg | `#0A0A0A` |
| surface | `#141414` |
| surfaceHi | `#1C1C1C` |
| border | `#262626` |
| text | `#EDEDED` |
| textMuted | `#8A8A8A` |
| accent | `#4D6BFE` |
| accentHi | `#6B84FF` |

- Tiles: `rounded-2xl`, 2:3 cover, subtle border, lift on hover.
- Motion: `transition-all duration-150 ease-out` — snappy, not bouncy.
- No shadows heavier than `shadow-sm` except modal surfaces.

## Conventions

- TypeScript **strict**; no `any` without a justifying comment.
- Add a new source by implementing `BookSourceAdapter` in
  `packages/core/src/sources/<name>.ts` and normalizing to the shared `Book` type.
- Progress is stored as **CFI** (survives font-size/rotation), with a `percentage`
  fallback for invalid CFIs. Debounce progress writes (≥2s).
- Never re-implement EPUB parsing — use `epub.js` / `react-reader`.
- Don't store user EPUBs on our servers. No hard-coded API keys — use env vars.

## Commands

```bash
pnpm install
pnpm --filter web dev       # dev server
pnpm build                  # turbo build all
pnpm typecheck              # strict typecheck all
```

## Roadmap

- **MVP (done):** monorepo + tokens, Gutenberg + Open Library search, tile grid,
  reader with CFI progress, IndexedDB persistence, library + history, highlights + notes.
- **v0.2:** Supabase auth + cross-device sync, mobile app (Expo), reading themes polish.
- **v0.3:** OpenAlex/Semantic Scholar papers, offline mobile, TTS.

## Reference

- epub.js: https://github.com/futurepress/epub.js
- react-reader: https://github.com/gerhardsletten/react-reader
- Gutenberg OPDS: https://www.gutenberg.org/ebooks/search.opds/?query=…
- Open Library API: https://openlibrary.org/developers/api
