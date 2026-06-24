"use client";

import { use } from "react";
import Link from "next/link";
import { mockMeasurementSessions } from "@/lib/mock-data";
import { WEAR_LOCATION_LABELS, MOTION_TYPE_LABELS, MOTION_TYPE_LABELS_PATIENT } from "@/lib/types";
import JointRangeComparison from "@/components/report/JointRangeComparison";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Params = Promise<{ reportId: string }>;

export default function ReportPage({ params }: { params: Params }) {
  const { reportId } = use(params);
  const session = mockMeasurementSessions.find((s) => s.reportId === reportId);

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-700 mb-2">리포트를 찾을 수 없습니다</p>
          <p className="text-sm text-slate-500">reportId: {reportId}</p>
        </div>
      </div>
    );
  }

  const improvement = session.postRom - session.preRom;
  const improvePct = ((improvement / session.preRom) * 100).toFixed(1);
  const painChange = session.prePainNrs - session.postPainNrs;

  // Combine pre/post curves for chart display
  const chartData = session.preCurve.map((pt, i) => ({
    time: pt.time,
    pre: pt.angle,
    post: session.postCurve[i]?.angle ?? 0,
  }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <p className="text-xs text-slate-400">AcuTrack</p>
          <h1 className="text-sm font-bold text-slate-700">치료 후 운동 리포트</h1>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-500 font-medium border border-violet-200">DEMO</span>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Patient summary */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <p className="text-xs text-slate-400 mb-1">{new Date(session.measuredAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</p>
          <p className="text-sm font-semibold text-slate-700">{session.patientId} 님의 치료 기록</p>
          <h2 className="text-lg font-bold text-slate-800 mb-1">
            {WEAR_LOCATION_LABELS[session.wearLocation]} · {MOTION_TYPE_LABELS_PATIENT[session.motionType]}
          </h2>
          <p className="text-sm text-slate-600">{session.patientSummary}</p>
        </section>

        {/* ROM comparison gauge */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col items-center">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 self-start">움직임 범위 변화</h3>
          <JointRangeComparison
            preRom={session.preRom}
            postRom={session.postRom}
            jointLabel={WEAR_LOCATION_LABELS[session.wearLocation]}
            motionLabel={MOTION_TYPE_LABELS_PATIENT[session.motionType]}
            audience="patient"
          />
          <div className="grid grid-cols-2 gap-3 w-full mt-4">
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
              <p className="text-[10px] text-slate-400 mb-1">치료 전</p>
              <p className="text-2xl font-bold text-slate-600 font-mono">{session.preRom}°</p>
            </div>
            <div className="rounded-xl bg-cyan-50 border border-cyan-100 p-3 text-center">
              <p className="text-[10px] text-cyan-500 mb-1">치료 후</p>
              <p className="text-2xl font-bold text-cyan-600 font-mono">{session.postRom}°</p>
            </div>
          </div>
          <p className="mt-2 text-sm font-bold text-emerald-600">+{improvement}° 향상 ({improvePct}%)</p>
        </section>

        {/* Pain change */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">통증 변화</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-center">
              <p className="text-[10px] text-red-400 mb-1">치료 전 통증</p>
              <p className="text-2xl font-bold text-red-500 font-mono">{session.prePainNrs}점</p>
              <p className="text-[10px] text-slate-400">NRS 0-10</p>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-center">
              <p className="text-[10px] text-emerald-500 mb-1">치료 후 통증</p>
              <p className="text-2xl font-bold text-emerald-600 font-mono">{session.postPainNrs}점</p>
              <p className="text-[10px] text-slate-400">NRS 0-10</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-center text-emerald-600 font-semibold">
            통증 {painChange}점 감소
          </p>
        </section>

        {/* Movement curve chart */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">움직임 곡선</h3>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="preGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="postGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide={false} tickFormatter={() => ""} tick={false} axisLine={false} tickLine={false} label={{ value: "측정 시작 → 끝", position: "insideBottom", offset: -2, fontSize: 10, fill: "#94a3b8" }} />
              <YAxis hide={false} tickFormatter={(v) => `${v}°`} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={32} domain={[0, "auto"]} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 11 }}
                formatter={(val, name) => [`${val}°`, name === "pre" ? "치료 전" : "치료 후"]}
              />
              <Area type="monotone" dataKey="pre" stroke="#94a3b8" fill="url(#preGrad)" strokeWidth={1.5} dot={false} />
              <Area type="monotone" dataKey="post" stroke="#06b6d4" fill="url(#postGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 justify-center mt-1">
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <span className="w-4 h-0.5 bg-slate-400 inline-block" /> 치료 전
            </span>
            <span className="flex items-center gap-1 text-[11px] text-cyan-500">
              <span className="w-4 h-0.5 bg-cyan-400 inline-block" /> 치료 후
            </span>
          </div>
        </section>

        {/* CTA */}
        <Link
          href={`/report/${reportId}/stretching`}
          className="block w-full text-center py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-sm transition-all shadow-md"
        >
          오늘의 홈 스트레칭 보기 →
        </Link>

        {/* Disclaimer */}
        <p className="text-xs text-slate-500 text-center leading-relaxed px-2">
          본 리포트는 치료 전후 움직임 변화 확인용 참고 자료이며, 진단 확정 또는 치료 효과 보장을 의미하지 않습니다. 모든 의료적 판단은 담당 임상 전문가의 지도 하에 이루어져야 합니다.
        </p>
      </main>
    </div>
  );
}
