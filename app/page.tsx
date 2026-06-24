"use client";

import Link from "next/link";
import { Activity, Scan, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stepVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35 } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      {/* Nav */}
      <nav className="border-b border-white/5 bg-[#07111f]/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="text-sm font-bold text-white tracking-wide">AcuTrack</span>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border bg-violet-500/10 text-violet-400 border-violet-500/20">
            DEMO
          </span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6">
        {/* Section A — Hero */}
        <section className="py-20 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium border bg-cyan-500/10 text-cyan-400 border-cyan-500/20 mb-6"
            >
              IMU-based ROM Analytics · DEMO
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-5xl font-bold text-white mb-4 tracking-tight">
              AcuTrack
            </motion.h1>
            <motion.p variants={fadeUp} className="text-base text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
              IMU 센서 기반 관절가동범위(ROM) 측정 및 치료 효과 분석 시스템
            </motion.p>
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/clinician/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#07111f] font-semibold text-sm transition-colors"
              >
                의료진용 대시보드 →
              </Link>
              <Link
                href="/report/report-session-P-01-1"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 hover:border-white/40 text-slate-300 hover:text-white font-medium text-sm transition-colors"
              >
                환자 리포트 보기 →
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Section B — 핵심 기능 */}
        <section className="py-12">
          <h2 className="text-lg font-semibold text-slate-200 text-center mb-8">핵심 기능</h2>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {[
              {
                Icon: Activity,
                title: "실시간 ROM 측정",
                desc: "IMU 센서로 관절가동범위를 실시간 측정. 치료 전후 비교 데이터를 자동 생성합니다.",
                color: "text-cyan-400",
                bg: "bg-cyan-500/10 border-cyan-500/20",
              },
              {
                Icon: Scan,
                title: "3D 관절 시각화",
                desc: "Low-poly 해부학 모델로 각 관절의 움직임과 센서 부착 위치를 직관적으로 표현합니다.",
                color: "text-violet-400",
                bg: "bg-violet-500/10 border-violet-500/20",
              },
              {
                Icon: Smartphone,
                title: "환자용 QR 리포트",
                desc: "측정 완료 후 QR 코드를 스캔하면 환자가 모바일로 치료 결과와 홈 스트레칭을 확인합니다.",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10 border-emerald-500/20",
              },
            ].map(({ Icon, title, desc, color, bg }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="rounded-2xl border border-white/8 bg-[#0f172a] p-6"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${bg}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Section C — 측정 플로우 */}
        <section className="py-12">
          <h2 className="text-lg font-semibold text-slate-200 text-center mb-8">측정 워크플로우</h2>
          <div className="max-w-4xl mx-auto overflow-x-auto pb-2">
            <motion.div
              className="flex items-start justify-center gap-0 min-w-[640px]"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
            >
              {[
                "환자 등록 · 센서 착용",
                "치료 전 ROM 측정",
                "한방 치료 시행",
                "치료 후 ROM 측정",
                "리포트 생성 · QR 전달",
              ].map((step, i, steps) => (
                <motion.div key={step} variants={stepVariants} className="flex items-start">
                  <div className="flex flex-col items-center min-w-[120px] max-w-[140px]">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-sm mb-3">
                      {i + 1}
                    </div>
                    <span className="text-xs text-slate-400 text-center leading-relaxed whitespace-nowrap">{step}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="flex-shrink-0 mt-4 mx-1 text-slate-600 text-sm">→</div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Section D — 데모 안내 */}
        <section className="py-12">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
            <p className="text-xs text-amber-300/80 leading-relaxed">
              본 데모는 IMU 센서 시뮬레이션을 사용합니다. 실제 환경에서는 웨어러블 센서가 연동됩니다. 모든 환자 데이터는 가상의 시연용 데이터입니다.
            </p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-slate-600">
        AcuTrack · IMU 기반 관절가동범위 분석 시스템 · DEMO
      </footer>
    </div>
  );
}
