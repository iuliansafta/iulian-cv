# AGENTS.md

Personal landing page for iulian.cloud: a single-page Vite 6 + React 18 site, plain CSS, no UI framework. Mirrors ../vora-landing. The GitHub repo is **public**.

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
- The CV PDFs in the repo root are git-ignored on purpose (phone number, personal address). Never commit them.

## CV

- `yarn cv` builds one PDF per entry in `VARIANTS` (`cv/build.ts`) into `cv/out/`, from `content.ts` via headless Chromium: general, SRE, Blockchain, and Platform (platform/DevOps roles). A variant owns only its title, headline, profile and optional location line; everything else is picked and reordered by index from `content.ts`, never reworded. Only CV-specific copy (those, plus the iulian.cloud entry) lives in `cv/build.ts`.
- The phone number is read from the git-ignored `cv/private.json`; never put it in a tracked file.
- Cover letters are `cv/letters/*.md` (format in `parseLetter`), one page each, with the header of the CV variant they name. The folder is git-ignored because letters name the companies Iulian applies to; never name a prospective employer in a tracked file (code comments included). Letters make the same factual claims as the CV, nothing more.
- Keep every variant to two A4 pages, one column (screeners read in order). Check with `pdfinfo` (pages), `pdftotext` (reading order) and a render.
- `cv/fonts/` holds static font instances on purpose: Chromium embeds variable fonts as Type 3, which some CV parsers can't read. `pdffonts` should list only TrueType.

## Layout

- `src/App.tsx` renders `src/landing/Console.tsx`, the whole page. `DotAscii.tsx` is the hero portrait.
- The two most recent jobs are always expanded in the career trace (`PINNED` in `Console.tsx`); older ones open on click, one at a time.
- The other explored directions (Terminal, Orbital, Signal, and the switcher) live only on the `design/explorations` branch.

## Styling

- All selectors are scoped under `.cn` in `src/landing/console.css`, with colour tokens at the top. Dark only: black, off-white, one red accent; green only where a terminal would use it (prompt, OK, diff additions).
- Fonts are self-hosted in `src/shared/fonts/` via `fonts.css` (all OFL). Don't add font CDNs.
- `useReveal` adds `is-in` straight to `[data-reveal]` nodes. Never give such a node a `className` that changes after mount (open/active states): React rewrites the attribute, drops `is-in`, and the element fades out. Put state on a child or in `aria-*`/`data-*`.
- Keep `prefers-reduced-motion` support when adding animation (`useReducedMotion` plus the CSS block at the end of the stylesheet). Canvas effects stop their animation loops when reduced.
