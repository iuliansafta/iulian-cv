import { useEffect, useRef, useState } from "react";
import { EMAIL_PARTS } from "./content";

export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

// Adds `is-in` to every `[data-reveal]` descendant once it scrolls into view.
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const targets = root.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);
  return ref;
}

// Latches to true the first time the element is visible.
export function useSeen<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, seen]);
  return [ref, seen] as const;
}

// Types `text` out character by character while `active` is true.
export function useTypewriter(text: string, active: boolean, speed = 18) {
  const [out, setOut] = useState("");
  useEffect(() => {
    if (!active) return;
    setOut("");
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, active, speed]);
  return out;
}

// Wall-clock time in `timeZone`, ticking every second.
export function useClock(timeZone: string) {
  const fmt = () =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date());
  const [now, setNow] = useState(fmt);
  useEffect(() => {
    const id = window.setInterval(() => setNow(fmt()), 1000);
    return () => window.clearInterval(id);
  });
  return now;
}

// Resolves text from random glyphs to `target`, left to right, once `active`.
export function useScramble(target: string, active: boolean, reduced: boolean, duration = 900) {
  const [out, setOut] = useState(active ? target : "");
  useEffect(() => {
    if (!active) return;
    if (reduced) return setOut(target);
    const glyphs = "!<>-_\\/[]{}=+*^?#01";
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const fixed = Math.floor(p * target.length);
      let s = target.slice(0, fixed);
      for (let i = fixed; i < target.length; i++) {
        s += target[i] === " " ? " " : glyphs[(Math.random() * glyphs.length) | 0];
      }
      setOut(s);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, reduced, duration]);
  return out;
}

// The address is joined only when a visitor asks for it (see EMAIL_PARTS).
export function useEmail() {
  const [address, setAddress] = useState<string | null>(null);
  const reveal = () => {
    const a = EMAIL_PARTS.join("@");
    setAddress(a);
    return a;
  };
  return { address, reveal };
}

export function useCopy(timeout = 1600) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, key = "default") => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(key);
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), timeout);
    });
  };
  return { copied, copy };
}

// Loads an image and returns its luminance on a cols×rows grid (0..1), for
// the ASCII and halftone portraits. Same-origin only, or the canvas taints.
export function usePortraitGrid(src: string, cols: number, rows: number) {
  const [grid, setGrid] = useState<Float32Array | null>(null);
  useEffect(() => {
    if (cols < 1 || rows < 1) return;
    let alive = true;
    const img = new Image();
    img.src = src;
    img.onload = () => {
      if (!alive) return;
      const c = document.createElement("canvas");
      c.width = cols;
      c.height = rows;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, cols, rows);
      try {
        const { data } = ctx.getImageData(0, 0, cols, rows);
        const out = new Float32Array(cols * rows);
        for (let i = 0; i < out.length; i++) {
          const l = (0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]) / 255;
          out[i] = l;
        }
        setGrid(out);
      } catch {
        setGrid(null);
      }
    };
    return () => {
      alive = false;
    };
  }, [src, cols, rows]);
  return grid;
}

// Career uptime from `start`, ticking every second: "15y 08m 26d 14:02:11".
export function useUptime(start: string) {
  const calc = () => {
    const a = new Date(start);
    const b = new Date();
    let y = b.getFullYear() - a.getFullYear();
    let m = b.getMonth() - a.getMonth();
    let d = b.getDate() - a.getDate();
    if (d < 0) {
      m--;
      d += new Date(b.getFullYear(), b.getMonth(), 0).getDate();
    }
    if (m < 0) {
      y--;
      m += 12;
    }
    const p = (n: number) => String(n).padStart(2, "0");
    return `${y}y ${p(m)}m ${p(d)}d ${p(b.getHours())}:${p(b.getMinutes())}:${p(b.getSeconds())}`;
  };
  const [up, setUp] = useState(calc);
  useEffect(() => {
    const id = window.setInterval(() => setUp(calc()), 1000);
    return () => window.clearInterval(id);
  });
  return up;
}
