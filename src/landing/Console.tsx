import {
  useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent, type ReactNode, type RefObject,
} from "react";
import {
  AI, AI_LINES, AI_SESSION, CAREER_START, CODE_LANGS, JOBS, LANGUAGES, LINKS, PROFILE, PROJECTS, STACK, STATS,
  type Job,
} from "../shared/content";
import { DotField } from "../shared/DotField";
import {
  useClock, useEmail, useReducedMotion, useReveal, useScramble, useSeen, useTypewriter, useUptime,
} from "../shared/hooks";
import { durationLabel, rangeLabel, yearValue } from "../shared/time";
import { DotAscii } from "./DotAscii";
import "./console.css";

// The shell, git log and stack.toml of a terminal, set in dot-matrix type on
// pure black, with a command palette folded into the shell.

const WINDOWS = [
  { id: "top", name: "whoami" },
  { id: "agents", name: "agents" },
  { id: "projects", name: "projects" },
  { id: "trace", name: "git-log" },
  { id: "stack", name: "stack" },
  { id: "contact", name: "contact" },
];

type Email = ReturnType<typeof useEmail>;

export default function Console() {
  const reduced = useReducedMotion();
  const root = useReveal<HTMLDivElement>();
  const email = useEmail();
  const field = useRef<HTMLInputElement>(null);

  // / jumps to the shell from anywhere. No Ctrl+K: Brave binds it to its own
  // search before the page ever sees it.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "/" || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      e.preventDefault();
      field.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      field.current?.focus({ preventScroll: true });
      // Flash the shell so the jump is visible even when it was on screen.
      // An attribute, not a class: the node is [data-reveal] (see AGENTS.md).
      const shell = field.current?.closest<HTMLElement>(".cn-shell");
      if (!shell || reduced) return;
      const flash = () => {
        shell.removeAttribute("data-summoned");
        void shell.offsetWidth;
        shell.setAttribute("data-summoned", "");
      };
      const r = shell.getBoundingClientRect();
      if (r.top >= 0 && r.bottom <= window.innerHeight) return flash();
      // Off screen: flash once the smooth scroll lands, not while it runs.
      let done = false;
      const once = () => {
        if (done) return;
        done = true;
        flash();
      };
      window.addEventListener("scrollend", once, { once: true });
      window.setTimeout(once, 900);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reduced]);

  return (
    <div className="cn" ref={root}>
      <a className="cn-skip" href="#cn-main">Skip to content</a>
      <Bar />
      <main id="cn-main">
        <Hero reduced={reduced} email={email} field={field} />
        <Agents reduced={reduced} />
        <Projects reduced={reduced} />
        <Trace reduced={reduced} />
        <Stack reduced={reduced} />
        <Contact reduced={reduced} email={email} />
      </main>
      <footer className="cn-foot cn-wrap">
        <span>EOF</span>
        <span>
          © {new Date().getFullYear()} {PROFILE.name} · built on {PROFILE.os}
        </span>
        <span>
          <kbd>/</kbd> opens the shell
        </span>
      </footer>
    </div>
  );
}

/* ───────────────────────────── Bar ───────────────────────────── */

