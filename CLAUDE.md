# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal portfolio site (victorvillazon.com) built with Next.js (Pages Router), React 18, and Tailwind CSS 3. Deployed on Vercel with `@vercel/analytics`. UI copy is in Spanish. Plain JavaScript/JSX — no TypeScript.

## Commands

- `npm run dev` — dev server at http://localhost:3000 (falls back to 3001+ if the port is busy; check the output)
- `npm run build` — production build (the main correctness check; there are no tests)
- `npm run start` — serve the production build
- `npm run lint` — runs `next lint`; there is no ESLint config in the repo, and `next lint` was removed in Next.js 16, so this script may not work as-is
- `npm run phoenix` — wipes `node_modules`/lockfile and reinstalls (uses `rm`, so it needs a POSIX shell, not PowerShell)

## Architecture

- `pages/_app.js` wraps every page in `layouts/BaseLayout.jsx` and mounts Vercel `<Analytics />`. BaseLayout renders `components/StarField.jsx` (a fixed, animated space background at `z-0`) and puts Navbar + page + Footer in a `relative z-10` wrapper on top of it. Keep page sections free of opaque full-width backgrounds or the stars get hidden.
- `pages/index.js` is essentially the whole site: hero → `#skills` → `#projects` → `#contact` ("¿Construimos algo juntos?"). Projects (`cards`), skills (`skillGroups`, the five groups from the CV) and the filter tabs (`filters`) are module-level constants in this file — edit them there.
  - Card fields: `id`, `type` (`'react' | 'vue' | 'next.js'`), `image`, `title`, `content`, `tags`, `links: { live, repository, figma? }`, optional `isVip` ("Destacado" badge), `isLive` ("En producción" badge), `isHidden` (excluded from render), `collaborators: [{ name, link }]`.
  - Filter tabs match `card.type` exactly; add a `filters` entry when introducing a new type.
- `components/Card.jsx` maps `type` to a label and dot color via `TYPES`; unknown types fall back to `TYPES.default`.
- `components/Navbar.js` uses `react-scroll` to scroll to the element ids `skills`, `projects` and `contact` (with `offset={-72}` for the sticky header). `pages/blog/index.js` is a placeholder.
- StarField generates star positions with a fixed-seed PRNG so server and client markup match; its keyframes and classes (`.sky`, `.twinkle-*`, `.nebula-*`, `.shooting-star`) live in `styles/globals.css` and are disabled under `prefers-reduced-motion`.
- `pages/_index.js`, `pages/api/hello.js`, and `styles/Home.module.css` are leftover create-next-app boilerplate (the leading underscore keeps `_index.js` from being a route).

## Styling and assets

- Installed Tailwind is 3.2.4: newer palette steps like `zinc-950` / `yellow-950` do not exist. Use the custom tokens in `tailwind.config.js` instead: `space` (page background), `ink`, `surface` (cards), `raised` (chips/controls), `line` (borders), `accent` (amber #fbbf24), plus `react`, `vue`, `next` for card type dots.
- Fonts are Geist (`font-sans`) and Geist Mono (`font-mono`), loaded via the Google Fonts import in `styles/globals.css`.
- `npm run dev` re-appends a "nextjs-agent-rules" block to this file; that is expected.
- Project screenshots live in `public/images/` as `.webp` (recent commits converted card images to webp); reference them as `/images/<name>.webp`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
