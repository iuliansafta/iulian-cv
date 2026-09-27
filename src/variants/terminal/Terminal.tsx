import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import {
  AI, AI_LINES, CAREER_START, CODE_LANGS, JOBS, LANGUAGES, LINKS, PROFILE, PROJECTS, STACK, STATS,
  type Job,
} from "../../shared/content";
import {
  useClock, useEmail, useReducedMotion, useReveal, useScramble, useSeen, useTypewriter, useUptime,
} from "../../shared/hooks";
import { durationLabel, rangeLabel } from "../../shared/time";
import { AsciiPortrait } from "./AsciiPortrait";
import "./terminal.css";

const WINDOWS = [
  { id: "top", name: "whoami" },
  { id: "ai", name: "agents" },
  { id: "projects", name: "vora" },
  { id: "work", name: "git-log" },
  { id: "stack", name: "stack" },
  { id: "contact", name: "contact" },
];

export default function Terminal() {
  const reduced = useReducedMotion();
  const root = useReveal<HTMLDivElement>();
  const email = useEmail();

  useEffect(() => {
    document.title = "iulian@cloud:~ — Iulian Safta";
  }, []);

  return (
    <div className="tt" ref={root}>
      <a className="tt-skip" href="#tt-main">Skip to content</a>
      <div className="tt-crt" aria-hidden="true" />
      <TmuxBar />
      <main id="tt-main">
        <Hero reduced={reduced} email={email} />
        <Stats />
        <Agents reduced={reduced} />
        <Projects reduced={reduced} />
        <Work reduced={reduced} />
        <Stack reduced={reduced} />
        <Contact reduced={reduced} email={email} />
      </main>
      <footer className="tt-foot tt-wrap">
        <span>EOF</span>
        <span>© {new Date().getFullYear()} {PROFILE.name} · vite + react, served from vercel</span>
        <span>
          press <kbd>`</kbd> to focus the shell
        </span>
      </footer>
    </div>
  );
}

type Email = ReturnType<typeof useEmail>;

/* ───────────────────────────── tmux bar ───────────────────────────── */

function TmuxBar() {
  const [active, setActive] = useState("top");
  const clock = useClock(PROFILE.timeZone);
  const uptime = useUptime(CAREER_START);

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
    <nav className="tt-tmux" aria-label="Sections">
      <a className="tt-tmux__session" href="#top">[iulian.cloud]</a>
      <div className="tt-tmux__wins">
        {WINDOWS.map((w, i) => (
          <a key={w.id} href={`#${w.id}`} className={active === w.id ? "is-active" : ""}>
            {i}:{w.name}
            {active === w.id ? "*" : ""}
          </a>
        ))}
      </div>
      <div className="tt-tmux__right">
        <span className="tt-tmux__up" title={`Career uptime since ${CAREER_START}`}>
          ▲ up {uptime}
        </span>
        <span>Thonon {clock}</span>
      </div>
    </nav>
  );
}

/* ───────────────────────────── Hero ───────────────────────────── */

function Hero({ reduced, email }: { reduced: boolean; email: Email }) {
  const name = useTypewriter(PROFILE.name, true, reduced ? 1 : 70);
  return (
    <header className="tt-hero tt-wrap" id="top">
      <div className="tt-hero__grid">
        <div className="tt-hero__copy">
          <p className="tt-prompt">
            <Ps1 /> whoami
          </p>
          <h1 className="tt-h1">
            {name}
            <span className="tt-caret" aria-hidden="true" />
          </h1>
          <p className="tt-role">
            <span className="tt-c-accent">{PROFILE.role}</span>
            <span className="tt-c-dim"> // </span>
            {PROFILE.years} years
          </p>
          <p className="tt-lede">{PROFILE.summary}</p>
          <dl className="tt-meta">
            <div>
              <dt>loc</dt>
              <dd>{PROFILE.location} · remote</dd>
            </div>
            <div>
              <dt>now</dt>
              <dd>
                SRE @ USBC · building <a href="#projects">Vora</a>
              </dd>
            </div>
            <div>
              <dt>lang</dt>
              <dd>{LANGUAGES.map((l) => `${l.code}`).join(" · ")} — {CODE_LANGS.slice(0, 4).join(", ")}…</dd>
            </div>
          </dl>
          <div className="tt-actions">
            <a className="tt-btn tt-btn--primary" href="#contact">
              ./contact.sh
            </a>
            <a className="tt-btn" href={LINKS.github} target="_blank" rel="noreferrer">
              github ↗
            </a>
            <a className="tt-btn" href={LINKS.linkedin} target="_blank" rel="noreferrer">
              linkedin ↗
            </a>
          </div>
        </div>
        <figure className="tt-portrait">
          <AsciiPortrait src="/iulian.jpg" alt={`Portrait of ${PROFILE.name}`} reduced={reduced} />
          <figcaption>
            <span>portrait.jpg → ascii</span>
            <span className="tt-c-dim">hover to decode</span>
          </figcaption>
        </figure>
      </div>
      <Shell reduced={reduced} email={email} />
    </header>
  );
}

