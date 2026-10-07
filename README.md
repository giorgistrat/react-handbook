# React Internals — illustrated

A static site that presents the *React Internals* notes from the Nexus vault
with diagrams, interactive walkthroughs and highlighted code.

```bash
npm install
npm run dev      # syncs notes from the vault, then starts http://localhost:4321
npm run build    # syncs + builds to dist/
```

## How it works

- `scripts/sync-notes.mjs` reads the notes from the vault folder
  (`VAULT_DIR` in `src/lib/notes-meta.mjs`), converts Obsidian syntax
  (wikilinks, 🔴/🟡/⚪ labels, Interview Q&A) and injects figures, writing
  `src/content/notes/*.md`. They are committed so the repo builds without the vault (the sync is skipped when the vault is missing); edit the vault, not them.
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

`content/How React Works, Start to Finish.md` is written in this repo (not the
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

## Stack

Astro 7 (static output, Shiki highlighting), Pagefind (static search index,
built by `npm run build`), Inter via Fontsource. Diagrams are hand-written
HTML/SVG; there is no diagram library. `node scripts/og-image.mjs`
regenerates the link-preview image `public/og.png`.

## Deploying to GitHub Pages

`site` and `base` are set in `astro.config.mjs`; all links are base-aware.

Live: https://giorgistrat.github.io/react-internals/ — redeploy with `npm run deploy`
(builds, then force-pushes `dist/` to the `gh-pages` branch).
