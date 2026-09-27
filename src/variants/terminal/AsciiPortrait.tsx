import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { usePortraitGrid } from "../../shared/hooks";

const RAMP = " .:-=+*#%@";
const NOISE = "01<>/\\{}[]#%&$";
const FONT_PX = 8;
const CELL_W = 4.8; // JetBrains Mono advance is 0.6em
const CELL_H = 8;

// The photo drawn as characters on a canvas. It decodes from noise on load,
// glitches a band now and then, and the real photo shows through a lens that
// follows the pointer (tap toggles it on touch screens).
export function AsciiPortrait({ src, alt, reduced }: { src: string; alt: string; reduced: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState(0);
  const [lens, setLens] = useState(false);
  const [full, setFull] = useState(false);
  const cols = Math.floor(size / CELL_W);
  const rows = Math.floor(size / CELL_H);
  const raw = usePortraitGrid(src, cols, rows);
  const grid = useMemo(() => raw && enhance(raw, cols, rows), [raw, cols, rows]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const c = canvas.current;
    if (!c || !grid || !size) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = size * dpr;
    c.height = size * dpr;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const accent = getComputedStyle(c).getPropertyValue("--accent-rgb").trim() || "61 255 154";
    const [ar, ag, ab] = accent.split(" ").map(Number);
    const ox = (size - cols * CELL_W) / 2;
    const oy = (size - rows * CELL_H) / 2;

    // resolved(i) says whether cell i shows its real glyph this frame.
    const draw = (resolved: (i: number) => boolean) => {
      ctx.clearRect(0, 0, size, size);
      ctx.font = `${FONT_PX}px "JetBrains Mono", monospace`;
      ctx.textBaseline = "top";
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          const l = grid[i];
          if (l < 0.2) continue;
          const real = resolved(i);
          const ch = real ? RAMP[Math.round(l * (RAMP.length - 1))] : NOISE[(Math.random() * NOISE.length) | 0];
          if (ch === " ") continue;
          // Accent in the shadows, fading to near-white in the highlights.
          const w = real ? Math.max(0, (l - 0.6) / 0.4) : 0;
          ctx.fillStyle = `rgba(${ar + (236 - ar) * w}, ${ag + (255 - ag) * w}, ${ab + (244 - ab) * w}, ${real ? 0.2 + l * 0.8 : 0.35})`;
          ctx.fillText(ch, ox + x * CELL_W, oy + y * CELL_H);
        }
      }
    };

    let raf = 0;
    let timer = 0;
    let alive = true;
    document.fonts.load(`${FONT_PX}px "JetBrains Mono"`).finally(() => {
      if (!alive) return;
      if (reduced) return draw(() => true);

      // Decode: rows settle top to bottom, with per-cell jitter.
      const seed = new Float32Array(cols * rows).map(() => Math.random() * 0.35);
      const t0 = performance.now();
      const decode = (t: number) => {
        const p = (t - t0) / 1500;
        draw((i) => Math.floor(i / cols) / rows + seed[i] < p * 1.35);
        if (p < 1) raf = requestAnimationFrame(decode);
        else {
          draw(() => true);
          timer = window.setTimeout(glitch, 2600);
        }
      };
      // Glitch: a thin band of rows scrambles for a few frames.
      const glitch = () => {
        const r0 = (Math.random() * rows) | 0;
        const band = 1 + ((Math.random() * 3) | 0);
        let n = 0;
        const step = () => {
          draw((i) => {
            const r = Math.floor(i / cols);
            return r < r0 || r >= r0 + band;
          });
          if (++n < 5) raf = requestAnimationFrame(step);
          else {
            draw(() => true);
            timer = window.setTimeout(glitch, 2200 + Math.random() * 3000);
          }
        };
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(decode);
    });
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [grid, size, cols, rows, reduced]);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const b = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - b.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - b.top}px`);
  };

  return (
    <div
      ref={box}
      className={`tt-ascii ${lens ? "is-lens" : ""} ${full ? "is-full" : ""} ${grid ? "" : "is-plain"}`}
      onPointerEnter={(e) => e.pointerType === "mouse" && setLens(true)}
      onPointerLeave={() => setLens(false)}
      onPointerMove={onMove}
      onClick={() => setFull((f) => !f)}
    >
      <canvas ref={canvas} aria-hidden="true" style={{ width: size, height: size }} />
      <img src={src} alt={alt} draggable={false} />
    </div>
  );
}

// Stretch tones between the 4th and 99th percentile, sharpen with an unsharp
// mask so eyes and mouth survive the downsample, then lift the midtones.
function enhance(src: Float32Array, cols: number, rows: number) {
  const sorted = Float32Array.from(src).sort();
  const lo = sorted[Math.floor(sorted.length * 0.04)];
  const hi = sorted[Math.floor(sorted.length * 0.99)];
  const n = src.map((v) => Math.min(1, Math.max(0, (v - lo) / (hi - lo || 1))));
  const out = new Float32Array(n.length);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let sum = 0;
      let cnt = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          const yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= cols || yy >= rows) continue;
          sum += n[yy * cols + xx];
          cnt++;
        }
      }
      const i = y * cols + x;
      const sharp = n[i] + 1.1 * (n[i] - sum / cnt);
      out[i] = Math.pow(Math.min(1, Math.max(0, sharp)), 0.55);
    }
  }
  return out;
}