function Ps1() {
  return (
    <span className="tt-ps1" aria-hidden="true">
      <span className="tt-c-accent">iulian@cloud</span>
      <span className="tt-c-dim">:</span>
      <span className="tt-c-blue">~</span>
      <span className="tt-c-dim">$</span>
    </span>
  );
}

/* ───────────────────────────── Interactive shell ───────────────────────────── */

type Line = { kind: "in" | "out" | "err" | "ok" | "dim"; text: ReactNode };

const BOOT: Line[] = [
  { kind: "ok", text: `Mounted /home/iulian — ${PROFILE.years} years of production` },
  { kind: "ok", text: "Started go.service rust.service python.service" },
  { kind: "ok", text: "Reached target kubernetes.target" },
  { kind: "ok", text: "Started vora.service — side project: linux containers" },
  { kind: "ok", text: "Listening on https://iulian.cloud" },
  { kind: "dim", text: "Type `help` — or just scroll. This shell is real." },
];

const COMMANDS = [
  "help", "whoami", "about", "ls", "work", "vora", "probe", "stack", "locale", "ai", "uptime", "date",
  "contact", "github", "linkedin", "clear", "sudo hire-me",
];

const CHIPS = ["help", "whoami", "vora", "work", "ai", "locale", "sudo hire-me"];

