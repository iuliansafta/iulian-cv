# iulian.cloud

The personal landing page of Iulian Safta. It uses the same stack as the
vora.sh landing page: Vite and React, plain CSS with no UI framework, and
self-hosted fonts. The page makes no third-party requests and has only a dark
theme.

The design, Console, is a terminal set in dot-matrix type. It has a working
shell that suggests commands as you type, and `/` focuses the shell from
anywhere on the page. It also has a halftone portrait with an ASCII loupe, and
a career trace that opens like a `git log`.

The `design/explorations` branch keeps the other designs: Terminal, Orbital and
Signal.

## Run the site

The repo uses yarn classic. If `yarn` resolves to Berry, run `npx yarn@1`
instead.

```bash
yarn install
yarn dev        # http://localhost:3000
yarn build      # static site in build/
```

Vercel deploys the site as a static Vite build. `vercel.json` points Vercel at
`build/`.

## Build the CVs

`yarn cv` needs `chromium` on your `PATH`.

```bash
yarn cv         # cv/out/Iulian_Safta_CV.pdf and one PDF per other variant
```

The PDFs use the same `content.ts` as the site, so the two can't drift. Each
variant in `VARIANTS` (`cv/build.ts`) picks and reorders the same facts. It
never rewords them.

The build reads the phone number from `cv/private.json` (`{ "phone": "…" }`).
That file and `cv/out/` are git-ignored.

To add a cover letter, create `cv/letters/<company>.md`. The folder is
git-ignored. `yarn cv` builds each letter as a one-page PDF, under the header
of the CV variant that its `cv:` line names. The date defaults to today. Add a
`date:` line to set it.

```text
cv: platform
file: Iulian_Safta_Cover_Letter_Company.pdf
to: Company | Team
subject: Application for Role
---
Dear …,

Paragraphs separated by blank lines. The build adds the signature.

Kind regards,
```

## Where things live

| Path | Contents |
| --- | --- |
| `src/landing/` | The page: sections, shell, portrait and styles. |
| `src/shared/content.ts` | Every fact on the page. Each one traces to the CVs or the vora repos. |
| `src/shared/` | Hooks, date helpers, fonts and the dot-field canvas. |
| `public/` | The favicon and the portrait. |
| `cv/` | The PDF CVs and cover letters. `build.ts` renders HTML and prints it to PDF with Chromium. `cv.css` styles the PDFs, and `fonts/` holds static fonts. |
