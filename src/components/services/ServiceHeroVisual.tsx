import type { ServiceVisual } from "@/types/content";

function Radar({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
      <circle cx={60} cy={60} r={58} fill="none" stroke={accent} strokeOpacity={0.15} strokeWidth={1} />
      <circle cx={60} cy={60} r={38} fill="none" stroke={accent} strokeOpacity={0.25} strokeWidth={1} />
      <g style={{ transformOrigin: "60px 60px" }} className="animate-[ax-spin_4s_linear_infinite]">
        <line x1={60} y1={60} x2={60} y2={4} stroke={accent} strokeWidth={2} strokeLinecap="round" opacity={0.8} />
      </g>
      <circle cx={82} cy={40} r={3} fill={accent} className="animate-[ax-pulse_2.4s_ease-in-out_infinite]" />
      <circle cx={36} cy={78} r={3} fill={accent} className="animate-[ax-pulse_2.4s_ease-in-out_infinite]" style={{ animationDelay: "0.6s" }} />
    </svg>
  );
}

function Calendar({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
      <rect x={18} y={22} width={84} height={76} rx={8} fill="none" stroke={accent} strokeWidth={1.5} />
      <line x1={18} y1={42} x2={102} y2={42} stroke={accent} strokeWidth={1.5} />
      <circle cx={78} cy={72} r={20} fill="none" stroke={accent} strokeWidth={2} className="animate-[ax-pulse_2.6s_ease-in-out_infinite]" />
      <path d="M69,72 L75,79 L88,64" fill="none" stroke={accent} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Rings({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
      <circle cx={48} cy={60} r={30} fill="none" stroke={accent} strokeWidth={1.5} opacity={0.7} className="animate-[ax-pulse_2.6s_ease-in-out_infinite]" />
      <circle
        cx={72}
        cy={60}
        r={30}
        fill="none"
        stroke={accent}
        strokeWidth={1.5}
        opacity={0.7}
        className="animate-[ax-pulse_2.6s_ease-in-out_infinite]"
        style={{ animationDelay: "0.6s" }}
      />
    </svg>
  );
}

function Envelope({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
      <rect x={16} y={34} width={88} height={58} rx={6} fill="none" stroke={accent} strokeWidth={1.5} />
      <path
        d="M16,38 L60,68 L104,38"
        fill="none"
        stroke={accent}
        strokeWidth={1.5}
        className="animate-[ax-envelope-flap_2.4s_ease-in-out_infinite]"
        style={{ transformOrigin: "60px 38px" }}
      />
    </svg>
  );
}

function Network({ accent }: { accent: string }) {
  const spokes = [
    [60, 20],
    [100, 60],
    [60, 100],
    [20, 60],
  ];
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
      {spokes.map(([x, y], i) => (
        <line key={i} x1={60} y1={60} x2={x} y2={y} stroke={accent} strokeWidth={1} opacity={0.5} />
      ))}
      <circle cx={60} cy={60} r={10} fill={accent} className="animate-[ax-pulse_2.4s_ease-in-out_infinite]" />
      {spokes.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={5}
          fill={accent}
          className="animate-[ax-pulse_2.4s_ease-in-out_infinite]"
          style={{ animationDelay: `${0.2 * (i + 1)}s` }}
        />
      ))}
    </svg>
  );
}

function Waveform({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
      {[20, 34, 48].map((r, i) => (
        <circle
          key={r}
          cx={60}
          cy={60}
          r={r}
          fill="none"
          stroke={accent}
          strokeWidth={1.5}
          className="animate-[ax-wave-pulse_2.6s_ease-out_infinite]"
          style={{ animationDelay: `${i * 0.5}s` }}
        />
      ))}
      <circle cx={60} cy={60} r={8} fill={accent} />
    </svg>
  );
}

function Blueprint({ accent }: { accent: string }) {
  const lines = [30, 60, 90];
  const points = [
    [30, 30],
    [60, 60],
    [90, 90],
  ];
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
      {lines.map((v) => (
        <g key={v}>
          <line x1={v} y1={10} x2={v} y2={110} stroke={accent} strokeOpacity={0.25} strokeWidth={1} />
          <line x1={10} y1={v} x2={110} y2={v} stroke={accent} strokeOpacity={0.25} strokeWidth={1} />
        </g>
      ))}
      {points.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={4}
          fill={accent}
          className="animate-[ax-pulse_2.4s_ease-in-out_infinite]"
          style={{ animationDelay: `${i * 0.4}s` }}
        />
      ))}
    </svg>
  );
}

const VISUALS: Record<ServiceVisual, typeof Radar> = {
  radar: Radar,
  calendar: Calendar,
  rings: Rings,
  envelope: Envelope,
  network: Network,
  waveform: Waveform,
  blueprint: Blueprint,
};

export function ServiceHeroVisual({ visual, accent }: { visual: ServiceVisual; accent: string }) {
  const Visual = VISUALS[visual];
  return (
    <div className="mx-auto h-[120px] w-[120px] sm:h-[160px] sm:w-[160px]">
      <Visual accent={accent} />
    </div>
  );
}
