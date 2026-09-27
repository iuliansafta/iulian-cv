import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  AI, AI_LINES, CODE_LANGS, JOBS, LANGUAGES, LINKS, PROFILE, PROJECTS, STACK, STATS,
} from "../../shared/content";
import { useClock, useEmail, useReducedMotion, useReveal, useScramble, useSeen } from "../../shared/hooks";
import { durationLabel, monthLabel, rangeLabel, yearValue } from "../../shared/time";
import "./orbital.css";

// Presentation only: three-letter call signs and which orbit each job sits on.
const CALL: Record<string, string> = {
  usbc: "USBC", olyn: "OLYN", eaudeweb: "EDW", bugsy: "BGW", clikd: "CKD", pix: "PIX", digitaljob: "DJB", qualitance: "QLT",
};

const RINGS = [
  { label: "2025 →", size: 60, dur: 70, ids: ["usbc", "vora"] },
  { label: "2022 – 25", size: 80, dur: 110, ids: ["olyn", "eaudeweb", "bugsy"] },
  { label: "2016 – 22", size: 100, dur: 160, ids: ["clikd", "pix", "digitaljob", "qualitance"] },
];

const FILTERS = ["Go", "Rust", "Kubernetes", "AWS", "PostgreSQL", "Solana", "Docker", "React", "Node.js", "PHP", "gRPC", "CI/CD"];

const NAV = [
  { href: "#orbit", label: "Profile" },
  { href: "#vora", label: "Vora" },
  { href: "#missions", label: "Missions" },
  { href: "#systems", label: "Systems" },
  { href: "#comms", label: "Comms" },
];

export default function Orbital() {
  const reduced = useReducedMotion();
  const root = useReveal<HTMLDivElement>();
  const [selected, setSelected] = useState(JOBS[0].id);

  useEffect(() => {
    document.title = "IULIAN SAFTA // Operator profile";
  }, []);

  const pick = (id: string) => {
    if (id === "vora") {
      document.getElementById("vora")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      return;
    }
    setSelected(id);
    document.getElementById("missions")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div className="ob" ref={root}>
      <a className="ob-skip" href="#ob-main">Skip to content</a>
      <div className="ob-bg" aria-hidden="true" />
      <Hud />
      <main id="ob-main">
        <Hero onPick={pick} reduced={reduced} />
        <Crew />
        <Vora />
        <Missions selected={selected} onSelect={setSelected} />
        <Systems />
        <Comms reduced={reduced} />
      </main>
      <footer className="ob-foot ob-wrap">
        <span>END OF FILE</span>
        <span>© {new Date().getFullYear()} {PROFILE.name.toUpperCase()}</span>
        <span>TRANSMITTED FROM {PROFILE.coords}</span>
      </footer>
    </div>
  );
}

/* ───────────────────────────── HUD frame ───────────────────────────── */

function Hud() {
  const clock = useClock(PROFILE.timeZone);
  return (
    <>
      <div className="ob-frame" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <header className="ob-hud">
        <a href="#orbit" className="ob-hud__id">
          <b>IULIAN.CLOUD</b>
          <span>// operator file 0x01</span>
        </a>
        <nav aria-label="Sections" className="ob-hud__nav">
          {NAV.map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
        </nav>
        <span className="ob-hud__clock">
          <i className="ob-dot" aria-hidden="true" /> THONON {clock}
        </span>
      </header>
      <div className="ob-hud__foot" aria-hidden="true">
        <span>{PROFILE.coords} · {PROFILE.location.toUpperCase()}</span>
        <span>
          SIGNAL <b className="ob-sig"><i /><i /><i /><i /></b> NOMINAL
        </span>
      </div>
    </>
  );
}

/* ───────────────────────────── Hero + orbit ───────────────────────────── */

function Hero({ onPick, reduced }: { onPick: (id: string) => void; reduced: boolean }) {
  return (
    <section className="ob-hero ob-wrap" id="orbit">
      <div className="ob-hero__copy">
        <p className="ob-kicker">
          <i className="ob-dot" aria-hidden="true" /> ONLINE — OPERATOR PROFILE
        </p>
        <h1 className="ob-h1">
          <span>{PROFILE.first}</span>
          <span>{PROFILE.last}</span>
        </h1>
        <p className="ob-role">{PROFILE.role}</p>
        <p className="ob-lede">{PROFILE.tagline} {PROFILE.summary.split(". ").slice(1).join(". ")}</p>
        <dl className="ob-readouts">
          {STATS.slice(0, 3).map((s) => (
            <Readout key={s.label} value={s.value} label={s.label} reduced={reduced} />
          ))}
        </dl>
        <div className="ob-actions">
          <a className="ob-btn ob-btn--primary" href="#comms">
            Open channel
          </a>
          <a className="ob-btn" href={LINKS.github} target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
          <a className="ob-btn" href={LINKS.linkedin} target="_blank" rel="noreferrer">
            LinkedIn ↗
          </a>
        </div>
      </div>
      <Orbit onPick={onPick} />
    </section>
  );
}

function Readout({ value, label, reduced }: { value: string; label: string; reduced: boolean }) {
  const [ref, seen] = useSeen<HTMLDivElement>(0.5);
  const target = parseInt(value, 10);
  const suffix = value.replace(/^\d+/, "");
  const [n, setN] = useState(reduced ? target : 0);
  useEffect(() => {
    if (!seen || reduced || Number.isNaN(target)) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1400);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, reduced, target]);
  return (
    <div ref={ref} className="ob-readout">
      <dt>{label}</dt>
      <dd>
        {Number.isNaN(target) ? value : `${n}${suffix}`}
      </dd>
    </div>
  );
}

