// Builds the PDF CVs, and any cover letters, from the same facts as the site: `yarn cv`.
// Jobs, projects, stack, stats and languages come from src/shared/content.ts;
// only the CV's own copy (titles, headlines, profiles, the iulian.cloud entry)
// lives here. Variants pick and reorder those facts; they never reword them.
// Cover letters live in cv/letters/*.md (git-ignored: they name the companies).
// Output goes to cv/out/ (git-ignored): the PDFs carry the phone number.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { EMAIL_PARTS, JOBS, LANGUAGES, LINKS, PROFILE, PROJECTS, STACK, STATS } from "../src/shared/content.ts";
import { monthLabel } from "../src/shared/time.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "out");

// The phone number stays out of the public repo: cv/private.json is git-ignored.
const PRIVATE = join(HERE, "private.json");
const phone: string | undefined = existsSync(PRIVATE) ? JSON.parse(readFileSync(PRIVATE, "utf8")).phone : undefined;
if (!phone) console.warn("! cv/private.json has no phone; building without one.");

type Variant = {
  id: string;
  file: string;
  title: string;
  // Replaces PROFILE.location, e.g. to name the city a job ad filters on.
  location?: string;
  headline: string;
  profile: string;
  // Jobs shown in full; the rest are listed under "Earlier experience".
  recent: string[];
  // Bullet order per job, by index into JOBS[].highlights. Unlisted recent jobs
  // keep all of theirs; unlisted earlier jobs keep their first two.
  highlights: Record<string, number[]>;
  // Projects in order ("site" is iulian.cloud), with the points to show, by index into PROJECTS[].points.
  projects: [id: string, points: number[]][];
  // By index into STATS.
  stats: number[];
  // STACK groups in order.
  stack: string[];
};

const SITE = {
  name: "iulian.cloud",
  url: "https://iulian.cloud",
  kind: "Personal site",
  pitch:
    "My landing page, built as a working terminal: a shell with a command palette, a halftone portrait with an ASCII loupe, and the career as a trace you open like a git log.",
  points: [] as string[],
  stack: ["Vite", "React", "plain CSS", "self-hosted fonts", "no third-party requests"],
};

