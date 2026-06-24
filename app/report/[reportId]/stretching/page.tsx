"use client";

import { use, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { mockMeasurementSessions } from "@/lib/mock-data";
import { WEAR_LOCATION_LABELS } from "@/lib/types";
import type { WearLocation } from "@/lib/types";
import { CheckCircle, Circle, ChevronLeft } from "lucide-react";

const StaticJoint3D = dynamic(() => import("@/components/report/StaticJoint3D"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100/5 rounded-lg animate-pulse" />,
});

type Params = Promise<{ reportId: string }>;

export default function StretchingPage({ params }: { params: Params }) {
  const { reportId } = use(params);
  const session = mockMeasurementSessions.find((s) => s.reportId === reportId);

  const [completed, setCompleted] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem(`stretching-completed-${reportId}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggleCompleted = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(`stretching-completed-${reportId}`, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">리포트를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const { stretchingPlan } = session;


  const allDone = stretchingPlan.exercises.length > 0 &&
    stretchingPlan.exercises.every((ex) => completed.has(ex.id));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Link href={`/report/${reportId}`} className="p-1.5 rounded-lg hover:bg-slate-100 transition-all">
          <ChevronLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <p className="text-xs text-slate-400">AcuTrack · 홈 스트레칭</p>
          <h1 className="text-sm font-bold text-slate-700">{stretchingPlan.title}</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Plan header */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-600 text-[10px] font-semibold">
              {WEAR_LOCATION_LABELS[stretchingPlan.targetArea]}
            </span>
            <span className="text-xs text-slate-400">{stretchingPlan.exercises.length}가지 운동</span>
          </div>
          <p className="text-sm text-slate-600">{stretchingPlan.description}</p>
        </section>

        {/* Exercises */}
        {stretchingPlan.exercises.map((exercise, idx) => {
          const done = completed.has(exercise.id);
          return (
            <div
              key={exercise.id}
              className={`bg-white rounded-2xl shadow-sm border transition-all ${done ? "border-emerald-200" : "border-slate-100"}`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-slate-700">{exercise.title}</h3>
                    </div>
                    <p className="text-[11px] text-slate-500">{exercise.purpose}</p>
                  </div>
                  <button
                    onClick={() => toggleCompleted(exercise.id)}
                    className="shrink-0 mt-0.5"
                    aria-label={done ? "완료 취소" : "완료 표시"}
                  >
                    {done
                      ? <CheckCircle className="w-7 h-7 text-emerald-500" />
                      : <Circle className="w-7 h-7 text-slate-300" />
                    }
                  </button>
                </div>

                {/* Illustration */}
                {exercise.poseAngle != null && (
                  <div className="w-full h-24 rounded-lg overflow-hidden bg-slate-800/30">
                    <StaticJoint3D
                      wearLocation={stretchingPlan.targetArea as WearLocation}
                      poseAngle={exercise.poseAngle}
                    />
                  </div>
                )}

                {/* Info row */}
                <div className="flex gap-3 mb-4">
                  {exercise.holdSeconds > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
                      {exercise.holdSeconds}초 유지
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
                    {exercise.repetitions}회 반복
                  </span>
                </div>

                {/* Steps */}
                <div className="space-y-2">
                  {exercise.instructionSteps.map((step, stepIdx) => (
                    <div key={stepIdx} className="flex gap-2.5">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-500 text-[10px] font-bold flex items-center justify-center mt-0.5">
                        {stepIdx + 1}
                      </span>
                      <p className="text-[12px] text-slate-600 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>

                {/* Cautions */}
                {exercise.cautions.length > 0 && (
                  <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-amber-600 mb-1">주의사항</p>
                    <ul className="space-y-0.5">
                      {exercise.cautions.map((c, i) => (
                        <li key={i} className="text-[11px] text-amber-700">· {c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* General cautions */}
        {stretchingPlan.generalCautions.length > 0 && (
          <section className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <p className="text-xs font-semibold text-amber-600 mb-2">전체 주의사항</p>
            <ul className="space-y-1">
              {stretchingPlan.generalCautions.map((c, i) => (
                <li key={i} className="text-[11px] text-amber-700">· {c}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Completion banner */}
        {allDone && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-emerald-700">모든 운동 완료!</p>
            <p className="text-xs text-emerald-600 mt-1">수고하셨습니다. 꾸준히 운동하시면 더 빨리 회복할 수 있습니다.</p>
          </div>
        )}

        {/* Progress */}
        <div className="bg-white rounded-xl border border-slate-100 p-3 flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-500"
              style={{ width: `${(completed.size / stretchingPlan.exercises.length) * 100}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {completed.size}/{stretchingPlan.exercises.length} 완료
          </span>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-slate-400 text-center leading-relaxed px-2">
          본 리포트는 치료 전후 움직임 변화 확인용 참고 자료이며, 진단 확정 또는 치료 효과 보장을 의미하지 않습니다. 모든 의료적 판단은 담당 임상 전문가의 지도 하에 이루어져야 합니다.
        </p>
      </main>
    </div>
  );
}
