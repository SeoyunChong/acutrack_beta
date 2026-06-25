"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Easing } from "framer-motion";
import { TrendingUp, Activity, Minus, Shield } from "lucide-react";
import type { PatientSession } from "@/lib/types";
import { calculateImprovement, calculateImprovementPercent, calculatePainReduction, calculateBmi } from "@/lib/calculations";
import type { MeasurementPhase } from "@/lib/measurement";
import { PHASE_LABELS } from "@/lib/measurement";

type Props = {
  session: PatientSession;
  phase: MeasurementPhase;
  measuredPreRom?: number;
  measuredPostRom?: number;
  liveAngle?: number;
  progress?: number;
};

function useCountUp(target: number, duration = 800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.round(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return val;
}

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

const EASE_OUT: Easing = "easeOut";
const fadeSlide = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_OUT } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

function ResultCards({ preRom, postRom, improvement, improvementPct, painReduction, session }: {
  preRom: number;
  postRom: number;
  improvement: number | undefined;
  improvementPct: number | undefined;
  painReduction: number | undefined;
  session: PatientSession;
}) {
  const animPreRom = useCountUp(preRom);
  const animPostRom = useCountUp(postRom);
  const animImprovement = useCountUp(improvement ?? 0);
  const animImprovementPct = useCountUp(Math.round(improvementPct ?? 0));

  return (
    <motion.div key="results" {...fadeSlide} className="grid grid-cols-4 gap-3">
      <KpiCard
        label="치료 전 ROM"
        value={`${animPreRom}°`}
        sub={`NRS ${session.prePainNrs}점`}
      />
      <KpiCard
        label="치료 후 ROM"
        value={`${animPostRom}°`}
        sub={`NRS ${session.postPainNrs}점`}
        accent
      />
      <KpiCard
        label="ROM 개선"
        value={improvement !== undefined ? `+${animImprovement}°` : "--°"}
        sub={improvementPct !== undefined ? `+${animImprovementPct}% 개선율` : "측정 완료 후 계산"}
        dim={improvement === undefined}
      />
      <KpiCard
        label="통증 변화"
        value={painReduction !== undefined ? (painReduction > 0 ? `-${painReduction}점` : `+${Math.abs(painReduction)}점`) : "--점"}
        sub={`신뢰도 ${session.confidenceScore}%`}
        dim={painReduction === undefined}
      />
    </motion.div>
  );
}

export default function KpiCards({ session, phase, measuredPreRom, measuredPostRom, liveAngle, progress = 0 }: Props) {
  const isReadyOrIdle = phase === "ready" || phase === "idle" as MeasurementPhase;
  const isAnalysisComplete = phase === "analysis_complete";
  const isDuringMeasurement = !isReadyOrIdle && !isAnalysisComplete;

  const preRom = measuredPreRom ?? session.preRom;
  const postRom = measuredPostRom ?? session.postRom;
  const improvement = isAnalysisComplete ? calculateImprovement(preRom, postRom) : undefined;
  const improvementPct = isAnalysisComplete ? calculateImprovementPercent(preRom, postRom) : undefined;
  const painReduction = isAnalysisComplete ? calculatePainReduction(session.prePainNrs, session.postPainNrs) : undefined;
  const bmi = calculateBmi(session.heightCm, session.weightKg);

  return (
    <AnimatePresence mode="wait">
      {isReadyOrIdle && (
        <motion.div key="info" {...fadeSlide} className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/8 bg-[#0f172a] p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">환자</p>
            <p className="text-sm font-bold text-white">{session.patientName ?? session.id}</p>
            <p className="text-xs text-slate-400">{session.age}세 · {session.sex} · BMI {bmi.toFixed(1)}</p>
          </div>
          <div className="rounded-xl border border-white/8 bg-[#0f172a] p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">주소증</p>
            <p className="text-sm text-slate-200 leading-relaxed line-clamp-2">{session.symptoms[0] ?? "—"}</p>
          </div>
        </motion.div>
      )}

      {isDuringMeasurement && (
        <motion.div key="progress" {...fadeSlide} className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-2.5 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse flex-shrink-0" />
          <span className="text-xs text-cyan-400 font-medium">{PHASE_LABELS[phase]}</span>
          {(phase === "measuring_pre" || phase === "measuring_post") && (
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${progress * 100}%` }} />
            </div>
          )}
        </motion.div>
      )}

      {isAnalysisComplete && (
        <ResultCards
          key="results-wrapper"
          preRom={preRom}
          postRom={postRom}
          improvement={improvement}
          improvementPct={improvementPct}
          painReduction={painReduction}
          session={session}
        />
      )}
    </AnimatePresence>
  );
}
