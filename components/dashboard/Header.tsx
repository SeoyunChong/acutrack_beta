"use client";

import { Activity, Wifi } from "lucide-react";
import type { PatientSession } from "@/lib/types";
import { WEAR_LOCATION_LABELS, MOTION_TYPE_LABELS } from "@/lib/types";
import type { MeasurementPhase } from "@/lib/measurement";
import { PHASE_LABELS, PHASE_COLORS } from "@/lib/measurement";

type Props = {
  session: PatientSession;
  phase: MeasurementPhase;
};

export default function Header({ session, phase }: Props) {
  return (
    <header className="border-b border-white/5 bg-[#07111f]/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-wide">AcuTrack</span>
            <span className="text-slate-600 mx-2">·</span>
            <span className="text-xs text-slate-400">IMU-based ROM Analytics</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Patient + location info */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/4 border border-white/6">
            <span className="text-xs font-bold text-slate-300">{session.id} {session.patientName}</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">{session.laterality} {WEAR_LOCATION_LABELS[session.wearLocation]}</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">{MOTION_TYPE_LABELS[session.motionType]}</span>
          </div>

          {/* Sensor badge */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            <Wifi className="w-3 h-3" />
            Sensor Connected
          </span>

          {/* Phase badge */}
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${PHASE_COLORS[phase]}`}>
            {PHASE_LABELS[phase]}
          </span>

          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border bg-violet-500/10 text-violet-400 border-violet-500/20">
            DEMO
          </span>
        </div>
      </div>
    </header>
  );
}
