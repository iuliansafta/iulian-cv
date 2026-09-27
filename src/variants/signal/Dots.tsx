import { useEffect, useRef, useState } from "react";
import { RED, fitCanvas } from "../../shared/DotField";
import { usePortraitGrid } from "../../shared/hooks";

// The photo as a halftone. Dots flee the pointer and spring back.
export function Halftone({ src, alt, reduced }: { src: string; alt: string; reduced: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState(0);
  const GAP = size < 360 ? 6 : 7;
  const n = Math.floor(size / GAP);
  const grid = usePortraitGrid(src, n, n);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const c = canvas.current;
    const el = box.current;
    if (!c || !el || !grid || !size) return;
    const ctx = fitCanvas(c, size, size);

    // Tone curve: stretch, then lift the midtones a little.
    const sorted = Float32Array.from(grid).sort();
    const lo = sorted[Math.floor(sorted.length * 0.05)];
    const hi = sorted[Math.floor(sorted.length * 0.995)];
    const tone = grid.map((v) => Math.pow(Math.min(1, Math.max(0, (v - lo) / (hi - lo || 1))), 0.85));

    const off = new Float32Array(n * n * 2); // current displacement
    const mouse = { x: -9999, y: -9999 };
    let raf = 0;
    let running = false;
    let intro = reduced ? 1 : 0;
    const t0 = performance.now();

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      let moving = false;
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          const i = y * n + x;
          const l = tone[i];
          if (l < 0.06) continue;
          const cx = x * GAP + GAP / 2;
          const cy = y * GAP + GAP / 2;
          const dx = cx - mouse.x;
          const dy = cy - mouse.y;
          const d = Math.hypot(dx, dy);
          const push = Math.max(0, 1 - d / 80);
          const tx = d ? (dx / d) * push * 18 : 0;
          const ty = d ? (dy / d) * push * 18 : 0;
          const ox = off[i * 2] + (tx - off[i * 2]) * 0.18;
          const oy = off[i * 2 + 1] + (ty - off[i * 2 + 1]) * 0.18;
          off[i * 2] = ox;
          off[i * 2 + 1] = oy;
          if (Math.abs(tx - ox) > 0.05 || Math.abs(ty - oy) > 0.05) moving = true;
          // Intro: dots grow in from the top-left diagonal.
          const grow = Math.min(1, Math.max(0, intro * 2.2 - (x + y) / (2 * n)));
          const r = (GAP / 2) * Math.sqrt(l) * 0.95 * grow;
          if (r < 0.25) continue;
          const heat = Math.min(1, push * 1.6);
          ctx.fillStyle = heat
            ? `rgb(${242 + (RED[0] - 242) * heat}, ${240 + (RED[1] - 240) * heat}, ${234 + (RED[2] - 234) * heat})`
            : "#f2f0ea";
          ctx.beginPath();
          ctx.arc(cx + ox, cy + oy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      return moving;
    };

    const loop = (t: number) => {
      if (intro < 1) intro = Math.min(1, (t - t0) / 1400);
      const moving = draw();
      if (moving || intro < 1 || mouse.x > -9999) raf = requestAnimationFrame(loop);
      else running = false;
    };
    const kick = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const b = c.getBoundingClientRect();
      mouse.x = e.clientX - b.left;
      mouse.y = e.clientY - b.top;
      if (!reduced) kick();
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
      if (!reduced) kick();
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    if (reduced) draw();
    else kick();
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [grid, size, n, GAP, reduced]);

  return (
    <div ref={box} className={`sg-halftone ${grid ? "" : "is-plain"}`}>
      <canvas ref={canvas} aria-hidden="true" />
      <img src={src} alt={alt} draggable={false} />
    </div>
  );
}
