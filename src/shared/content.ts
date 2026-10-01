// Every fact on the site comes from this file, and every fact here traces to
// the two CVs in the repo root or to the ../vora and ../vora-probe READMEs.
// Keep it that way: no invented clients, numbers or titles.

// From Iulian (2026-09-27): he started in January 2008. The CVs say "15+",
// which predates this; the site derives the figure so it can't go stale.
export const CAREER_START = "2008-01-01";
const YEARS = `${Math.floor((Date.now() - new Date(CAREER_START).getTime()) / (365.25 * 864e5))}+`;

export const PROFILE = {
  name: "Iulian Safta",
  first: "Iulian",
  last: "Safta",
  role: "Senior Software & Infrastructure Engineer",
  location: "Thonon-les-Bains, France",
  coords: "46.37°N 06.48°E",
  timeZone: "Europe/Paris",
  // From Iulian (2026-09-27): the machine this site was built on.
  os: "Omarchy — Arch Linux + Hyprland",
  years: YEARS,
  summary:
    `Senior software and infrastructure engineer with ${YEARS} years of building backend systems, distributed infrastructure and developer platforms. I work across the application/infrastructure boundary — from Go and Rust services and blockchain runtimes to Kubernetes, networking, observability and automation.`,
  focus: [
    "Distributed systems",
    "Platform engineering",
    "Developer tooling",
    "Reliability",
    "Cloud infrastructure",
    "AI agent infrastructure",
  ],
};

export const LINKS = {
  github: "https://github.com/iuliansafta",
  linkedin: "https://www.linkedin.com/in/iuliansafta",
};

// Assembled in the browser on demand, so the address never appears in the
// HTML or the bundle as one string that a scraper can grep.
// A Proton alias, so it can be rotated if it attracts spam.
export const EMAIL_PARTS = ["hi", "iulian.cloud"] as const;

export type Job = {
  id: string;
  company: string;
  role: string;
  start: string; // YYYY-MM
  end: string | null; // null: present
  place: string;
  url?: string;
  summary: string;
  highlights: string[];
  stack: string[];
};

