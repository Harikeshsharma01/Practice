import React, { useEffect, useRef } from "react";
// Two lightweight canvases keep the sky behind content and touch sparks above it.
// Decorations never intercept clicks, and animation stops in hidden tabs.
export default function CosmicScene({ enabled }) {
  const sky = useRef(null),
    magic = useRef(null);
  useEffect(() => {
    document.documentElement.dataset.cosmicEffects = enabled ? "on" : "off";
    const canvas = sky.current,
      overlay = magic.current,
      ctx = canvas.getContext("2d"),
      fx = overlay.getContext("2d");
    if (!ctx || !fx) return;
    let width = 0,
      height = 0,
      stars = [],
      particles = [],
      rings = [],
      raf = 0,
      last = 0,
      warp = 0,
      moveAt = 0;
    const pointer = { x: -1000, y: -1000 };
    const palette = ["#bda4ff", "#84e8ff", "#f5d8ff", "#ffd9a3"];
    function size() {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      for (const [c, context] of [
        [canvas, ctx],
        [overlay, fx],
      ]) {
        c.width = width * dpr;
        c.height = height * dpr;
        c.style.width = width + "px";
        c.style.height = height + "px";
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      stars = Array.from({ length: width < 700 ? 65 : 145 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.4 + Math.random() * 1.3,
        phase: Math.random() * 6.28,
        depth: 0.2 + Math.random() * 0.8,
      }));
      draw(performance.now(), 0);
    }
    function burst(x, y, count = 28) {
      if (!enabled) return;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2,
          velocity = 0.5 + Math.random() * 3.5;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: 1,
          r: 1 + Math.random() * 2,
          color: palette[i % palette.length],
        });
      }
      particles = particles.slice(-180);
      rings.push({ x, y, r: 5, life: 1 });
      rings = rings.slice(-5);
    }
    function draw(now, delta) {
      ctx.clearRect(0, 0, width, height);
      fx.clearRect(0, 0, width, height);
      const connections = [];
      for (const star of stars) {
        const drift = enabled
          ? Math.sin(now * 0.00012 + star.phase) * star.depth * 5
          : 0;
        const x = star.x + drift,
          y = star.y + (enabled ? Math.cos(now * 0.00009 + star.phase) * 3 : 0);
        const alpha = enabled
          ? 0.35 + (0.5 + 0.5 * Math.sin(now * 0.0007 + star.phase)) * 0.45
          : 0.5;
        ctx.fillStyle = `rgba(209,218,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, star.r, 0, Math.PI * 2);
        ctx.fill();
        if (enabled && Math.hypot(x - pointer.x, y - pointer.y) < 135)
          connections.push({ x, y });
        if (warp > 0) {
          ctx.strokeStyle = `rgba(166,183,255,${warp * 0.4})`;
          ctx.lineWidth = star.r * 0.7;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(
            x + (x - width / 2) * warp * 0.045,
            y + (y - height / 2) * warp * 0.045,
          );
          ctx.stroke();
        }
      }
      if (enabled) {
        ctx.strokeStyle = "rgba(146,197,255,.16)";
        ctx.lineWidth = 0.6;
        for (const star of connections.slice(0, 8)) {
          ctx.beginPath();
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(star.x, star.y);
          ctx.stroke();
        }
        for (const p of particles) {
          p.x += p.vx * delta;
          p.y += p.vy * delta;
          p.vy += 0.009 * delta;
          p.life -= 0.018 * delta;
          fx.globalAlpha = Math.max(0, p.life);
          fx.fillStyle = p.color;
          fx.shadowColor = p.color;
          fx.shadowBlur = 9;
          fx.beginPath();
          fx.arc(p.x, p.y, p.r * Math.max(0.2, p.life), 0, Math.PI * 2);
          fx.fill();
        }
        fx.shadowBlur = 0;
        particles = particles.filter((p) => p.life > 0);
        for (const ring of rings) {
          ring.r += 2.5 * delta;
          ring.life -= 0.025 * delta;
          fx.globalAlpha = Math.max(0, ring.life * 0.6);
          fx.strokeStyle = "#bfa5ff";
          fx.lineWidth = 1;
          fx.beginPath();
          fx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
          fx.stroke();
        }
        rings = rings.filter((r) => r.life > 0);
        fx.globalAlpha = 1;
        warp = Math.max(0, warp - 0.022 * delta);
      }
    }
    function animate(now) {
      raf = requestAnimationFrame(animate);
      if (now - last < 30) return;
      const delta = Math.min((now - last) / 16.67, 3) || 1;
      last = now;
      draw(now, delta);
    }
    function start() {
      cancelAnimationFrame(raf);
      if (enabled && !document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(animate);
      } else draw(performance.now(), 0);
    }
    function move(event) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (!enabled) return;
      const now = performance.now();
      if (now - moveAt > 45 && event.pointerType !== "touch") {
        moveAt = now;
        particles.push({
          x: pointer.x,
          y: pointer.y,
          vx: (Math.random() - 0.5) * 0.4,
          vy: 0.2,
          life: 0.65,
          r: 1,
          color: palette[Math.floor(Math.random() * palette.length)],
        });
        particles = particles.slice(-180);
      }
      const card = event.target.closest?.(
        ".course-card,.button.primary,.lab-option",
      );
      if (card) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
        card.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
      }
    }
    function down(e) {
      burst(e.clientX, e.clientY);
    }
    function leave() {
      pointer.x = -1000;
      pointer.y = -1000;
    }
    function portal(event) {
      if (!enabled) return;
      warp = 1;
      const { x = width * 0.55, y = height * 0.35 } = event.detail || {};
      burst(x, y, 60);
    }
    size();
    start();
    window.addEventListener("resize", size);
    document.addEventListener("visibilitychange", start);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("sewestian-portal", portal);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      document.removeEventListener("visibilitychange", start);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("sewestian-portal", portal);
    };
  }, [enabled]);
  return (
    <>
      <div className="cosmic-backdrop" aria-hidden="true">
        <div className="nebula nebula-violet" />
        <div className="nebula nebula-cyan" />
        <div className="cosmic-dust" />
        <canvas ref={sky} />
      </div>
      <canvas className="cosmic-touch" ref={magic} aria-hidden="true" />
    </>
  );
}
