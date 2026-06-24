"use client";

import { User, Wifi, Battery } from "lucide-react";
import type { PatientSession, WearLocation, MotionType, Laterality } from "@/lib/types";
import { WEAR_LOCATION_LABELS, MOTION_TYPE_LABELS } from "@/lib/types";

const LOCATION_TO_MOTION: Record<WearLocation, MotionType> = {
  wrist: "wrist_flexion_extension",
  elbow: "elbow_flexion",
  shoulder: "shoulder_abduction",
  neck: "cervical_rotation",
  lowerBack: "lumbar_flexion",
  knee: "knee_flexion",
  ankle: "ankle_dorsi_plantar",
};
import { calculateBmi } from "@/lib/calculations";
import type { MeasurementPhase } from "@/lib/measurement";

type Props = {
  session: PatientSession;
  patients: PatientSession[];
  selectedId: string;
  phase: MeasurementPhase;
  onSelectPatient: (id: string) => void;
  onChange: (patch: Partial<PatientSession>) => void;
};

function Pill<T extends string>({
  value,
  options,
  labels,
  onChange,
  disabled,
}: {
  value: T;
  options: T[];
  labels: Record<T, string> | ((v: T) => string);
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  const getLabel = typeof labels === "function" ? labels : (v: T) => (labels as Record<T, string>)[v];
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => (
        <button
          key={opt}
          disabled={disabled}
          onClick={() => onChange(opt)}
          className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all border ${
            value === opt
              ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
              : "bg-white/3 text-slate-500 border-white/6 hover:bg-white/6 hover:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
          }`}
        >
          {getLabel(opt)}
        </button>
      ))}
    </div>
  );
}

function SliderRow({ label, value, onChange, min, max, unit, disabled }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; unit?: string; disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-slate-500 w-12 shrink-0">{label}</span>
      <input
        type="range" min={min} max={max} value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1 rounded-full accent-cyan-500 bg-white/10 cursor-pointer disabled:opacity-30"
      />
      <span className="text-[11px] font-mono text-slate-300 w-10 text-right shrink-0">{value}{unit}</span>
    </div>
  );
}

export default function CompactPatientSetup({ session, patients, selectedId, phase, onSelectPatient, onChange }: Props) {
  const bmi = calculateBmi(session.heightCm, session.weightKg);
  const locked = phase !== "ready" && phase !== "idle";

  return (
    <div className="w-72 shrink-0 flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-64px)] pb-4 pr-0.5">

      {/* Sensor status (display only) */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-emerald-400 font-semibold">Sensor Connected</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <Battery className="w-3 h-3" />
            {session.batteryPercent}%
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-500">
          <span>IMU: <span className="text-slate-400">준비 완료</span></span>
          <span>신호: <span className="text-emerald-400">안정</span></span>
          <span>보정: <span className="text-slate-400">완료</span></span>
        </div>
      </div>

      {/* Patient selector */}
      <div className="rounded-xl border border-white/8 bg-[#0f172a] p-3 space-y-2">
        <div className="flex items-center gap-1.5 mb-1">
          <User className="w-3 h-3 text-slate-500" />
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">환자 선택</span>
        </div>
        {patients.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectPatient(p.id)}
            disabled={locked}
            className={`w-full text-left px-2.5 py-2 rounded-lg border text-[11px] transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              p.id === selectedId
                ? "bg-cyan-500/12 border-cyan-500/30 text-cyan-300"
                : "bg-white/2 border-white/5 text-slate-400 hover:bg-white/5"
            }`}
          >
            <span className="font-bold">{p.id}</span> {p.patientName} · {p.age}세 {p.sex}
          </button>
        ))}
      </div>

      {/* Patient measurements */}
      <div className="rounded-xl border border-white/8 bg-[#0f172a] p-3 space-y-2.5">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">신체 정보</span>
        <SliderRow label="키" value={session.heightCm} onChange={(v) => onChange({ heightCm: v })} min={140} max={200} unit="cm" disabled={locked} />
        <SliderRow label="몸무게" value={session.weightKg} onChange={(v) => onChange({ weightKg: v })} min={40} max={130} unit="kg" disabled={locked} />
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500">BMI</span>
          <span className={`font-bold ${bmi < 25 ? "text-emerald-400" : bmi < 30 ? "text-amber-400" : "text-red-400"}`}>
            {bmi.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Wear config */}
      <div className="rounded-xl border border-white/8 bg-[#0f172a] p-3 space-y-2.5">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">측정 설정</span>
        <div>
          <div className="text-[10px] text-slate-600 mb-1">착용 부위</div>
          <Pill<WearLocation>
            value={session.wearLocation}
            options={["wrist", "elbow", "shoulder", "neck", "lowerBack", "knee", "ankle"]}
            labels={WEAR_LOCATION_LABELS}
            onChange={(v) => onChange({ wearLocation: v, motionType: LOCATION_TO_MOTION[v] })}
            disabled={locked}
          />
        </div>
        <div>
          <div className="text-[10px] text-slate-600 mb-1">좌우</div>
          <Pill<Laterality>
            value={session.laterality}
            options={["좌측", "우측", "양측"]}
            labels={(v) => v}
            onChange={(v) => onChange({ laterality: v })}
            disabled={locked}
          />
        </div>
        <div>
          <div className="text-[10px] text-slate-600 mb-1">측정 동작</div>
          <Pill<MotionType>
            value={session.motionType}
            options={[LOCATION_TO_MOTION[session.wearLocation]]}
            labels={MOTION_TYPE_LABELS}
            onChange={(v) => onChange({ motionType: v })}
            disabled={locked}
          />
        </div>
      </div>

      {/* Target ROM (hidden from UI, set via preRom/postRom which are mock targets) */}
      <div className="rounded-xl border border-white/8 bg-[#0f172a] p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">목표 ROM (데모)</span>
          <span className="text-[9px] text-amber-500/70 bg-amber-500/8 px-1.5 py-0.5 rounded">실제 환경에서는 자동 측정</span>
        </div>
        <SliderRow label="치료 전" value={session.preRom} onChange={(v) => onChange({ preRom: v })} min={5} max={180} unit="°" disabled={locked} />
        <SliderRow label="치료 후" value={session.postRom} onChange={(v) => onChange({ postRom: v })} min={5} max={180} unit="°" disabled={locked} />
        <SliderRow label="전 NRS" value={session.prePainNrs} onChange={(v) => onChange({ prePainNrs: v })} min={0} max={10} disabled={locked} />
        <SliderRow label="후 NRS" value={session.postPainNrs} onChange={(v) => onChange({ postPainNrs: v })} min={0} max={10} disabled={locked} />
      </div>
    </div>
  );
}