function Orbit({ onPick }: { onPick: (id: string) => void }) {
  const [hover, setHover] = useState<string | null>(null);
  const info = hover === "vora" ? PROJECTS[0] : JOBS.find((j) => j.id === hover);
  return (
    <div className="ob-orbit" aria-label="Career orbit: select a company">
      <div className="ob-orbit__sweep" aria-hidden="true" />
      <div className="ob-orbit__ticks" aria-hidden="true" />
      {RINGS.map((r, ri) => (
        <div
          key={r.label}
          className={`ob-ring ${ri % 2 ? "ob-ring--rev" : ""}`}
          style={{ "--size": `${r.size}%`, "--dur": `${r.dur}s` } as CSSProperties}
        >
          <span className="ob-ring__label" aria-hidden="true">
            {r.label}
          </span>
          {r.ids.map((id, i) => {
            const angle = (360 / r.ids.length) * i + ri * 40 - 60;
            const label = id === "vora" ? "VORA" : CALL[id];
            return (
              <div key={id} className="ob-sat" style={{ "--a": `${angle}deg` } as CSSProperties}>
                <button
                  type="button"
                  className={`ob-sat__in ${id === "vora" ? "is-vora" : ""} ${id === "usbc" ? "is-now" : ""}`}
                  onClick={() => onPick(id)}
                  onMouseEnter={() => setHover(id)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(id)}
                  onBlur={() => setHover(null)}
                  aria-label={id === "vora" ? "Vora project" : `${JOBS.find((j) => j.id === id)?.company}`}
                >
                  <i />
                  <span>{label}</span>
                </button>
              </div>
            );
          })}
        </div>
      ))}
      <div className="ob-core">
        <img src="/iulian.jpg" alt={`Portrait of ${PROFILE.name}`} />
        <span className="ob-core__scan" aria-hidden="true" />
      </div>
      <div className={`ob-orbit__info ${info ? "is-on" : ""}`} aria-live="polite">
        {info && "company" in info ? (
          <>
            <b>{info.company}</b>
            <span>{info.role}</span>
            <span className="ob-dim">{rangeLabel(info.start, info.end)}</span>
          </>
        ) : info ? (
          <>
            <b>{info.name}</b>
            <span>{info.kind}</span>
            <span className="ob-dim">{info.status}</span>
          </>
        ) : null}
      </div>
    </div>
  );
}

/* ───────────────────────────── Crew (AI) ───────────────────────────── */

