"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { generateRomCurve } from "@/lib/calculations";
import type { PatientSession } from "@/lib/types";
import { MOTION_TYPE_LABELS } from "@/lib/types";

type Props = {
  session: PatientSession;
};

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: number;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0b1220] border border-white/10 rounded-xl p-3 text-xs shadow-xl">
      <p className="text-slate-400 mb-2">측정 진행률 {label}%</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}°
        </p>
      ))}
    </div>
  );
};

export default function RomComparisonChart({ session }: Props) {
  const data = generateRomCurve(session.preRom, session.postRom);
  const disabled = !session.deviceWorn;

  return (
    <div className={`rounded-2xl border bg-[#0f172a] border-white/8 p-5 ${disabled ? "opacity-40" : ""}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">ROM 비교 그래프</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {MOTION_TYPE_LABELS[session.motionType]} · {session.laterality}
          </p>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-slate-500 inline-block rounded" />
            <span className="text-slate-500">치료 전 ({session.preRom}°)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-cyan-400 inline-block rounded" />
            <span className="text-slate-400">치료 후 ({session.postRom}°)</span>
          </span>
        </div>
      </div>

      {disabled ? (
        <div className="h-52 flex items-center justify-center text-slate-600 text-sm">
          디바이스 착용 후 측정을 시작하세요
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="preGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="postGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00A3A8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#00A3A8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="time"
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 10, fill: "#475569" }}
              axisLine={{ stroke: "#1e293b" }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `${v}°`}
              tick={{ fontSize: 10, fill: "#475569" }}
              axisLine={{ stroke: "#1e293b" }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={session.preRom}
              stroke="#475569"
              strokeDasharray="4 4"
              label={{ value: `Max Pre ${session.preRom}°`, position: "insideTopRight", fontSize: 9, fill: "#475569" }}
            />
            <ReferenceLine
              y={session.postRom}
              stroke="#00A3A8"
              strokeDasharray="4 4"
              label={{ value: `Max Post ${session.postRom}°`, position: "insideTopRight", fontSize: 9, fill: "#00A3A8" }}
            />
            <Area
              type="monotone"
              dataKey="pre"
              name="치료 전"
              stroke="#64748b"
              strokeWidth={2}
              fill="url(#preGrad)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="post"
              name="치료 후"
              stroke="#00A3A8"
              strokeWidth={2.5}
              fill="url(#postGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
