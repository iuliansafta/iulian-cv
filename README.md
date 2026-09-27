# iulian.cloud

Personal landing page for Iulian Safta. Same stack as the vora.sh landing page:
Vite + React, plain CSS, no UI framework, self-hosted fonts, no third-party
requests. Dark only.

Four design directions live behind a switcher (keys `1`–`4`, `h` hides it):

| Key | Variant | Idea |
| --- | --- | --- |
| `1` | **Terminal** (`#terminal`) | A working shell (`help`, `vora`, `sudo hire-me`…), an ASCII portrait that decodes under the cursor, experience as `git log --graph` |
| `2` | **Orbital** (`#orbital`) | Mission-control HUD: companies orbit the portrait, a mission log you can filter by technology, Vora's containment layers |
| `3` | **Signal** (`#signal`) | Dot-matrix type on pure black, a cursor-reactive dot field and halftone portrait, `⌘K` palette, career as a distributed trace |
| `4` | **Console** (`#console`) | A × C: A's shell with C's palette folded in (suggestions as you type, `⌘K`/`/`), a halftone portrait with an ASCII loupe, the career trace as a `git log` with diffs |

Once one is chosen, render it directly from `src/App.tsx` and drop the
switcher, as vora-landing did.

## Run

```bash
yarn install
yarn dev        # http://localhost:3000
yarn build      # static site in build/
```

Deploys on Vercel as a static Vite build; `vercel.json` points it at `build/`.

## Layout

| Path | What |
| --- | --- |
| `src/shared/content.ts` | every fact on the page — keep it traceable to the CVs and the vora repos |
| `src/shared/` | hooks, date helpers, fonts, the dot-field canvas, variant switcher |
| `src/variants/<name>/` | one directory per design direction, its CSS scoped under its own prefix |
| `public/` | favicon, portrait |
