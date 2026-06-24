import type { PatientSession, RomCurvePoint } from "./types";
import { WEAR_LOCATION_LABELS, MOTION_TYPE_LABELS } from "./types";

export function calculateBmi(heightCm: number, weightKg: number): number {
  const h = heightCm / 100;
  return weightKg / (h * h);
}

export function calculateImprovement(preRom: number, postRom: number): number {
  return postRom - preRom;
}

export function calculateImprovementPercent(preRom: number, postRom: number): number {
  if (preRom === 0) return 0;
  return ((postRom - preRom) / preRom) * 100;
}

export function calculatePainReduction(prePainNrs: number, postPainNrs: number): number {
  return prePainNrs - postPainNrs;
}

export function getImprovementGrade(improvementDeg: number): {
  label: string;
  color: string;
} {
  if (improvementDeg >= 20) return { label: "뚜렷한 가동 범위 개선", color: "text-cyan-400" };
  if (improvementDeg >= 10) return { label: "유의한 가동 범위 개선", color: "text-emerald-400" };
  if (improvementDeg >= 1) return { label: "경미한 개선", color: "text-amber-400" };
  return { label: "뚜렷한 개선 없음", color: "text-red-400" };
}

export function generateRomCurve(preRom: number, postRom: number): RomCurvePoint[] {
  // Natural bell-curve shape: 0 → peak → back down
  const points = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const bellShape = [0, 0.3, 0.62, 0.85, 0.97, 1.0, 0.97, 0.85, 0.62, 0.3, 0];

  return points.map((t, i) => ({
    time: t,
    pre: Math.round(preRom * bellShape[i]),
    post: Math.round(postRom * bellShape[i]),
  }));
}

export function generateClinicalSummary(session: PatientSession): string {
  const improvement = calculateImprovement(session.preRom, session.postRom);
  const grade = getImprovementGrade(improvement);
  const painReduction = calculatePainReduction(session.prePainNrs, session.postPainNrs);
  const locationLabel = WEAR_LOCATION_LABELS[session.wearLocation];
  const motionLabel = MOTION_TYPE_LABELS[session.motionType];

  let painText = "";
  if (painReduction > 0) {
    painText = ` 통증 NRS는 ${session.prePainNrs}점에서 ${session.postPainNrs}점으로 감소하여, 기능 회복과 주관적 통증 완화가 함께 확인됩니다.`;
  } else if (painReduction === 0) {
    painText = ` 통증 NRS는 ${session.prePainNrs}점으로 변화가 없었습니다.`;
  } else {
    painText = ` 통증 NRS는 ${session.prePainNrs}점에서 ${session.postPainNrs}점으로 증가하였습니다.`;
  }

  return `치료 후 ${session.laterality} ${locationLabel} ${motionLabel} ROM이 ${session.preRom}°에서 ${session.postRom}°로 증가하여, +${improvement}°의 ${grade.label}이 관찰되었습니다.${painText}`;
}
