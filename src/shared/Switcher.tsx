import { useEffect, useState } from "react";
import "./switcher.css";

export const VARIANTS = [
  { key: "terminal", letter: "A", name: "Terminal" },
  { key: "orbital", letter: "B", name: "Orbital" },
  { key: "signal", letter: "C", name: "Signal" },
  { key: "console", letter: "D", name: "Console · A×C" },
] as const;

export type VariantKey = (typeof VARIANTS)[number]["key"];

export function Switcher({ current }: { current: VariantKey }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.altKey || e.metaKey || e.ctrlKey) return;
      const i = ["1", "2", "3", "4"].indexOf(e.key);
      if (i >= 0) window.location.hash = VARIANTS[i].key;
      if (e.key === "h") setHidden((h) => !h);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <nav className={`vx-switch ${hidden ? "is-hidden" : ""}`} aria-label="Design variants">
      <span className="vx-switch__label">Variant</span>
      {VARIANTS.map((v, i) => (
        <a
          key={v.key}
          href={`#${v.key}`}
          className={`vx-switch__item ${current === v.key ? "is-active" : ""}`}
          aria-current={current === v.key ? "page" : undefined}
          title={`${v.name} (${i + 1})`}
        >
          <b>{v.letter}</b>
          <span>{v.name}</span>
        </a>
      ))}
      <button className="vx-switch__hide" onClick={() => setHidden(true)} aria-label="Hide switcher (press h)">
        ×
      </button>
    </nav>
  );
}
