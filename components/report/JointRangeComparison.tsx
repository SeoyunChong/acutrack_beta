"use client";

type Props = {
  preRom: number;
  postRom: number;
  normalRange?: number;
  jointLabel: string;
  motionLabel: string;
  compact?: boolean;
  audience: "patient" | "clinician";
};

function polarToXy(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 180) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  if (endDeg <= startDeg) return "";
  const start = polarToXy(cx, cy, r, startDeg);
  const end = polarToXy(cx, cy, r, endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export default function JointRangeComparison({
  preRom, postRom, normalRange = 60, jointLabel, motionLabel, compact = false, audience,
}: Props) {
  const w = compact ? 220 : 280;
  const h = compact ? 130 : 165;
  const cx = w / 2;
  const cy = h - (compact ? 20 : 25);
  const rOuter = compact ? 90 : 115;
  const rInner = rOuter - (compact ? 14 : 18);
  const maxAngle = 180; // semicircle 0-180

  // Map ROM degrees to arc degrees (0 at left, 180 at right)
  const preArcEnd = Math.min((preRom / maxAngle) * 180, 180);
  const postArcEnd = Math.min((postRom / maxAngle) * 180, 180);
  const normalArcEnd = Math.min((normalRange / maxAngle) * 180, 180);

  const improvement = postRom - preRom;
  const improvePct = preRom > 0 ? ((improvement / preRom) * 100).toFixed(1) : "0";

  const fs = compact ? 10 : 13;
  const bigFs = compact ? 14 : 18;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
        {/* Track (full semicircle) */}
        <path
          d={arcPath(cx, cy, (rOuter + rInner) / 2, 0, 180)}
          fill="none"
          stroke="#1e293b"
          strokeWidth={rOuter - rInner}
          strokeLinecap="round"
        />

        {/* Normal range indicator */}
        <path
          d={arcPath(cx, cy, (rOuter + rInner) / 2, 0, normalArcEnd)}
          fill="none"
          stroke="#334155"
          strokeWidth={rOuter - rInner}
          strokeLinecap="round"
        />

        {/* Pre ROM arc */}
        <path
          d={arcPath(cx, cy, (rOuter + rInner) / 2, 0, preArcEnd)}
          fill="none"
          stroke="#64748b"
          strokeWidth={rOuter - rInner}
          strokeLinecap="round"
        />

        {/* Post ROM arc */}
        <path
          d={arcPath(cx, cy, (rOuter + rInner) / 2, 0, postArcEnd)}
          fill="none"
          stroke="#06b6d4"
          strokeWidth={rOuter - rInner}
          strokeLinecap="round"
          opacity={0.9}
        />

        {/* Center label */}
        <text x={cx} y={cy - (compact ? 12 : 16)} textAnchor="middle" fill="#06b6d4" fontSize={bigFs} fontWeight="bold" fontFamily="monospace">
          +{improvement}°
        </text>
        <text x={cx} y={cy - (compact ? 1 : 2)} textAnchor="middle" fill="#94a3b8" fontSize={fs - 1}>
          {audience === "patient" ? "움직임이 넓어졌어요" : `ROM +${improvePct}%`}
        </text>

        {/* Pre label */}
        <text x={compact ? 8 : 10} y={cy + (compact ? 14 : 18)} fill="#64748b" fontSize={fs - 1}>Pre {preRom}°</text>
        {/* Post label */}
        <text x={w - (compact ? 8 : 10)} y={cy + (compact ? 14 : 18)} textAnchor="end" fill="#06b6d4" fontSize={fs - 1}>Post {postRom}°</text>
      </svg>

      <p className="text-[11px] text-slate-400 text-center">
        {jointLabel} · {motionLabel}
      </p>
      {audience === "patient" && (
        <p className="text-xs text-cyan-400 font-semibold text-center">
          움직임 범위가 넓어졌어요 🎉
        </p>
      )}
    </div>
  );
}