const VARIANTS: Variant[] = [
  {
    id: "general",
    file: "Iulian_Safta_CV.pdf",
    title: PROFILE.role,
    headline: "Go and Rust systems, and the infrastructure they run on.",
    profile:
      `${PROFILE.years} years shipping backend systems and running the infrastructure under them. At USBC I operate a customised Solana/Agave runtime across Devnet, Testnet and Mainnet, and built an investigator agent that tells the team what is breaking on the network and how to fix it. At Olyn I moved a high-volume payments platform from a Python monolith to Go on Kubernetes. Responses got 40% faster and infrastructure costs fell by 30–40%. I build with coding agents every day (OpenCode, Pi) and review every line that ships.`,
    recent: ["usbc", "olyn"],
    highlights: { usbc: [0, 1, 2, 3, 6, 4, 5, 7] },
    projects: [["vora", [0, 5]], ["probe", [0]], ["site", []]],
    stats: [0, 2, 3, 4],
    stack: ["Systems & Backend", "Cloud & Platform", "Distributed Systems", "Observability & Data", "AI / Agent Tooling", "Also"],
  },
  {
    id: "sre",
    file: "Iulian_Safta_CV_SRE.pdf",
    title: "Senior SRE / Infrastructure Engineer",
    headline: "Production that stays up, deploys itself and costs less to run.",
    profile:
      `${PROFILE.years} years building and running production systems. At USBC I own the reliability of a customised Solana/Agave network across Devnet, Testnet and Mainnet. I built its automation, its RPC traffic routing and failover, its alerting and on-call pipeline, and an investigator agent that tells the team what is happening and how to fix it. At Olyn I moved a payments platform onto Kubernetes and ArgoCD with zero-downtime deployments, cut infrastructure costs by 30–40%, and built its alerting and on-call pipeline too.`,
    recent: ["usbc", "olyn"],
    highlights: { usbc: [4, 5, 6, 7, 3, 1, 0, 2], olyn: [0, 5, 3, 1, 2, 4] },
    projects: [["probe", [0]], ["vora", [0, 4]]],
    stats: [0, 4, 2, 3],
    stack: ["Cloud & Platform", "Observability & Data", "Systems & Backend", "Distributed Systems", "AI / Agent Tooling", "Also"],
  },
  {
    id: "blockchain",
    file: "Iulian_Safta_CV_Blockchain.pdf",
    title: "Senior Blockchain Infrastructure Engineer",
    headline: "Solana validators, RPC and indexers, built and run in production.",
    profile:
      `${PROFILE.years} years in backend and infrastructure engineering. At USBC I build and operate a customised Solana/Agave runtime across Devnet, Testnet and Mainnet. I automated validator and RPC provisioning with Ansible and built a Pingora RPC gateway with geo-distributed load balancing and failover. The Geyser indexers I built write on-chain data to PostgreSQL, and the investigator agent reports what is happening on the network. Before that, I deployed private Hyperledger Besu nodes on Kubernetes at Olyn and wrote Solana smart contracts in Rust at Bugsy World. I build with coding agents every day (OpenCode, Pi) and review every line that ships.`,
    recent: ["usbc", "olyn", "bugsy"],
    highlights: { usbc: [0, 1, 3, 2, 6, 4, 5, 7], olyn: [4, 0, 1, 2, 3, 5], bugsy: [1, 0, 2] },
    projects: [["vora", [0, 1]], ["probe", [0]]],
    stats: [2, 0, 3, 4],
    stack: ["Distributed Systems", "Systems & Backend", "Cloud & Platform", "Observability & Data", "AI / Agent Tooling", "Also"],
  },
  // Platform / DevOps roles: the SRE variant in a platform team's words:
  // production, test and dev environments, monitoring and alerting, on-call,
  // cost-effective infrastructure, Linux.
  {
    id: "platform",
    file: "Iulian_Safta_CV_Platform.pdf",
    title: "Platform / DevOps Engineer · SRE",
    location: `${PROFILE.location} · Geneva area`,
    headline: "Keep production up, keep it lean, automate the rest.",
    profile:
      `${PROFILE.years} years building production infrastructure. At USBC I run a customised Solana/Agave network across its development, test and production environments: Devnet, Testnet and Mainnet. I built its Ansible automation, its RPC load balancing with health checks and failover, its monitoring and alerting from Alertmanager to Datadog and Slack, and an investigator agent that tells the team what is happening and how to fix it. I also provide on-call support. At Olyn I moved a PCI-compliant payments platform onto AWS, Kubernetes and ArgoCD with zero-downtime deployments, cut infrastructure costs by 30–40%, and built the same alerting and on-call pipeline. On the side, I'm learning Linux containers by building Vora.`,
    recent: ["usbc", "olyn"],
    highlights: { usbc: [4, 5, 6, 7, 3, 1, 0, 2], olyn: [0, 5, 3, 1, 2, 4] },
    projects: [["probe", [0]], ["vora", [0, 1]]],
    stats: [0, 4, 2, 3],
    stack: ["Cloud & Platform", "Observability & Data", "Systems & Backend", "Distributed Systems", "AI / Agent Tooling", "Also"],
  },
  // Cloud / platform roles in regulated finance: the platform variant, with a
  // profile that opens on the bank behind USBC, then Terraform, Helm and GitOps, then Go.
  {
    id: "cloud",
    file: "Iulian_Safta_CV_Cloud_Platform.pdf",
    title: "Cloud / Platform Engineer",
    location: `${PROFILE.location} · Geneva area`,
    headline: "Keep production up, keep it lean, automate the rest.",
    profile:
      `${PROFILE.years} years building production infrastructure. At USBC I run a customised Solana/Agave runtime across Devnet, Testnet and Mainnet. It is the ledger behind a bank-backed digital dollar held as tokenized deposits at Vast Bank, N.A. I automate it with Ansible and Terraform Cloud, and built its RPC load balancing with health checks and failover, its alerting and on-call pipeline, and an investigator agent that tells the team what is happening and how to fix it. At Olyn I moved a PCI-compliant payments platform from a Python monolith to Go microservices on AWS and Kubernetes, deployed with Terraform, Helm and ArgoCD GitOps, without downtime. Responses got 40% faster and infrastructure costs fell by 30–40%. I build with coding agents every day (OpenCode, Pi) and review every line that ships.`,
    recent: ["usbc", "olyn"],
    highlights: { usbc: [0, 1, 4, 5, 6, 7, 3, 2], olyn: [0, 1, 5, 3, 2, 4] },
    projects: [["probe", [0]], ["vora", [0, 1]]],
    stats: [0, 4, 3, 2],
    stack: ["Cloud & Platform", "Observability & Data", "Systems & Backend", "AI / Agent Tooling", "Distributed Systems", "Also"],
  },
  // Observability SRE roles: logs, metrics, traces and alerts, and AI tooling
  // for detection and response. The alerting pipelines and the investigator agent lead.
  {
    id: "observability",
    file: "Iulian_Safta_CV_Observability.pdf",
    title: "Senior Site Reliability Engineer · Observability",
    location: `${PROFILE.location} · Geneva area`,
    headline: "Logs, metrics and alerts engineers rely on, and agents that read them.",
    profile:
      `${PROFILE.years} years building and running production systems. At USBC I run a customised Solana/Agave network on hosted bare metal across Devnet, Testnet and Mainnet. I built its alerting and on-call pipeline, which routes alerts from Alertmanager into Datadog Teams and On-Call and posts them to Slack. I also built an investigator agent that tells the team what is happening and how to fix it. I am now streaming logs from the bare-metal nodes into Loki on AWS, so the agent can read them alongside Prometheus metrics through Grafana MCP. At Olyn I ran observability on Prometheus, Grafana and Datadog for a Kubernetes and ArgoCD payments platform, built its alerting and on-call pipeline too, and cut infrastructure costs by 30–40%.`,
    recent: ["usbc", "olyn"],
    highlights: { usbc: [5, 6, 7, 4, 0, 3, 1, 2], olyn: [5, 0, 3, 1, 2, 4] },
    projects: [["probe", [0, 1]], ["vora", [4, 0]]],
    stats: [0, 4, 2, 3],
    stack: ["Observability & Data", "Cloud & Platform", "Systems & Backend", "AI / Agent Tooling", "Distributed Systems", "Also"],
  },
];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const bare = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
const range = (start: string, end: string | null) => `${monthLabel(start)} – ${end ? monthLabel(end) : "Present"}`;
const bullets = (items: string[]) => `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
// Prose, with ranges like "30–40%" kept on one line.
const prose = (s: string) => esc(s).replace(/\d+–\d+%/g, '<span class="nowrap">$&</span>');
const stackLine = (items: string[]) => `<p class="stack">${items.map(esc).join(" · ")}</p>`;
const pick = <T,>(items: T[], order: number[]) => order.map((i) => items[i] ?? fail(`no item ${i}`));
function fail(msg: string): never {
  throw new Error(msg);
}

const email = EMAIL_PARTS.join("@");
// Two lines: how to reach me, then where to look.
const contacts = (location: string) => [
  [
    `<a href="mailto:${email}">${email}</a>`,
    phone && `<a href="tel:${phone.replace(/\s/g, "")}">${esc(phone)}</a>`,
    esc(location),
  ],
  [
    `<a href="https://iulian.cloud">iulian.cloud</a>`,
    `<a href="${LINKS.github}">${bare(LINKS.github)}</a>`,
    `<a href="${LINKS.linkedin}">${bare(LINKS.linkedin)}</a>`,
  ],
].map((line) => line.filter(Boolean).join('<span class="sep"> · </span>'));

const page = (title: string, description: string, body: string) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${esc(title)}</title>
<meta name="author" content="${esc(PROFILE.name)}" />
<meta name="description" content="${esc(description)}" />
<link rel="stylesheet" href="../cv.css" />
</head>
<body>
${body}
</body>
</html>
`;

