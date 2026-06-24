"use client";

import { TrendingUp, Activity, Minus, Shield } from "lucide-react";
import type { PatientSession } from "@/lib/types";
import { calculateImprovement, calculateImprovementPercent, calculatePainReduction } from "@/lib/calculations";
import type { MeasurementPhase } from "@/lib/measurement";

type Props = {
  session: PatientSession;
  phase: MeasurementPhase;
  measuredPreRom?: number;
  measuredPostRom?: number;
  liveAngle?: number;
};

function KpiCard({ label, value, sub, accent, dim }: {
  label: string; value: string; sub: string; accent?: boolean; dim?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-3.5 transition-all ${
      dim ? "bg-white/2 border-white/4 opacity-35" : accent ? "bg-cyan-500/8 border-cyan-500/20" : "bg-[#0f172a] border-white/8"
    }`}>
      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">{label}</div>
      <div className={`text-2xl font-bold mb-0.5 font-mono ${dim ? "text-slate-700" : accent ? "text-cyan-400" : "text-white"}`}>
        {value}
      </div>
      <div className="text-[10px] text-slate-500">{sub}</div>
    </div>
  );
}

export default function KpiCards({ session, phase, measuredPreRom, measuredPostRom, liveAngle }: Props) {
  const isMeasuring = phase === "measuring_pre" || phase === "measuring_post" || phase === "calibrating";
  const hasPost = phase === "post_complete" || phase === "analysis_complete";
  const hasPre = hasPost || phase === "pre_complete" || phase === "treatment_waiting";

  const preRom = measuredPreRom ?? session.preRom;
  const postRom = measuredPostRom ?? session.postRom;
  const improvement = hasPost ? calculateImprovement(preRom, postRom) : undefined;
  const improvementPct = hasPost ? calculateImprovementPercent(preRom, postRom) : undefined;
  const painReduction = hasPost ? calculatePainReduction(session.prePainNrs, session.postPainNrs) : undefined;

  return (
    <div className="grid grid-cols-4 gap-3">
      <KpiCard
        label="치료 전 ROM"
        value={hasPre ? `${preRom}°` : isMeasuring && phase === "measuring_pre" ? `${liveAngle ?? 0}°` : "--°"}
        sub={`NRS ${session.prePainNrs}점`}
        dim={!hasPre && !isMeasuring}
      />
      <KpiCard
        label="치료 후 ROM"
        value={hasPost ? `${postRom}°` : isMeasuring && phase === "measuring_post" ? `${liveAngle ?? 0}°` : "--°"}
        sub={`NRS ${session.postPainNrs}점`}
        accent={hasPost}
        dim={!hasPost && phase !== "measuring_post"}
      />
      <KpiCard
        label="ROM 개선"
        value={improvement !== undefined ? `+${improvement}°` : "--°"}
        sub={improvementPct !== undefined ? `+${improvementPct.toFixed(1)}% 개선율` : "측정 완료 후 계산"}
        dim={improvement === undefined}
      />
      <KpiCard
        label="통증 변화"
        value={painReduction !== undefined ? (painReduction > 0 ? `-${painReduction}점` : `+${Math.abs(painReduction)}점`) : "--점"}
        sub={`신뢰도 ${session.confidenceScore}%`}
        dim={painReduction === undefined}
      />
    </div>
  );
}