function Bar() {
  const [active, setActive] = useState("top");
  const clock = useClock(PROFILE.timeZone);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    WINDOWS.forEach((w) => {
      const el = document.getElementById(w.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <header className="cn-bar">
      <a href="#top" className="cn-bar__id">
        <i className="cn-rec" aria-hidden="true" />
        iulian.cloud
      </a>
      <nav className="cn-bar__wins" aria-label="Sections">
        {WINDOWS.map((w, i) => (
          <a key={w.id} href={`#${w.id}`} className={active === w.id ? "is-active" : ""}>
            <span>{i}:</span>
            {w.name}
          </a>
        ))}
      </nav>
      <span className="cn-bar__clock">Thonon {clock}</span>
    </header>
  );
}

/* ───────────────────────────── Hero ───────────────────────────── */

function Hero({ reduced, email, field }: { reduced: boolean; email: Email; field: RefObject<HTMLInputElement> }) {
  const first = useTypewriter(PROFILE.first, true, reduced ? 1 : 90);
  const last = useTypewriter(PROFILE.last, first === PROFILE.first, reduced ? 1 : 90);
  return (
    <section className="cn-hero" id="top">
      <DotField reduced={reduced} className="cn-field" />
      <div className="cn-wrap cn-hero__grid">
        <div className="cn-hero__copy">
          <p className="cn-prompt">
            <Ps1 /> whoami
          </p>
          <h1 className="cn-h1" aria-label={PROFILE.name}>
            <span aria-hidden="true">{first || " "}</span>
            <span aria-hidden="true">
              {last || " "}
              <i className="cn-caret" />
            </span>
          </h1>
          <p className="cn-role">
            {PROFILE.role} <span className="cn-dim">//</span> <span className="cn-red">{PROFILE.years} years</span>
          </p>
          <p className="cn-lede">{PROFILE.summary}</p>
          <div className="cn-actions">
            <a className="cn-btn cn-btn--red" href="#contact">
              ./contact.sh
            </a>
            <a className="cn-btn" href={LINKS.github} target="_blank" rel="noreferrer">
              github ↗
            </a>
            <a className="cn-btn" href={LINKS.linkedin} target="_blank" rel="noreferrer">
              linkedin ↗
            </a>
          </div>
        </div>
        <figure className="cn-portrait">
          <DotAscii src="/iulian.jpg" alt={`Portrait of ${PROFILE.name}`} reduced={reduced} />
          <figcaption>
            <span>portrait.jpg · halftone</span>
            <span>hover · tap to decode</span>
          </figcaption>
        </figure>
      </div>
      <div className="cn-wrap">
        <Shell reduced={reduced} email={email} field={field} />
        <dl className="cn-readout">
          {STATS.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Ps1() {
  return (
    <span className="cn-ps1" aria-hidden="true">
      <span className="cn-green">iulian@cloud</span>
      <span className="cn-dim">:</span>~<span className="cn-dim">$</span>
    </span>
  );
}

/* ───────────────────────────── Shell + palette ───────────────────────────── */

type Line = { kind: "in" | "out" | "err" | "ok" | "dim"; text: ReactNode };

const CMDS = [
  { name: "help", desc: "list every command" },
  { name: "whoami", desc: "name, role, location" },
  { name: "about", desc: "the short version" },
  { name: "agents", desc: "how I work with AI" },
  { name: "vora", desc: "side project: linux containers" },
  { name: "probe", desc: "side project: investigator agent" },
  { name: "work", desc: "career, newest first" },
  { name: "stack", desc: "languages and tools" },
  { name: "locale", desc: "spoken languages" },
  { name: "uptime", desc: "time in production" },
  { name: "uname -a", desc: "the machine behind this site" },
  { name: "contact", desc: "decode the e-mail address" },
  { name: "github", desc: "open GitHub ↗" },
  { name: "linkedin", desc: "open LinkedIn ↗" },
  ...WINDOWS.slice(1).map((w) => ({ name: `cd ${w.id}`, desc: `jump to ${w.name}` })),
  { name: "sudo hire-me", desc: "you know you want to" },
  { name: "clear", desc: "wipe the screen" },
];

const CHIPS = ["help", "whoami", "agents", "vora", "work", "sudo hire-me"];

const BOOT: Line[] = [
  { kind: "ok", text: `Mounted /home/iulian — ${PROFILE.years} years of production` },
  { kind: "ok", text: "Started go.service rust.service" },
  { kind: "ok", text: "Started opencode.service pi.service" },
  { kind: "ok", text: "Listening on https://iulian.cloud" },
  { kind: "dim", text: "Start typing — suggestions appear as you go. Press / anywhere to come back here." },
];

function Shell({ reduced, email, field }: { reduced: boolean; email: Email; field: RefObject<HTMLInputElement> }) {
  const [lines, setLines] = useState<Line[]>(reduced ? BOOT : []);
  const [input, setInput] = useState("");
  const [sel, setSel] = useState(0);
  const [hist, setHist] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const body = useRef<HTMLDivElement>(null);
  const uptime = useUptime(CAREER_START);

  useEffect(() => {
    if (reduced) return;
    const ids = BOOT.map((l, i) => window.setTimeout(() => setLines((ls) => [...ls, l]), 500 + i * 160));
    return () => ids.forEach(clearTimeout);
  }, [reduced]);

  useEffect(() => {
    const el = body.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const q = input.trim().toLowerCase();
  const suggestions = useMemo(() => {
    if (!q) return [];
    const hits = CMDS.filter((c) => c.name.includes(q));
    return hits.sort((a, b) => Number(!a.name.startsWith(q)) - Number(!b.name.startsWith(q))).slice(0, 6);
  }, [q]);

  const run = (raw: string) => {
    const cmd = raw.trim().replace(/\s+/g, " ");
    setInput("");
    setSel(0);
    const echo: Line = { kind: "in", text: cmd };
    if (!cmd) return setLines((ls) => [...ls, echo]);
    setHist((h) => [cmd, ...h].slice(0, 50));
    setHIdx(-1);
    if (cmd === "clear") return setLines([]);
    // Run outside the updater: commands have side effects (reveal, open, scroll).
    const result = exec(cmd);
    setLines((ls) => [...ls, echo, ...result]);
  };

  const jump = (id: string) =>
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }), 250);

  const exec = (cmd: string): Line[] => {
    const [head, ...rest] = cmd.split(" ");
    const arg = rest.join(" ");
    const out = (...t: ReactNode[]): Line[] => t.map((text) => ({ kind: "out", text }));
    switch (head) {
      case "help":
        return out(
          <span className="cn-cols">
            {CMDS.map((c) => (
              <button key={c.name} type="button" onClick={() => run(c.name)}>
                {c.name}
              </button>
            ))}
          </span>,
        );
      case "whoami":
        return out(`${PROFILE.name} — ${PROFILE.role}`, `${PROFILE.location} · ${PROFILE.years} years · remote`);
      case "about":
        return out(PROFILE.summary);
      case "agents":
        return out(<b>{AI_LINES.headline}</b>, AI.body);
      case "vora":
      case "probe": {
        const p = PROJECTS.find((x) => x.id === head)!;
        return out(
          <span>
            <b>{p.name}</b> <span className="cn-dim">— {p.kind} · {p.status}</span>
          </span>,
          p.pitch,
          <a href={p.url} target="_blank" rel="noreferrer">
            → {p.url.replace("https://", "")}
          </a>,
        );
      }
      case "work":
        return out(
          ...JOBS.map((j) => (
            <span key={j.id}>
              <span className="cn-red">{hash(j.id)}</span> {j.role} @ <b>{j.company}</b>{" "}
              <span className="cn-dim">({rangeLabel(j.start, j.end)})</span>
            </span>
          )),
        );
      case "stack":
        return out(`code: ${CODE_LANGS.join(" · ")}`, ...STACK.slice(0, 4).map((g) => `${g.group.toLowerCase()}: ${g.items.slice(0, 6).join(", ")}`));
      case "locale":
        return out(...LANGUAGES.map((l) => `${l.locale}.UTF-8  ${l.name} — ${l.level}`));
      case "uname":
        return out(`Linux · ${PROFILE.os} — where this site was built`);
      case "uptime":
        return out(`up ${uptime}`);
      case "contact":
        return out(`email:    ${email.reveal()}`, `github:   ${LINKS.github}`, `linkedin: ${LINKS.linkedin}`);
      case "github":
      case "linkedin":
        window.open(LINKS[head], "_blank", "noopener");
        return out(`opening ${LINKS[head]} …`);
      case "cd": {
        const w = WINDOWS.find((x) => x.id === arg || x.name === arg);
        if (!w) return [{ kind: "err", text: `cd: no such section: ${arg || "(empty)"}` }];
        jump(w.id);
        return [{ kind: "dim", text: `→ ${w.name}` }];
      }
      case "sudo":
        if (arg === "hire-me" || arg === "hire me")
          return [
            { kind: "dim", text: "[sudo] password for recruiter: ••••••••" },
            { kind: "ok", text: "access granted. running ./contact.sh" },
            ...exec("contact"),
          ];
        return [{ kind: "err", text: "iulian is not in the sudoers file. This incident will be reported." }];
      case "rm":
        return [{ kind: "err", text: "rm: nice try." }];
      case "echo":
        return out(arg);
      default:
        return [
          { kind: "err", text: `zsh: command not found: ${head}` },
          { kind: "dim", text: "try `help`" },
        ];
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    run(suggestions.length ? suggestions[Math.min(sel, suggestions.length - 1)].name : input);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const open = suggestions.length > 0;
    if (e.key === "Tab" && open) {
      e.preventDefault();
      setInput(suggestions[sel].name);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (open) setSel((s) => Math.min(s + 1, suggestions.length - 1));
      else {
        const i = hIdx - 1;
        setHIdx(Math.max(i, -1));
        setInput(i >= 0 ? hist[i] : "");
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (open) setSel((s) => Math.max(s - 1, 0));
      else {
        const i = Math.min(hIdx + 1, hist.length - 1);
        if (i >= 0) {
          setHIdx(i);
          setInput(hist[i]);
        }
      }
    } else if (e.key === "Escape") {
      setInput("");
      e.currentTarget.blur();
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <section className="cn-shell" aria-label="Interactive shell" data-reveal>
      <header className="cn-shell__head">
        <span>
          <i className="cn-rec" aria-hidden="true" /> iulian@cloud — zsh
        </span>
        <span>
          <kbd>/</kbd>
        </span>
      </header>
      <div className="cn-shell__body" ref={body} onClick={() => field.current?.focus()}>
        {lines.map((l, i) => (
          <div key={i} className={`cn-line cn-line--${l.kind}`}>
            {l.kind === "in" && <><Ps1 />{" "}</>}
            {l.kind === "ok" && <><span className="cn-ok">[  OK  ]</span>{" "}</>}
            {l.text}
          </div>
        ))}
        <form className="cn-line cn-shell__form" onSubmit={onSubmit}>
          <Ps1 />
          <input
            ref={field}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setSel(0);
            }}
            onKeyDown={onKey}
            aria-label="Shell command"
            aria-autocomplete="list"
            aria-controls="cn-suggest"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="type a command…"
          />
        </form>
      </div>
      {suggestions.length > 0 && (
        <ul className="cn-suggest" id="cn-suggest" role="listbox">
          {suggestions.map((c, i) => (
            <li key={c.name} role="option" aria-selected={i === sel}>
              <button
                type="button"
                className={i === sel ? "is-on" : ""}
                onMouseEnter={() => setSel(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => run(c.name)}
              >
                <span>{c.name}</span>
                <span className="cn-dim">{c.desc}</span>
              </button>
            </li>
          ))}
          <li className="cn-suggest__foot">↑↓ select · tab complete · ↵ run · esc close</li>
        </ul>
      )}
      <div className="cn-shell__chips">
        {CHIPS.map((c) => (
          <button key={c} type="button" onClick={() => run(c)}>
            {c}
          </button>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────────── Sections ───────────────────────────── */

// Section header: the command types itself, then a dot-matrix title.
function Head({ cmd, n, reduced }: { cmd: string; n: string; reduced: boolean }) {
  const [ref, seen] = useSeen<HTMLParagraphElement>(0.6);
  const typed = useTypewriter(cmd, seen, reduced ? 1 : 26);
  return (
    <p className="cn-head" ref={ref} aria-label={`$ ${cmd}`}>
      <span className="cn-head__n">{n}</span>
      <Ps1 /> {reduced ? cmd : typed}
      <i className={`cn-caret cn-caret--sm ${typed === cmd ? "is-done" : ""}`} aria-hidden="true" />
    </p>
  );
}

function Agents({ reduced }: { reduced: boolean }) {
  const [a, b] = AI_LINES.headline.split(". ");
  return (
    <section className="cn-sec cn-wrap" id="agents">
      <Head n="01" cmd="cat ~/.config/agents.md" reduced={reduced} />
      <h2 className="cn-h2" data-reveal>
        <span>{a}.</span>
        <span className="cn-red">{b}</span>
      </h2>
      <div className="cn-agents">
        <div data-reveal>
          <p className="cn-sub">{AI_LINES.sub}</p>
          <p className="cn-body">{AI.body}</p>
          <ul className="cn-tools">
            {AI.tools.map((t) => (
              <li key={t.name}>
                <b>{t.name}</b>
                <span className="cn-leader" aria-hidden="true" />
                <span>{t.note}</span>
              </li>
            ))}
          </ul>
        </div>
        <Session reduced={reduced} />
      </div>
    </section>
  );
}

function Session({ reduced }: { reduced: boolean }) {
  const [ref, seen] = useSeen<HTMLDivElement>(0.4);
  const [n, setN] = useState(reduced ? AI_SESSION.length : 0);
  useEffect(() => {
    if (!seen || reduced) return;
    const id = window.setInterval(() => setN((x) => (x >= AI_SESSION.length + 4 ? 0 : x + 1)), 700);
    return () => window.clearInterval(id);
  }, [seen, reduced]);
  const step = n > 0 ? AI_SESSION[Math.min(n, AI_SESSION.length) - 1].step : -1;
  return (
    <div className="cn-session" ref={ref} data-reveal>
      <header>
        <span>$ tail -f session.log</span>
        <span>illustrative</span>
      </header>
      <ol>
        {AI_SESSION.slice(0, Math.min(n, AI_SESSION.length)).map((l, i) => (
          <li key={i} className={`cn-log cn-log--${l.k}`}>
            <span>{l.k === "ok" ? "✓" : l.k === "no" ? "✗" : "▸"}</span>
            <span>{l.who}</span>
            <span>{l.what}</span>
            <span>{l.msg}</span>
          </li>
        ))}
        {n < AI_SESSION.length && <li className="cn-log cn-log--cursor" aria-hidden="true" />}
      </ol>
      <footer>
        {AI.loop.map((s, i) => (
          <span key={s} className={i === step ? "is-on" : ""}>
            {s}
          </span>
        ))}
      </footer>
    </div>
  );
}

function Projects({ reduced }: { reduced: boolean }) {
  return (
    <section className="cn-sec cn-wrap" id="projects">
      <Head n="02" cmd="ls -la ~/projects" reduced={reduced} />
      <div className="cn-projects">
        {PROJECTS.map((p, i) => (
          <article key={p.id} className={`cn-proj ${i === 0 ? "cn-proj--main" : ""}`} data-reveal>
            <header>
              <span>drwxr-xr-x ~/projects/{p.id}/</span>
              <span className="cn-pill">
                <i className="cn-rec" aria-hidden="true" /> {p.status}
              </span>
            </header>
            <h3 className="cn-proj__name">{p.name}</h3>
            <p className="cn-proj__kind">{p.kind}</p>
            <p className="cn-proj__tag">&gt; {p.tagline}</p>
            <p className="cn-body">{p.pitch}</p>
            <ul className="cn-checks">
              {p.points.map((x) => (
                <li key={x}>
                  <span className="cn-red">[x]</span> {x}
                </li>
              ))}
            </ul>
            <footer>
              <span className="cn-tags">
                {p.stack.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </span>
              <a href={p.url} target="_blank" rel="noreferrer" className="cn-arrow">
                {p.url.replace("https://", "")} ↗
              </a>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────────── Trace ───────────────────────────── */

// The most recent jobs stay expanded; older ones open on click, one at a time.
const PINNED = 2;

function Trace({ reduced }: { reduced: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  const [ref, seen] = useSeen<HTMLDivElement>(0.15);
  const t0 = 2016;
  const t1 = yearValue(null);
  const years = useMemo(() => Array.from({ length: Math.floor(t1) - t0 + 1 }, (_, i) => t0 + i), [t1]);
  const pos = (v: number) => ((v - t0) / (t1 - t0)) * 100;

  return (
    <section className="cn-sec cn-wrap" id="trace">
      <Head n="03" cmd="git log --format=trace career" reduced={reduced} />
      <div className="cn-trace__intro" data-reveal>
        <h2 className="cn-h2 cn-h2--sm">Career, as a trace.</h2>
        <p className="cn-dim">
          {JOBS.length} commits · {PROFILE.years} years · click an older span for its diff
        </p>
      </div>
      <div className={`cn-trace ${seen ? "is-in" : ""}`} ref={ref}>
        <div className="cn-trace__axis" aria-hidden="true">
          <span />
          <div>
            {years.map((y) => (
              <i key={y} style={{ left: `${pos(y)}%` }}>
                {y}
              </i>
            ))}
          </div>
        </div>
        {JOBS.map((j, i) => (
          <Span
            key={j.id}
            job={j}
            i={i}
            left={pos(yearValue(j.start))}
            width={pos(yearValue(j.end)) - pos(yearValue(j.start))}
            pinned={i < PINNED}
            open={i < PINNED || open === j.id}
            onToggle={() => setOpen((o) => (o === j.id ? null : j.id))}
          />
        ))}
        <p className="cn-trace__root">
          <span className="cn-dim">… earlier history squashed ({CAREER_START.slice(0, 4)}–2016)</span>
        </p>
      </div>
    </section>
  );
}

function Span({
  job, i, left, width, pinned, open, onToggle,
}: { job: Job; i: number; left: number; width: number; pinned: boolean; open: boolean; onToggle: () => void }) {
  const live = !job.end;
  const row = (
    <>
      <span className="cn-span__name">
        <span className="cn-span__hash">
          {hash(job.id)}
          {live && <em>HEAD</em>}
        </span>
        <b>{job.company}</b>
        <span className="cn-span__role">{job.role}</span>
      </span>
      <span className="cn-span__lane">
        <span
          className="cn-span__bar"
          style={{ left: `${left}%`, width: `${Math.max(width, 0.8)}%`, "--i": i } as CSSProperties}
        >
          <span className="cn-span__dur">{durationLabel(job.start, job.end)}</span>
        </span>
      </span>
    </>
  );
  return (
    <div className={`cn-span ${open ? "is-open" : ""} ${live ? "is-live" : ""}`}>
      {pinned ? (
        <div className="cn-span__row">{row}</div>
      ) : (
        <button type="button" className="cn-span__row" onClick={onToggle} aria-expanded={open}>
          {row}
        </button>
      )}
      {open && (
        <div className="cn-span__detail">
          <dl className="cn-attrs">
            <div>
              <dt>role</dt>
              <dd>{job.role}</dd>
            </div>
            <div>
              <dt>date</dt>
              <dd>{rangeLabel(job.start, job.end)}</dd>
            </div>
            <div>
              <dt>where</dt>
              <dd>{job.place}</dd>
            </div>
            {job.url && (
              <div>
                <dt>url</dt>
                <dd>
                  <a href={job.url} target="_blank" rel="noreferrer">
                    {job.url.replace(/^https:\/\/|\/$/g, "")}
                  </a>
                </dd>
              </div>
            )}
          </dl>
          <div className="cn-diff">
            <p className="cn-diff__msg">{job.summary}</p>
            <ul>
              {job.highlights.map((h) => (
                <li key={h}>
                  <span aria-hidden="true">+</span>
                  {h}
                </li>
              ))}
            </ul>
            <p className="cn-diff__stat">
              {job.stack.map((s) => (
                <span key={s}>{s}</span>
              ))}
              <em>
                {job.stack.length} files changed, {job.highlights.length} insertions(+)
              </em>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────── Stack ───────────────────────────── */

function Stack({ reduced }: { reduced: boolean }) {
  return (
    <section className="cn-sec cn-wrap" id="stack">
      <Head n="04" cmd="cat stack.toml && locale" reduced={reduced} />
      <p className="cn-langs" data-reveal aria-label={`Languages: ${CODE_LANGS.join(", ")}`}>
        {CODE_LANGS.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </p>
      <div className="cn-stack">
        <pre className="cn-toml" data-reveal aria-label="stack.toml">
          <Toml />
        </pre>
        <div className="cn-side" data-reveal>
          <p className="cn-side__title">$ locale -a</p>
          <ul className="cn-locale">
            {LANGUAGES.map((l) => (
              <li key={l.code}>
                <span>{l.locale}.UTF-8</span>
                <span className="cn-dots" aria-label={l.level}>
                  {[0, 1, 2, 3].map((d) => (
                    <i key={d} className={d < l.bars ? "is-on" : ""} />
                  ))}
                </span>
                <span className="cn-dim">{l.level}</span>
              </li>
            ))}
          </ul>
          <p className="cn-side__title">$ cat focus.txt</p>
          <ul className="cn-focus">
            {PROFILE.focus.map((f) => (
              <li key={f}>
                <span className="cn-red">▸</span> {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Toml() {
  const arr = (items: string[]) => (
    <>
      [
      {items.map((s, i) => (
        <span key={s}>
          <span className="cn-str">"{s}"</span>
          {i < items.length - 1 ? ", " : ""}
        </span>
      ))}
      ]
    </>
  );
  return (
    <>
      <span className="cn-dim"># stack.toml — what I reach for</span>
      {STACK.map((g, i) => (
        <span key={g.group}>
          {i ? "\n\n" : "\n"}
          <span className="cn-red">[{slug(g.group)}]</span>
          {"\n"}
          items = {arr(g.items)}
        </span>
      ))}
    </>
  );
}

/* ───────────────────────────── Contact ───────────────────────────── */

function Contact({ reduced, email }: { reduced: boolean; email: Email }) {
  const [ran, setRan] = useState(false);
  const shown = useScramble(email.address ?? "", ran, reduced, 1200);
  return (
    <section className="cn-sec cn-contact" id="contact">
      <div className="cn-wrap">
        <Head n="05" cmd="./contact.sh --reveal" reduced={reduced} />
        <h2 className="cn-giant" data-reveal>
          Say hi<span className="cn-red">.</span>
        </h2>
        <div className="cn-contact__out" data-reveal>
          <p>
            <span className="cn-dim">email    →</span>{" "}
            {ran ? (
              <a href={`mailto:${email.address}`} className="cn-contact__email">
                {shown}
              </a>
            ) : (
              <button
                type="button"
                className="cn-btn cn-btn--red"
                onClick={() => {
                  email.reveal();
                  setRan(true);
                }}
              >
                ▶ run to decrypt
              </button>
            )}
          </p>
          <p>
            <span className="cn-dim">github   →</span>{" "}
            <a href={LINKS.github} target="_blank" rel="noreferrer">
              {LINKS.github.replace("https://", "")}
            </a>
          </p>
          <p>
            <span className="cn-dim">linkedin →</span>{" "}
            <a href={LINKS.linkedin} target="_blank" rel="noreferrer">
              {LINKS.linkedin.replace("https://www.", "")}
            </a>
          </p>
          <p className="cn-dim">
            exit 0 · {PROFILE.location} · {PROFILE.coords}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── utils ───────────────────────────── */

// Stable fake commit hash per job.
function hash(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7);
}

function slug(s: string) {
  return s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}
