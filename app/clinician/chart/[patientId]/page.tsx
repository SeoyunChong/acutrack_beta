"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { mockMeasurementSessions, mockPatientsNew, mockChartEntries } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { WEAR_LOCATION_LABELS, MOTION_TYPE_LABELS } from "@/lib/types";
import ClinicianNav from "@/components/layout/ClinicianNav";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { ChevronLeft, FileText, BookOpen, MessageSquare } from "lucide-react";

type Params = Promise<{ patientId: string }>;

const entryTypeIcons: Record<string, React.ReactNode> = {
  rom_measurement: <FileText className="w-3.5 h-3.5" />,
  education: <BookOpen className="w-3.5 h-3.5" />,
  consultation_note: <MessageSquare className="w-3.5 h-3.5" />,
};
const entryTypeLabels: Record<string, string> = {
  rom_measurement: "ROM 측정",
  education: "교육",
  consultation_note: "상담 노트",
};

export default function ChartDetailPage({ params }: { params: Params }) {
  const { patientId } = use(params);
  const router = useRouter();
  const storeChartEntries = useStore((s) => s.chartEntries);

  const patient = mockPatientsNew.find((p) => p.id === patientId);
  const patientSessions = mockMeasurementSessions.filter((s) => s.patientId === patientId);

  // Merge store entries with mock entries
  const allEntries = [
    ...storeChartEntries.filter((e) => e.patientId === patientId),
    ...mockChartEntries.filter(
      (e) => e.patientId === patientId &&
        !storeChartEntries.some((se) => se.id === e.id)
    ),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const romTrendData = patientSessions.map((s) => ({
    date: new Date(s.measuredAt).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" }),
    pre: s.preRom,
    post: s.postRom,
  }));

  if (!patient) {
    return (
      <div className="min-h-screen bg-[#07111f] text-white flex items-center justify-center">
        <p>환자를 찾을 수 없습니다: {patientId}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <ClinicianNav />

      <div className="p-6 space-y-6">
        <div>
          <button
            onClick={() => router.push("/clinician/chart")}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 mb-4 transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> 차트 목록으로
          </button>

          {/* Patient header */}
          <div className="rounded-2xl border border-white/8 bg-[#0f172a] p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-sm font-bold text-cyan-400">
                {patientId}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-lg font-bold text-white">{patient.name}</h1>
                  <span className="text-sm text-slate-400">{patient.age}세 · {patient.sex}</span>
                </div>
                <p className="text-xs text-slate-400 mb-1">{patient.mainComplaint}</p>
                {patient.assumedDiagnosis && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400">
                    {patient.assumedDiagnosis}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ROM trend chart */}
        {romTrendData.length > 0 && (
          <div className="rounded-2xl border border-white/8 bg-[#0f172a] p-5">
            <h2 className="text-sm font-semibold text-slate-300 mb-4">ROM 변화 추이</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={romTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} unit="°" />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 11 }}
                  formatter={(val, name) => [`${val}°`, name === "pre" ? "치료 전" : "치료 후"]}
                />
                <Legend
                  formatter={(val) => val === "pre" ? "치료 전 ROM" : "치료 후 ROM"}
                  wrapperStyle={{ fontSize: 11 }}
                />
                <Line type="monotone" dataKey="pre" stroke="#64748b" strokeWidth={2} dot={{ r: 4, fill: "#64748b" }} />
                <Line type="monotone" dataKey="post" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4, fill: "#06b6d4" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Chart entries */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-3">차트 기록</h2>
          {allEntries.length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-[#0f172a] p-8 text-center">
              <p className="text-slate-500 text-sm">차트에 반영된 기록이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allEntries.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-white/8 bg-[#0f172a] p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium ${
                        entry.type === "rom_measurement"
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                          : entry.type === "education"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-violet-500/10 text-violet-400 border-violet-500/20"
                      }`}>
                        {entryTypeIcons[entry.type]}
                        {entryTypeLabels[entry.type]}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {new Date(entry.createdAt).toLocaleString("ko-KR", {
                        month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-slate-200 mb-1">{entry.title}</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{entry.content}</p>

                  {/* Included fields badges */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entry.includedFields.romResult && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500">ROM 결과</span>
                    )}
                    {entry.includedFields.painChange && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500">통증 변화</span>
                    )}
                    {entry.includedFields.clinicalSummary && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500">임상 소견</span>
                    )}
                    {entry.includedFields.stretchingEducation && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500">스트레칭 교육</span>
                    )}
                    {entry.includedFields.followUpPlan && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500">추적 관찰</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
