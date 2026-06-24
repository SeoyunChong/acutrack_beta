"use client";

import { useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import type { PatientSession } from "@/lib/types";

type ViewMode = "before" | "after" | "overlay";

type Props = {
  session: PatientSession;
};

export default function MotionOverlay({ session }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("overlay");
  const [isPlaying, setIsPlaying] = useState(false);
  const disabled = !session.deviceWorn;

  const preAngle = (session.preRom / 180) * Math.PI;
  const postAngle = (session.postRom / 180) * Math.PI;
  const cx = 110;
  const cy = 140;
  const r = 80;

  const preX = cx + r * Math.sin(preAngle);
  const preY = cy - r * Math.cos(preAngle);
  const postX = cx + r * Math.sin(postAngle);
  const postY = cy - r * Math.cos(postAngle);

  return (
    <div className={`rounded-2xl border bg-[#0f172a] border-white/8 p-5 ${disabled ? "opacity-40" : ""}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Motion Trajectory</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">관절 궤적 오버레이</p>
        </div>
        <div className="flex items-center gap-1">
          {(["before", "after", "overlay"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                viewMode === mode
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                  : "text-slate-500 hover:text-slate-300 border border-transparent"
              }`}
            >
              {mode === "before" ? "치료 전" : mode === "after" ? "치료 후" : "오버레이"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center">
        <svg width={220} height={170} viewBox="0 0 220 170">
          {/* Background grid */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={1} />
          <circle cx={cx} cy={cy} r={r * 0.66} fill="none" stroke="#1e293b" strokeWidth={0.5} strokeDasharray="3 3" />
          <circle cx={cx} cy={cy} r={r * 0.33} fill="none" stroke="#1e293b" strokeWidth={0.5} strokeDasharray="3 3" />
          <line x1={cx} y1={cy - r - 10} x2={cx} y2={cy} stroke="#1e293b" strokeWidth={1} />

          {/* Joint center */}
          <circle cx={cx} cy={cy} r={5} fill="#334155" stroke="#475569" strokeWidth={1} />

          {/* Pre arc */}
          {(viewMode === "before" || viewMode === "overlay") && (
            <>
              <path
                d={`M ${cx} ${cy - r} A ${r} ${r} 0 ${preAngle > Math.PI ? 1 : 0} 1 ${preX} ${preY}`}
                fill="none"
                stroke="#475569"
                strokeWidth={2}
                strokeDasharray="5 3"
              />
              <line x1={cx} y1={cy} x2={preX} y2={preY} stroke="#475569" strokeWidth={2} />
              <circle cx={preX} cy={preY} r={4} fill="#475569" />
              <text x={preX + 6} y={preY + 4} fontSize={9} fill="#64748b">Pre {session.preRom}°</text>
            </>
          )}

          {/* Post arc */}
          {(viewMode === "after" || viewMode === "overlay") && (
            <>
              <path
                d={`M ${cx} ${cy - r} A ${r} ${r} 0 ${postAngle > Math.PI ? 1 : 0} 1 ${postX} ${postY}`}
                fill="rgba(0,163,168,0.08)"
                stroke="#00A3A8"
                strokeWidth={2.5}
              />
              <line x1={cx} y1={cy} x2={postX} y2={postY} stroke="#00A3A8" strokeWidth={2.5} />
              <circle cx={postX} cy={postY} r={5} fill="#00A3A8" className="drop-shadow-sm" />
              <text x={postX + 6} y={postY + 4} fontSize={9} fill="#00A3A8">Post {session.postRom}°</text>
            </>
          )}

          {/* Arm bone */}
          <line x1={cx} y1={cy} x2={cx} y2={cy + 45} stroke="#334155" strokeWidth={4} strokeLinecap="round" />
          <circle cx={cx} cy={cy + 45} r={5} fill="#334155" stroke="#475569" strokeWidth={1} />

          {/* Angle label */}
          {viewMode === "overlay" && (
            <text x={cx + 15} y={cy - 50} fontSize={10} fill="#64748b">
              Δ+{session.postRom - session.preRom}°
            </text>
          )}
        </svg>
      </div>

      <div className="flex items-center justify-center gap-3 mt-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-medium hover:bg-cyan-500/20 transition-all"
        >
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {isPlaying ? "일시정지" : "재생"}
        </button>
        <button
          onClick={() => setIsPlaying(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 text-slate-400 text-xs font-medium hover:bg-white/8 transition-all"
        >
          <RotateCcw className="w-3 h-3" />
          반복
        </button>
      </div>
    </div>
  );
}
