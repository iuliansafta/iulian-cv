# AGENTS.md

Personal landing page for iulian.cloud: a single-page Vite 6 + React 18 site, plain CSS, no UI framework. Mirrors ../vora-landing.

## Commands

- Package manager is **yarn classic** (`yarn.lock`). If `yarn` resolves to Berry, use `npx yarn@1 …`; don't create `.yarnrc.yml` or a `package-lock.json`.
- `yarn dev` serves on port 3000. `yarn build` writes to `build/` (not `dist/`); `vercel.json` tells Vercel.
- There is no test suite, linter or `tsconfig`; SWC does not type-check. Verify with `yarn build` plus a look in a browser at desktop and ~390px width.

## Content rules

- `src/shared/content.ts` holds every fact. Each must trace to the CVs in the repo root or to `../vora` / `../vora-probe`. Never invent employers, numbers, titles or clients.
- Vora and Vora Probe are side projects for learning Linux containers; Iulian does not run his own agents in Vora. His harnesses are OpenCode and Pi, with Claude now and then; he uses them to ship, reviews every line, and keeps slop out (he is not "harness-obsessed"). Don't write copy that says otherwise.
- Career start is January 2008 (from Iulian; the CVs' "15+" is outdated). The years figure is derived from `CAREER_START`; the meta tags in `index.html` say "since 2008". Never hardcode a year count.
- The e-mail is joined in the browser only on a visitor's action (`EMAIL_PARTS`, `useEmail`). Don't put the address in HTML, meta tags or `llms.txt`. No phone number anywhere.
- The vora repos are private; link to vora.sh, not GitHub.

## Styling

- Each variant scopes its selectors under its own prefix (`.tt`, `.ob`, `.sg`, `.cn`) and defines colour tokens at the top of its CSS. Dark only.
- Fonts are self-hosted in `src/shared/fonts/` via `fonts.css` (all OFL). Don't add font CDNs.
- `useReveal` adds `is-in` straight to `[data-reveal]` nodes. Never give such a node a `className` that changes after mount (open/active states): React rewrites the attribute, drops `is-in`, and the element fades out. Put state on a child or in `aria-*`/`data-*`.
- Keep `prefers-reduced-motion` support when adding animation (`useReducedMotion` plus the CSS block at the end of each stylesheet). Canvas effects stop their animation loops when reduced.
