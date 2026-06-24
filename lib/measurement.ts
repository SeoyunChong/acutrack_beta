export type MeasurementPhase =
  | "idle"
  | "ready"
  | "calibrating"
  | "measuring_pre"
  | "pre_complete"
  | "treatment_waiting"
  | "measuring_post"
  | "post_complete"
  | "analysis_complete";

export type RomPoint = {
  time: number;
  angle: number;
};

export const PHASE_LABELS: Record<MeasurementPhase, string> = {
  idle: "대기",
  ready: "측정 준비",
  calibrating: "보정 중...",
  measuring_pre: "치료 전 측정 중",
  pre_complete: "치료 전 완료",
  treatment_waiting: "치료 진행 중",
  measuring_post: "치료 후 측정 중",
  post_complete: "측정 완료",
  analysis_complete: "분석 완료",
};

export const PHASE_COLORS: Record<MeasurementPhase, string> = {
  idle: "text-slate-400 bg-slate-500/10 border-slate-500/20",
  ready: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  calibrating: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  measuring_pre: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  pre_complete: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  treatment_waiting: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  measuring_post: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  post_complete: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  analysis_complete: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

export function generateLiveRomValue(progress: number, targetRom: number): number {
  // Bell curve: rises to peak then falls
  const curve = Math.sin(progress * Math.PI);
  const noise = (Math.random() - 0.5) * 3;
  return Math.max(0, Math.round(curve * targetRom + noise));
}

export function generateFullRomCurve(targetRom: number, points = 60): RomPoint[] {
  return Array.from({ length: points }, (_, i) => {
    const progress = i / (points - 1);
    return {
      time: Math.round(progress * 100),
      angle: generateLiveRomValue(progress, targetRom),
    };
  });
}

export const MEASUREMENT_DURATION_MS = 6000;
export const CALIBRATION_DURATION_MS = 1200;
