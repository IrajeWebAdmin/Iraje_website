# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Critical: read the Next.js docs before writing Next.js code

This repo runs **Next.js 16.2.9** (App Router) — newer than training data, with breaking changes (see `AGENTS.md`). Before using any Next.js API, read the matching guide under `node_modules/next/dist/docs/01-app/` (the `01-app/` tree is App Router; `02-pages/` is the legacy Pages Router and is **not** used here). Heed deprecation notices.

## Commands

```bash
npm run dev      # dev server at http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
```

There is **no lint or test setup** — no ESLint config, no test runner, no scripts beyond the three above. Prettier (with `prettier-plugin-tailwindcss`) is installed for formatting but not wired to a script.

## Stack

- **Next.js 16 App Router**, **React 19**, JavaScript only (no TypeScript; `jsconfig.json` only defines the `@/*` → `src/*` path alias).
- **React Compiler is enabled** (`reactCompiler: true` in `next.config.mjs` + `babel-plugin-react-compiler`). Do **not** add manual `useMemo` / `useCallback` / `React.memo` — the compiler handles memoization.
- **Tailwind CSS v4** via `@tailwindcss/postcss` (no `tailwind.config.js`; config lives in CSS). `framer-motion` for animation. `react-icons` for icons.

## Architecture

The site is a marketing/product site composed from section components driven by separate content files.

- **`src/app/`** — App Router. `layout.js` wraps **every** page with `HomeNavbar` + `HomeFooter` and applies the Poppins font globally. `page.js` (home) is a thin composition of section components in render order.
- **`src/components/<Section>/`** — UI grouped by page section: `Home/`, `Navbar/`, `Footer/`. Navbar and Hero have **per-section variants** (`HomeNavbar`/`EpmNavbar`, `Hero`/`EpmHero`), anticipating distinct page layouts beyond the home page.
- **`src/data/*.js`** — the content layer. Each file `export default`s a plain array/object of content (e.g. `product.js`, `whyIraje.js`, `testimonials.js`). Section components import these and `.map()` over them. **Edit copy/content here, not inline in JSX.**
- **`public/`** — static assets referenced by absolute path: `images/`, `icons/` (SVGs), `navbar/`.

### Server vs Client components

Components are **Server Components by default**. Add `"use client"` only when a component needs interactivity — local state, event handlers, or `framer-motion` (which requires the client). Examples of client components: `ProductCards` (uses `useState`), `ProductCard`/`WhyIraje` (framer-motion), `HomeNavbar` (mobile menu state). Keep purely presentational sections (e.g. `Hero`) as server components.

### Styling conventions

- Tailwind utility classes inline in JSX. Brand blue is `#0451CC`, applied via arbitrary values like `text-[#0451CC]` / `border-[#0451CC]`.
- One custom global utility, **`.container-global`** (defined in `src/app/globals.css`), is the standard page-width wrapper (`max-width: 1600px` + horizontal padding). Use it for new section containers rather than re-deriving `mx-auto max-w-* px-*`.

## Current state notes

- Only the **home route** exists. `HomeNavbar` links to routes (`/products`, `/university`, `/contact`, etc.) that are **not yet built**.
- `layout.js` still has placeholder metadata (`title: "Create Next App"`); per-page `metadata` exports (as in `page.js`) override it for that route.
