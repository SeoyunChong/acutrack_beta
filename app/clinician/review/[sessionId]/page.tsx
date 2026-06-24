"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { mockMeasurementSessions } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { WEAR_LOCATION_LABELS, MOTION_TYPE_LABELS, WEAR_LOCATION_LABELS_CLINICAL } from "@/lib/types";
import JointRangeComparison from "@/components/report/JointRangeComparison";
import ClinicianNav from "@/components/layout/ClinicianNav";
import { CheckSquare, Square, ChevronLeft, CheckCircle, XCircle } from "lucide-react";

type Params = Promise<{ sessionId: string }>;

export default function ReviewPage({ params }: { params: Params }) {
  const { sessionId } = use(params);
  const router = useRouter();
  const approveToChart = useStore((s) => s.approveToChart);
  const updateSessionChartStatus = useStore((s) => s.updateSessionChartStatus);

  // Use mock data for display; store for mutations
  const session = mockMeasurementSessions.find((s) => s.id === sessionId);

  const [options, setOptions] = useState({
    romResult: true,
    painChange: true,
    clinicalSummary: true,
    stretchingEducation: true,
    followUpPlan: false,
    clinicianMemo: "",
    followUpNote: "",
  });

  if (!session) {
    return (
      <div className="min-h-screen bg-[#07111f] text-white flex items-center justify-center">
        <p>세션을 찾을 수 없습니다: {sessionId}</p>
      </div>
    );
  }

  const improvement = session.postRom - session.preRom;
  const improvePct = ((improvement / session.preRom) * 100).toFixed(1);

  const handleApprove = () => {
    approveToChart(sessionId, options);
    router.push(`/clinician/chart/${session.patientId}`);
  };

  const handleReject = () => {
    updateSessionChartStatus(sessionId, "rejected");
    router.push("/clinician/chart");
  };

  const toggle = (key: keyof typeof options) => {
    if (typeof options[key] === "boolean") {
      setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const CheckRow = ({ label, field }: { label: string; field: keyof typeof options }) => (
    <button
      onClick={() => toggle(field)}
      className="flex items-center gap-2 py-2 text-left w-full group"
    >
      {options[field]
        ? <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
        : <Square className="w-4 h-4 text-slate-500 shrink-0 group-hover:text-slate-300" />}
      <span className={`text-xs ${options[field] ? "text-slate-200" : "text-slate-500"}`}>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <ClinicianNav />

      <div className="p-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 mb-4 transition-all"
        >
          <ChevronLeft className="w-4 h-4" /> 뒤로
        </button>

        <h1 className="text-lg font-bold text-white mb-1">차트 반영 검토</h1>
        <p className="text-xs text-slate-400 mb-6">
          {session.patientId} · {WEAR_LOCATION_LABELS_CLINICAL[session.wearLocation]} ·{" "}
          {new Date(session.measuredAt).toLocaleDateString("ko-KR")}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: measurement results */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/8 bg-[#0f172a] p-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">측정 결과</h2>

              <JointRangeComparison
                preRom={session.preRom}
                postRom={session.postRom}
                jointLabel={WEAR_LOCATION_LABELS[session.wearLocation]}
                motionLabel={MOTION_TYPE_LABELS[session.motionType]}
                compact={true}
                audience="clinician"
              />

              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="rounded-xl bg-white/4 p-3 text-center">
                  <p className="text-[10px] text-slate-500 mb-1">치료 전 ROM</p>
                  <p className="text-xl font-bold font-mono text-slate-300">{session.preRom}°</p>
                </div>
                <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3 text-center">
                  <p className="text-[10px] text-slate-500 mb-1">치료 후 ROM</p>
                  <p className="text-xl font-bold font-mono text-cyan-400">{session.postRom}°</p>
                </div>
                <div className="rounded-xl bg-white/4 p-3 text-center">
                  <p className="text-[10px] text-slate-500 mb-1">NRS 전→후</p>
                  <p className="text-sm font-bold text-slate-300">{session.prePainNrs} → {session.postPainNrs}</p>
                </div>
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
                  <p className="text-[10px] text-slate-500 mb-1">ROM 개선율</p>
                  <p className="text-sm font-bold text-emerald-400">+{improvePct}%</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-[#0f172a] p-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">임상 소견</h2>
              <p className="text-xs text-slate-400 leading-relaxed">{session.clinicalSummary}</p>
            </div>
          </div>

          {/* Center: patient report preview */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/8 bg-[#0f172a] p-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">환자용 요약 (미리보기)</h2>
              <p className="text-xs text-slate-300 leading-relaxed">{session.patientSummary}</p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-[#0f172a] p-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">스트레칭 교육 내용</h2>
              <p className="text-xs text-slate-400 mb-3">{session.stretchingPlan.description}</p>
              {session.stretchingPlan.exercises.map((ex) => (
                <div key={ex.id} className="mb-3">
                  <p className="text-xs font-semibold text-slate-300 mb-1">{ex.title}</p>
                  <p className="text-[11px] text-slate-500">{ex.purpose}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">{ex.holdSeconds}초 × {ex.repetitions}회</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: chart options + actions */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/8 bg-[#0f172a] p-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">차트 포함 항목</h2>

              <div className="border-t border-white/5 divide-y divide-white/5">
                <CheckRow label="ROM 측정 결과" field="romResult" />
                <CheckRow label="통증 변화 (NRS)" field="painChange" />
                <CheckRow label="임상 소견 요약" field="clinicalSummary" />
                <CheckRow label="스트레칭 교육 기록" field="stretchingEducation" />
                <CheckRow label="추적 관찰 계획" field="followUpPlan" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-[#0f172a] p-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">임상의 메모</h2>
              <textarea
                value={options.clinicianMemo}
                onChange={(e) => setOptions((prev) => ({ ...prev, clinicianMemo: e.target.value }))}
                placeholder="추가 소견 또는 메모를 입력하세요..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 placeholder-slate-600 resize-none focus:outline-none focus:border-cyan-500/40"
              />
            </div>

            {options.followUpPlan && (
              <div className="rounded-2xl border border-white/8 bg-[#0f172a] p-4">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">추적 관찰 계획</h2>
                <textarea
                  value={options.followUpNote}
                  onChange={(e) => setOptions((prev) => ({ ...prev, followUpNote: e.target.value }))}
                  placeholder="추적 관찰 계획을 입력하세요..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 placeholder-slate-600 resize-none focus:outline-none focus:border-cyan-500/40"
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleApprove}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-sm transition-all shadow-lg"
              >
                <CheckCircle className="w-4 h-4" />
                진료기록에 저장
              </button>
              <button
                onClick={handleReject}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 font-medium text-sm transition-all border border-white/8 hover:border-red-500/20"
              >
                <XCircle className="w-4 h-4" />
                반영 거부
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
