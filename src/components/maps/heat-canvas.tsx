import { useEffect, useRef, useState } from "react";
import { magmaRgb } from "@/lib/magma";
import type { ClickPoint } from "@/mock/maps";

type HeatCanvasProps = {
  points: ClickPoint[];
  // Jari-jari titik sebagai pecahan lebar kanvas
  radiusRatio?: number;
  // Seberapa pekat satu titik sebelum ditumpuk
  pointAlpha?: number;
};

const MAX_OUTPUT_ALPHA = 0.88;

// Teknik heatmap klasik: tumpuk bulatan transparan, lalu petakan kepekatan ke palet magma
function drawHeat(canvas: HTMLCanvasElement, points: ClickPoint[], width: number, height: number, radiusRatio: number, pointAlpha: number) {
  const context = canvas.getContext("2d");
  const scratch = document.createElement("canvas");
  scratch.width = width;
  scratch.height = height;
  const scratchContext = scratch.getContext("2d", { willReadFrequently: true });
  if (context === null || scratchContext === null) return;

  const radius = Math.max(20, width * radiusRatio);
  for (const point of points) {
    const x = point.x * width;
    const y = point.y * height;
    const gradient = scratchContext.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(0, 0, 0, ${pointAlpha})`);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    scratchContext.fillStyle = gradient;
    scratchContext.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  const image = scratchContext.getImageData(0, 0, width, height);
  const { data } = image;
  let peak = 1;
  for (let index = 3; index < data.length; index += 4) peak = Math.max(peak, data[index] ?? 0);

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3] ?? 0;
    if (alpha === 0) continue;
    const t = alpha / peak;
    const [r, g, b] = magmaRgb(t);
    data[index] = r;
    data[index + 1] = g;
    data[index + 2] = b;
    // Area sepi dibiarkan menipis supaya halaman di bawahnya tetap terbaca
    data[index + 3] = Math.round(255 * Math.min(1, t * 1.25) * MAX_OUTPUT_ALPHA);
  }
  context.clearRect(0, 0, width, height);
  context.putImageData(image, 0, 0);
}

function HeatCanvas({ points, radiusRatio = 0.045, pointAlpha = 0.18 }: HeatCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (parent === null || parent === undefined) return;
    const observer = new ResizeObserver(() => {
      setSize({ width: Math.round(parent.clientWidth), height: Math.round(parent.clientHeight) });
    });
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null || size.width === 0 || size.height === 0) return;
    canvas.width = size.width;
    canvas.height = size.height;
    drawHeat(canvas, points, size.width, size.height, radiusRatio, pointAlpha);
  }, [points, size, radiusRatio, pointAlpha]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />;
}

export { HeatCanvas };
