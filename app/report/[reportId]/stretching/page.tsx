"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { mockMeasurementSessions } from "@/lib/mock-data";
import { WEAR_LOCATION_LABELS } from "@/lib/types";
import { CheckCircle, Circle, ChevronLeft, Clock, RefreshCw } from "lucide-react";

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
  const total = stretchingPlan.exercises.length;
  const doneCount = completed.size;
  const allDone = total > 0 && doneCount === total;
  const progressPct = total > 0 ? (doneCount / total) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* ── Sticky header ────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-100 px-3 py-2.5 flex items-center gap-2 sticky top-0 z-10">
        <Link
          href={`/report/${reportId}`}
          className="p-2.5 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-all -ml-1"
          aria-label="뒤로"
        >
          <ChevronLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-slate-400 leading-none mb-0.5">AcuTrack · 홈 스트레칭</p>
          <h1 className="text-sm font-bold text-slate-700 truncate">{stretchingPlan.title}</h1>
        </div>
        <span className="shrink-0 text-xs font-semibold text-slate-400 tabular-nums">
          {doneCount}/{total}
        </span>
      </header>

      {/* ── Main scroll area (pb for sticky bottom bar) ───────────────────── */}
      <main className="max-w-lg mx-auto px-4 pt-5 pb-28 space-y-4">

        {/* Plan summary card */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-600 text-xs font-semibold">
              {WEAR_LOCATION_LABELS[stretchingPlan.targetArea]}
            </span>
            <span className="text-xs text-slate-400">{total}가지 운동</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{stretchingPlan.description}</p>
        </section>

        {/* Exercise cards */}
        {stretchingPlan.exercises.map((exercise, idx) => {
          const done = completed.has(exercise.id);
          return (
            <article
              key={exercise.id}
              className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 ${
                done ? "border-emerald-200 bg-emerald-50/30" : "border-slate-100"
              }`}
            >
              {/* Card header */}
              <div className="px-4 pt-4 pb-3 flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-cyan-100 text-cyan-600 text-xs font-bold flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-700 leading-snug">{exercise.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{exercise.purpose}</p>
                </div>
                {done && (
                  <CheckCircle className="shrink-0 w-5 h-5 text-emerald-500 mt-0.5" />
                )}
              </div>

              {/* GIF illustration — full width, responsive */}
              {exercise.poseAngle != null && (
                <div className="mx-4 rounded-xl overflow-hidden bg-[#07111f] flex justify-center mb-3">
                  <Image
                    src={`/gifs/${exercise.id}.gif`}
                    alt={`${exercise.title} 동작 예시`}
                    width={240}
                    height={240}
                    unoptimized
                    className="w-48 h-48"
                  />
                </div>
              )}

              {/* Info badges */}
              <div className="px-4 flex gap-2 mb-3 flex-wrap">
                {exercise.holdSeconds > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                    <Clock className="w-3 h-3" />
                    {exercise.holdSeconds}초 유지
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                  <RefreshCw className="w-3 h-3" />
                  {exercise.repetitions}회 반복
                </span>
              </div>

              {/* Instruction steps */}
              <div className="px-4 space-y-2.5 mb-3">
                {exercise.instructionSteps.map((step, stepIdx) => (
                  <div key={stepIdx} className="flex gap-3">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-500 text-[11px] font-bold flex items-center justify-center mt-0.5">
                      {stepIdx + 1}
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>

              {/* Cautions */}
              {exercise.cautions.length > 0 && (
                <div className="mx-4 mb-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <p className="text-[11px] font-semibold text-amber-600 mb-1.5">⚠ 주의사항</p>
                  <ul className="space-y-1">
                    {exercise.cautions.map((c, i) => (
                      <li key={i} className="text-xs text-amber-700 leading-snug">· {c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Full-width done toggle button */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => toggleCompleted(exercise.id)}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                    done
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : "bg-cyan-500 text-white hover:bg-cyan-400 shadow-sm shadow-cyan-200"
                  }`}
                  aria-label={done ? "완료 취소" : "완료 표시"}
                >
                  {done ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      완료했어요
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4" />
                      완료 표시하기
                    </>
                  )}
                </button>
              </div>
            </article>
          );
        })}

        {/* General cautions */}
        {stretchingPlan.generalCautions.length > 0 && (
          <section className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <p className="text-xs font-semibold text-amber-600 mb-2">전체 주의사항</p>
            <ul className="space-y-1.5">
              {stretchingPlan.generalCautions.map((c, i) => (
                <li key={i} className="text-xs text-amber-700 leading-snug">· {c}</li>
              ))}
            </ul>
          </section>
        )}

        {/* All done banner */}
        {allDone && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-base font-bold text-emerald-700 mb-1">모든 운동 완료!</p>
            <p className="text-xs text-emerald-600 leading-relaxed">
              수고하셨습니다. 꾸준히 운동하시면 더 빨리 회복할 수 있습니다.
            </p>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-[11px] text-slate-400 text-center leading-relaxed px-2 pb-2">
          본 리포트는 치료 전후 움직임 변화 확인용 참고 자료이며, 진단 확정 또는 치료 효과 보장을 의미하지 않습니다.
          모든 의료적 판단은 담당 임상 전문가의 지도 하에 이루어져야 합니다.
        </p>
      </main>

      {/* ── Sticky bottom progress bar ────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-sm border-t border-slate-100 px-4 py-3 safe-area-pb">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-bold text-slate-500 tabular-nums w-14 text-right">
            {doneCount}/{total} 완료
          </span>
        </div>
        {allDone && (
          <p className="text-center text-[11px] text-emerald-600 font-semibold mt-1.5">
            오늘 스트레칭 완료 🎉
          </p>
        )}
      </div>
    </div>
  );
}
