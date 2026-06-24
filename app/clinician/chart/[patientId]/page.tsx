"use client";

import { use } from "react";
import Link from "next/link";
import { mockMeasurementSessions } from "@/lib/mock-data";
import {
  WEAR_LOCATION_LABELS_CLINICAL,
  MOTION_TYPE_LABELS,
} from "@/lib/types";
import type { MeasurementSession } from "@/lib/types";
import ClinicianNav from "@/components/layout/ClinicianNav";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronLeft } from "lucide-react";

type Params = Promise<{ patientId: string }>;

const buildHistory = (session: MeasurementSession) => {
  const base = session.preRom;
  const dates = [-90, -60, -30, 0].map((d) => {
    const dt = new Date(session.measuredAt);
    dt.setDate(dt.getDate() + d);
    return dt.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  });
  return [
    {
      date: dates[0],
      pre: Math.round(base * 0.72),
      post: Math.round(base * 0.8),
      label: "1차",
    },
    {
      date: dates[1],
      pre: Math.round(base * 0.82),
      post: Math.round(base * 0.91),
      label: "2차",
    },
    {
      date: dates[2],
      pre: Math.round(base * 0.91),
      post: Math.round(base * 0.96),
      label: "3차",
    },
    {
      date: dates[3],
      pre: session.preRom,
      post: session.postRom,
      label: "4차 (최근)",
    },
  ];
};

const statusLabel: Record<string, { label: string; cls: string }> = {
  approved: {
    label: "승인됨",
    cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  not_reviewed: {
    label: "미검토",
    cls: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  },
  reviewing: {
    label: "검토 중",
    cls: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  rejected: {
    label: "반려됨",
    cls: "bg-red-500/10 text-red-400 border-red-500/20",
  },
};

export default function ChartPage({ params }: { params: Params }) {
  const { patientId } = use(params);
  const session = mockMeasurementSessions.find((s) => s.patientId === patientId);

  if (!session) {
    return (
      <div className="min-h-screen bg-[#07111f] text-white">
        <ClinicianNav />
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-slate-400">환자를 찾을 수 없습니다: {patientId}</p>
        </div>
      </div>
    );
  }

  const improvement = Math.round(
    ((session.postRom - session.preRom) / session.preRom) * 100
  );
  const nrsDelta = session.prePainNrs - session.postPainNrs;
  const historyData = buildHistory(session);

  // Fake prior sessions for the table
  const fakeRows = historyData.slice(0, 3).map((h, i) => ({
    ...h,
    sessionNum: `${i + 1}차`,
    chartStatus: "approved" as const,
  }));

  const statusSt = statusLabel[session.chartStatus] ?? statusLabel.not_reviewed;

  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <ClinicianNav />

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Back button */}
        <Link
          href="/clinician/dashboard"
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          대시보드로 돌아가기
        </Link>

        {/* Section 1 — Patient header card */}
        <div className="rounded-2xl border border-white/8 bg-[#0f172a] p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 text-xs font-bold tracking-wider">
              {patientId}
            </span>
            {session.diagnosisCode && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium">
                {session.diagnosisCode}
              </span>
            )}
            <span className={`ml-auto inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-medium ${statusSt.cls}`}>
              {statusSt.label}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 text-xs text-slate-400">
            <div>
              <span className="block text-[10px] text-slate-600 mb-0.5">측정일</span>
              {new Date(session.measuredAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div>
              <span className="block text-[10px] text-slate-600 mb-0.5">임상의</span>
              {session.clinicianName}
            </div>
            <div>
              <span className="block text-[10px] text-slate-600 mb-0.5">측정 부위</span>
              {WEAR_LOCATION_LABELS_CLINICAL[session.wearLocation]}
            </div>
            <div>
              <span className="block text-[10px] text-slate-600 mb-0.5">측면</span>
              {session.laterality}
            </div>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "치료 전 ROM", value: `${session.preRom}°`, color: "text-slate-300" },
              { label: "치료 후 ROM", value: `${session.postRom}°`, color: "text-cyan-400" },
              {
                label: "ROM 개선율",
                value: `+${improvement}%`,
                color: "text-emerald-400",
              },
              {
                label: "치료 전 NRS",
                value: String(session.prePainNrs),
                color: "text-amber-400",
              },
              {
                label: "치료 후 NRS",
                value: String(session.postPainNrs),
                color: "text-emerald-400",
              },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-xl bg-white/3 border border-white/6 p-3 text-center"
              >
                <div className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{kpi.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2 — ROM 추이 */}
        <div className="rounded-2xl border border-white/8 bg-[#0f172a] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200">ROM 측정 추이</h2>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="inline-block w-6 border-t border-dashed border-slate-400" />
                치료 전 ROM
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="inline-block w-6 border-t-2 border-cyan-500" />
                치료 후 ROM
              </span>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  unit="°"
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                  formatter={(val, name) => [
                    `${val}°`,
                    name === "pre" ? "치료 전 ROM" : "치료 후 ROM",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="pre"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  dot={{ r: 3, fill: "#94a3b8" }}
                />
                <Line
                  type="monotone"
                  dataKey="post"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#06b6d4" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 3 — 세션 기록 테이블 */}
        <div className="rounded-2xl border border-white/8 bg-[#0f172a] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/6">
            <h2 className="text-sm font-semibold text-slate-200">세션 기록</h2>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-white/4 text-slate-500 text-[11px]">
                {[
                  "날짜",
                  "측정 부위",
                  "동작",
                  "치료 전 ROM",
                  "치료 후 ROM",
                  "개선",
                  "NRS 변화",
                  "상태",
                ].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fakeRows.map((row, i) => {
                const imp = Math.round(
                  ((row.post - row.pre) / row.pre) * 100
                );
                return (
                  <tr
                    key={i}
                    className={`border-t border-white/6 ${i % 2 === 0 ? "bg-white/2" : ""}`}
                  >
                    <td className="px-4 py-3 text-slate-400">{row.date}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {WEAR_LOCATION_LABELS_CLINICAL[session.wearLocation]}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {MOTION_TYPE_LABELS[session.motionType]}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{row.pre}°</td>
                    <td className="px-4 py-3 text-cyan-400">{row.post}°</td>
                    <td className="px-4 py-3 text-emerald-400">+{imp}%</td>
                    <td className="px-4 py-3 text-slate-400">—</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        승인됨
                      </span>
                    </td>
                  </tr>
                );
              })}
              {/* Current (real) session */}
              <tr className="border-t border-white/6 border-t-cyan-500/20 bg-cyan-500/3">
                <td className="px-4 py-3 text-slate-200 font-medium">
                  {new Date(session.measuredAt).toLocaleDateString("ko-KR", {
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {WEAR_LOCATION_LABELS_CLINICAL[session.wearLocation]}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {MOTION_TYPE_LABELS[session.motionType]}
                </td>
                <td className="px-4 py-3 text-slate-300">{session.preRom}°</td>
                <td className="px-4 py-3 text-cyan-400">{session.postRom}°</td>
                <td className="px-4 py-3 text-emerald-400">+{improvement}%</td>
                <td className="px-4 py-3 text-emerald-400">-{nrsDelta}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] border ${statusSt.cls}`}>
                    {statusSt.label}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 4 — 임상 소견 */}
        <div className="rounded-2xl border border-white/8 bg-[#0f172a] p-5">
          <h2 className="text-sm font-semibold text-slate-200 mb-3">임상 소견</h2>
          <div className="border-l-2 border-cyan-500/40 pl-4">
            <p className="text-sm text-slate-300 leading-relaxed">
              {session.clinicalSummary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
