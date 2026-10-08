# React Handbook

A static site with everything a React developer should know, organized as a
learning path of modules (Fundamentals → Hooks → Advanced APIs → Patterns →
Performance → Suspense → Internals), with diagrams, step-through animations,
highlighted code and real output recorded from example apps.

```bash
npm install
npm run dev      # syncs notes from the vault, then starts http://localhost:4321
npm run build    # syncs + builds to dist/
```

## How it works

- `src/lib/modules.mjs` lists the modules in learning-path order; each
  module's notes are in `src/lib/notes/<module>.mjs`. Pages live at
  `/<module>/` and `/<module>/<slug>/` (old `/notes/<slug>/` URLs redirect).
- `scripts/sync-notes.mjs` converts every note (wikilinks across modules,
  🔴/🟡/⚪ labels, Interview Q&A, figures) into
  `src/content/notes/<module>/<slug>.md`. React Internals comes from the vault
  (`~/Nexus/40 Resources/Engineering/JavaScript/React`, override with
  `NEXUS_REACT_DIR`); the other modules are rewritten for the site in
  `content/<module>/`. The output is committed so the repo builds without the
  vault (the sync is skipped when the vault is missing).
- `src/lib/diagrams.mjs` holds every diagram (HTML/SVG, plus two Mermaid
  sequence diagrams). `REPLACE_BLOCKS` and `INSERT_AFTER` in the sync script
  decide where each one goes. The sync fails loudly if a target heading or
  ASCII block disappears from a note.
- `src/lib/illustrations.mjs` draws the isometric card illustrations.
- `src/scripts/client.ts` adds the interactive bits: search (Pagefind), the
  theme toggle, the current-section highlight in the table of contents, read
  tracking, copy buttons, heading links, the Interview Q&A quiz and the
  self-check checkboxes. Everything a viewer marks is kept in their browser
  (`localStorage`) only.
- `src/scripts/anim.ts` runs the step-through animations (slider, speed,
  pause when off-screen); `src/lib/anim.mjs` builds them and their legend.

## Site-only card: How React Works, Start to Finish

`content/internals/How React Works, Start to Finish.md` is written in this repo (not the
vault). It follows the demo app in `examples/how-react-works` and uses
build-time markers (`<!-- source -->`, `<!-- compiled -->`, `<!-- trace -->`,
`<!-- tree -->`, `<!-- element -->`, `<!-- figure -->`, documented at the top of
`scripts/sync-notes.mjs`) that pull in real output:

```bash
cd examples/how-react-works
npm install
npm run compile   # Babel (automatic / dev / classic) + Vite output → generated/compiled
npm run trace     # React call order via Chrome DevTools logpoints → generated/trace.json
```

Its animations live in `src/lib/animations-hrw.mjs`.

## The shared example app: product store

`examples/product-store` is one small Vite + React 19.2.5 app used by every
module except React Internals. Each topic is a lesson
(`src/lessons/<module>/<lesson>.tsx`, opened with `/?lesson=…`). The notes in
`content/<module>/` embed its real code and recorded results with markers
(`<!-- source region -->`, `<!-- compiled -->`, `<!-- output -->`, documented
in `scripts/sync-notes.mjs`):

```bash
cd examples/product-store
npm install
npm run dev       # browse the lessons
npm run record    # Babel output + run every lesson in Chrome → generated/*.json
```

Mark a snippet with `// #region name` … `// #endregion` (or the `{/* */}` form
in JSX) to embed only that part.

## Stack

Astro 7 (static output, Shiki highlighting), Pagefind (static search index,
built by `npm run build`), Inter via Fontsource. Diagrams are hand-written
HTML/SVG; there is no diagram library. `node scripts/og-image.mjs`
regenerates the link-preview image `public/og.png`.

## Deploying to GitHub Pages

`site` and `base` are set in `astro.config.mjs`; all links are base-aware.

Live: https://giorgistrat.github.io/react-handbook/ — redeploy with `npm run deploy`
(builds, then force-pushes `dist/` to the `gh-pages` branch).

## PDFs

`npm run pdf` builds, then writes one folder per module (each note plus a
combined PDF) to `~/Desktop/React Handbook PDFs/`, printed in the light theme.