function Shell({ reduced, email }: { reduced: boolean; email: Email }) {
  const [lines, setLines] = useState<Line[]>(reduced ? BOOT : []);
  const [input, setInput] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const body = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const uptime = useUptime(CAREER_START);
  const clock = useClock(PROFILE.timeZone);

  // Boot log, one line at a time.
  useEffect(() => {
    if (reduced) return;
    const ids = BOOT.map((l, i) => window.setTimeout(() => setLines((ls) => [...ls, l]), 260 + i * 170));
    return () => ids.forEach(clearTimeout);
  }, [reduced]);

  useEffect(() => {
    const el = body.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  // ` focuses the shell from anywhere.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "`") {
        e.preventDefault();
        field.current?.focus({ preventScroll: false });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const run = (raw: string) => {
    const cmd = raw.trim().replace(/\s+/g, " ");
    const echo: Line = { kind: "in", text: cmd };
    if (!cmd) return setLines((ls) => [...ls, echo]);
    setHist((h) => [cmd, ...h].slice(0, 50));
    setHIdx(-1);
    if (cmd === "clear") return setLines([]);
    // Run outside the updater: commands have side effects (reveal, window.open).
    const result = exec(cmd);
    setLines((ls) => [...ls, echo, ...result]);
  };

  const exec = (cmd: string): Line[] => {
    const [head, ...rest] = cmd.split(" ");
    const arg = rest.join(" ");
    const out = (...t: ReactNode[]): Line[] => t.map((text) => ({ kind: "out", text }));
    switch (head) {
      case "help":
        return out(
          "available commands:",
          <span className="tt-cols">
            {COMMANDS.map((c) => (
              <button key={c} type="button" onClick={() => run(c)}>
                {c}
              </button>
            ))}
          </span>,
          <span className="tt-c-dim">tab completes · ↑↓ history · `clear` wipes the screen</span>,
        );
      case "whoami":
        return out(`${PROFILE.name} — ${PROFILE.role}`, `${PROFILE.location} · ${PROFILE.years} years · remote`);
      case "about":
      case "cat":
        if (head === "cat" && arg && !["about.md", "ai.md", "stack.toml", "contact.sh"].includes(arg))
          return [{ kind: "err", text: `cat: ${arg}: No such file or directory` }];
        if (arg === "ai.md") return exec("ai");
        if (arg === "stack.toml") return exec("stack");
        if (arg === "contact.sh") return exec("contact");
        return out(PROFILE.summary, <span className="tt-c-dim">{PROFILE.tagline}</span>);
      case "ls":
        return out(
          <span className="tt-cols tt-cols--ls">
            <span>about.md</span>
            <span>ai.md</span>
            <span className="tt-c-blue">projects/</span>
            <span>stack.toml</span>
            <span className="tt-c-accent">contact.sh*</span>
          </span>,
        );
      case "work":
      case "git":
        return out(
          ...JOBS.map((j) => (
            <span key={j.id}>
              <span className="tt-c-amber">{hash(j.id)}</span> {j.role} @ {j.company}{" "}
              <span className="tt-c-dim">({rangeLabel(j.start, j.end)})</span>
            </span>
          )),
        );
      case "vora":
      case "probe": {
        const p = PROJECTS.find((x) => x.id === head)!;
        return out(
          <span>
            <b className="tt-c-accent">{p.name}</b> <span className="tt-c-dim">— {p.status}</span>
          </span>,
          p.pitch,
          ...p.points.slice(0, 3).map((x) => `  • ${x}`),
          <a href={p.url} target="_blank" rel="noreferrer">
            → {p.url.replace("https://", "")}
          </a>,
        );
      }
      case "stack":
        return out(
          `code: ${CODE_LANGS.join(" · ")}`,
          ...STACK.slice(0, 4).map((g) => `${g.group.toLowerCase()}: ${g.items.slice(0, 6).join(", ")}`),
        );
      case "locale":
        return out(
          ...LANGUAGES.map((l) => (
            <span key={l.code}>
              {l.locale}.UTF-8 <span className="tt-c-dim">·</span> {l.name}{" "}
              <span className="tt-c-accent">{l.level}</span>
            </span>
          )),
        );
      case "ai":
        return out(<b>{AI_LINES.terminal}</b>, AI.body);
      case "uptime":
        return out(`up ${uptime} · load average: agents 3, humans 1`);
      case "date":
        return out(`${clock} in Thonon-les-Bains (Europe/Paris)`);
      case "contact":
        return out(`email:    ${email.reveal()}`, `github:   ${LINKS.github}`, `linkedin: ${LINKS.linkedin}`);
      case "github":
      case "linkedin":
        window.open(LINKS[head], "_blank", "noopener");
        return out(`opening ${LINKS[head]} …`);
      case "sudo":
        if (arg === "hire-me" || arg === "hire me")
          return [
            { kind: "dim", text: "[sudo] password for recruiter: ••••••••" },
            { kind: "ok", text: "access granted. running ./contact.sh" },
            ...exec("contact"),
          ];
        return [{ kind: "err", text: "iulian is not in the sudoers file. This incident will be reported." }];
      case "rm":
        return [{ kind: "err", text: "rm: nice try — this shell runs default-deny, like everything in Vora." }];
      case "exit":
        return out("logout… just kidding. Scroll down, there's more.");
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
    run(input);
    setInput("");
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const m = COMMANDS.filter((c) => c.startsWith(input.trim()));
      if (m.length === 1) setInput(m[0]);
      else if (m.length > 1) setLines((ls) => [...ls, { kind: "in", text: input }, { kind: "dim", text: m.join("  ") }]);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const i = Math.min(hIdx + 1, hist.length - 1);
      if (i >= 0) {
        setHIdx(i);
        setInput(hist[i]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const i = hIdx - 1;
      setHIdx(Math.max(i, -1));
      setInput(i >= 0 ? hist[i] : "");
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <section className="tt-shell" aria-label="Interactive shell" data-reveal>
      <div className="tt-shell__chrome">
        <i />
        <i />
        <i />
        <span>iulian@cloud: ~ — zsh — 96×24</span>
      </div>
      <div className="tt-shell__body" ref={body} onClick={() => field.current?.focus()}>
        {lines.map((l, i) => (
          <div key={i} className={`tt-line tt-line--${l.kind}`}>
            {l.kind === "in" && <><Ps1 />{" "}</>}
            {l.kind === "ok" && <><span className="tt-ok">[  OK  ]</span>{" "}</>}
            {l.text}
          </div>
        ))}
        <form className="tt-line tt-line--in tt-shell__form" onSubmit={onSubmit}>
          <Ps1 />
          <input
            ref={field}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            aria-label="Shell command"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="help"
          />
        </form>
      </div>
      <div className="tt-shell__chips">
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

// Section header: the command types itself once the section is on screen.
function Cmd({ children, reduced }: { children: string; reduced: boolean }) {
  const [ref, seen] = useSeen<HTMLParagraphElement>(0.6);
  const typed = useTypewriter(children, seen, reduced ? 1 : 28);
  return (
    <p className="tt-prompt tt-cmd" ref={ref} aria-label={`$ ${children}`}>
      <Ps1 /> {reduced ? children : typed}
      <span className={`tt-caret tt-caret--sm ${typed === children ? "is-done" : ""}`} aria-hidden="true" />
    </p>
  );
}

function Stats() {
  return (
    <section className="tt-stats tt-wrap" aria-label="At a glance">
      {STATS.map((s) => (
        <div key={s.label} className="tt-stat" data-reveal>
          <b>{s.value}</b>
          <span>{s.label}</span>
        </div>
      ))}
    </section>
  );
}

function Agents({ reduced }: { reduced: boolean }) {
  const [a, b] = AI_LINES.terminal.split(". ");
  return (
    <section className="tt-sec tt-wrap" id="ai">
      <Cmd reduced={reduced}>cat ~/.config/agents/manifesto.md</Cmd>
      <div className="tt-ai">
        <div className="tt-ai__copy" data-reveal>
          <p className="tt-kicker"># {AI.kicker}</p>
          <h2 className="tt-h2">
            {a}.<br />
            <span className="tt-c-accent">{b}</span>
          </h2>
          <p className="tt-body">{AI.body}</p>
          <ol className="tt-loop" aria-label="How I work with agents">
            {AI.loop.map((s, i) => (
              <li key={s} style={{ ["--i" as string]: i }}>
                {s}
              </li>
            ))}
          </ol>
        </div>
        <pre className="tt-code" data-reveal aria-label="agents.yaml">
          <span className="tt-c-dim"># ~/.config/agents.yaml</span>
          {"\n"}
          {AI.tools.map((t) => (
            <span key={t.name}>
              <span className="tt-c-blue">{slug(t.name)}</span>
              <span className="tt-c-dim">:</span> <span className="tt-c-amber">"{t.note}"</span>
              {"\n"}
            </span>
          ))}
          <span className="tt-c-blue">human_in_the_loop</span>
          <span className="tt-c-dim">:</span> <span className="tt-c-accent">true</span>
          {"\n"}
          <span className="tt-c-blue">loop</span>
          <span className="tt-c-dim">:</span> [{AI.loop.join(", ")}]
        </pre>
      </div>
    </section>
  );
}

function Projects({ reduced }: { reduced: boolean }) {
  return (
    <section className="tt-sec tt-wrap" id="projects">
      <Cmd reduced={reduced}>ls -la ~/projects</Cmd>
      <pre className="tt-ls" data-reveal>
        <span className="tt-c-dim">total 2</span>
        {"\n"}
        {PROJECTS.map((p) => (
          <span key={p.id}>
            <span className="tt-c-dim">drwxr-xr-x iulian </span>
            <span className="tt-c-amber">{p.status.padEnd(24)}</span>
            <a href={`#p-${p.id}`} className="tt-c-blue">
              {p.id}/
            </a>
            {"\n"}
          </span>
        ))}
      </pre>
      <div className="tt-projects">
        {PROJECTS.map((p, i) => (
          <article key={p.id} className={`tt-proj ${i === 0 ? "tt-proj--main" : ""}`} id={`p-${p.id}`} data-reveal>
            <header className="tt-proj__head">
              <span className="tt-c-dim">~/projects/{p.id}/README.md</span>
              <span className="tt-badge">{p.status}</span>
            </header>
            <h3 className="tt-h3">
              <span className="tt-c-dim"># </span>
              {p.name}
            </h3>
            <p className="tt-proj__kind">{p.kind}</p>
            <p className="tt-proj__tag">&gt; {p.tagline}</p>
            <p className="tt-body">{p.pitch}</p>
            <ul className="tt-checks">
              {p.points.map((x) => (
                <li key={x}>
                  <span className="tt-c-accent">[x]</span> {x}
                </li>
              ))}
            </ul>
            <footer className="tt-proj__foot">
              <span className="tt-tags">
                {p.stack.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </span>
              <a href={p.url} target="_blank" rel="noreferrer" className="tt-link">
                {p.url.replace("https://", "")} ↗
              </a>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}

function Work({ reduced }: { reduced: boolean }) {
  const [open, setOpen] = useState<Set<string>>(() => new Set(["usbc", "olyn"]));
  const toggle = (id: string) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  return (
    <section className="tt-sec tt-wrap" id="work">
      <Cmd reduced={reduced}>git log --graph --stat career</Cmd>
      <ol className="tt-git">
        {JOBS.map((j, i) => (
          <Commit key={j.id} job={j} head={i === 0} open={open.has(j.id)} onToggle={() => toggle(j.id)} />
        ))}
        <li className="tt-git__root" data-reveal>
          <span className="tt-git__rail" aria-hidden="true">
            *
          </span>
          <span className="tt-c-dim">… earlier history squashed ({CAREER_START.slice(0, 4)}–2016)</span>
        </li>
      </ol>
    </section>
  );
}

function Commit({ job, head, open, onToggle }: { job: Job; head: boolean; open: boolean; onToggle: () => void }) {
  return (
    // Static className: useReveal adds `is-in` to the DOM node, and a changing
    // className would make React overwrite it and hide the row again.
    <li className="tt-commit" data-reveal>
      <span className="tt-git__rail" aria-hidden="true">
        *
      </span>
      <div className="tt-commit__main">
        <button type="button" className="tt-commit__line" aria-expanded={open} onClick={onToggle}>
          <span className="tt-c-amber">{hash(job.id)}</span>
          {head && <span className="tt-ref">(HEAD → main)</span>}
          {job.role === "CTO" && <span className="tt-ref tt-ref--tag">(tag: cto)</span>}
          <span className="tt-commit__msg">
            {job.role} <span className="tt-c-dim">@</span> <b>{job.company}</b>
          </span>
          <span className="tt-commit__date">
            {rangeLabel(job.start, job.end)} · {durationLabel(job.start, job.end)}
          </span>
          <span className="tt-commit__chev" aria-hidden="true">
            {open ? "−" : "+"}
          </span>
        </button>
        {open && (
          <div className="tt-commit__body">
            <p className="tt-c-dim">
              Date: {rangeLabel(job.start, job.end)} · {job.place}
              {job.url && (
                <>
                  {" · "}
                  <a href={job.url} target="_blank" rel="noreferrer">
                    {job.url.replace(/^https:\/\/|\/$/g, "")}
                  </a>
                </>
              )}
            </p>
            <p className="tt-commit__sum">{job.summary}</p>
            <ul className="tt-diff">
              {job.highlights.map((h) => (
                <li key={h}>
                  <span aria-hidden="true">+</span>
                  {h}
                </li>
              ))}
            </ul>
            <p className="tt-commit__stat">
              {job.stack.map((s) => (
                <span key={s}>{s}</span>
              ))}
              <span className="tt-c-dim">
                {job.stack.length} files changed, {job.highlights.length} insertions(+)
              </span>
            </p>
          </div>
        )}
      </div>
    </li>
  );
}

function Stack({ reduced }: { reduced: boolean }) {
  return (
    <section className="tt-sec tt-wrap" id="stack">
      <Cmd reduced={reduced}>cat stack.toml && locale</Cmd>
      <div className="tt-stackgrid">
        <pre className="tt-code tt-toml" data-reveal aria-label="stack.toml">
          <Toml />
        </pre>
        <div className="tt-side">
          <div className="tt-card" data-reveal>
            <p className="tt-card__title">$ locale -a</p>
            <ul className="tt-locale">
              {LANGUAGES.map((l) => (
                <li key={l.code}>
                  <span>{l.locale}.UTF-8</span>
                  <span className="tt-c-dim">{l.name}</span>
                  <span className="tt-bars" aria-label={l.level}>
                    {[0, 1, 2, 3].map((b) => (
                      <i key={b} className={b < l.bars ? "is-on" : ""} />
                    ))}
                  </span>
                  <span className="tt-c-accent">{l.level}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="tt-card" data-reveal>
            <p className="tt-card__title">$ cat focus.txt</p>
            <ul className="tt-focus">
              {PROFILE.focus.map((f) => (
                <li key={f}>
                  <span className="tt-c-accent">▸</span> {f}
                </li>
              ))}
            </ul>
          </div>
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
          <span className="tt-c-amber">"{s}"</span>
          {i < items.length - 1 ? ", " : ""}
        </span>
      ))}
      ]
    </>
  );
  return (
    <>
      <span className="tt-c-dim"># stack.toml — what I reach for</span>
      {"\n\n"}
      <span className="tt-c-pink">[languages]</span>
      {"\n"}
      <span className="tt-c-blue">code</span> = {arr(CODE_LANGS)}
      {"\n"}
      <span className="tt-c-blue">spoken</span> = {"{ "}
      {LANGUAGES.map((l, i) => (
        <span key={l.code}>
          {l.code} = <span className="tt-c-amber">"{l.level}"</span>
          {i < LANGUAGES.length - 1 ? ", " : ""}
        </span>
      ))}
      {" }"}
      {STACK.map((g) => (
        <span key={g.group}>
          {"\n\n"}
          <span className="tt-c-pink">[{slug(g.group)}]</span>
          {"\n"}
          <span className="tt-c-blue">items</span> = {arr(g.items)}
        </span>
      ))}
    </>
  );
}

function Contact({ reduced, email }: { reduced: boolean; email: Email }) {
  const [ran, setRan] = useState(false);
  const shown = useScramble(email.address ?? "", ran, reduced, 1100);
  return (
    <section className="tt-sec tt-wrap tt-contact" id="contact">
      <Cmd reduced={reduced}>./contact.sh --reveal</Cmd>
      <div className="tt-contact__grid" data-reveal>
        <h2 className="tt-h2">
          Let's build something
          <br />
          that doesn't page anyone <span className="tt-c-accent">at 3am.</span>
        </h2>
        <div className="tt-contact__out">
          <p>
            <span className="tt-c-dim">email    →</span>{" "}
            {ran ? (
              <a href={`mailto:${email.address}`} className="tt-c-accent">
                {shown}
              </a>
            ) : (
              <button
                type="button"
                className="tt-btn tt-btn--primary tt-btn--sm"
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
            <span className="tt-c-dim">github   →</span>{" "}
            <a href={LINKS.github} target="_blank" rel="noreferrer">
              {LINKS.github.replace("https://", "")}
            </a>
          </p>
          <p>
            <span className="tt-c-dim">linkedin →</span>{" "}
            <a href={LINKS.linkedin} target="_blank" rel="noreferrer">
              {LINKS.linkedin.replace("https://www.", "")}
            </a>
          </p>
          <p className="tt-c-dim">
            <span>exit 0</span> · {PROFILE.location} · CET/CEST
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
