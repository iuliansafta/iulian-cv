import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import {
  AI, AI_LINES, AI_SESSION, CODE_LANGS, JOBS, LANGUAGES, LINKS, PROFILE, PROJECTS, STACK, STATS, type Job,
} from "../../shared/content";
import { useClock, useCopy, useEmail, useReducedMotion, useReveal, useScramble, useSeen } from "../../shared/hooks";
import { durationLabel, rangeLabel, yearValue } from "../../shared/time";
import { DotField } from "../../shared/DotField";
import { Halftone } from "./Dots";
import "./signal.css";

const SECTIONS = [
  { id: "agents", n: "01", label: "Agents" },
  { id: "projects", n: "02", label: "Projects" },
  { id: "trace", n: "03", label: "Trace" },
  { id: "stack", n: "04", label: "Stack" },
  { id: "contact", n: "05", label: "Contact" },
];

export default function Signal() {
  const reduced = useReducedMotion();
  const root = useReveal<HTMLDivElement>();
  const email = useEmail();
  const [palette, setPalette] = useState(false);

  useEffect(() => {
    document.title = "Iulian Safta — signal";
  }, []);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((p) => !p);
      } else if (e.key === "/" && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        setPalette(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="sg" ref={root}>
      <a className="sg-skip" href="#sg-main">Skip to content</a>
      <Bar onPalette={() => setPalette(true)} />
      <main id="sg-main">
        <Hero reduced={reduced} />
        <Agents reduced={reduced} />
        <Projects />
        <Trace />
        <Stack />
        <Contact reduced={reduced} email={email} />
      </main>
      <footer className="sg-foot sg-wrap">
        <span>© {new Date().getFullYear()} {PROFILE.name}</span>
        <span>
          <kbd>⌘K</kbd> or <kbd>/</kbd> to jump anywhere
        </span>
      </footer>
      {palette && <Palette onClose={() => setPalette(false)} email={email} />}
    </div>
  );
}

type Email = ReturnType<typeof useEmail>;

/* ───────────────────────────── Bar ───────────────────────────── */