// Newest first. Wording follows the 2-page CV; details the long CV adds are kept.
export const JOBS: Job[] = [
  {
    id: "usbc",
    company: "USBC",
    role: "SRE / Core Blockchain Developer",
    // USBC from Jan 2026; Olyn ended Dec 2025: from Iulian (2026-10-01).
    start: "2026-01",
    end: null,
    place: "Remote",
    url: "https://usbc.xyz/",
    summary: "Core blockchain infrastructure on a customised Solana/Agave runtime.",
    highlights: [
      "Built and deployed a customised Solana/Agave runtime and operated the core blockchain infrastructure across Devnet, Testnet and Mainnet.",
      "Designed Ansible automation for validator, RPC and supporting-node provisioning, configuration and repeatable network deployment.",
      "Developed Geyser-based indexers that consume blockchain events, decode on-chain data and persist transactions and events to PostgreSQL.",
      "Built a high-performance RPC gateway on Cloudflare's Pingora, with geo-distributed RPC load balancing, health checks and failover.",
      "Owned reliability end to end: deployment automation, traffic routing, node connectivity, RPC availability and production troubleshooting.",
    ],
    stack: ["Rust", "Solana / Agave", "Pingora", "Ansible", "PostgreSQL", "Cloudflare"],
  },
  {
    id: "olyn",
    company: "Olyn",
    role: "Senior Backend / DevOps Engineer",
    start: "2023-07",
    end: "2025-12",
    place: "Remote",
    url: "https://olyn.com/",
    summary: "From a Python monolith to Go microservices on Kubernetes, for high-volume payments.",
    highlights: [
      "Migrated a legacy monolith to AWS microservices on Kubernetes and Istio, shipped through ArgoCD GitOps with zero-downtime deployments.",
      "Led the move from Python/Flask to Go and from MongoDB to PostgreSQL, over REST (Echo) and gRPC — response times down 40%.",
      "Built event-driven orchestration with Go workers, AWS Lambda and message queues for high-volume payment processing, integrating Checkout.com and Shift4 in a PCI-compliant environment.",
      "Cut infrastructure costs by 30–40% with Karpenter autoscaling, spot/on-demand workload balancing and observability-driven scaling.",
      "Deployed private Hyperledger Besu nodes on Kubernetes and ran observability on Prometheus, Grafana and Datadog.",
    ],
    stack: ["Go", "Kubernetes", "Istio", "ArgoCD", "AWS", "PostgreSQL", "gRPC", "Karpenter", "Datadog"],
  },
  {
    id: "eaudeweb",
    company: "Eau de Web",
    role: "Full Stack Developer",
    start: "2023-04",
    end: "2023-07",
    place: "Remote",
    url: "https://eaudeweb.ro/",
    summary: "React front ends on Django APIs.",
    highlights: [
      "Built React applications and Django APIs.",
      "Managed CI/CD with GitHub Actions and Docker.",
    ],
    stack: ["React", "Django", "Python", "GitHub Actions", "Docker"],
  },
  {
    id: "bugsy",
    company: "Bugsy World",
    role: "Full Stack Developer",
    start: "2022-02",
    end: "2023-03",
    place: "Remote",
    summary: "An NFT platform and Solana smart contracts, end to end.",
    highlights: [
      "Built an NFT generation and management platform with Rust, Node.js, MongoDB and TypeScript.",
      "Developed Solana smart contracts in Rust for the $MXO token ecosystem, and a web marketplace with wallet login and NFT trading.",
      "Integrated private-sale and KYC flows with vesting contracts.",
    ],
    stack: ["Rust", "Solana", "Node.js", "TypeScript", "MongoDB"],
  },
  {
    id: "clikd",
    company: "CliKD",
    role: "Full Stack Developer",
    start: "2020-03",
    end: "2022-02",
    place: "Remote",
    summary: "APIs, AWS infrastructure and a React Native app.",
    highlights: [
      "Developed and maintained REST APIs (PHP) and AWS infrastructure, with GitLab CI/CD pipelines.",
      "Migrated legacy .NET APIs to a Node.js microservice using GraphQL.",
      "Led development of the React Native app (v2), with in-app purchases and App Store / Play Store releases.",
    ],
    stack: ["PHP", "Node.js", "GraphQL", "React Native", "AWS", "GitLab CI/CD"],
  },
  {
    id: "pix",
    company: "Pix & Associates",
    role: "Full Stack Developer",
    start: "2019-01",
    end: "2020-03",
    place: "Nice, France",
    summary: "Client projects across the PHP and JavaScript stacks.",
    highlights: [
      "Delivered client projects across Laravel, Symfony, React, Vue.js, MySQL and PostgreSQL.",
      "Automated server configuration and CI/CD with Bash, Docker and Bitbucket Pipelines.",
      "Mentored and guided junior developers.",
    ],
    stack: ["Laravel", "Symfony", "React", "Vue.js", "PostgreSQL", "Docker"],
  },
  {
    id: "digitaljob",
    company: "Digitaljob",
    role: "CTO",
    start: "2017-01",
    end: "2018-12",
    place: "Bucharest, Romania",
    summary: "Led architecture, infrastructure and delivery.",
    highlights: [
      "Aligned the development department with the company's objectives; led software architecture and full-stack delivery.",
      "Designed REST APIs and the database architecture; ran AWS infrastructure and CI/CD on Bitbucket Pipelines.",
      "Built an internal administration platform with Laravel and Vue.js.",
    ],
    stack: ["Laravel", "Vue.js", "AWS", "Bitbucket Pipelines"],
  },
  {
    id: "qualitance",
    company: "Qualitance",
    role: "Senior Software Developer",
    start: "2016-03",
    end: "2017-01",
    place: "Bucharest, Romania",
    summary: "Features, reviews and mentoring on a product team.",
    highlights: [
      "Mentored a team of two junior developers and a tester; owned the architecture overview and code reviews.",
      "Shipped features with PHP/Laravel, Node.js/Express, React and Docker, and supported client builds and rollouts.",
    ],
    stack: ["PHP", "Laravel", "Node.js", "React", "Docker"],
  },
];

export type Project = {
  id: string;
  name: string;
  url: string;
  kind: string;
  status: string;
  tagline: string;
  pitch: string;
  points: string[];
  stack: string[];
};

// Both repos are private (github.com/vorash), so the public links go to vora.sh.
export const PROJECTS: Project[] = [
  {
    id: "vora",
    name: "Vora",
    url: "https://vora.sh",
    kind: "Side project · Linux containers",
    status: "v0.7 · proof of concept",
    tagline: "A clean room for dirty code.",
    // A learning project: Iulian does not run his own agents in it.
    pitch:
      "A side project for learning Linux containers from the inside — namespaces, cgroups, gVisor — built around one idea: run AI agents and untrusted code in isolated sandboxes, and keep a record of everything they did.",
    points: [
      "Bubblewrap or gVisor isolation, chosen per sandbox; one Go runner, no Kubernetes in the path",
      "Default-deny networking: an SNI-inspecting egress gateway and allowlist-only DNS",
      "Brokered credentials that never enter the sandbox",
      "Live snapshots and forks — the fan-out primitive for parallel agents",
      "An audit trail of every exec and network decision, with Prometheus and OpenTelemetry",
      "TypeScript and Python SDKs, and an MCP server so coding agents can drive sandboxes",
    ],
    stack: ["Go", "gRPC", "gVisor", "bubblewrap", "cgroup v2", "containerd", "PostgreSQL", "MCP"],
  },
  {
    id: "probe",
    name: "Vora Probe",
    url: "https://vora.sh/probe/",
    kind: "Side project · investigator agent",
    status: "in development",
    tagline: "Find the cause. Or say you can't.",
    pitch:
      "An agent that investigates incidents read-only: it gathers telemetry and logs through MCP integrations with Grafana and Loki, links every claim to evidence, and refuses conclusions the evidence cannot support.",
    points: [
      "Picks up Alertmanager webhooks and investigates each incident under rate limits and a deadline",
      "Observations → hypotheses → evidence relations → an evidence-linked report",
      "A claims policy pinned by fixtures: proximity is not causation",
      "Compares a baseline LLM against Jev on held-out evaluation suites",
    ],
    stack: ["Go", "MCP", "Grafana", "Loki", "Prometheus", "Alertmanager"],
  },
];

