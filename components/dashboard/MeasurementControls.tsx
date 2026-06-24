"use client";

import { Play, RefreshCw, ChevronRight, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { MeasurementPhase } from "@/lib/measurement";
import { PHASE_LABELS, PHASE_COLORS } from "@/lib/measurement";

type Props = {
  phase: MeasurementPhase;
  progress: number;
  currentAngle: number;
  maxAnglePre?: number;
  maxAnglePost?: number;
  onStartPre: () => void;
  onStartPost: () => void;
  onReset: () => void;
  onStop?: () => void;
  onStartTreatment?: () => void;
};

export default function MeasurementControls({
  phase,
  progress,
  currentAngle,
  maxAnglePre,
  maxAnglePost,
  onStartPre,
  onStartPost,
  onReset,
  onStop,
  onStartTreatment,
}: Props) {
  const isMeasuring = phase === "measuring_pre" || phase === "measuring_post" || phase === "calibrating";
  const isComplete = phase === "post_complete" || phase === "analysis_complete";

  return (
    <div className="rounded-2xl border bg-[#0f172a] border-white/8 p-4 space-y-4">
      {/* Phase badge + current angle */}
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${PHASE_COLORS[phase]}`}>
          {isMeasuring && <Loader2 className="w-3 h-3 animate-spin" />}
          {isComplete && <CheckCircle className="w-3 h-3" />}
          {PHASE_LABELS[phase]}
        </span>
        {isMeasuring && (
          <span className="text-2xl font-bold font-mono text-cyan-400">
            {currentAngle}°
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.25 }}
        >
          {/* Progress bar */}
          {isMeasuring && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>
                  {phase === "calibrating"
                    ? "센서 보정 중..."
                    : "환자에게 동작을 수행하도록 안내하세요."}
                </span>
                <span>{Math.round(progress * 100)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-cyan-500 transition-all duration-150"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>최대 도달: <span className="text-cyan-400 font-medium">{Math.max(currentAngle, maxAnglePre ?? 0)}°</span></span>
              </div>
            </div>
          )}

          {/* Completed results */}
          {(phase === "pre_complete" || phase === "treatment_waiting" || isComplete) && maxAnglePre !== undefined && (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/4 rounded-xl p-3 text-center">
                <div className="text-[10px] text-slate-500 mb-1">치료 전 ROM</div>
                <div className="text-xl font-bold text-slate-300">{maxAnglePre}°</div>
              </div>
              {maxAnglePost !== undefined ? (
                <div className="bg-cyan-500/10 rounded-xl p-3 text-center border border-cyan-500/20">
                  <div className="text-[10px] text-slate-500 mb-1">치료 후 ROM</div>
                  <div className="text-xl font-bold text-cyan-400">{maxAnglePost}°</div>
                </div>
              ) : (
                <div className="bg-white/3 rounded-xl p-3 text-center border border-white/5 opacity-40">
                  <div className="text-[10px] text-slate-500 mb-1">치료 후 ROM</div>
                  <div className="text-xl font-bold text-slate-600">—°</div>
                </div>
              )}
            </div>
          )}

          {/* treatment_waiting state */}
          {phase === "treatment_waiting" && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs text-amber-400 font-medium">치료 진행 중</span>
              </div>
              <p className="text-[11px] text-slate-500">치료 완료 후 치료 후 측정을 시작하세요.</p>
              {onStartPost && (
                <motion.button
                  onClick={onStartPost}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-semibold transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                >
                  치료 후 측정 시작
                </motion.button>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 mt-4">
            {phase === "ready" && (
              <motion.button
                onClick={onStartPre}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-sm transition-all shadow-[0_0_16px_rgba(0,163,168,0.3)]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
              >
                <Play className="w-4 h-4" />
                치료 전 측정 시작
              </motion.button>
            )}

            {phase === "pre_complete" && (
              <div className="flex flex-col gap-2 flex-1">
                {onStartTreatment && (
                  <motion.button
                    onClick={onStartTreatment}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold text-sm transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                  >
                    치료 진행 중으로 전환
                  </motion.button>
                )}
                <motion.button
                  onClick={onStartPost}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-semibold text-sm transition-all shadow-[0_0_16px_rgba(139,92,246,0.3)]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                >
                  <ChevronRight className="w-4 h-4" />
                  치료 후 측정 시작
                </motion.button>
              </div>
            )}

            {isMeasuring && (
              <div className="flex-1 flex gap-2">
                <button
                  disabled
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 text-slate-600 font-semibold text-sm cursor-not-allowed border border-white/5"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  측정 중...
                </button>
                {(phase === "measuring_pre" || phase === "measuring_post") && onStop && (
                  <motion.button
                    onClick={() => {
                      if (confirm("측정을 중단하시겠습니까? 현재 측정 데이터는 저장되지 않습니다.")) {
                        onStop();
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 text-xs hover:bg-red-500/10 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                  >
                    측정 중단
                  </motion.button>
                )}
              </div>
            )}

            {isComplete && (
              <motion.button
                onClick={onReset}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/8 hover:bg-white/12 text-slate-300 font-semibold text-sm transition-all border border-white/8"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
              >
                <RefreshCw className="w-4 h-4" />
                다시 측정
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
