import { useEffect, useRef, useState } from "react";
import { RED, fitCanvas } from "../shared/DotField";
import { usePortraitGrid } from "../shared/hooks";

const RAMP = " .:-=+*#%@";
const LENS = 96;
const ZOOM = 1.8;

// The photo as a halftone; a loupe that follows the pointer magnifies it and
// decodes it into ASCII. Tap toggles the whole portrait to ASCII on touch screens.
export function DotAscii({ src, alt, reduced }: { src: string; alt: string; reduced: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState(0);
  const [all, setAll] = useState(false);
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
    let lens = 0; // eased lens radius, grows in on enter and out on leave
    let raf = 0;
    let running = false;
    let intro = reduced ? 1 : 0;
    const t0 = performance.now();

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      // Dots, except under the lens.
      ctx.fillStyle = "#f2f0ea";
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          const l = tone[y * n + x];
          if (l < 0.07) continue;
          const cx = x * GAP + GAP / 2;
          const cy = y * GAP + GAP / 2;
          if (all || Math.hypot(cx - mouse.x, cy - mouse.y) < lens) continue;
          const grow = Math.min(1, Math.max(0, intro * 2.2 - (x + y) / (2 * n)));
          const r = (GAP / 2) * Math.sqrt(l) * 0.95 * grow;
          if (r < 0.25) continue;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (all) return ascii(size / 2, size / 2, size, 1, GAP * 1.4);
      if (lens < 4) return;
      // The loupe: the same image, magnified, in characters.
      ctx.save();
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, lens, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
      ctx.fill();
      ascii(mouse.x, mouse.y, lens, ZOOM, 12);
      ctx.restore();
      ctx.strokeStyle = `rgba(${RED[0]}, ${RED[1]}, ${RED[2]}, 0.85)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, lens, 0, Math.PI * 2);
      ctx.stroke();
    };

    // Characters on a grid of `fontPx` cells covering a square of half-size
    // `half` around (mx, my), sampling the image `zoom`× magnified around it.
    const ascii = (mx: number, my: number, half: number, zoom: number, fontPx: number) => {
      const cw = fontPx * 0.6;
      ctx.font = `500 ${fontPx}px "JetBrains Mono", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let py = my - half + fontPx / 2; py < my + half; py += fontPx) {
        for (let px = mx - half + cw / 2; px < mx + half; px += cw) {
          const gx = Math.floor((mx + (px - mx) / zoom) / GAP);
          const gy = Math.floor((my + (py - my) / zoom) / GAP);
          if (gx < 0 || gy < 0 || gx >= n || gy >= n) continue;
          const l = tone[gy * n + gx];
          const ch = RAMP[Math.round(l * (RAMP.length - 1))];
          if (ch === " ") continue;
          const edge = zoom > 1 ? Math.min(1, Math.max(0, (Math.hypot(px - mx, py - my) / half - 0.7) / 0.3)) : 0;
          ctx.fillStyle = `rgba(${242 + (RED[0] - 242) * edge}, ${240 + (RED[1] - 240) * edge}, ${234 + (RED[2] - 234) * edge}, ${0.3 + l * 0.7})`;
          ctx.fillText(ch, px, py);
        }
      }
    };

    const inside = () => mouse.x > -9999;
    const loop = (t: number) => {
      if (intro < 1) intro = Math.min(1, (t - t0) / 1400);
      const target = inside() ? LENS : 0;
      lens += (target - lens) * 0.2;
      if (Math.abs(target - lens) < 0.5) lens = target;
      draw();
      if (intro < 1 || lens !== target || inside()) raf = requestAnimationFrame(loop);
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
        lens = LENS;
        draw();
      } else kick();
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
      if (reduced) {
        lens = 0;
        draw();
      } else kick();
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    document.fonts.load(`500 12px "JetBrains Mono"`).finally(() => (reduced ? draw() : kick()));
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [grid, size, n, GAP, reduced, all]);

  return (
    <div
      ref={box}
      className={`cn-dotascii ${grid ? "" : "is-plain"}`}
      onClick={() => setAll((a) => !a)}
      role="img"
      aria-label={alt}
    >
      <canvas ref={canvas} aria-hidden="true" />
      <img src={src} alt="" draggable={false} />
    </div>
  );
}
