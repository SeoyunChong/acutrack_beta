export type DeviceStatus = "connected" | "waiting" | "weak" | "disconnected";
export type WearLocation = "wrist" | "elbow" | "shoulder" | "neck" | "lowerBack" | "knee" | "ankle";
export type MotionType = "wrist_flexion_extension" | "elbow_flexion" | "shoulder_abduction" | "cervical_rotation" | "lumbar_flexion" | "knee_flexion" | "ankle_dorsi_plantar";
export type Laterality = "좌측" | "우측" | "양측";
export type AttachmentMethod = "피부 부착" | "의복 위 부착" | "스트랩 착용";
export type MeasurementPhase = "idle" | "ready" | "calibrating" | "measuring_pre" | "pre_complete" | "treatment_waiting" | "measuring_post" | "post_complete" | "analysis_complete";

// Patient-facing location labels
export const WEAR_LOCATION_LABELS: Record<WearLocation, string> = {
  wrist: "손목", elbow: "팔꿈치", shoulder: "어깨", neck: "목",
  lowerBack: "허리", knee: "무릎", ankle: "발목",
};

// Clinician-facing anatomical labels (대한해부학회 기준)
export const WEAR_LOCATION_LABELS_CLINICAL: Record<WearLocation, string> = {
  wrist: "수근관절",
  elbow: "주관절",
  shoulder: "견관절",
  neck: "경추",
  lowerBack: "요추",
  knee: "슬관절",
  ankle: "족관절",
};

// Clinician-facing anatomical motion labels
export const MOTION_TYPE_LABELS: Record<MotionType, string> = {
  wrist_flexion_extension: "수근관절 굴곡/신전",
  elbow_flexion: "주관절 굴곡",
  shoulder_abduction: "견관절 외전",
  cervical_rotation: "경추 회전",
  lumbar_flexion: "요추 굴곡",
  knee_flexion: "슬관절 굴곡",
  ankle_dorsi_plantar: "족관절 배측굴곡/저측굴곡",
};

// Patient-facing motion labels
export const MOTION_TYPE_LABELS_PATIENT: Record<MotionType, string> = {
  wrist_flexion_extension: "손목 굽힘/펴기",
  elbow_flexion: "팔꿈치 굽힘",
  shoulder_abduction: "어깨 들기",
  cervical_rotation: "목 돌리기",
  lumbar_flexion: "허리 앞굽히기",
  knee_flexion: "무릎 굽힘",
  ankle_dorsi_plantar: "발목 올리기/내리기",
};
export const SYMPTOM_OPTIONS = ["통증","가동 범위 제한","뻣뻣함","저림","근력 저하","움직임 불안정","치료 후 호전감","야간통","운동 시 악화"] as const;

export type Patient = {
  id: string; name: string; age: number; sex: "남" | "여";
  heightCm: number; weightKg: number; mainComplaint: string; assumedDiagnosis?: string;
};

// Keep PatientSession for backwards compat with existing components
export type PatientSession = {
  id: string; patientName: string; age: number; sex: "남" | "여";
  heightCm: number; weightKg: number; symptoms: string[]; assumedDiagnosis: string;
  deviceWorn: boolean; deviceStatus: DeviceStatus; batteryPercent: number;
  wearLocation: WearLocation; laterality: Laterality; attachmentMethod: AttachmentMethod;
  motionType: MotionType; preRom: number; postRom: number; prePainNrs: number;
  postPainNrs: number; smoothnessScore: number; stabilityScore: number; confidenceScore: number;
  measuredAt: string;
};

export type RomPoint = { time: number; angle: number; };

// RomCurvePoint kept for compatibility
export type RomCurvePoint = {
  time: number;
  pre: number;
  post: number;
};

export type MeasurementSession = {
  id: string; patientId: string; measuredAt: string; clinicianName: string; diagnosisCode?: string;
  wearLocation: WearLocation; motionType: MotionType; laterality: Laterality;
  attachmentMethod: AttachmentMethod; deviceConnected: true; sensorLabel: string;
  preRom: number; postRom: number; prePainNrs: number; postPainNrs: number;
  preCurve: RomPoint[]; postCurve: RomPoint[];
  smoothnessScore: number; stabilityScore: number; confidenceScore: number;
  symptoms: string[]; clinicalSummary: string; patientSummary: string;
  stretchingPlan: StretchingPlan; reportId: string;
  chartStatus: "not_reviewed" | "reviewing" | "approved" | "rejected";
};

export type StretchingExercise = {
  id: string; title: string; targetArea: WearLocation; purpose: string;
  instructionSteps: string[]; holdSeconds: number; repetitions: number; cautions: string[];
};
export type StretchingPlan = {
  id: string; sessionId: string; targetArea: WearLocation; title: string;
  description: string; exercises: StretchingExercise[]; generalCautions: string[];
};
export type ChartEntry = {
  id: string; patientId: string; sessionId: string; createdAt: string;
  type: "rom_measurement" | "education" | "consultation_note";
  title: string; content: string;
  includedFields: { romResult: boolean; painChange: boolean; clinicalSummary: boolean; stretchingEducation: boolean; followUpPlan: boolean; };
};
export type ChartReviewOptions = {
  romResult: boolean; painChange: boolean; clinicalSummary: boolean;
  stretchingEducation: boolean; followUpPlan: boolean;
  clinicianMemo: string; followUpNote: string;
};
