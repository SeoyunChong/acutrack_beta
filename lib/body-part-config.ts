export type BodyPartType =
  | "upperArm" | "forearm" | "hand"
  | "torso" | "neck" | "head"
  | "pelvis" | "thigh" | "shin" | "foot";

export type BodyPartConfig = {
  type: BodyPartType;
  topRadius: number;
  bottomRadius: number;
  length: number;
  width?: number;
  depth?: number;
  segments?: number;
};

export const BODY_PART_CONFIGS: Record<BodyPartType, BodyPartConfig> = {
  upperArm:  { type: "upperArm",  topRadius: 0.115, bottomRadius: 0.095, length: 1.15, segments: 8 },
  forearm:   { type: "forearm",   topRadius: 0.095, bottomRadius: 0.072, length: 1.05, segments: 8 },
  hand:      { type: "hand",      topRadius: 0.065, bottomRadius: 0.045, length: 0.52, width: 0.18, depth: 0.06, segments: 6 },
  torso:     { type: "torso",     topRadius: 0.26,  bottomRadius: 0.22,  length: 0.60, width: 0.38, depth: 0.20, segments: 8 },
  neck:      { type: "neck",      topRadius: 0.075, bottomRadius: 0.088, length: 0.32, segments: 8 },
  head:      { type: "head",      topRadius: 0.20,  bottomRadius: 0.20,  length: 0.26, segments: 10 },
  pelvis:    { type: "pelvis",    topRadius: 0.22,  bottomRadius: 0.20,  length: 0.28, width: 0.42, depth: 0.22, segments: 8 },
  thigh:     { type: "thigh",     topRadius: 0.130, bottomRadius: 0.100, length: 1.25, segments: 8 },
  shin:      { type: "shin",      topRadius: 0.095, bottomRadius: 0.070, length: 1.15, segments: 8 },
  foot:      { type: "foot",      topRadius: 0.070, bottomRadius: 0.055, length: 0.62, width: 0.24, depth: 0.10, segments: 6 },
};
