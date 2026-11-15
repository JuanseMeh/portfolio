"use client";

import { useEffect, useRef } from "react";

function hash(x: number, y: number) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

function noise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;

  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);

  const u = smooth(xf);
  const v = smooth(yf);

  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, y: number) {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let total = 0;

  for (let i = 0; i < 4; i += 1) {
    value += noise(x * frequency, y * frequency) * amplitude;
    total += amplitude;
    amplitude *= 0.5;
    frequency *= 2.02;
  }

  return value / total;
}

export default function ContourField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");

    let width = 0;
    let height = 0;
    let frame = 0;
    let last = 0;
    let running = true;

    const pointer = {
      x: 0,
      y: 0,
      tx: 0,
      ty: 0,
      active: false,
      strength: 0,
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time: number) => {
      const cell = width < 720 ? 22 : 16;
      const cols = Math.ceil(width / cell) + 1;
      const rows = Math.ceil(height / cell) + 1;
      const field = new Float32Array(cols * rows);

      const phase = time * 0.000055;
      const peakX = 0.63;
      const peakY = 0.43;

      pointer.x += (pointer.tx - pointer.x) * 0.07;
      pointer.y += (pointer.ty - pointer.y) * 0.07;
      pointer.strength +=
        ((pointer.active ? 0.3 : 0) - pointer.strength) * 0.05;

      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const nx = x / cols;
          const ny = y / rows;

          let value = fbm(x * 0.045 + phase, y * 0.045 - phase * 0.55);

          const peakDx = (nx - peakX) / 0.46;
          const peakDy = (ny - peakY) / 0.5;
          value += 0.34 * Math.exp(-(peakDx * peakDx + peakDy * peakDy));

          if (pointer.strength > 0.002) {
            const px = pointer.x / cell;
            const py = pointer.y / cell;
            const dx = (x - px) / 13;
            const dy = (y - py) / 13;
            value += pointer.strength * Math.exp(-(dx * dx + dy * dy));
          }

          field[y * cols + x] = value;
        }
      }

      context.clearRect(0, 0, width, height);
      context.lineCap = "round";
      context.lineJoin = "round";

      const levels = 23;

      for (let levelIndex = 1; levelIndex < levels; levelIndex += 1) {
        const level = 0.08 + (levelIndex / levels) * 1.02;
        const path = new Path2D();
        let hasPoints = false;

        for (let y = 0; y < rows - 1; y += 1) {
          for (let x = 0; x < cols - 1; x += 1) {
            const v0 = field[y * cols + x];
            const v1 = field[y * cols + x + 1];
            const v2 = field[(y + 1) * cols + x + 1];
            const v3 = field[(y + 1) * cols + x];

            let count = 0;
            const px = [0, 0, 0, 0];
            const py = [0, 0, 0, 0];

            if ((v0 < level && v1 >= level) || (v0 >= level && v1 < level)) {
              const t = (level - v0) / (v1 - v0);
              px[count] = (x + t) * cell;
              py[count] = y * cell;
              count += 1;
            }
            if ((v1 < level && v2 >= level) || (v1 >= level && v2 < level)) {
              const t = (level - v1) / (v2 - v1);
              px[count] = (x + 1) * cell;
              py[count] = (y + t) * cell;
              count += 1;
            }
            if ((v3 < level && v2 >= level) || (v3 >= level && v2 < level)) {
              const t = (level - v3) / (v2 - v3);
              px[count] = (x + t) * cell;
              py[count] = (y + 1) * cell;
              count += 1;
            }
            if ((v0 < level && v3 >= level) || (v0 >= level && v3 < level)) {
              const t = (level - v0) / (v3 - v0);
              px[count] = x * cell;
              py[count] = (y + t) * cell;
              count += 1;
            }

            if (count === 2) {
              path.moveTo(px[0], py[0]);
              path.lineTo(px[1], py[1]);
              hasPoints = true;
            } else if (count === 4) {
              path.moveTo(px[0], py[0]);
              path.lineTo(px[1], py[1]);
              path.moveTo(px[2], py[2]);
              path.lineTo(px[3], py[3]);
              hasPoints = true;
            }
          }
        }

        if (!hasPoints) continue;

        const ratio = levelIndex / levels;
        const alpha = 0.034 + ratio * 0.092;
        context.strokeStyle = `rgba(231, 228, 234, ${alpha.toFixed(3)})`;
        context.lineWidth = levelIndex % 5 === 0 ? 0.9 : 0.55;
        context.stroke(path);
      }
    };

    const loop = (now: number) => {
      if (!running) return;
      frame = window.requestAnimationFrame(loop);
      if (now - last < 38) return;
      last = now;
      draw(now);
    };

    const start = () => {
      if (running) return;
      running = true;
      frame = window.requestAnimationFrame(loop);
    };

    const stop = () => {
      running = false;
      window.cancelAnimationFrame(frame);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (coarse.matches) return;
      pointer.tx = event.clientX;
      pointer.ty = event.clientY;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (!reduced.matches) start();
    };

    const onReduced = () => {
      stop();
      resize();
      draw(0);
      if (!reduced.matches) start();
    };

    resize();
    draw(0);

    if (!reduced.matches) start();

    const observer = new ResizeObserver(() => {
      stop();
      resize();
      draw(performance.now());
      if (!reduced.matches) start();
    });
    observer.observe(document.documentElement);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);
    reduced.addEventListener("change", onReduced);

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", onReduced);
    };
  }, []);

  return <canvas ref={canvasRef} className="contour-canvas" aria-hidden="true" />;
}