export const AI = {
  body:
    "Agents sit in my toolchain next to the compiler and the debugger. I use them to build and ship faster — OpenCode and Pi as harnesses, Claude now and then — and I review every line before it ships. Speed is the agent's job; keeping slop out of the codebase is mine.",
  // From Iulian directly (2026-09-27): OpenCode + Pi as harnesses, Claude sometimes.
  tools: [
    { name: "OpenCode", note: "harness · daily driver" },
    { name: "Pi", note: "harness" },
    { name: "Claude", note: "now and then" },
    { name: "MCP", note: "Grafana · Loki, for Vora Probe" },
  ],
  loop: ["spec", "plan", "agent", "test", "review", "ship"],
};

// Illustrative, not a recording: the shape of a normal day, told as a log.
// `step` indexes AI.loop (spec, plan, agent, test, review, ship).
export const AI_SESSION: { k: "run" | "ok" | "no"; who: string; what: string; msg: string; step: number }[] = [
  { k: "run", who: "human", what: "spec", msg: "write the acceptance test first", step: 0 },
  { k: "run", who: "opencode", what: "plan", msg: "break the task into small diffs", step: 1 },
  { k: "run", who: "pi", what: "edit", msg: "apply the first diff", step: 2 },
  { k: "run", who: "agent", what: "exec", msg: "go test ./...", step: 3 },
  { k: "no", who: "tests", what: "fail", msg: "1 failing — back to the agent", step: 3 },
  { k: "ok", who: "tests", what: "pass", msg: "ok — the diff holds", step: 3 },
  { k: "run", who: "claude", what: "review", msg: "second opinion, now and then", step: 4 },
  { k: "run", who: "human", what: "review", msg: "read every line that ships", step: 4 },
  { k: "ok", who: "main", what: "ship", msg: "merged", step: 5 },
];

export const AI_LINES = {
  // Two sentences, split onto two lines of the dot-matrix headline.
  headline: "Fast with agents. Strict on review.",
  sub: "Agents write the first draft. I own what ships.",
};

export const CODE_LANGS = ["Go", "Rust", "Python", "TypeScript", "PHP", "Solidity"];

export const STACK: { group: string; items: string[] }[] = [
  { group: "Systems & Backend", items: ["Go", "Rust", "Python", "TypeScript", "Node.js", "gRPC", "REST", "event-driven systems"] },
  { group: "Cloud & Platform", items: ["AWS", "Kubernetes", "Istio", "ArgoCD", "Docker", "Terraform", "Ansible", "Karpenter", "GitHub Actions", "GitLab CI/CD"] },
  { group: "Distributed Systems", items: ["Solana / Agave", "Hyperledger Besu", "RPC infrastructure", "Pingora", "load balancing", "service mesh"] },
  { group: "Observability & Data", items: ["Prometheus", "Grafana", "Datadog", "PostgreSQL", "MongoDB", "MySQL", "Redis", "Elasticsearch"] },
  { group: "AI / Agent Tooling", items: ["OpenCode", "Pi", "Claude", "MCP", "infrastructure investigation"] },
  { group: "Also", items: ["React", "React Native", "Django", "Flask", "Solidity", "Laravel", "Symfony"] },
];

export const LANGUAGES = [
  { code: "ro", locale: "ro_RO", name: "Romanian", level: "native", bars: 4 },
  { code: "en", locale: "en_US", name: "English", level: "professional", bars: 3 },
  { code: "fr", locale: "fr_FR", name: "French", level: "intermediate", bars: 2 },
];

export const STATS = [
  { value: YEARS, label: "years in production" },
  { value: String(JOBS.length), label: "companies, CTO included" },
  { value: "3", label: "blockchain networks operated" },
  { value: "−40%", label: "response times, Go rewrite" },
  { value: "30–40%", label: "infra cost cut, Karpenter" },
];
