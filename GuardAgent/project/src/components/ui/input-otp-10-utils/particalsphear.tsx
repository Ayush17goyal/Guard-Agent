import React, { useEffect, useRef } from "react";

interface ParticleSphereAnimationProps {
  className?: string;
  particleCount?: number;
  radius?: number;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  size: number;
  color: string;
}

export default function ParticleSphereAnimation({
  className,
  particleCount = 180,
  radius = 55,
}: ParticleSphereAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let angleX = 0;
    let angleY = 0;
    const rotationSpeedX = 0.003;
    const rotationSpeedY = 0.007;

    // Generate uniformly distributed points on a sphere (Fibonacci sphere algorithm)
    const points: Point3D[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden ratio angle

    const colors = [
      "rgba(34, 211, 238, ", // cyan-400
      "rgba(56, 189, 248, ", // sky-400
      "rgba(99, 102, 241, ", // indigo-500
      "rgba(52, 211, 153, ", // emerald-400
    ];

    for (let i = 0; i < particleCount; i++) {
      const y = 1 - (i / (particleCount - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y); // radius at y
      const theta = phi * i; // golden angle increment

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      const px = x * radius;
      const py = y * radius;
      const pz = z * radius;

      const color = colors[i % colors.length];
      const size = Math.random() * 1.5 + 1.2;

      points.push({
        x: px,
        y: py,
        z: pz,
        baseX: px,
        baseY: py,
        baseZ: pz,
        size,
        color,
      });
    }

    const setCanvasDimensions = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = (rect.width || 140) * dpr;
      canvas.height = (rect.height || 140) * dpr;
      ctx.scale(dpr, dpr);
    };

    setCanvasDimensions();
    const resizeObserver = new ResizeObserver(setCanvasDimensions);
    resizeObserver.observe(canvas);

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || 140;
      const height = rect.height || 140;
      const cx = width / 2;
      const cy = height / 2;
      const focalLength = 180;

      ctx.clearRect(0, 0, width, height);

      angleX += rotationSpeedX;
      angleY += rotationSpeedY;

      const sinX = Math.sin(angleX);
      const cosX = Math.cos(angleX);
      const sinY = Math.sin(angleY);
      const cosY = Math.cos(angleY);

      // Rotate and project points
      const projected = points.map((p) => {
        // Rotate around Y
        const x1 = p.baseX * cosY - p.baseZ * sinY;
        const z1 = p.baseZ * cosY + p.baseX * sinY;

        // Rotate around X
        const y2 = p.baseY * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.baseY * sinX;

        // Perspective projection
        const scale = focalLength / (focalLength + z2 + 80);
        const x2D = cx + x1 * scale;
        const y2D = cy + y2 * scale;
        const depthAlpha = Math.max(0.15, Math.min(1, (z2 + radius) / (2 * radius) + 0.25));

        return {
          x: x2D,
          y: y2D,
          z: z2,
          scale,
          depthAlpha,
          color: p.color,
          size: p.size,
        };
      });

      // Sort by depth so farther particles are drawn first
      projected.sort((a, b) => a.z - b.z);

      // Draw subtle connecting lines between close points
      ctx.lineWidth = 0.5;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < Math.min(i + 4, projected.length); j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 22) {
            const lineAlpha = (1 - dist / 22) * 0.18 * ((p1.depthAlpha + p2.depthAlpha) / 2);
            ctx.strokeStyle = `rgba(34, 211, 238, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw particle points
      for (const p of projected) {
        ctx.beginPath();
        const r = Math.max(0.8, p.size * p.scale);
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.depthAlpha})`;
        ctx.fill();

        // Glow for foreground particles
        if (p.z > 15) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${(p.depthAlpha * 0.3).toFixed(2)})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [particleCount, radius]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
