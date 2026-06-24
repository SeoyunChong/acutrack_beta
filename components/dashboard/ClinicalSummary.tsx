"use client";

import { AlertCircle } from "lucide-react";
import type { PatientSession } from "@/lib/types";
import { WEAR_LOCATION_LABELS, MOTION_TYPE_LABELS } from "@/lib/types";
import { calculateImprovement, calculateImprovementPercent, calculatePainReduction, getImprovementGrade } from "@/lib/calculations";
import type { MeasurementPhase } from "@/lib/measurement";

type Props = {
  session: PatientSession;
  phase: MeasurementPhase;
  measuredPreRom?: number;
  measuredPostRom?: number;
};

export default function ClinicalSummary({ session, phase, measuredPreRom, measuredPostRom }: Props) {
  const isDone = phase === "post_complete" || phase === "analysis_complete";
  const preRom = measuredPreRom ?? session.preRom;
  const postRom = measuredPostRom ?? session.postRom;

  if (!isDone) {
    return (
      <div className="rounded-2xl border bg-[#0f172a] border-white/8 p-5 flex items-center justify-center h-full min-h-[100px]">
        <p className="text-[12px] text-slate-600">치료 전후 측정 완료 후 요약이 표시됩니다.</p>
      </div>
    );
  }

  const improvement = calculateImprovement(preRom, postRom);
  const improvementPct = calculateImprovementPercent(preRom, postRom);
  const painReduction = calculatePainReduction(session.prePainNrs, session.postPainNrs);
  const grade = getImprovementGrade(improvement);
  const locationLabel = WEAR_LOCATION_LABELS[session.wearLocation];
  const motionLabel = MOTION_TYPE_LABELS[session.motionType];

  return (
    <div className="rounded-2xl border bg-[#0f172a] border-white/8 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">임상 요약</h3>
        <span className={`text-[11px] px-2.5 py-1 rounded-full border font-semibold ${grade.color.replace("text-", "bg-").replace("-400", "-500/10")} ${grade.color} border-current/30`}>
          {grade.label}
        </span>
      </div>

      <p className="text-[12px] text-slate-300 leading-relaxed bg-white/3 rounded-xl p-3 border border-white/5">
        치료 후 {session.laterality} {locationLabel} {motionLabel} ROM이{" "}
        <span className="text-slate-400 font-medium">{preRom}°</span>에서{" "}
        <span className="text-cyan-400 font-bold">{postRom}°</span>로 증가했습니다.{" "}
        <span className="text-emerald-400 font-bold">+{improvement}°</span>의 {grade.label}이 관찰되며,
        통증 NRS도 {session.prePainNrs}점에서 {session.postPainNrs}점으로{" "}
        <span className={painReduction > 0 ? "text-emerald-400" : "text-red-400"}>
          {painReduction > 0 ? `${painReduction}점 감소` : `${Math.abs(painReduction)}점 증가`}
        </span>했습니다.
      </p>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/3 rounded-xl p-2.5 text-center">
          <div className="text-[10px] text-slate-500 mb-1">ROM 개선</div>
          <div className="text-base font-bold text-emerald-400">+{improvement}°</div>
        </div>
        <div className="bg-white/3 rounded-xl p-2.5 text-center">
          <div className="text-[10px] text-slate-500 mb-1">개선율</div>
          <div className="text-base font-bold text-cyan-400">+{improvementPct.toFixed(1)}%</div>
        </div>
        <div className="bg-white/3 rounded-xl p-2.5 text-center">
          <div className="text-[10px] text-slate-500 mb-1">통증 변화</div>
          <div className={`text-base font-bold ${painReduction > 0 ? "text-emerald-400" : "text-red-400"}`}>
            {painReduction > 0 ? "-" : "+"}{Math.abs(painReduction)}점
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/15 rounded-xl p-2.5">
        <AlertCircle className="w-3 h-3 text-amber-500/60 mt-0.5 shrink-0" />
        <p className="text-[10px] text-amber-600/70 leading-relaxed">
          본 결과는 치료 전후 기능 변화 시각화 보조 자료이며, 진단 확정 용도가 아닙니다.
        </p>
      </div>
    </div>
  );
}
