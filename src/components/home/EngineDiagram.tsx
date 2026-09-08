"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const STAGES = [
  {
    n: "01",
    title: "Detection",
    body: "The market is noisy. Our AI continuously scans thousands of accounts, filtering out weak activity and isolating genuine buying intent: funding, hiring, technology-stack changes.",
  },
  {
    n: "02",
    title: "Orchestration",
    body: "Validated signals enter one coordinated system: data, messaging, email, LinkedIn and calling moving in sequence, with strategists supervising tone, timing and cadence throughout.",
  },
  {
    n: "03",
    title: "Qualified conversation",
    body: "The coordinated paths resolve into one opportunity. A human has validated it, managed the reply, and handled the objections. You step in ready to sell.",
  },
];

function DetectionVisual() {
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%" aria-hidden="true">
      <line x1="0" y1="0" x2="0" y2="400" stroke="rgba(53,211,224,0.35)" strokeWidth={2}>
        <animate attributeName="x1" values="0;400;0" dur="3.8s" repeatCount="indefinite" />
        <animate attributeName="x2" values="0;400;0" dur="3.8s" repeatCount="indefinite" />
      </line>
      {[
        [60, 70, "#3E7BFA"],
        [130, 40, "#8B5CF6"],
        [320, 90, "#35D3E0"],
        [60, 220, "#E94FA8"],
        [350, 260, "#3E7BFA"],
        [220, 340, "#8B5CF6"],
        [90, 330, "#35D3E0"],
      ].map(([x, y, fill], i) => (
        <circle key={i} cx={x as number} cy={y as number} r={2.5} fill={fill as string} opacity={0.5} className="animate-[ax-pulse_2.4s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
      {[
        [180, 150, "#35D3E0", "#9FE8EE", "Funding signal"],
        [250, 220, "#8B5CF6", "#C9B6F5", "Hiring signal"],
        [140, 270, "#E94FA8", "#F5AFD3", "Tech-stack signal"],
      ].map(([x, y, stroke, textFill, label], i) => (
        <g key={label as string}>
          <circle cx={x as number} cy={y as number} r={8} fill="none" stroke={stroke as string} strokeWidth={1.5} />
          <circle
            cx={x as number}
            cy={y as number}
            r={6}
            fill={stroke as string}
            className="animate-[ax-pulse_2.4s_ease-in-out_infinite]"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
          <text x={(x as number) + 16} y={(y as number) + 3} fill={textFill as string} fontSize={11} fontFamily="var(--ax-font-body)">
            {label as string}
          </text>
        </g>
      ))}
    </svg>
  );
}

function OrchestrationVisual() {
  const spokes: [number, number, string, string][] = [
    [90, 110, "#3E7BFA", "Email"],
    [310, 100, "#8B5CF6", "LinkedIn"],
    [90, 300, "#35D3E0", "Calling"],
    [310, 300, "#E94FA8", "Timing"],
  ];
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%" aria-hidden="true">
      {spokes.map(([x, y, stroke], i) => (
        <line key={i} x1={x} y1={y} x2={200} y2={200} stroke={stroke} strokeWidth={1.5} strokeDasharray="5 9" opacity={0.7}>
          <animate attributeName="stroke-dashoffset" values="0;-140" dur="2.6s" repeatCount="indefinite" begin={`${-i * 0.5}s`} />
        </line>
      ))}
      <circle cx={200} cy={200} r={14} fill="#8B5CF6" />
      <circle cx={200} cy={200} r={22} fill="none" stroke="rgba(139,92,246,0.4)" strokeWidth={1} />
      {spokes.map(([x, y, , label], i) => (
        <g key={label}>
          <text
            x={x < 200 ? x - 20 : x + 12}
            y={y < 200 ? y - 10 : y + 16}
            fill="#C9B6F5"
            fontSize={11}
            fontFamily="var(--ax-font-body)"
          >
            {label}
          </text>
          <circle cx={x} cy={y} r={4} fill={spokes[i][2]} className="animate-[ax-pulse_2.4s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.3}s` }} />
        </g>
      ))}
    </svg>
  );
}

function QualifiedVisual() {
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%" aria-hidden="true">
      <path
        d="M120,150 Q110,120 150,110 Q220,90 260,130 Q300,170 260,210 Q230,240 180,220 Q130,205 120,150 Z"
        fill="rgba(139,92,246,0.06)"
        stroke="rgba(139,92,246,0.25)"
        strokeWidth={1}
      />
      <path
        d="M150,260 Q140,235 175,228 Q230,215 260,245 Q290,275 258,300 Q232,320 195,304 Q155,290 150,260 Z"
        fill="rgba(53,211,224,0.06)"
        stroke="rgba(53,211,224,0.25)"
        strokeWidth={1}
      />
      <line x1={180} y1={170} x2={210} y2={255} stroke="#35D3E0" strokeWidth={2} />
      <circle cx={180} cy={170} r={9} fill="#8B5CF6" />
      <circle cx={210} cy={255} r={16} fill="none" stroke="#35D3E0" strokeWidth={2} />
      <path d="M201,255 L208,262 L221,246" fill="none" stroke="#35D3E0" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle
        cx={180}
        cy={170}
        r={20}
        fill="none"
        stroke="#E8B368"
        strokeWidth={1.5}
        className="animate-[ax-pulse_2.6s_ease-in-out_infinite]"
      />
      <text x={150} y={105} fill="#C9B6F5" fontSize={11} fontFamily="var(--ax-font-body)">
        Validated by a human
      </text>
      <text x={150} y={330} fill="#9FE8EE" fontSize={11} fontFamily="var(--ax-font-body)">
        Ready for you
      </text>
    </svg>
  );
}

const VISUALS = [DetectionVisual, OrchestrationVisual, QualifiedVisual];

export function EngineDiagram() {
  const [active, setActive] = useState(0);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.cap);
            setActive(index);
          }
        });
      },
      { threshold: 0.6 },
    );
    stageRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const ActiveVisual = VISUALS[active];

  return (
    <section data-reveal className="relative px-5 py-28 sm:px-10 sm:py-36">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-14 text-center text-[13px] font-semibold text-ax-violet">One system, three stages</div>
        <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="flex flex-col gap-16">
            {STAGES.map((stage, i) => (
              <div
                key={stage.n}
                ref={(el) => {
                  stageRefs.current[i] = el;
                }}
                data-cap={i}
                tabIndex={0}
                onFocus={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "border-l-2 border-white/10 pl-7 transition-colors duration-400",
                  active === i && "border-ax-violet",
                )}
              >
                <div className={cn("mb-2.5 font-display text-4xl font-extrabold text-[#3A3E52] transition-colors duration-400", active === i && "text-ax-violet")}>
                  {stage.n}
                </div>
                <h3 className="mb-2.5 text-2xl font-bold">{stage.title}</h3>
                <p className="max-w-[44ch] text-[15.5px] leading-relaxed text-ax-text-muted">{stage.body}</p>
              </div>
            ))}
          </div>

          <div className="sticky top-32 hidden h-[440px] rounded-lg border border-white/8 bg-white/[0.02] lg:block">
            <div className="relative h-full w-full overflow-hidden">
              <ActiveVisual />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
