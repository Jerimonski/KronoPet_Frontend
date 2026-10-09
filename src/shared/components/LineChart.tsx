import { useEffect, useId, useRef, useState } from "react";

export interface LinePoint {
  label: string;
  /** Texto largo para el tooltip (ej. "Noviembre 2025"). */
  tooltipLabel?: string;
  value: number;
}

interface LineChartProps {
  data: LinePoint[];
  height?: number;
  unit: string;
  color?: string;
  /** Formato de los valores (eje y tooltip). */
  format?: (value: number) => string;
  ariaLabel: string;
  /**
   * "zero": el eje Y parte en 0 (conteos). "auto": se ajusta al rango de los
   * datos, útil para medidas como el peso donde importan variaciones pequeñas.
   */
  domain?: "zero" | "auto";
}

const PAD = { top: 16, right: 12, bottom: 28, left: 36 };

/** Paso "redondo" (1, 2, 2.5, 5 × 10^n) mayor o igual a `raw`. */
function niceStep(raw: number) {
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  return ([1, 2, 2.5, 5, 10].find((s) => s * magnitude >= raw) ?? 10) * magnitude;
}

/** Límites y marcas del eje Y. */
function scale(values: number[], domain: "zero" | "auto") {
  const max = Math.max(...values, 0);
  if (domain === "zero") {
    // Mínimo 4 para que los conteos pequeños no generen marcas decimales.
    const step = max <= 4 ? 1 : niceStep(max / 4);
    return { lo: 0, hi: step * 4, step };
  }
  const min = Math.min(...values);
  const pad = (max - min || max * 0.1 || 1) * 0.15;
  const step = niceStep((max - min + pad * 2) / 4);
  const lo = Math.max(0, Math.floor((min - pad) / step) * step);
  return { lo, hi: lo + Math.max(Math.ceil((max + pad - lo) / step), 2) * step, step };
}

/** Curva suave (Catmull-Rom → Bézier) que no sobrepasa los extremos en exceso. */
function smoothPath(points: [number, number][]) {
  if (points.length < 2) return "";
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const t = 0.18;
    // Los puntos de control no salen del rango vertical del tramo: la curva nunca baja de 0.
    const clampY = (v: number) => Math.min(Math.max(v, Math.min(p1[1], p2[1])), Math.max(p1[1], p2[1]));
    d += ` C${p1[0] + (p2[0] - p0[0]) * t},${clampY(p1[1] + (p2[1] - p0[1]) * t)} ${p2[0] - (p3[0] - p1[0]) * t},${clampY(p2[1] - (p3[1] - p1[1]) * t)} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/** Gráfico de línea de una serie con área, crosshair y tooltip. */
export default function LineChart({
  data,
  height = 240,
  unit,
  color = "#0b9393",
  format = (v) => v.toLocaleString("es-CL"),
  ariaLabel,
  domain = "zero",
}: LineChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const gradientId = useId();
  const [width, setWidth] = useState(600);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { lo, hi, step } = scale(data.map((d) => d.value), domain);
  const innerW = Math.max(width - PAD.left - PAD.right, 10);
  const innerH = height - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (data.length > 1 ? (i / (data.length - 1)) * innerW : innerW / 2);
  const y = (v: number) => PAD.top + innerH - ((v - lo) / (hi - lo)) * innerH;
  const points = data.map((d, i) => [x(i), y(d.value)] as [number, number]);
  const line = smoothPath(points);
  const area = `${line} L${x(data.length - 1)},${y(lo)} L${x(0)},${y(lo)} Z`;
  const ticks = Array.from({ length: Math.round((hi - lo) / step) + 1 }, (_, n) => lo + step * n);
  // Deja ~44px por etiqueta del eje X para que no se superpongan.
  const labelEvery = Math.max(1, Math.ceil(data.length / Math.max(innerW / 44, 1)));

  const handleMove = (clientX: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect || data.length === 0) return;
    const rel = clientX - rect.left - PAD.left;
    const index = Math.round((rel / innerW) * (data.length - 1));
    setActive(Math.min(Math.max(index, 0), data.length - 1));
  };

  const activePoint = active != null ? data[active] : null;

  return (
    <div ref={ref} className="relative w-full select-none" style={{ height }}>
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={ariaLabel}
        onMouseMove={(e) => handleMove(e.clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onMouseLeave={() => setActive(null)}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={PAD.left + innerW}
              y1={y(t)}
              y2={y(t)}
              stroke="var(--color-neutral-200)"
              strokeDasharray={t === lo ? undefined : "3 4"}
            />
            <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-neutral-400 text-[11px] tabular-nums">
              {format(t)}
            </text>
          </g>
        ))}

        {data.map((d, i) =>
          i % labelEvery === 0 || i === data.length - 1 ? (
            <text
              key={d.label + i}
              x={x(i)}
              y={height - 8}
              textAnchor="middle"
              className={i === active ? "fill-neutral-900 text-[11px] font-semibold" : "fill-neutral-400 text-[11px]"}
            >
              {d.label}
            </text>
          ) : null,
        )}

        <path d={area} fill={`url(#${gradientId})`} />
        <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />

        {active != null && (
          <g>
            <line
              x1={x(active)}
              x2={x(active)}
              y1={PAD.top}
              y2={y(lo)}
              stroke="var(--color-neutral-400)"
              strokeDasharray="3 3"
            />
            <circle cx={x(active)} cy={y(data[active].value)} r={5} fill={color} stroke="white" strokeWidth={2} />
          </g>
        )}
      </svg>

      {activePoint && active != null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-neutral-900 px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-lg"
          style={{
            left: Math.min(Math.max(x(active), 60), width - 60),
            top: y(activePoint.value) - 10,
          }}
        >
          <p className="text-neutral-300">{activePoint.tooltipLabel ?? activePoint.label}</p>
          <p className="font-semibold tabular-nums">
            {format(activePoint.value)} <span className="font-normal text-neutral-300">{unit}</span>
          </p>
        </div>
      )}
    </div>
  );
}
