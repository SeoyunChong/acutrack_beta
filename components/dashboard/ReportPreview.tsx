"use client";

import { FileText, Download } from "lucide-react";
import type { PatientSession } from "@/lib/types";
import { WEAR_LOCATION_LABELS, MOTION_TYPE_LABELS } from "@/lib/types";
import { calculateImprovement, calculateImprovementPercent, calculatePainReduction } from "@/lib/calculations";

type Props = {
  session: PatientSession;
};

export default function ReportPreview({ session }: Props) {
  const improvement = calculateImprovement(session.preRom, session.postRom);
  const improvementPct = calculateImprovementPercent(session.preRom, session.postRom);
  const painReduction = calculatePainReduction(session.prePainNrs, session.postPainNrs);

  return (
    <div className="rounded-2xl border bg-[#0f172a] border-white/8 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">상담용 리포트</h3>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 text-slate-400 text-[11px] font-medium hover:bg-white/8 transition-all cursor-default">
          <Download className="w-3 h-3" />
          PDF Export
        </button>
      </div>

      {/* Report Card */}
      <div className="bg-[#07111f] border border-white/6 rounded-xl p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-white/5">
          <div>
            <div className="text-xs text-slate-500 mb-0.5">환자</div>
            <div className="text-sm font-bold text-white">{session.patientName}</div>
            <div className="text-[11px] text-slate-500">{session.age}세 {session.sex} · BMI —</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 mb-0.5">측정일</div>
            <div className="text-xs font-medium text-slate-300">{session.measuredAt}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{session.id}</div>
          </div>
        </div>

        {/* Measurement info */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] text-slate-500 mb-0.5">착용 부위</div>
            <div className="text-xs text-slate-300">{session.laterality} {WEAR_LOCATION_LABELS[session.wearLocation]}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 mb-0.5">측정 동작</div>
            <div className="text-xs text-slate-300">{MOTION_TYPE_LABELS[session.motionType]}</div>
          </div>
        </div>

        {/* ROM results */}
        <div className="bg-white/3 rounded-xl p-3">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-[10px] text-slate-500 mb-1">치료 전 ROM</div>
              <div className="text-lg font-bold text-slate-400">{session.preRom}°</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 mb-1">치료 후 ROM</div>
              <div className="text-lg font-bold text-cyan-400">{session.postRom}°</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 mb-1">개선 각도</div>
              <div className="text-lg font-bold text-emerald-400">+{improvement}°</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 mb-1">개선율</div>
              <div className="text-lg font-bold text-emerald-400">+{improvementPct.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        {/* Pain */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500">통증 변화 (NRS)</span>
          <span className="text-[11px] text-slate-300">
            {session.prePainNrs}점 → {session.postPainNrs}점
            <span className={`ml-1.5 font-bold ${painReduction > 0 ? "text-emerald-400" : "text-red-400"}`}>
              ({painReduction > 0 ? "-" : "+"}{Math.abs(painReduction)}점)
            </span>
          </span>
        </div>

        {/* Memo */}
        <div>
          <div className="text-[10px] text-slate-500 mb-1.5">의료진 상담 메모</div>
          <div className="bg-white/3 border border-white/5 rounded-lg p-2.5 min-h-[44px]">
            <p className="text-[11px] text-slate-500 italic">메모를 입력하세요...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
