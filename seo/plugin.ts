// Gives crawlers and AI agents the page without running JavaScript. Everything
// is generated from content.ts at build time, so it can't drift from the site.
// Never join EMAIL_PARTS here: the address must not appear in any output.
import type { Plugin } from "vite";
import { AI, CAREER_START, JOBS, LANGUAGES, LINKS, PROFILE, PROJECTS, STACK } from "../src/shared/content.ts";
import { monthLabel, rangeLabel } from "../src/shared/time.ts";

const SITE = "https://iulian.cloud/";
const ROOT = '<div id="root"></div>';

const since = monthLabel(CAREER_START.slice(0, 7));
const [locality, country] = PROFILE.location.split(", ");
const current = JOBS.find((job) => job.end === null);
const contact = `GitHub, LinkedIn, or the e-mail button on ${SITE}`;

function markdown(built: string): string {
  const out = [
    `# ${PROFILE.name}`,
    "",
    `${PROFILE.role}, ${PROFILE.location}. Working since ${since}.`,
    "",
    PROFILE.summary,
    "",
    `Focus: ${PROFILE.focus.join(", ")}.`,
    "",
    `- Website: ${SITE}`,
    `- GitHub: ${LINKS.github}`,
    `- LinkedIn: ${LINKS.linkedin}`,
    `- Contact: ${contact}`,
    "",
    "## Experience",
  ];
  for (const job of JOBS) {
    out.push("", `### ${job.role}, ${job.company}`, "", [rangeLabel(job.start, job.end), job.place, job.url].filter(Boolean).join(" · "));
    out.push("", job.summary, "", ...job.highlights.map((h) => `- ${h}`), "", `Stack: ${job.stack.join(", ")}.`);
  }
  out.push("", "## Side projects");
  for (const p of PROJECTS) {
    out.push("", `### ${p.name}`, "", `${p.kind} · ${p.status} · ${p.url}`, "", `${p.tagline} ${p.pitch}`);
    out.push("", ...p.points.map((point) => `- ${point}`), "", `Stack: ${p.stack.join(", ")}.`);
  }
  out.push("", "## How I work with AI", "", AI.body);
  out.push("", "## Skills", "", ...STACK.map((s) => `- ${s.group}: ${s.items.join(", ")}`));
  out.push("", "## Languages", "", ...LANGUAGES.map((l) => `- ${l.name}: ${l.level}`));
  out.push("", `Generated from the site's content on ${built}.`, "");
  return out.join("\n");
}

function llmsTxt(): string {
  return [
    `# ${PROFILE.name}`,
    "",
    `> ${PROFILE.role} in ${PROFILE.location}, working since ${since}. ${PROFILE.summary}`,
    "",
    `Focus: ${PROFILE.focus.join(", ")}. Contact: ${contact}.`,
    "",
    "## Profile",
    "",
    `- [Full profile](${SITE}index.md): experience, side projects, skills and languages, in Markdown`,
    "",
    "## Experience",
    "",
    ...JOBS.map((job) => `- ${job.company}, ${job.role} (${rangeLabel(job.start, job.end)}): ${job.summary}`),
    "",
    "## Side projects",
    "",
    ...PROJECTS.map((p) => `- [${p.name}](${p.url}): ${p.tagline} ${p.pitch}`),
    "",
    "## Links",
    "",
    `- [GitHub](${LINKS.github})`,
    `- [LinkedIn](${LINKS.linkedin})`,
    "",
  ].join("\n");
}

