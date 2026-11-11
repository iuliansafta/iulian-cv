import { useEffect, useRef, useState } from "react";
import { fitCanvas } from "../shared/DotField";
import { usePortraitGrid } from "../shared/hooks";

const REACH = 90;

// The photo as a halftone. On hover, the dots near the pointer swell a little.
export function DotAscii({ src, alt, reduced }: { src: string; alt: string; reduced: boolean }) {
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

    const sorted = Float32Array.from(grid).sort();
    const lo = sorted[Math.floor(sorted.length * 0.05)];
    const hi = sorted[Math.floor(sorted.length * 0.995)];
    const tone = grid.map((v) => Math.pow(Math.min(1, Math.max(0, (v - lo) / (hi - lo || 1))), 0.8));

    const mouse = { x: -9999, y: -9999 };
    let amt = 0; // eased hover strength, 0 to 1
    let raf = 0;
    let running = false;
    let intro = reduced ? 1 : 0;
    const t0 = performance.now();

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = "#f2f0ea";
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          const l = tone[y * n + x];
          if (l < 0.07) continue;
          const cx = x * GAP + GAP / 2;
          const cy = y * GAP + GAP / 2;
          const grow = Math.min(1, Math.max(0, intro * 2.2 - (x + y) / (2 * n)));
          const near = amt > 0 ? amt * Math.max(0, 1 - Math.hypot(cx - mouse.x, cy - mouse.y) / REACH) : 0;
          const r = (GAP / 2) * Math.sqrt(l) * 0.95 * grow * (1 + near * 0.35);
          if (r < 0.25) continue;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const inside = () => mouse.x > -9999;
    const loop = (t: number) => {
      if (intro < 1) intro = Math.min(1, (t - t0) / 1400);
      const target = inside() ? 1 : 0;
      amt += (target - amt) * 0.15;
      if (Math.abs(target - amt) < 0.01) amt = target;
      draw();
      if (intro < 1 || amt !== target || inside()) raf = requestAnimationFrame(loop);
      else running = false;
    };
    const kick = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const b = c.getBoundingClientRect();
      mouse.x = e.clientX - b.left;
      mouse.y = e.clientY - b.top;
      if (reduced) {
        amt = 1;
        draw();
      } else kick();
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
      if (reduced) {
        amt = 0;
        draw();
      } else kick();
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    reduced ? draw() : kick();
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [grid, size, n, GAP, reduced]);

  return (
    <div ref={box} className={`cn-dotascii ${grid ? "" : "is-plain"}`} role="img" aria-label={alt}>
      <canvas ref={canvas} aria-hidden="true" />
      <img src={src} alt="" draggable={false} />
    </div>
  );
}
