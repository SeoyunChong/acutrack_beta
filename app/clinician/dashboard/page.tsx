"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { PatientSession } from "@/lib/types";
import { mockPatients } from "@/lib/mock-patients";
import { mockMeasurementSessions } from "@/lib/mock-data";
import type { MeasurementPhase, RomPoint } from "@/lib/measurement";
import {
  generateLiveRomValue,
  MEASUREMENT_DURATION_MS,
  CALIBRATION_DURATION_MS,
} from "@/lib/measurement";

import ClinicianNav from "@/components/layout/ClinicianNav";
import LiveDataPanel from "@/components/dashboard/LiveDataPanel";
import CompactPatientSetup from "@/components/dashboard/CompactPatientSetup";
import MeasurementControls from "@/components/dashboard/MeasurementControls";
import KpiCards from "@/components/dashboard/KpiCards";
import LiveRomChart from "@/components/dashboard/LiveRomChart";
import ClinicalSummary from "@/components/dashboard/ClinicalSummary";
import SessionTable from "@/components/dashboard/SessionTable";

const Joint3DView = dynamic(() => import("@/components/dashboard/Joint3DView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#05080f] rounded-xl">
      <p className="text-slate-600 text-xs">3D View 로딩 중...</p>
    </div>
  ),
});

// Lazy-import QRCode to avoid SSR issues
import("qrcode.react");

const TICK_INTERVAL = 100;

