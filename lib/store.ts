import { create } from "zustand";
import type {
  MeasurementSession,
  ChartEntry,
  ChartReviewOptions,
  RomPoint,
} from "./types";
import type { MeasurementPhase } from "./measurement";
import { mockMeasurementSessions, mockChartEntries } from "./mock-data";

interface AppState {
  sessions: MeasurementSession[];
  chartEntries: ChartEntry[];

  // Active measurement
  selectedPatientId: string;
  measurementPhase: MeasurementPhase;
  currentAngle: number;
  livePreCurve: RomPoint[];
  livePostCurve: RomPoint[];
  measuredPreRom: number | undefined;
  measuredPostRom: number | undefined;
  activeSessionId: string | undefined;

  // Actions
  selectPatient: (id: string) => void;
  setMeasurementPhase: (phase: MeasurementPhase) => void;
  setCurrentAngle: (angle: number) => void;
  appendPrePoint: (pt: RomPoint) => void;
  appendPostPoint: (pt: RomPoint) => void;
  setMeasuredPreRom: (val: number) => void;
  setMeasuredPostRom: (val: number) => void;
  setLivePreCurve: (pts: RomPoint[]) => void;
  setLivePostCurve: (pts: RomPoint[]) => void;
  resetMeasurement: () => void;
  addSession: (session: MeasurementSession) => void;
  updateSessionChartStatus: (
    sessionId: string,
    status: MeasurementSession["chartStatus"]
  ) => void;
  approveToChart: (sessionId: string, options: ChartReviewOptions) => void;
}

export const useStore = create<AppState>((set, get) => ({
  sessions: mockMeasurementSessions,
  chartEntries: mockChartEntries,
  selectedPatientId: "P-01",
  measurementPhase: "ready",
  currentAngle: 0,
  livePreCurve: [],
  livePostCurve: [],
  measuredPreRom: undefined,
  measuredPostRom: undefined,
  activeSessionId: undefined,

  selectPatient: (id) =>
    set({
      selectedPatientId: id,
      measurementPhase: "ready",
      currentAngle: 0,
      livePreCurve: [],
      livePostCurve: [],
      measuredPreRom: undefined,
      measuredPostRom: undefined,
      activeSessionId: undefined,
    }),

  setMeasurementPhase: (phase) => set({ measurementPhase: phase }),
  setCurrentAngle: (angle) => set({ currentAngle: angle }),
  appendPrePoint: (pt) =>
    set((s) => ({ livePreCurve: [...s.livePreCurve, pt] })),
  appendPostPoint: (pt) =>
    set((s) => ({ livePostCurve: [...s.livePostCurve, pt] })),
  setMeasuredPreRom: (val) => set({ measuredPreRom: val }),
  setMeasuredPostRom: (val) => set({ measuredPostRom: val }),
  setLivePreCurve: (pts) => set({ livePreCurve: pts }),
  setLivePostCurve: (pts) => set({ livePostCurve: pts }),

  resetMeasurement: () =>
    set({
      measurementPhase: "ready",
      currentAngle: 0,
      livePreCurve: [],
      livePostCurve: [],
      measuredPreRom: undefined,
      measuredPostRom: undefined,
      activeSessionId: undefined,
    }),

  addSession: (session) =>
    set((s) => ({ sessions: [session, ...s.sessions] })),

  updateSessionChartStatus: (sessionId, status) =>
    set((s) => ({
      sessions: s.sessions.map((sess) =>
        sess.id === sessionId ? { ...sess, chartStatus: status } : sess
      ),
    })),

  approveToChart: (sessionId, options) => {
    const { sessions } = get();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    const entry: ChartEntry = {
      id: `chart-entry-${Date.now()}`,
      patientId: session.patientId,
      sessionId,
      createdAt: new Date().toISOString(),
      type: "rom_measurement",
      title: `ROM 측정 결과 차트 반영`,
      content: `치료 전 ${session.preRom}° → 치료 후 ${session.postRom}° (+${session.postRom - session.preRom}°). 통증 NRS ${session.prePainNrs}→${session.postPainNrs}. ${options.clinicianMemo ? `임상의 메모: ${options.clinicianMemo}` : ""}`,
      includedFields: {
        romResult: options.romResult,
        painChange: options.painChange,
        clinicalSummary: options.clinicalSummary,
        stretchingEducation: options.stretchingEducation,
        followUpPlan: options.followUpPlan,
      },
    };

    set((s) => ({
      sessions: s.sessions.map((sess) =>
        sess.id === sessionId ? { ...sess, chartStatus: "approved" } : sess
      ),
      chartEntries: [entry, ...s.chartEntries],
    }));
  },
}));
