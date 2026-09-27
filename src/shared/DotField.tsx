import { useEffect, useRef } from "react";

export const RED = [255, 77, 46];

export function fitCanvas(c: HTMLCanvasElement, w: number, h: number) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  c.style.width = `${w}px`;
  c.style.height = `${h}px`;
  const ctx = c.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

// Background grid of dots. A slow diagonal swell passes through it, and dots
// near the pointer light up and turn red. Only animates while on screen.
export function DotField({ reduced, className }: { reduced: boolean; className: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    const host = c?.parentElement;
    if (!c || !host) return;
    const GAP = 22;
    let w = 0;
    let h = 0;
    let ctx = fitCanvas(c, 1, 1);
    let raf = 0;
    let visible = true;
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      w = host.clientWidth;
      h = host.clientHeight;
      ctx = fitCanvas(c, w, h);
      if (reduced) frame(0);
    };

    const frame = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (let y = GAP / 2; y < h; y += GAP) {
        for (let x = GAP / 2; x < w; x += GAP) {
          const swell = reduced ? 0 : Math.max(0, Math.sin((x + y) / 180 - t / 1600)) ** 6;
          const d = Math.hypot(x - mouse.x, y - mouse.y);
          const near = Math.max(0, 1 - d / 170);
          const a = 0.1 + swell * 0.18 + near * 0.8;
          const r = 0.9 + swell * 0.5 + near * 1.6;
          const mix = near * near;
          ctx.fillStyle = `rgba(${240 + (RED[0] - 240) * mix}, ${240 + (RED[1] - 240) * mix}, ${236 + (RED[2] - 236) * mix}, ${a})`;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const loop = (t: number) => {
      frame(t);
      if (visible) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const b = c.getBoundingClientRect();
      mouse.x = e.clientX - b.left;
      mouse.y = e.clientY - b.top;
      if (reduced) frame(0);
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
      if (reduced) frame(0);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !reduced) raf = requestAnimationFrame(loop);
    });
    io.observe(host);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    resize();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