function jsonLd(built: string): string {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: SITE,
    dateModified: built,
    mainEntity: {
      "@type": "Person",
      name: PROFILE.name,
      givenName: PROFILE.first,
      familyName: PROFILE.last,
      jobTitle: PROFILE.role,
      description: PROFILE.summary,
      url: SITE,
      image: `${SITE}iulian.jpg`,
      sameAs: [LINKS.github, LINKS.linkedin],
      address: { "@type": "PostalAddress", addressLocality: locality, addressCountry: country },
      knowsAbout: PROFILE.focus,
      knowsLanguage: LANGUAGES.map((l) => ({ "@type": "Language", name: l.name, alternateName: l.code })),
      ...(current && { worksFor: { "@type": "Organization", name: current.company, url: current.url } }),
    },
  };
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const link = (href: string, text: string) => `<a href="${esc(href)}">${esc(text)}</a>`;
const list = (items: string[]) => `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;

function staticHtml(): string {
  const jobs = JOBS.map(
    (job) =>
      `<article><h3>${esc(`${job.role}, ${job.company}`)}</h3>` +
      `<p>${esc(`${rangeLabel(job.start, job.end)} · ${job.place}`)}${job.url ? ` · ${link(job.url, job.url)}` : ""}</p>` +
      `<p>${esc(job.summary)}</p>${list(job.highlights)}<p>Stack: ${esc(job.stack.join(", "))}.</p></article>`,
  ).join("");
  const projects = PROJECTS.map(
    (p) =>
      `<article><h3>${link(p.url, p.name)}</h3><p>${esc(`${p.kind} · ${p.status}`)}</p>` +
      `<p>${esc(`${p.tagline} ${p.pitch}`)}</p>${list(p.points)}<p>Stack: ${esc(p.stack.join(", "))}.</p></article>`,
  ).join("");
  return (
    `<main data-static>` +
    `<h1>${esc(PROFILE.name)}</h1>` +
    `<p>${esc(`${PROFILE.role} · ${PROFILE.location} · working since ${since}`)}</p>` +
    `<p>${esc(PROFILE.summary)}</p>` +
    `<p>Focus: ${esc(PROFILE.focus.join(", "))}.</p>` +
    `<p>${link(LINKS.github, "GitHub")} · ${link(LINKS.linkedin, "LinkedIn")} · ${link("/index.md", "Profile in Markdown")} · ${link("/llms.txt", "llms.txt")}</p>` +
    `<section><h2>Experience</h2>${jobs}</section>` +
    `<section><h2>Side projects</h2>${projects}</section>` +
    `<section><h2>How I work with AI</h2><p>${esc(AI.body)}</p></section>` +
    `<section><h2>Skills</h2>${list(STACK.map((s) => `${s.group}: ${s.items.join(", ")}`))}</section>` +
    `<section><h2>Languages</h2>${list(LANGUAGES.map((l) => `${l.name}: ${l.level}`))}</section>` +
    `</main>`
  );
}

export function agentReadable(): Plugin {
  const built = new Date().toISOString().slice(0, 10);
  return {
    name: "agent-readable",
    transformIndexHtml(html) {
      if (!html.includes(ROOT)) throw new Error(`agent-readable: index.html has no ${ROOT}`);
      return {
        html: html.replace(ROOT, `<div id="root">${staticHtml()}</div>`),
        tags: [
          // Browsers that run the app never paint the static copy; React replaces it on mount.
          { tag: "script", children: 'document.documentElement.classList.add("js")', injectTo: "head" },
          {
            tag: "style",
            children:
              ".js #root>[data-static]{display:none}" +
              "[data-static]{color:#f2f0ea;font-family:'JetBrains Mono',ui-monospace,monospace;line-height:1.55;max-width:80ch;margin:0 auto;padding:24px 16px}" +
              "[data-static] h2{margin-top:2em}[data-static] h3{margin-top:1.2em}[data-static] p,[data-static] ul{margin-top:.5em}" +
              "[data-static] li{margin-left:1.2em;list-style:square}",
            injectTo: "head",
          },
          { tag: "link", attrs: { rel: "canonical", href: SITE }, injectTo: "head" },
          { tag: "link", attrs: { rel: "alternate", type: "text/plain", href: "/llms.txt", title: "LLM-readable summary" }, injectTo: "head" },
          { tag: "link", attrs: { rel: "alternate", type: "text/markdown", href: "/index.md", title: "Full profile in Markdown" }, injectTo: "head" },
          { tag: "script", attrs: { type: "application/ld+json" }, children: jsonLd(built), injectTo: "head" },
        ],
      };
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "llms.txt", source: llmsTxt() });
      this.emitFile({ type: "asset", fileName: "index.md", source: markdown(built) });
    },
  };
}
