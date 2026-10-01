# iulian.cloud

Personal landing page for Iulian Safta. Same stack as the vora.sh landing page:
Vite + React, plain CSS, no UI framework, self-hosted fonts, no third-party
requests. Dark only.

The design is **Console**: a terminal in a dot-matrix skin. A working shell
with a command palette folded in (suggestions as you type, `/` from anywhere),
a halftone portrait with an ASCII loupe, and the career as a trace you can open
like a `git log`.

The other explored directions (Terminal, Orbital, Signal) live on the
`design/explorations` branch.

## Run

```bash
yarn install
yarn dev        # http://localhost:3000
yarn build      # static site in build/
```

Deploys on Vercel as a static Vite build; `vercel.json` points it at `build/`.

## CV

```bash
yarn cv         # cv/out/Iulian_Safta_CV{,_SRE,_Blockchain,_Platform}.pdf (needs chromium on PATH)
```

The PDFs are built from the same `content.ts` as the site, so they can't
drift. The SRE, Blockchain and Platform variants pick and reorder the same facts
(`VARIANTS` in `cv/build.ts`). The phone number comes from `cv/private.json` (`{ "phone": "…" }`),
git-ignored like `cv/out/`.

Cover letters go in `cv/letters/<company>.md` (git-ignored) and build with the
CVs, one page each, under the header of the CV variant they name:

```text
cv: platform
file: Iulian_Safta_Cover_Letter_Company.pdf
to: Company | Team
subject: Application — Role
---
Dear …,

Paragraphs separated by blank lines. The signature is added.

Kind regards,
```

## Layout

| Path | What |
| --- | --- |
| `src/landing/` | the page: sections, shell, portrait, styles |
| `src/shared/content.ts` | every fact on the page — keep it traceable to the CVs and the vora repos |
| `src/shared/` | hooks, date helpers, fonts, the dot-field canvas |
| `public/` | favicon, portrait |
| `cv/` | the PDF CV: `build.ts` (HTML → Chromium → PDF), `cv.css`, static fonts |
