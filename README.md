# iulian.cloud

Personal landing page for Iulian Safta. Same stack as the vora.sh landing page:
Vite + React, plain CSS, no UI framework, self-hosted fonts, no third-party
requests. Dark only.

The design is **Console**: a terminal in a dot-matrix skin. A working shell
with a command palette folded in (suggestions as you type, `⌘K` or `/` from
anywhere), a halftone portrait with an ASCII loupe, and the career as a trace
you can open like a `git log`.

The other explored directions (Terminal, Orbital, Signal) live on the
`design/explorations` branch.

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
| `src/landing/` | the page: sections, shell, portrait, styles |
| `src/shared/content.ts` | every fact on the page — keep it traceable to the CVs and the vora repos |
| `src/shared/` | hooks, date helpers, fonts, the dot-field canvas |
| `public/` | favicon, portrait |
