"use client";

import { AlertCircle, CheckCircle, TrendingUp } from "lucide-react";
import type { PatientSession } from "@/lib/types";
import {
  calculateImprovement,
  calculateImprovementPercent,
  calculatePainReduction,
  getImprovementGrade,
  generateClinicalSummary,
} from "@/lib/calculations";

type Props = {
  session: PatientSession;
};

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-slate-500">{label}</span>
        <span className="text-[11px] font-medium text-slate-300">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function ClinicalInterpretation({ session }: Props) {
  const improvement = calculateImprovement(session.preRom, session.postRom);
  const improvementPct = calculateImprovementPercent(session.preRom, session.postRom);
  const painReduction = calculatePainReduction(session.prePainNrs, session.postPainNrs);
  const grade = getImprovementGrade(improvement);
  const summary = generateClinicalSummary(session);

  const improvementScore = Math.min(100, Math.round((improvement / session.preRom) * 100 + session.confidenceScore * 0.3));

  return (
    <div className="rounded-2xl border bg-[#0f172a] border-white/8 p-5 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">임상 해석</h3>
        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
          improvement >= 20
            ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
            : improvement >= 10
            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
            : improvement >= 1
            ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
            : "bg-red-500/15 text-red-400 border-red-500/30"
        }`}>
          {grade.label}
        </span>
      </div>

      {/* Summary text */}
      <div className="bg-white/3 border border-white/6 rounded-xl p-4">
        <p className="text-[12px] text-slate-300 leading-relaxed">{summary}</p>
      </div>

      {/* Score metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <ScoreBar label="Improvement Score" value={improvementScore} color="bg-cyan-400" />
          <ScoreBar label="Smoothness Score" value={session.smoothnessScore} color="bg-emerald-400" />
        </div>
        <div className="space-y-3">
          <ScoreBar label="Stability Score" value={session.stabilityScore} color="bg-violet-400" />
          <ScoreBar label="Confidence" value={session.confidenceScore} color="bg-amber-400" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/3 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-white">+{improvement}°</div>
          <div className="text-[10px] text-slate-500 mt-0.5">ROM 개선</div>
        </div>
        <div className="bg-white/3 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-cyan-400">+{improvementPct.toFixed(1)}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">개선율</div>
        </div>
        <div className="bg-white/3 rounded-xl p-3 text-center">
          <div className={`text-lg font-bold ${painReduction > 0 ? "text-emerald-400" : "text-red-400"}`}>
            {painReduction > 0 ? "-" : "+"}{Math.abs(painReduction)}점
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">통증 변화</div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/15 rounded-xl p-3">
        <AlertCircle className="w-3.5 h-3.5 text-amber-500/70 mt-0.5 shrink-0" />
        <p className="text-[10px] text-amber-600/80 leading-relaxed">
          본 화면은 진단 확정이 아닌 치료 전후 기능 변화 시각화 보조 도구입니다. 모든 데이터는 가상 데모 데이터입니다.
        </p>
      </div>
    </div>
  );
}
