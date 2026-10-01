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
- `src/scripts/client.ts` adds the interactive bits: the work-loop walker,
  list-diff tabs, table wrapping and Mermaid rendering.

## Stack

Astro 7 (static output, Shiki highlighting), Mermaid (loaded only on pages
with sequence diagrams), Inter via Fontsource. `lodash-es` is pinned through
`overrides` to a patched release, because Mermaid's parser dependency pulls an
older one.

## Deploying to GitHub Pages

`site` and `base` are set in `astro.config.mjs`; all links are base-aware.

Live: https://giorgistrat.github.io/react-internals/ — redeploy with `npm run deploy`
(builds, then force-pushes `dist/` to the `gh-pages` branch).
