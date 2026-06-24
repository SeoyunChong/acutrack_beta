"use client";

import { Download, CheckCircle, WifiOff } from "lucide-react";
import type { PatientSession } from "@/lib/types";
import { WEAR_LOCATION_LABELS, MOTION_TYPE_LABELS } from "@/lib/types";
import { calculateImprovement, calculatePainReduction } from "@/lib/calculations";

type Props = {
  sessions: PatientSession[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export default function SessionTable({ sessions, selectedId, onSelect }: Props) {
  return (
    <div className="rounded-2xl border bg-[#0f172a] border-white/8 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <h3 className="text-sm font-semibold text-white">전체 환자 세션</h3>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 text-slate-400 text-[11px] font-medium hover:bg-white/8 transition-all cursor-default">
          <Download className="w-3 h-3" />
          CSV Export
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5">
              {["ID", "환자", "나이/성별", "착용 부위", "측정 동작", "치료 전 ROM", "치료 후 ROM", "개선", "통증 변화", "신뢰도", "측정일"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] text-slate-500 uppercase tracking-wider font-medium whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => {
              const improvement = calculateImprovement(s.preRom, s.postRom);
              const painChange = calculatePainReduction(s.prePainNrs, s.postPainNrs);
              const isSelected = s.id === selectedId;
              return (
                <tr
                  key={s.id}
                  onClick={() => onSelect(s.id)}
                  className={`border-b border-white/3 cursor-pointer transition-all hover:bg-white/4 ${
                    isSelected ? "bg-cyan-500/8" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className={`font-mono font-bold ${isSelected ? "text-cyan-400" : "text-slate-400"}`}>
                      {s.id}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {s.deviceWorn ? (
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <WifiOff className="w-3 h-3 text-red-500" />
                      )}
                      <span className="text-slate-300 font-medium">{s.patientName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{s.age}세 {s.sex}</td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                    {s.laterality} {WEAR_LOCATION_LABELS[s.wearLocation]}
                  </td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{MOTION_TYPE_LABELS[s.motionType]}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono">{s.preRom}°</td>
                  <td className="px-4 py-3 text-cyan-400 font-mono font-medium">{s.postRom}°</td>
                  <td className="px-4 py-3">
                    <span className={`font-mono font-bold ${improvement >= 10 ? "text-emerald-400" : improvement > 0 ? "text-amber-400" : "text-red-400"}`}>
                      +{improvement}°
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-mono ${painChange > 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {painChange > 0 ? "-" : "+"}{Math.abs(painChange)}점
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-12 rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-violet-400"
                          style={{ width: `${s.confidenceScore}%` }}
                        />
                      </div>
                      <span className="text-slate-500">{s.confidenceScore}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{s.measuredAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
