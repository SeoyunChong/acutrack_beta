import type { WearLocation } from "./types";
import type { BodyPartType } from "./body-part-config";

export type SegmentConfig = {
  bodyPart: BodyPartType;
  position: [number, number, number];
  rotation?: [number, number, number];
  label: string;
  isUpward?: boolean;
};

export type JointSceneConfig = {
  label: string;
  fixed: SegmentConfig;
  moving: SegmentConfig;
  pivot: {
    radius: number;
    position: [number, number, number];
  };
  sensor: {
    attachTo: "fixed" | "moving";
    localPosition: [number, number, number];
    localRotation?: [number, number, number];
  };
  rotationAxis: "x" | "y" | "z";
  arc: {
    radius: number;
    offset?: [number, number, number];
  };
  camera: {
    position: [number, number, number];
    fov: number;
    target?: [number, number, number];
  };
};

export const JOINT_CONFIGS: Record<WearLocation, JointSceneConfig> = {
  wrist: {
    label: "수근관절",
    fixed: {
      bodyPart: "forearm",
      position: [0, 0.62, 0],
      label: "전완",
    },
    moving: {
      bodyPart: "hand",
      position: [0, -0.22, 0],
      label: "손",
    },
    pivot: { radius: 0.075, position: [0, 0, 0] },
    sensor: { attachTo: "moving", localPosition: [0, -0.10, 0.035] },
    rotationAxis: "x",
    arc: { radius: 0.75 },
    camera: { position: [1.2, 0.5, 2.0], fov: 42 },
  },

  elbow: {
    label: "주관절",
    fixed: {
      bodyPart: "upperArm",
      position: [0, 0.68, 0],
      label: "상완",
    },
    moving: {
      bodyPart: "forearm",
      position: [0, -0.62, 0],
      label: "전완",
    },
    pivot: { radius: 0.095, position: [0, 0, 0] },
    sensor: { attachTo: "moving", localPosition: [0.12, -0.30, 0] },
    rotationAxis: "x",
    arc: { radius: 1.1 },
    camera: { position: [1.5, 0.4, 2.5], fov: 44 },
  },

  shoulder: {
    label: "견관절",
    fixed: {
      bodyPart: "torso",
      position: [-0.28, 0.04, 0],
      label: "몸통",
    },
    moving: {
      bodyPart: "upperArm",
      position: [0, -0.62, 0],
      label: "상완",
    },
    pivot: { radius: 0.10, position: [0, 0, 0] },
    sensor: { attachTo: "moving", localPosition: [0.13, -0.30, 0] },
    rotationAxis: "z",
    arc: { radius: 1.1 },
    camera: { position: [1.8, 0.6, 2.8], fov: 46 },
  },

  neck: {
    label: "경추",
    fixed: {
      bodyPart: "neck",
      position: [0, -0.22, 0],
      label: "목",
    },
    moving: {
      bodyPart: "head",
      position: [0, 0.22, 0],
      label: "머리",
      isUpward: true,
    },
    pivot: { radius: 0.08, position: [0, 0, 0] },
    sensor: { attachTo: "fixed", localPosition: [0.10, -0.05, -0.08] },
    rotationAxis: "y",
    arc: { radius: 0.45 },
    camera: { position: [1.2, 0.6, 2.2], fov: 40 },
  },

  lowerBack: {
    label: "요추",
    fixed: {
      bodyPart: "pelvis",
      position: [0, -0.22, 0],
      label: "골반",
    },
    moving: {
      bodyPart: "torso",
      position: [0, 0.38, 0],
      label: "몸통",
    },
    pivot: { radius: 0.10, position: [0, 0, 0] },
    sensor: { attachTo: "moving", localPosition: [0, -0.15, 0.12] },
    rotationAxis: "x",
    arc: { radius: 0.85 },
    camera: { position: [1.6, 0.5, 2.6], fov: 44 },
  },

  knee: {
    label: "슬관절",
    fixed: {
      bodyPart: "thigh",
      position: [0, 0.72, 0],
      label: "대퇴",
    },
    moving: {
      bodyPart: "shin",
      position: [0, -0.68, 0],
      label: "하퇴",
    },
    pivot: { radius: 0.10, position: [0, 0, 0] },
    sensor: { attachTo: "moving", localPosition: [0.11, -0.25, 0] },
    rotationAxis: "x",
    arc: { radius: 1.1 },
    camera: { position: [1.4, 0.2, 2.4], fov: 44 },
  },

  ankle: {
    label: "족관절",
    fixed: {
      bodyPart: "shin",
      position: [0, 0.62, 0],
      label: "하퇴",
    },
    moving: {
      bodyPart: "foot",
      position: [0, 0, 0.15],
      label: "발",
    },
    pivot: { radius: 0.07, position: [0, 0, 0] },
    sensor: { attachTo: "moving", localPosition: [0, 0.055, 0.18] },
    rotationAxis: "x",
    arc: { radius: 0.72 },
    camera: { position: [1.2, -0.2, 2.0], fov: 40 },
  },
};
