"use client";

import { Settings, Battery, Wifi, WifiOff, Activity } from "lucide-react";
import type { PatientSession, DeviceStatus, WearLocation, MotionType, Laterality, AttachmentMethod } from "@/lib/types";
import {
  WEAR_LOCATION_LABELS,
  MOTION_TYPE_LABELS,
  SYMPTOM_OPTIONS,
} from "@/lib/types";
import { calculateBmi } from "@/lib/calculations";

type Props = {
  session: PatientSession;
  onChange: (patch: Partial<PatientSession>) => void;
};

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{children}</label>;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function NumberInput({ value, onChange, min, max, unit }: { value: number; onChange: (v: number) => void; min: number; max: number; unit?: string }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1 rounded-full accent-cyan-500 bg-white/10 cursor-pointer"
      />
      <span className="text-xs font-mono text-slate-300 w-12 text-right">{value}{unit}</span>
    </div>
  );
}

function SelectButton<T extends string>({
  value,
  options,
  labels,
  onChange,
}: {
  value: T;
  options: T[];
  labels: Record<T, string> | ((v: T) => string);
  onChange: (v: T) => void;
}) {
  const getLabel = typeof labels === "function" ? labels : (v: T) => (labels as Record<T, string>)[v];
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all border ${
            value === opt
              ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
              : "bg-white/3 text-slate-500 border-white/6 hover:bg-white/6 hover:text-slate-300"
          }`}
        >
          {getLabel(opt)}
        </button>
      ))}
    </div>
  );
}

export default function DeviceEmulator({ session, onChange }: Props) {
  const bmi = calculateBmi(session.heightCm, session.weightKg);
  const statusColors: Record<DeviceStatus, string> = {
    connected: "text-emerald-400",
    waiting: "text-amber-400",
    weak: "text-amber-400",
    disconnected: "text-red-400",
  };

  return (
    <aside className="w-72 shrink-0 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-64px)] pb-6 pr-1 scrollbar-thin">
      {/* Header */}
      <div className="flex items-center gap-2 sticky top-0 bg-[#07111f] pt-1 pb-2 z-10">
        <Settings className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-[11px] text-slate-400 uppercase tracking-widest font-medium">Device Emulator</span>
      </div>

      {/* Device Toggle */}
      <div className="rounded-xl border border-white/8 bg-[#0f172a] p-4 space-y-3">
        <Row label="착용 여부">
          <div className="flex gap-2">
            {[true, false].map((v) => (
              <button
                key={String(v)}
                onClick={() => onChange({ deviceWorn: v })}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                  session.deviceWorn === v
                    ? v
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      : "bg-red-500/20 text-red-400 border-red-500/40"
                    : "bg-white/3 text-slate-500 border-white/6 hover:bg-white/6"
                }`}
              >
                {v ? "착용됨" : "미착용"}
              </button>
            ))}
          </div>
        </Row>

        <Row label="센서 연결 상태">
          <SelectButton<DeviceStatus>
            value={session.deviceStatus}
            options={["connected", "waiting", "weak", "disconnected"]}
            labels={{ connected: "연결됨", waiting: "대기", weak: "신호 약함", disconnected: "연결 끊김" }}
            onChange={(v) => onChange({ deviceStatus: v })}
          />
        </Row>

        <Row label={`배터리 ${session.batteryPercent}%`}>
          <NumberInput value={session.batteryPercent} onChange={(v) => onChange({ batteryPercent: v })} min={0} max={100} unit="%" />
        </Row>
      </div>

      {/* Patient Info */}
      <div className="rounded-xl border border-white/8 bg-[#0f172a] p-4 space-y-3">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-1">환자 기본 정보</div>

        <Row label="성별">
          <SelectButton<"남" | "여">
            value={session.sex}
            options={["남", "여"]}
            labels={{ "남": "남성", "여": "여성" }}
            onChange={(v) => onChange({ sex: v })}
          />
        </Row>

        <Row label={`나이 ${session.age}세`}>
          <NumberInput value={session.age} onChange={(v) => onChange({ age: v })} min={10} max={90} unit="세" />
        </Row>

        <Row label={`키 ${session.heightCm}cm`}>
          <NumberInput value={session.heightCm} onChange={(v) => onChange({ heightCm: v })} min={140} max={200} unit="cm" />
        </Row>

        <Row label={`몸무게 ${session.weightKg}kg`}>
          <NumberInput value={session.weightKg} onChange={(v) => onChange({ weightKg: v })} min={40} max={120} unit="kg" />
        </Row>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500">BMI</span>
          <span className={`font-bold ${bmi < 18.5 ? "text-amber-400" : bmi < 25 ? "text-emerald-400" : bmi < 30 ? "text-amber-400" : "text-red-400"}`}>
            {bmi.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Wear Info */}
      <div className="rounded-xl border border-white/8 bg-[#0f172a] p-4 space-y-3">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-1">착용 정보</div>

        <Row label="착용 부위">
          <SelectButton<WearLocation>
            value={session.wearLocation}
            options={["wrist", "elbow", "shoulder", "neck", "lowerBack", "knee", "ankle"]}
            labels={WEAR_LOCATION_LABELS}
            onChange={(v) => onChange({ wearLocation: v })}
          />
        </Row>

        <Row label="좌우">
          <SelectButton<Laterality>
            value={session.laterality}
            options={["좌측", "우측", "양측"]}
            labels={(v) => v}
            onChange={(v) => onChange({ laterality: v })}
          />
        </Row>

        <Row label="부착 방식">
          <SelectButton<AttachmentMethod>
            value={session.attachmentMethod}
            options={["피부 부착", "의복 위 부착", "스트랩 착용"]}
            labels={(v) => v}
            onChange={(v) => onChange({ attachmentMethod: v })}
          />
        </Row>
      </div>

      {/* Motion Type */}
      <div className="rounded-xl border border-white/8 bg-[#0f172a] p-4 space-y-3">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-1">측정 동작</div>
        <SelectButton<MotionType>
          value={session.motionType}
          options={[
            "wrist_flexion_extension",
            "elbow_flexion",
            "shoulder_abduction",
            "cervical_rotation",
            "lumbar_flexion",
            "knee_flexion",
            "ankle_dorsi_plantar",
          ]}
          labels={MOTION_TYPE_LABELS}
          onChange={(v) => onChange({ motionType: v })}
        />
      </div>

      {/* Symptoms */}
      <div className="rounded-xl border border-white/8 bg-[#0f172a] p-4 space-y-3">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-1">증상 (복수 선택)</div>
        <div className="flex flex-wrap gap-1">
          {SYMPTOM_OPTIONS.map((sym) => {
            const active = session.symptoms.includes(sym);
            return (
              <button
                key={sym}
                onClick={() =>
                  onChange({
                    symptoms: active
                      ? session.symptoms.filter((s) => s !== sym)
                      : [...session.symptoms, sym],
                  })
                }
                className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all border ${
                  active
                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                    : "bg-white/3 text-slate-500 border-white/6 hover:bg-white/6 hover:text-slate-300"
                }`}
              >
                {sym}
              </button>
            );
          })}
        </div>
      </div>

      {/* Measurements */}
      <div className="rounded-xl border border-white/8 bg-[#0f172a] p-4 space-y-4">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-1">치료 전후 측정값</div>

        <Row label={`치료 전 ROM ${session.preRom}°`}>
          <NumberInput value={session.preRom} onChange={(v) => onChange({ preRom: v })} min={0} max={180} unit="°" />
        </Row>
        <Row label={`치료 후 ROM ${session.postRom}°`}>
          <NumberInput value={session.postRom} onChange={(v) => onChange({ postRom: v })} min={0} max={180} unit="°" />
        </Row>
        <Row label={`치료 전 NRS ${session.prePainNrs}`}>
          <NumberInput value={session.prePainNrs} onChange={(v) => onChange({ prePainNrs: v })} min={0} max={10} />
        </Row>
        <Row label={`치료 후 NRS ${session.postPainNrs}`}>
          <NumberInput value={session.postPainNrs} onChange={(v) => onChange({ postPainNrs: v })} min={0} max={10} />
        </Row>
        <Row label={`Smoothness ${session.smoothnessScore}%`}>
          <NumberInput value={session.smoothnessScore} onChange={(v) => onChange({ smoothnessScore: v })} min={0} max={100} unit="%" />
        </Row>
        <Row label={`Stability ${session.stabilityScore}%`}>
          <NumberInput value={session.stabilityScore} onChange={(v) => onChange({ stabilityScore: v })} min={0} max={100} unit="%" />
        </Row>
        <Row label={`Confidence ${session.confidenceScore}%`}>
          <NumberInput value={session.confidenceScore} onChange={(v) => onChange({ confidenceScore: v })} min={0} max={100} unit="%" />
        </Row>
      </div>
    </aside>
  );
}
