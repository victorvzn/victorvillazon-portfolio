# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal portfolio site (victorvillazon.com) built with Next.js (Pages Router), React 18, and Tailwind CSS 3. Deployed on Vercel with `@vercel/analytics`. UI copy is in Spanish. Plain JavaScript/JSX — no TypeScript.

## Commands

- `npm run dev` — dev server at http://localhost:3000
- `npm run build` — production build (the main correctness check; there are no tests)
- `npm run start` — serve the production build
- `npm run lint` — runs `next lint`; there is no ESLint config in the repo, and `next lint` was removed in Next.js 16, so this script may not work as-is
- `npm run phoenix` — wipes `node_modules`/lockfile and reinstalls (uses `rm`, so it needs a POSIX shell, not PowerShell)

## Architecture

- `pages/_app.js` wraps every page in `layouts/BaseLayout.jsx` (Navbar + Footer on a gray background) and mounts Vercel `<Analytics />`.
- `pages/index.js` is essentially the whole site. Portfolio projects (`cards`) and skills (`skills`) are hardcoded arrays in `useState` inside this file — adding or editing a project means editing the `cards` array here.
  - Card fields: `id`, `type` (`'react' | 'vue' | 'next.js' | ...`), `image`, `title`, `content`, `tags`, `links: { live, repository, figma? }`, optional `isVip` (star badge), `isHidden` (excluded from render), `collaborators: [{ name, link }]`.
  - The filter tabs (Todos / React.js / Vue.js) match `card.type` exactly.
  - Skills are rendered in a 5-column grid split by `type` (`competent` / `familiar`); entries with `isEmpty: true` and `name: ''` are intentional spacers that align rows in the grid.
- `components/Card.jsx` maps `type` to border/background classes via a `types` lookup (`default`, `react`, `vue`). **A card whose `type` is not in that map will crash** (destructuring `undefined`). Add an entry there whenever a card uses a new `type`.
- `components/Navbar.js` uses `react-scroll` to smooth-scroll to element ids `top` and `projects`; the Blog link is hidden. `pages/blog/index.js` is a placeholder.
- `pages/_index.js`, `pages/api/hello.js`, and `styles/Home.module.css` are leftover create-next-app boilerplate (the leading underscore keeps `_index.js` from being a route).

## Styling and assets

- Tailwind custom colors in `tailwind.config.js`: `primary`, `secondary`, `react` (#61DAFB), `vue` (#42D392) — used as `border-react`, `bg-vue`, etc. Default font is Lato.
- Project screenshots live in `public/images/` as `.webp` (recent commits converted card images to webp); reference them as `/images/<name>.webp`.
