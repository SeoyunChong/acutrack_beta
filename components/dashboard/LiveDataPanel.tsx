"use client";

import { useEffect, useRef, useReducer } from "react";
import { Activity, Wifi } from "lucide-react";
import type { MeasurementPhase } from "@/lib/measurement";

type Props = {
  phase: MeasurementPhase;
  currentAngle: number;
  progress: number;
};

type ImuFrame = {
  t: string;
  ax: number; ay: number; az: number;
  gx: number; gy: number; gz: number;
  angle: number;
};

function rand(center: number, spread: number) {
  return parseFloat((center + (Math.random() - 0.5) * spread).toFixed(3));
}

function generateFrame(angle: number): ImuFrame {
  const now = new Date();
  const t = `${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}.${String(now.getMilliseconds()).slice(0, 2)}`;
  return {
    t,
    ax: rand(0.12 + angle * 0.005, 0.08),
    ay: rand(-0.98 + angle * 0.002, 0.06),
    az: rand(0.06, 0.05),
    gx: rand(angle * 0.8, 4),
    gy: rand(1.2, 3),
    gz: rand(-0.4, 2),
    angle,
  };
}

const MAX_ROWS = 6;

export default function LiveDataPanel({ phase, currentAngle, progress }: Props) {
  const isMeasuring = phase === "measuring_pre" || phase === "measuring_post";
  const framesRef = useRef<ImuFrame[]>([]);
  const sampleCountRef = useRef(0);
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    if (!isMeasuring) return;
    const frame = generateFrame(currentAngle);
    framesRef.current = [frame, ...framesRef.current].slice(0, MAX_ROWS);
    sampleCountRef.current += 1;
    forceUpdate();
  }, [currentAngle, isMeasuring]);

  const frames = framesRef.current;
  const sampleCount = sampleCountRef.current;

  // Don't render if no data and not measuring
  if (!isMeasuring && frames.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/6 bg-[#05080f] overflow-hidden">
      {/* Header strip */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/3 border-b border-white/5">
        <div className="flex items-center gap-2">
          {isMeasuring && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
          <Activity className="w-3 h-3 text-slate-500" />
          <span className="text-[10px] font-semibold text-slate-400">IMU Raw Data</span>
          <span className="text-[10px] font-mono text-cyan-500 ml-1">100 Hz</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <Wifi className="w-3 h-3" />
            <span className="font-mono">-47 dBm</span>
          </span>
          <span className="font-mono">{sampleCount} samples</span>
          <span className={`font-mono font-bold ${isMeasuring ? "text-cyan-400" : "text-slate-500"}`}>
            {currentAngle}°
          </span>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-7 text-[9px] text-slate-600 uppercase font-medium bg-[#07111f] border-b border-white/4">
        {["Time", "Ax(g)", "Ay(g)", "Az(g)", "Gx°/s", "Gy°/s", "Angle"].map((h) => (
          <div key={h} className="px-2 py-1 text-right first:text-left">{h}</div>
        ))}
      </div>

      {/* Data rows */}
      <div className="font-mono">
        {frames.length === 0 && (
          <div className="text-center py-3 text-[10px] text-slate-700">데이터 수신 대기 중...</div>
        )}
        {frames.map((f, i) => (
          <div
            key={`${f.t}-${i}`}
            className={`grid grid-cols-7 text-[10px] border-b border-white/3 ${
              i === 0 && isMeasuring ? "bg-cyan-500/6 text-slate-200" : "text-slate-500"
            }`}
          >
            {[f.t, f.ax.toFixed(3), f.ay.toFixed(3), f.az.toFixed(3), f.gx.toFixed(1), f.gy.toFixed(1), `${f.angle}°`].map((val, j) => (
              <div
                key={j}
                className={`px-2 py-1 tabular-nums text-right first:text-left ${
                  j === 6 ? "text-cyan-400 font-bold" : ""
                }`}
              >
                {val}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