const top = (v: Variant, portrait: boolean) => `
<header class="top">
  <div class="id">
    <h1>${esc(PROFILE.name)}</h1>
    <p class="title">${esc(v.title)}</p>
    <p class="headline">${esc(v.headline)}</p>
    ${contacts(v.location ?? PROFILE.location).map((line) => `<p class="contacts">${line}</p>`).join("")}
  </div>
  ${portrait ? `<img class="portrait" src="../../public/iulian.jpg" alt="" />` : ""}
</header>`;

type Job = (typeof JOBS)[number];

const job = (j: Job, highlights: string[]) => `
  <article class="entry">
    <header>
      <h3>${esc(j.company)} <span class="role">${esc(j.role)}</span></h3>
      <p class="when">${range(j.start, j.end)}</p>
    </header>
    <p class="where">${esc(j.place)}${j.url ? ` · <a href="${j.url}">${bare(j.url)}</a>` : ""}</p>
    ${bullets(highlights)}
    ${stackLine(j.stack)}
  </article>`;

// Older roles: place and dates on one line, no stack line (the stack section has it).
const earlier = (j: Job, highlights: string[]) => `
  <article class="entry">
    <header>
      <h3>${esc(j.company)} <span class="role">${esc(j.role)}</span></h3>
      <p class="when">${esc(j.place)} · ${range(j.start, j.end)}</p>
    </header>
    ${bullets(highlights)}
  </article>`;

const project = (p: { name: string; url: string; kind: string; pitch: string; points: string[]; stack: string[] }) => `
  <article class="entry">
    <header>
      <h3>${esc(p.name)} <span class="role">${esc(p.kind)}</span></h3>
      <p class="when"><a href="${p.url}">${bare(p.url)}</a></p>
    </header>
    <p class="pitch">${esc(p.pitch)}</p>
    ${p.points.length ? bullets(p.points) : ""}
    ${stackLine(p.stack)}
  </article>`;

