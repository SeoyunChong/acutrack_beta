"use client";

import { User, Wifi, WifiOff, Battery } from "lucide-react";
import type { PatientSession } from "@/lib/types";
import { WEAR_LOCATION_LABELS, MOTION_TYPE_LABELS } from "@/lib/types";
import { calculateImprovement } from "@/lib/calculations";

type Props = {
  patients: PatientSession[];
  selectedId: string;
  onSelect: (id: string) => void;
};

function StatusDot({ status }: { status: PatientSession["deviceStatus"] }) {
  const colors = {
    connected: "bg-emerald-400",
    waiting: "bg-amber-400",
    weak: "bg-amber-400",
    disconnected: "bg-red-400",
  };
  return <span className={`w-2 h-2 rounded-full ${colors[status]} ${status === "connected" ? "animate-pulse" : ""}`} />;
}

export default function PatientSelector({ patients, selectedId, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 px-1 mb-1">
        <User className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-[11px] text-slate-500 uppercase tracking-widest font-medium">환자 세션</span>
      </div>
      {patients.map((p) => {
        const improvement = calculateImprovement(p.preRom, p.postRom);
        const isSelected = p.id === selectedId;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
              isSelected
                ? "bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_12px_rgba(0,163,168,0.15)]"
                : "bg-white/3 border-white/6 hover:bg-white/6 hover:border-white/12"
            }`}
          >
            <div className="flex items-start justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <StatusDot status={p.deviceStatus} />
                <span className={`text-xs font-bold ${isSelected ? "text-cyan-300" : "text-slate-300"}`}>{p.id}</span>
                <span className="text-xs text-slate-400">{p.patientName}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <Battery className="w-3 h-3" />
                {p.batteryPercent}%
              </div>
            </div>
            <div className="text-[10px] text-slate-500 mb-1.5">
              {p.age}세 {p.sex} · {WEAR_LOCATION_LABELS[p.wearLocation]} {MOTION_TYPE_LABELS[p.motionType]}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-600">{p.preRom}° → {p.postRom}°</span>
              <span className={`text-[11px] font-bold ${improvement >= 10 ? "text-cyan-400" : improvement >= 1 ? "text-amber-400" : "text-red-400"}`}>
                +{improvement}°
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