function Bar({ onPalette }: { onPalette: () => void }) {
  const clock = useClock(PROFILE.timeZone);
  return (
    <header className="sg-bar">
      <a href="#top" className="sg-bar__id">
        <i className="sg-rec" aria-hidden="true" />
        IULIAN.CLOUD
      </a>
      <nav className="sg-bar__nav" aria-label="Sections">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`}>
            <span>{s.n}</span>
            {s.label}
          </a>
        ))}
      </nav>
      <span className="sg-bar__clock">{clock} CET</span>
      <button type="button" className="sg-bar__k" onClick={onPalette} aria-label="Open command palette">
        <kbd>⌘K</kbd>
      </button>
    </header>
  );
}

/* ───────────────────────────── Hero ───────────────────────────── */

function Hero({ reduced }: { reduced: boolean }) {
  return (
    <section className="sg-hero" id="top">
      <DotField reduced={reduced} className="sg-field" />
      <div className="sg-wrap sg-hero__grid">
        <div className="sg-hero__copy">
          <p className="sg-live">
            <i className="sg-rec" aria-hidden="true" /> LIVE — building Vora
          </p>
          <h1 className="sg-h1" aria-label={PROFILE.name}>
            <span aria-hidden="true">{PROFILE.first}</span>
            <span aria-hidden="true">{PROFILE.last}</span>
          </h1>
          <p className="sg-role">{PROFILE.role}</p>
          <p className="sg-lede">{PROFILE.summary}</p>
          <div className="sg-actions">
            <a className="sg-btn sg-btn--red" href="#contact">
              Get in touch
            </a>
            <a className="sg-btn" href={LINKS.github} target="_blank" rel="noreferrer">
              GitHub ↗
            </a>
            <a className="sg-btn" href={LINKS.linkedin} target="_blank" rel="noreferrer">
              LinkedIn ↗
            </a>
          </div>
        </div>
        <figure className="sg-portrait">
          <Halftone src="/iulian.jpg" alt={`Portrait of ${PROFILE.name}`} reduced={reduced} />
          <figcaption>
            <span>IMG_0001 · halftone</span>
            <span>move the cursor through it</span>
          </figcaption>
        </figure>
      </div>
      <dl className="sg-wrap sg-readout">
        {STATS.map((s) => (
          <div key={s.label}>
            <dt>{s.label}</dt>
            <dd>{s.value}</dd>
          </div>
        ))}
        <div>
          <dt>spoken</dt>
          <dd>{LANGUAGES.map((l) => l.code.toUpperCase()).join(" ")}</dd>
        </div>
      </dl>
    </section>
  );
}

/* ───────────────────────────── Agents ───────────────────────────── */

function SecHead({ n, label }: { n: string; label: string }) {
  return (
    <p className="sg-sechead" data-reveal>
      <span>{n}</span>
      {label}
    </p>
  );
}

function Agents({ reduced }: { reduced: boolean }) {
  const [a, b] = AI_LINES.signal.split(". ");
  return (
    <section className="sg-sec sg-wrap" id="agents">
      <SecHead n="01" label="Agents" />
      <h2 className="sg-h2" data-reveal>
        <span>{a}.</span>
        <span className="sg-red">{b}</span>
      </h2>
      <div className="sg-agents">
        <div data-reveal>
          <p className="sg-body sg-body--lg">{AI.body}</p>
          <ul className="sg-tools">
            {AI.tools.map((t) => (
              <li key={t.name}>
                <b>{t.name}</b>
                <span className="sg-leader" aria-hidden="true" />
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
    // Stream a line every 700ms, hold the full log, then start over.
    const id = window.setInterval(() => setN((x) => (x >= AI_SESSION.length + 4 ? 0 : x + 1)), 700);
    return () => window.clearInterval(id);
  }, [seen, reduced]);
  return (
    <div className="sg-session" ref={ref} data-reveal>
      <header>
        <span>
          <i className="sg-rec" aria-hidden="true" /> session.log
        </span>
        <span>illustrative</span>
      </header>
      <ol>
        {AI_SESSION.slice(0, Math.min(n, AI_SESSION.length)).map((l, i) => (
          <li key={i} className={`sg-log sg-log--${l.k}`}>
            <span className="sg-log__k">{l.k === "ok" ? "✓" : l.k === "no" ? "⊘" : "▸"}</span>
            <span className="sg-log__who">{l.who}</span>
            <span className="sg-log__what">{l.what}</span>
            <span className="sg-log__msg">{l.msg}</span>
          </li>
        ))}
        {n < AI_SESSION.length && <li className="sg-log sg-log--cursor" aria-hidden="true" />}
      </ol>
      <footer>
        {AI.loop.map((s, i) => (
          <span key={s} className={n > 0 && i === AI_SESSION[Math.min(n, AI_SESSION.length) - 1].step ? "is-on" : ""}>
            {s}
          </span>
        ))}
      </footer>
    </div>
  );
}

/* ───────────────────────────── Projects ───────────────────────────── */

function Projects() {
  return (
    <section className="sg-sec sg-wrap" id="projects">
      <SecHead n="02" label="Projects" />
      <div className="sg-projects">
        {PROJECTS.map((p, i) => (
          <article key={p.id} className={`sg-proj ${i === 0 ? "sg-proj--main" : ""}`} data-reveal>
            <header>
              <span>{p.kind}</span>
              <span className="sg-pill">
                <i className="sg-rec" aria-hidden="true" /> {p.status}
              </span>
            </header>
            <h3 className="sg-proj__name">{p.name}</h3>
            <p className="sg-proj__tag">{p.tagline}</p>
            <p className="sg-body">{p.pitch}</p>
            <ul className="sg-points">
              {p.points.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <footer>
              <span className="sg-tags">
                {p.stack.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </span>
              <a href={p.url} target="_blank" rel="noreferrer" className="sg-arrow">
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

function Trace() {
  const [open, setOpen] = useState<string | null>("usbc");
  const [ref, seen] = useSeen<HTMLDivElement>(0.15);
  const t0 = 2016;
  const t1 = yearValue(null);
  const years = useMemo(() => Array.from({ length: Math.floor(t1) - t0 + 1 }, (_, i) => t0 + i), [t1]);
  const pos = (v: number) => ((v - t0) / (t1 - t0)) * 100;

  return (
    <section className="sg-sec sg-wrap" id="trace">
      <SecHead n="03" label="Trace" />
      <div className="sg-trace__intro" data-reveal>
        <h2 className="sg-h2 sg-h2--sm">Career, as a distributed trace.</h2>
        <p className="sg-mono-dim">
          service=<b>iulian</b> · spans=<b>{JOBS.length}</b> · root=<b>{PROFILE.years} years</b> · click a span
        </p>
      </div>
      <div className={`sg-trace ${seen ? "is-in" : ""}`} ref={ref}>
        <div className="sg-trace__axis" aria-hidden="true">
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
            open={open === j.id}
            onToggle={() => setOpen((o) => (o === j.id ? null : j.id))}
          />
        ))}
      </div>
    </section>
  );
}

function Span({
  job, i, left, width, open, onToggle,
}: { job: Job; i: number; left: number; width: number; open: boolean; onToggle: () => void }) {
  const live = !job.end;
  return (
    <div className={`sg-span ${open ? "is-open" : ""} ${live ? "is-live" : ""}`}>
      <button type="button" className="sg-span__row" onClick={onToggle} aria-expanded={open}>
        <span className="sg-span__name">
          <b>{job.company}</b>
          <span>{job.role}</span>
        </span>
        <span className="sg-span__lane">
          <span
            className="sg-span__bar"
            style={{ left: `${left}%`, width: `${Math.max(width, 0.8)}%`, "--i": i } as CSSProperties}
          >
            <span className="sg-span__dur">{durationLabel(job.start, job.end)}</span>
          </span>
        </span>
      </button>
      {open && (
        <div className="sg-span__detail">
          <dl className="sg-attrs">
            <div>
              <dt>span.name</dt>
              <dd>{job.role}</dd>
            </div>
            <div>
              <dt>time</dt>
              <dd>{rangeLabel(job.start, job.end)}</dd>
            </div>
            <div>
              <dt>location</dt>
              <dd>{job.place}</dd>
            </div>
            {job.url && (
              <div>
                <dt>http.url</dt>
                <dd>
                  <a href={job.url} target="_blank" rel="noreferrer">
                    {job.url.replace(/^https:\/\/|\/$/g, "")}
                  </a>
                </dd>
              </div>
            )}
            <div>
              <dt>stack</dt>
              <dd>{job.stack.join(" · ")}</dd>
            </div>
          </dl>
          <ol className="sg-events">
            <li className="sg-events__sum">{job.summary}</li>
            {job.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────── Stack ───────────────────────────── */

function Stack() {
  return (
    <section className="sg-sec sg-wrap" id="stack">
      <SecHead n="04" label="Stack" />
      <p className="sg-langs" data-reveal aria-label={`Languages: ${CODE_LANGS.join(", ")}`}>
        {CODE_LANGS.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </p>
      <div className="sg-stack">
        {STACK.map((g) => (
          <div key={g.group} className="sg-group" data-reveal>
            <p className="sg-group__name">{g.group}</p>
            <ul>
              {g.items.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        ))}
        <div className="sg-group sg-group--spoken" data-reveal>
          <p className="sg-group__name">Spoken</p>
          <ul>
            {LANGUAGES.map((l) => (
              <li key={l.code} className="sg-spoken">
                <span>{l.name}</span>
                <span className="sg-dots" aria-label={l.level}>
                  {[0, 1, 2, 3].map((d) => (
                    <i key={d} className={d < l.bars ? "is-on" : ""} />
                  ))}
                </span>
                <span className="sg-mono-dim">{l.level}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Contact ───────────────────────────── */

function Contact({ reduced, email }: { reduced: boolean; email: Email }) {
  const [on, setOn] = useState(false);
  const shown = useScramble(email.address ?? "", on, reduced, 1200);
  const { copied, copy } = useCopy();
  return (
    <section className="sg-sec sg-contact" id="contact">
      <div className="sg-wrap">
        <SecHead n="05" label="Contact" />
        <h2 className="sg-giant" data-reveal>
          Say hi<span className="sg-red">.</span>
        </h2>
        <div className="sg-contact__row" data-reveal>
          {on ? (
            <span className="sg-contact__email">
              <a href={`mailto:${email.address}`}>{shown}</a>
              <button type="button" className="sg-btn sg-btn--sm" onClick={() => copy(email.address ?? "", "mail")}>
                {copied === "mail" ? "copied" : "copy"}
              </button>
            </span>
          ) : (
            <button
              type="button"
              className="sg-btn sg-btn--red sg-btn--lg"
              onClick={() => {
                email.reveal();
                setOn(true);
              }}
            >
              Decode e-mail address
            </button>
          )}
          <a className="sg-btn" href={LINKS.github} target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
          <a className="sg-btn" href={LINKS.linkedin} target="_blank" rel="noreferrer">
            LinkedIn ↗
          </a>
        </div>
        <p className="sg-mono-dim sg-contact__loc">
          {PROFILE.location} · {PROFILE.coords} · remote-first
        </p>
      </div>
    </section>
  );
}

/* ───────────────────────────── Command palette ───────────────────────────── */

type Action = { id: string; label: string; hint: string; run: () => void };

function Palette({ onClose, email }: { onClose: () => void; email: Email }) {
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const field = useRef<HTMLInputElement>(null);

  const go = (id: string) => () => {
    onClose();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  const open = (url: string) => () => {
    onClose();
    window.open(url, "_blank", "noopener");
  };

  const actions: Action[] = [
    ...SECTIONS.map((s) => ({ id: s.id, label: `Go to ${s.label}`, hint: s.n, run: go(s.id) })),
    { id: "vora", label: "Open vora.sh", hint: "↗", run: open(PROJECTS[0].url) },
    { id: "gh", label: "Open GitHub", hint: "↗", run: open(LINKS.github) },
    { id: "li", label: "Open LinkedIn", hint: "↗", run: open(LINKS.linkedin) },
    {
      id: "mail",
      label: "Copy e-mail address",
      hint: "⧉",
      run: () => {
        const a = email.reveal();
        navigator.clipboard?.writeText(a).then(() => setNote(`copied ${a}`));
      },
    },
    ...["terminal", "orbital", "console"].map((v) => ({
      id: v,
      label: `Switch design → ${v}`,
      hint: "#",
      run: () => {
        onClose();
        window.location.hash = v;
      },
    })),
  ];
  const list = actions.filter((a) => a.label.toLowerCase().includes(q.toLowerCase()));

  useEffect(() => {
    field.current?.focus();
  }, []);

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setI((x) => Math.min(x + 1, list.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setI((x) => Math.max(x - 1, 0));
    } else if (e.key === "Enter") list[i]?.run();
  };

  return (
    <div className="sg-pal" role="dialog" aria-modal="true" aria-label="Command palette" onClick={onClose}>
      <div className="sg-pal__box" onClick={(e) => e.stopPropagation()}>
        <input
          ref={field}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setI(0);
          }}
          onKeyDown={onKey}
          placeholder="Type a command…"
          aria-label="Command"
        />
        <ul>
          {list.map((a, k) => (
            <li key={a.id}>
              <button type="button" className={k === i ? "is-on" : ""} onMouseEnter={() => setI(k)} onClick={a.run}>
                <span>{a.label}</span>
                <kbd>{a.hint}</kbd>
              </button>
            </li>
          ))}
          {!list.length && <li className="sg-pal__empty">No match.</li>}
        </ul>
        <p className="sg-pal__foot">{note ?? "↑↓ to move · enter to run · esc to close"}</p>
      </div>
    </div>
  );
}
