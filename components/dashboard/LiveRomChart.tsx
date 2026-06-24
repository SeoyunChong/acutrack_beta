"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from "recharts";
import type { RomPoint } from "@/lib/measurement";
import type { MeasurementPhase } from "@/lib/measurement";

type Props = {
  preData: RomPoint[];
  postData: RomPoint[];
  phase: MeasurementPhase;
  preMax?: number;
  postMax?: number;
};

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; stroke: string }>;
  label?: number;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0b1220] border border-white/10 rounded-xl p-2.5 text-xs shadow-xl">
      <p className="text-slate-500 mb-1.5">t = {label}%</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.stroke }} className="font-mono">
          {p.name}: {p.value}°
        </p>
      ))}
    </div>
  );
};

export default function LiveRomChart({ preData, postData, phase, preMax, postMax }: Props) {
  // Merge pre and post data by index for overlay
  const maxLen = Math.max(preData.length, postData.length);
  const merged = Array.from({ length: maxLen }, (_, i) => ({
    time: preData[i]?.time ?? postData[i]?.time ?? i,
    pre: preData[i]?.angle,
    post: postData[i]?.angle,
  }));

  const hasPost = postData.length > 0;
  const hasPre = preData.length > 0;

  return (
    <div className="rounded-2xl border bg-[#0f172a] border-white/8 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">ROM 실시간 측정</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {phase === "measuring_pre" && "치료 전 측정 진행 중..."}
            {phase === "measuring_post" && "치료 후 측정 진행 중..."}
            {(phase === "post_complete" || phase === "analysis_complete") && "치료 전후 비교"}
            {phase === "pre_complete" && "치료 전 측정 완료 · 치료 후 측정 대기"}
            {(phase === "ready" || phase === "idle") && "측정 시작 전"}
          </p>
        </div>
        {(preMax !== undefined || postMax !== undefined) && (
          <div className="flex gap-3 text-[11px]">
            {preMax !== undefined && (
              <span className="text-slate-400">Pre <span className="font-bold text-slate-300">{preMax}°</span></span>
            )}
            {postMax !== undefined && (
              <span className="text-cyan-400">Post <span className="font-bold text-cyan-300">{postMax}°</span></span>
            )}
            {preMax !== undefined && postMax !== undefined && (
              <span className="text-emerald-400 font-bold">+{postMax - preMax}°</span>
            )}
          </div>
        )}
      </div>

      {!hasPre && !hasPost ? (
        <div className="h-44 flex items-center justify-center">
          <p className="text-slate-600 text-sm">측정 시작 후 데이터가 표시됩니다</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={merged} margin={{ top: 4, right: 8, left: -14, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2540" />
            <XAxis
              dataKey="time"
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 9, fill: "#475569" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `${v}°`}
              tick={{ fontSize: 9, fill: "#475569" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {preMax && (
              <ReferenceLine
                y={preMax}
                stroke="#475569"
                strokeDasharray="4 3"
                strokeWidth={1}
              />
            )}
            {postMax && (
              <ReferenceLine
                y={postMax}
                stroke="#00A3A8"
                strokeDasharray="4 3"
                strokeWidth={1}
              />
            )}
            {hasPre && (
              <Line
                type="monotone"
                dataKey="pre"
                name="치료 전"
                stroke="#64748b"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                connectNulls={false}
              />
            )}
            {hasPost && (
              <Line
                type="monotone"
                dataKey="post"
                name="치료 후"
                stroke="#00A3A8"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
                connectNulls={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
