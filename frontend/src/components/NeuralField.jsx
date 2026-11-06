import { useEffect, useRef } from "react";

// Depth-sorted particle mesh with a cursor-reactive glow.
export const NeuralField = ({ density = 90, className = "" }) => {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999 };
    let w = 0, h = 0, raf;

    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const pts = Array.from({ length: density }, () => ({
      x: Math.random() * w, y: Math.random() * h, z: Math.random(),
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
    }));
    const onMove = (e) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx * (0.4 + p.z); p.y += p.vy * (0.4 + p.z);
        if (p.x < -20) p.x = w + 20; if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20; if (p.y > h + 20) p.y = -20;
        const d = Math.hypot(mouse.x - p.x, mouse.y - p.y);
        if (d < 200) { p.x -= (mouse.x - p.x) * 0.0025; p.y -= (mouse.y - p.y) * 0.0025; }
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > 140) continue;
          const near = Math.hypot(mouse.x - a.x, mouse.y - a.y) < 180;
          const alpha = (1 - d / 140) * (0.08 + (a.z + b.z) * 0.12) * (near ? 2.4 : 1);
          ctx.strokeStyle = near ? `rgba(34,211,238,${alpha})` : `rgba(99,120,255,${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      for (const p of pts) {
        ctx.fillStyle = `rgba(${150 + p.z * 60},${180 + p.z * 40},255,${0.25 + p.z * 0.6})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 0.6 + p.z * 1.7, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); window.removeEventListener("mousemove", onMove); };
  }, [density]);

  return <canvas ref={ref} className={`absolute inset-0 h-full w-full ${className}`} aria-hidden />;
};