export default function DashboardPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<PatientSession[]>(mockPatients);
  const [selectedId, setSelectedId] = useState<string>(mockPatients[0].id);
  const [phase, setPhase] = useState<MeasurementPhase>("ready");
  const [progress, setProgress] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [preData, setPreData] = useState<RomPoint[]>([]);
  const [postData, setPostData] = useState<RomPoint[]>([]);
  const [measuredPreRom, setMeasuredPreRom] = useState<number | undefined>();
  const [measuredPostRom, setMeasuredPostRom] = useState<number | undefined>();

  // QR state
  const [QRCode, setQRCode] = useState<React.ComponentType<{ value: string; size: number }> | null>(null);

  useEffect(() => {
    import("qrcode.react").then((mod) => {
      // qrcode.react v3+ exports QRCodeSVG as named export
      type QRMod = { QRCodeSVG?: React.ComponentType<{ value: string; size: number }> };
      const Comp = (mod as QRMod).QRCodeSVG;
      if (Comp) setQRCode(() => Comp);
    });
  }, []);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const selectedSession = sessions.find((s) => s.id === selectedId)!;

  // Find associated MeasurementSession for this patient
  const measurementSession = mockMeasurementSessions.find(
    (s) => s.patientId === selectedId
  );

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const runMeasurement = useCallback(
    (targetRom: number, onComplete: (maxRom: number) => void) => {
      setProgress(0);
      setCurrentAngle(0);
      startTimeRef.current = Date.now();
      let maxReached = 0;

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const prog = Math.min(elapsed / MEASUREMENT_DURATION_MS, 1);
        const angle = generateLiveRomValue(prog, targetRom);

        if (angle > maxReached) maxReached = angle;

        const point: RomPoint = { time: Math.round(prog * 100), angle };

        setProgress(prog);
        setCurrentAngle(angle);

        if (prog >= 1) {
          clearTimer();
          onComplete(maxReached);
        }
      }, TICK_INTERVAL);
    },
    []
  );

  const handleStartPre = useCallback(() => {
    setPhase("calibrating");
    setPreData([]);
    setPostData([]);
    setMeasuredPreRom(undefined);
    setMeasuredPostRom(undefined);
    setCurrentAngle(0);
    setProgress(0);

    setTimeout(() => {
      setPhase("measuring_pre");
      runMeasurement(selectedSession.preRom, (maxRom) => {
        setMeasuredPreRom(maxRom);
        setCurrentAngle(0);
        const pts: RomPoint[] = Array.from({ length: 60 }, (_, i) => {
          const p = i / 59;
          return { time: Math.round(p * 100), angle: generateLiveRomValue(p, maxRom) };
        });
        setPreData(pts);
        setPhase("pre_complete");
      });
    }, CALIBRATION_DURATION_MS);
  }, [selectedSession.preRom, runMeasurement]);

  const handleStartPost = useCallback(() => {
    setPhase("measuring_post");
    setCurrentAngle(0);
    setProgress(0);

    runMeasurement(selectedSession.postRom, (maxRom) => {
      setMeasuredPostRom(maxRom);
      setCurrentAngle(0);
      const pts: RomPoint[] = Array.from({ length: 60 }, (_, i) => {
        const p = i / 59;
        return { time: Math.round(p * 100), angle: generateLiveRomValue(p, maxRom) };
      });
      setPostData(pts);
      setPhase("analysis_complete");
    });
  }, [selectedSession.postRom, runMeasurement]);

  const handleStartTreatment = useCallback(() => {
    setPhase("treatment_waiting");
  }, []);

  const handleReset = useCallback(() => {
    clearTimer();
    setPhase("ready");
    setProgress(0);
    setCurrentAngle(0);
    setPreData([]);
    setPostData([]);
    setMeasuredPreRom(undefined);
    setMeasuredPostRom(undefined);
  }, []);

  const handleSelectPatient = useCallback(
    (id: string) => {
      setSelectedId(id);
      handleReset();
    },
    [handleReset]
  );

  const handleSessionChange = useCallback(
    (patch: Partial<PatientSession>) => {
      setSessions((prev) =>
        prev.map((s) => (s.id === selectedId ? { ...s, ...patch } : s))
      );
    },
    [selectedId]
  );

  const isMeasuringPre = phase === "measuring_pre";
  const isMeasuringPost = phase === "measuring_post";

  useEffect(() => {
    if (isMeasuringPre) {
      setPreData((prev) => [
        ...prev,
        { time: Math.round(progress * 100), angle: currentAngle },
      ]);
    } else if (isMeasuringPost) {
      setPostData((prev) => [
        ...prev,
        { time: Math.round(progress * 100), angle: currentAngle },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAngle]);

  useEffect(() => () => clearTimer(), []);

  const reportUrl = measurementSession
    ? `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/report/${measurementSession.reportId}`
    : "";

  const isAnalysisComplete = phase === "analysis_complete";

  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <ClinicianNav />

      <div className="flex gap-4 p-4">
        {/* Left: compact setup */}
        <CompactPatientSetup
          session={selectedSession}
          patients={sessions}
          selectedId={selectedId}
          phase={phase}
          onSelectPatient={handleSelectPatient}
          onChange={handleSessionChange}
        />

        {/* Main content */}
        <main className="flex-1 min-w-0 flex flex-col gap-4">
          <KpiCards
            session={selectedSession}
            phase={phase}
            measuredPreRom={measuredPreRom}
            measuredPostRom={measuredPostRom}
            liveAngle={currentAngle}
          />

          <div className="grid grid-cols-5 gap-4">
            {/* 3D View */}
            <div className="col-span-2 rounded-2xl border bg-[#0f172a] border-white/8 p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-white">3D Joint View</h3>
                {measuredPreRom && (
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-0.5 bg-slate-500 inline-block" />
                      <span className="text-slate-500">Pre {measuredPreRom}°</span>
                    </span>
                    {measuredPostRom && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-0.5 bg-cyan-400 inline-block" />
                        <span className="text-cyan-500">Post {measuredPostRom}°</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="h-52">
                <Joint3DView
                  currentAngle={currentAngle}
                  preMaxAngle={measuredPreRom}
                  postMaxAngle={measuredPostRom}
                  phase={phase}
                  wearLocation={selectedSession.wearLocation}
                />
              </div>
              <LiveDataPanel
                phase={phase}
                currentAngle={currentAngle}
                progress={progress}
              />
            </div>

            {/* Live ROM Chart + Controls */}
            <div className="col-span-3 flex flex-col gap-4">
              <LiveRomChart
                preData={preData}
                postData={postData}
                phase={phase}
                preMax={measuredPreRom}
                postMax={measuredPostRom}
              />
              <MeasurementControls
                phase={phase}
                progress={progress}
                currentAngle={currentAngle}
                maxAnglePre={measuredPreRom}
                maxAnglePost={measuredPostRom}
                onStartPre={handleStartPre}
                onStartPost={handleStartPost}
                onReset={handleReset}
                onStop={handleReset}
                onStartTreatment={handleStartTreatment}
              />
            </div>
          </div>

          {/* Analysis complete: QR card + action buttons */}
          {isAnalysisComplete && measurementSession && (
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5 flex flex-col md:flex-row items-center gap-6">
              {QRCode && (
                <div className="shrink-0 p-3 bg-white rounded-xl">
                  <QRCode value={reportUrl} size={120} />
                </div>
              )}
              <div className="flex flex-col gap-3 flex-1">
                <div>
                  <h3 className="text-sm font-bold text-white mb-0.5">측정 완료 – 환자 리포트 준비됨</h3>
                  <p className="text-xs text-slate-400">QR 코드를 스캔하거나 버튼을 눌러 환자용 리포트를 확인하세요.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-semibold transition-all"
                  >
                    환자용 리포트 보기 →
                  </a>
                  <button
                    onClick={() => router.push(`/clinician/review/${measurementSession.id}`)}
                    className="px-4 py-2 rounded-lg bg-violet-500 hover:bg-violet-400 text-white text-xs font-semibold transition-all"
                  >
                    검토 후 Chart에 반영
                  </button>
                </div>
              </div>
            </div>
          )}

          <ClinicalSummary
            session={selectedSession}
            phase={phase}
            measuredPreRom={measuredPreRom}
            measuredPostRom={measuredPostRom}
          />

          <SessionTable
            sessions={sessions}
            selectedId={selectedId}
            onSelect={handleSelectPatient}
          />
        </main>
      </div>
    </div>
  );
}