function render(v: Variant): string {
  const highlights = (j: Job) =>
    v.highlights[j.id] ? pick(j.highlights, v.highlights[j.id]) : v.recent.includes(j.id) ? j.highlights : j.highlights.slice(0, 2);
  const projects = v.projects.map(([id, points]) => {
    if (id === "site") return SITE;
    const p = PROJECTS.find((p) => p.id === id) ?? fail(`no project ${id}`);
    return { ...p, points: pick(p.points, points) };
  });
  const stack = v.stack.map((g) => STACK.find((s) => s.group === g) ?? fail(`no stack group ${g}`));

  return page(`${PROFILE.name} · ${v.title}`, `${v.title}. ${v.headline}`, `${top(v, true)}

<section>
  <h2>Profile</h2>
  <p class="profile">${prose(v.profile)}</p>
  <ul class="stats">${pick(STATS, v.stats).map((s) => `<li><b>${esc(s.value)}</b> ${esc(s.label)}</li>`).join("")}</ul>
</section>

<section>
  <h2>Experience</h2>
  ${JOBS.filter((j) => v.recent.includes(j.id)).map((j) => job(j, highlights(j))).join("")}
</section>

<section>
  <h2>Side projects</h2>
  ${projects.map(project).join("")}
</section>

<section>
  <h2>Earlier experience</h2>
  ${JOBS.filter((j) => !v.recent.includes(j.id)).map((j) => earlier(j, highlights(j))).join("")}
</section>

<section class="keep">
  <h2>Technical stack</h2>
  <dl class="skills">${stack.map((g) => `<dt>${esc(g.group)}</dt><dd>${g.items.map(esc).join(", ")}</dd>`).join("")}</dl>
</section>

<section class="keep">
  <h2>Languages</h2>
  <p>${LANGUAGES.map((l) => `${esc(l.name)} <span class="level">(${esc(l.level)})</span>`).join('<span class="sep"> · </span>')}</p>
</section>`);
}

// A letter file: `key: value` lines, a line with `---`, then the body.
// Keys: cv (a variant id, for the header), file, to (lines split by " | "),
// subject, date (optional, defaults to today). Blank lines separate paragraphs;
// the body carries its own greeting and closing, the signature is added here.
type Letter = { file: string; cv: string; to: string; subject: string; date?: string; body: string };

function parseLetter(path: string): Letter {
  const [head, ...rest] = readFileSync(path, "utf8").split(/^---\s*$/m);
  const meta = Object.fromEntries(
    head.split("\n").filter((l) => l.includes(":")).map((l) => [l.slice(0, l.indexOf(":")).trim(), l.slice(l.indexOf(":") + 1).trim()]),
  );
  for (const key of ["file", "cv", "to", "subject"]) if (!meta[key]) fail(`${path}: missing "${key}"`);
  return { ...meta, body: rest.join("---") } as Letter;
}

function renderLetter(l: Letter): string {
  const v = VARIANTS.find((v) => v.id === l.cv) ?? fail(`no variant ${l.cv}`);
  const date = l.date ?? new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const paragraphs = l.body.trim().split(/\n\s*\n/).map((p) => `<p>${prose(p.replace(/\s*\n\s*/g, " "))}</p>`);
  return page(`${PROFILE.name} · Cover letter`, l.subject, `${top(v, false)}
<main class="letter">
  <div class="letter-meta">
    <p class="to">${l.to.split(" | ").map(esc).join("<br />")}</p>
    <p class="date">${esc(PROFILE.location.split(",")[0])}, ${esc(date)}</p>
  </div>
  <p class="subject">${esc(l.subject)}</p>
  ${paragraphs.join("\n  ")}
  <p class="signature">${esc(PROFILE.name)}</p>
</main>`);
}

function print(file: string, html: string) {
  const htmlPath = join(OUT, file.replace(/\.pdf$/, ".html"));
  const pdfPath = join(OUT, file);
  writeFileSync(htmlPath, html);
  execFileSync(
    "chromium",
    ["--headless", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${pdfPath}`, `file://${htmlPath}`],
    // Chromium's stderr is noise on success (a missing accessibility bus, byte
    // counts); on failure execFileSync throws with it in the message.
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  console.log(`→ ${pdfPath}`);
}

mkdirSync(OUT, { recursive: true });
for (const v of VARIANTS) print(v.file, render(v));

const LETTERS = join(HERE, "letters");
if (existsSync(LETTERS)) {
  const files = new Set(VARIANTS.map((v) => v.file));
  for (const name of readdirSync(LETTERS).filter((n) => n.endsWith(".md"))) {
    const letter = parseLetter(join(LETTERS, name));
    if (files.has(letter.file)) fail(`${name}: ${letter.file} is already written by another CV or letter`);
    files.add(letter.file);
    print(letter.file, renderLetter(letter));
  }
}
