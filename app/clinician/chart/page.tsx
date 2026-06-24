"use client";

import Link from "next/link";
import { mockMeasurementSessions, mockPatientsNew } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import ClinicianNav from "@/components/layout/ClinicianNav";
import { WEAR_LOCATION_LABELS } from "@/lib/types";
import { ChevronRight } from "lucide-react";

const statusColors: Record<string, string> = {
  approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  not_reviewed: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  reviewing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};
const statusLabels: Record<string, string> = {
  approved: "차트 반영됨",
  not_reviewed: "미검토",
  reviewing: "검토 중",
  rejected: "반영 거부",
};

export default function ChartListPage() {
  const storeSessions = useStore((s) => s.sessions);

  // Merge mock sessions with store for live status updates
  const sessionsMap = new Map(storeSessions.map((s) => [s.id, s]));
  const sessions = mockMeasurementSessions.map((s) => sessionsMap.get(s.id) ?? s);

  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <ClinicianNav />

      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">환자 차트</h1>
          <p className="text-sm text-slate-400">측정 세션 및 차트 반영 현황</p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#0f172a] overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-slate-500 font-medium">환자</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">측정 부위</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">측정일</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">ROM 개선</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">차트 상태</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => {
                const patient = mockPatientsNew.find((p) => p.id === session.patientId);
                const improvement = session.postRom - session.preRom;
                const improvePct = ((improvement / session.preRom) * 100).toFixed(1);

                return (
                  <tr
                    key={session.id}
                    className="border-b border-white/4 hover:bg-white/3 transition-all"
                  >
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-300">{session.patientId}</span>
                      <span className="ml-1.5 text-slate-400">{patient?.name}</span>
                      <span className="ml-1.5 text-slate-600">{patient?.age}세 {patient?.sex}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {session.laterality} {WEAR_LOCATION_LABELS[session.wearLocation]}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(session.measuredAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-cyan-400 font-semibold font-mono">
                        +{improvement}° (+{improvePct}%)
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-medium ${statusColors[session.chartStatus]}`}>
                        {statusLabels[session.chartStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/clinician/chart/${session.patientId}`}
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-all"
                      >
                        보기 <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