function Crew() {
  const [a, b] = AI_LINES.orbital.split(". ");
  const status = ["ACTIVE", "ACTIVE", "ON CALL", "LINKED"];
  return (
    <section className="ob-sec ob-wrap" id="crew">
      <SecHead code="SEC-02" label="Crew manifest" />
      <div className="ob-crew">
        <div data-reveal>
          <h2 className="ob-h2">
            {a}.<br />
            <em>{b}</em>
          </h2>
          <p className="ob-body">{AI.body}</p>
          <ul className="ob-manifest">
            {AI.tools.map((t, i) => (
              <li key={t.name}>
                <span className="ob-manifest__id">CR-{String(i + 1).padStart(2, "0")}</span>
                <b>{t.name}</b>
                <span className="ob-dim">{t.note}</span>
                <span className={`ob-status ob-status--${i}`}>{status[i]}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="ob-loop" data-reveal aria-label={`Loop: ${AI.loop.join(", ")}`}>
          <div className="ob-loop__ring" aria-hidden="true">
            <span className="ob-loop__dot" />
          </div>
          {AI.loop.map((s, i) => (
            <span
              key={s}
              className="ob-loop__node"
              style={{ "--a": `${(360 / AI.loop.length) * i - 90}deg`, "--i": i } as CSSProperties}
            >
              <i>{String(i + 1).padStart(2, "0")}</i>
              {s}
            </span>
          ))}
          <p className="ob-loop__core">
            <b>AGENT LOOP</b>
            <span>human sets course</span>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Vora ───────────────────────────── */

function Vora() {
  const [vora, probe] = PROJECTS;
  return (
    <section className="ob-sec ob-wrap" id="vora">
      <SecHead code="SEC-03" label="Primary mission" />
      <div className="ob-vora">
        <div className="ob-vora__copy" data-reveal>
          <p className="ob-kicker ob-kicker--blue">
            {vora.kind} · {vora.status}
          </p>
          <h2 className="ob-h2 ob-h2--xl">{vora.name.toUpperCase()}</h2>
          <p className="ob-tag">{vora.tagline}</p>
          <p className="ob-body">{vora.pitch}</p>
          <ul className="ob-objectives">
            {vora.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <div className="ob-chips">
            {vora.stack.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
          <a className="ob-btn ob-btn--blue" href={vora.url} target="_blank" rel="noreferrer">
            vora.sh ↗
          </a>
        </div>
        <Containment />
      </div>
      <article className="ob-probe" data-reveal>
        <div>
          <p className="ob-kicker">SUB-MISSION // {probe.kind}</p>
          <h3 className="ob-h3">{probe.name}</h3>
          <p className="ob-tag">{probe.tagline}</p>
          <p className="ob-body">{probe.pitch}</p>
          <a className="ob-link" href={probe.url} target="_blank" rel="noreferrer">
            vora.sh/probe ↗
          </a>
        </div>
        <ol className="ob-chain" aria-label="Investigation chain">
          {["Alert", "Observe", "Hypothesise", "Evidence", "Report | refuse"].map((s, i) => (
            <li key={s} style={{ "--i": i } as CSSProperties}>
              <i />
              {s}
            </li>
          ))}
        </ol>
      </article>
    </section>
  );
}

// Nested boundaries, as in the vora README: host → runner → backend → sandbox → agent.
function Containment() {
  const layers = ["host", "vora-runner", "bwrap | gVisor", "sandbox · /workspace", "agent"];
  return (
    <figure className="ob-contain" data-reveal aria-label="Vora containment layers">
      {layers.map((l, i) => (
        <div key={l} className="ob-contain__layer" style={{ "--i": i } as CSSProperties}>
          <span>{l}</span>
        </div>
      ))}
      <span className="ob-contain__probe ob-contain__probe--a" aria-hidden="true" />
      <span className="ob-contain__probe ob-contain__probe--b" aria-hidden="true" />
      <span className="ob-contain__probe ob-contain__probe--c" aria-hidden="true" />
      <figcaption>
        <span>169.254.169.254 → <b>BLOCKED</b></span>
        <span>fork bomb → <b>CONTAINED</b></span>
        <span>egress → <b>DEFAULT DENY</b></span>
      </figcaption>
    </figure>
  );
}

/* ───────────────────────────── Missions ───────────────────────────── */

function uses(text: string, skill: string) {
  if (skill === "CI/CD") return /CI\/CD|GitHub Actions|Bitbucket|GitLab|ArgoCD/i.test(text);
  const esc = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^\\w])${esc}([^\\w]|$)`, "i").test(text);
}

function Missions({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const [filter, setFilter] = useState<string | null>(null);
  const job = JOBS.find((j) => j.id === selected) ?? JOBS[0];
  const matches = useMemo(
    () =>
      new Set(
        JOBS.filter((j) => !filter || uses([j.stack.join(" · "), ...j.highlights].join(" "), filter)).map((j) => j.id),
      ),
    [filter],
  );

  // Timeline lanes: overlapping jobs stack.
  const t0 = 2016;
  const t1 = yearValue(null);
  const lanes = useMemo(() => {
    const ends: number[] = [];
    return [...JOBS].reverse().map((j) => {
      const s = yearValue(j.start);
      const e = yearValue(j.end);
      let lane = ends.findIndex((x) => x <= s + 0.01);
      if (lane < 0) lane = ends.length;
      ends[lane] = e;
      return { j, s, e, lane };
    });
  }, [t1]);

  return (
    <section className="ob-sec ob-wrap" id="missions">
      <SecHead code="SEC-04" label="Mission log" />
      <div className="ob-filter" data-reveal>
        <span className="ob-dim">FILTER BY PAYLOAD</span>
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={filter === f ? "is-on" : ""}
            aria-pressed={filter === f}
            onClick={() => {
              const next = filter === f ? null : f;
              setFilter(next);
              // Keep the panel on a mission that matches the new filter.
              const hit = next && JOBS.find((j) => uses([j.stack.join(" · "), ...j.highlights].join(" "), next));
              if (hit && !uses([job.stack.join(" · "), ...job.highlights].join(" "), next)) onSelect(hit.id);
            }}
          >
            {f}
          </button>
        ))}
        <span className="ob-filter__count">
          {filter ? `${matches.size} / ${JOBS.length} missions` : `${JOBS.length} missions`}
        </span>
      </div>

      <div className="ob-track" data-reveal>
        <div className="ob-track__lanes">
          {lanes.map(({ j, s, e, lane }) => (
            <button
              key={j.id}
              type="button"
              className={`ob-track__seg ${j.id === selected ? "is-sel" : ""} ${matches.has(j.id) ? "" : "is-dim"}`}
              style={{
                left: `${((s - t0) / (t1 - t0)) * 100}%`,
                width: `${((e - s) / (t1 - t0)) * 100}%`,
                top: `${lane * 22}px`,
              }}
              onClick={() => onSelect(j.id)}
              title={`${j.company} · ${rangeLabel(j.start, j.end)}`}
            >
              <span>{CALL[j.id]}</span>
            </button>
          ))}
        </div>
        <div className="ob-track__axis" aria-hidden="true">
          {Array.from({ length: Math.floor(t1) - t0 + 1 }, (_, i) => t0 + i).map((y) => (
            <span key={y} style={{ left: `${((y - t0) / (t1 - t0)) * 100}%` }}>
              {String(y).slice(2)}
            </span>
          ))}
        </div>
      </div>

      <div className="ob-missions">
        <ol className="ob-mlist" data-reveal>
          {JOBS.map((j) => (
            <li key={j.id}>
              <button
                type="button"
                className={`${j.id === selected ? "is-sel" : ""} ${matches.has(j.id) ? "" : "is-dim"}`}
                onClick={() => onSelect(j.id)}
                aria-pressed={j.id === selected}
              >
                <span className="ob-mlist__call">{CALL[j.id]}</span>
                <span className="ob-mlist__main">
                  <b>{j.company}</b>
                  <span>{j.role}</span>
                </span>
                <span className="ob-mlist__yr">
                  {j.start.slice(0, 4)}–{j.end ? j.end.slice(2, 4) : "now"}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <article className="ob-mpanel" key={job.id} aria-live="polite">
          <header>
            <span className="ob-kicker">MISSION {CALL[job.id]} · {job.end ? "COMPLETE" : "IN PROGRESS"}</span>
            <span className="ob-dim">
              T+{durationLabel(job.start, job.end)}
            </span>
          </header>
          <h3 className="ob-h3">{job.company}</h3>
          <p className="ob-mpanel__role">{job.role}</p>
          <dl className="ob-mpanel__meta">
            <div>
              <dt>Launch</dt>
              <dd>{monthLabel(job.start)}</dd>
            </div>
            <div>
              <dt>{job.end ? "Landed" : "Status"}</dt>
              <dd>{job.end ? monthLabel(job.end) : "in orbit"}</dd>
            </div>
            <div>
              <dt>Base</dt>
              <dd>{job.place}</dd>
            </div>
          </dl>
          <p className="ob-tag">{job.summary}</p>
          <ul className="ob-objectives">
            {job.highlights.map((h) => (
              <li key={h} className={filter && uses(h, filter) ? "is-hit" : ""}>
                {h}
              </li>
            ))}
          </ul>
          <div className="ob-chips">
            {job.stack.map((s) => (
              <span key={s} className={filter && uses(s, filter) ? "is-hit" : ""}>
                {s}
              </span>
            ))}
          </div>
          {job.url && (
            <a className="ob-link" href={job.url} target="_blank" rel="noreferrer">
              {job.url.replace(/^https:\/\/|\/$/g, "")} ↗
            </a>
          )}
        </article>
      </div>
    </section>
  );
}

/* ───────────────────────────── Systems ───────────────────────────── */

function Systems() {
  return (
    <section className="ob-sec ob-wrap" id="systems">
      <SecHead code="SEC-05" label="Onboard systems" />
      <div className="ob-langs" data-reveal>
        <span className="ob-dim">PRIMARY LANGUAGES</span>
        {CODE_LANGS.map((l) => (
          <b key={l}>{l}</b>
        ))}
      </div>
      <div className="ob-systems">
        {STACK.map((g, i) => (
          <div key={g.group} className="ob-panel" data-reveal style={{ "--i": i } as CSSProperties}>
            <p className="ob-panel__head">
              <span>SYS-{String(i + 1).padStart(2, "0")}</span>
              <b>{g.group}</b>
            </p>
            <ul>
              {g.items.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="ob-focus" data-reveal>
        {PROFILE.focus.map((f) => (
          <span key={f}>{f}</span>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────────── Comms ───────────────────────────── */

function Comms({ reduced }: { reduced: boolean }) {
  const { address, reveal } = useEmail();
  const [phase, setPhase] = useState<"idle" | "handshake" | "open">("idle");
  const shown = useScramble(address ?? "", phase === "open", reduced, 1000);

  const connect = () => {
    reveal();
    if (reduced) return setPhase("open");
    setPhase("handshake");
    window.setTimeout(() => setPhase("open"), 900);
  };

  return (
    <section className="ob-sec ob-wrap" id="comms">
      <SecHead code="SEC-06" label="Comms" />
      <div className="ob-comms">
        <div className="ob-channels" data-reveal>
          <p className="ob-dim">LANGUAGE CHANNELS</p>
          {LANGUAGES.map((l) => (
            <div key={l.code} className="ob-channel">
              <span className="ob-channel__code">CH-{l.code.toUpperCase()}</span>
              <span className="ob-wave" style={{ "--amp": l.bars / 4 } as CSSProperties} aria-hidden="true">
                {Array.from({ length: 24 }, (_, i) => (
                  <i key={i} style={{ "--i": i } as CSSProperties} />
                ))}
              </span>
              <span className="ob-channel__name">
                <b>{l.name}</b>
                <span>{l.level}</span>
              </span>
            </div>
          ))}
        </div>
        <div className="ob-link-box" data-reveal>
          <h2 className="ob-h2">Open a channel.</h2>
          <p className="ob-body">Remote from {PROFILE.location}, on Central European Time.</p>
          <div className="ob-link-box__email">
            {phase === "idle" && (
              <button type="button" className="ob-btn ob-btn--primary" onClick={connect}>
                Establish link
              </button>
            )}
            {phase === "handshake" && <span className="ob-handshake">HANDSHAKE ▮▮▮▯▯ …</span>}
            {phase === "open" && (
              <a href={`mailto:${address}`} className="ob-email">
                {shown}
              </a>
            )}
          </div>
          <div className="ob-actions">
            <a className="ob-btn" href={LINKS.github} target="_blank" rel="noreferrer">
              GitHub ↗
            </a>
            <a className="ob-btn" href={LINKS.linkedin} target="_blank" rel="noreferrer">
              LinkedIn ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function SecHead({ code, label }: { code: string; label: string }) {
  return (
    <p className="ob-sechead" data-reveal>
      <span>{code}</span>
      <b>{label}</b>
      <i aria-hidden="true" />
    </p>
  );
}
