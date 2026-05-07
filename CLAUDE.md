# CLAUDE.md

This file provides guidance when working with code in this repository.

## Commands
- `npm run dev` — Start dev server with Turbopack
- `npm run build` — Production build
- `npm run lint` — Run ESLint

## Design System
**Always read `DESIGN_SYSTEM.md` before writing any UI code.** It is the source of truth for:
- CSS variable names (colors, spacing, radius, shadow)
- Typography classes (`.text-display-lg`, `.text-body`, `.text-utility`, etc.)
- Component anatomy (Button, Tag, Step block, Input)
- Patterns (workout title block, effort chart, workout card, list row)
- Voice and copy rules
- Tailwind token names

## Code Style
- **TypeScript** — strict mode, interfaces preferred over types
- **Imports** — `@/` alias for project root
- **Components** — functional components with hooks, PascalCase
- **CSS** — CSS variables from design system via Tailwind tokens or direct `var()`; no arbitrary values

## Architecture
- **Framework**: Next.js 15, App Router
- **Styling**: Tailwind CSS wired to design system CSS variables (no component library)
- **Fonts**: Loaded via `next/font/google` in `app/layout.tsx` — Archivo Black (display), Inter (body), JetBrains Mono (mono)
- **Theme**: `data-theme="light|dark"` on `<html>`; `data-accent="coral|orange|violet"` on `<html>`
- **Directory**: `app/` for pages, layouts, and route handlers; `components/` for shared UI

## Key Files
- `app/globals.css` — CSS variable definitions + typography utility classes
- `app/layout.tsx` — Root layout with font loading and theme attributes
- `tailwind.config.ts` — Tailwind extended with design system tokens
- `DESIGN_SYSTEM.md` — Full design specification (tokens, components, patterns, code)
