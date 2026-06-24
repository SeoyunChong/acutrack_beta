"use client";

import { useRef, Suspense, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import * as THREE from "three";
import type { MeasurementPhase } from "@/lib/measurement";
import type { WearLocation } from "@/lib/types";
import { JOINT_CONFIGS } from "@/lib/joint-config";
import { BODY_PART_CONFIGS } from "@/lib/body-part-config";
import type { BodyPartType } from "@/lib/body-part-config";

type Props = {
  currentAngle: number;
  preMaxAngle?: number;
  postMaxAngle?: number;
  phase: MeasurementPhase;
  wearLocation: WearLocation;
};

// ─── Color palette ────────────────────────────────────────────────────────────

const COLORS = {
  fixedBodyPart: "#8a9ba8",
  movingBodyPart: "#a8bbc8",
  pivotActive: "#00A3A8",
  pivotIdle: "#1a3a4a",
  sensor: "#0d2035",
  preArc: "#475569",
  postArc: "#0891b2",
  currentArc: "#22d3ee",
  ghostPre: "#334155",
  ghostPost: "#164e63",
};

// ─── TaperedLimb ──────────────────────────────────────────────────────────────

function TaperedLimb({
  topRadius, bottomRadius, length, segments = 8, color, emissiveColor, transparent, opacity,
}: {
  topRadius: number; bottomRadius: number; length: number; segments?: number;
  color: string; emissiveColor?: string; transparent?: boolean; opacity?: number;
}) {
  const geo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 5; i++) {
      const t = i / 5;
      const r = bottomRadius + (topRadius - bottomRadius) * t;
      pts.push(new THREE.Vector2(r, (t - 0.5) * length));
    }
    const g = new THREE.LatheGeometry(pts, segments);
    g.computeVertexNormals();
    return g;
  }, [topRadius, bottomRadius, length, segments]);

  const matProps = {
    color,
    emissive: emissiveColor ?? "#000000",
    emissiveIntensity: emissiveColor ? 0.18 : 0,
    roughness: 0.62,
    metalness: 0.04,
    transparent: !!transparent,
    opacity: opacity ?? 1,
  };

  return (
    <group>
      <mesh geometry={geo}>
        <meshStandardMaterial {...matProps} />
      </mesh>
      <mesh position={[0, length / 2, 0]}>
        <sphereGeometry args={[topRadius, segments, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
      <mesh position={[0, -length / 2, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[bottomRadius, segments, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
    </group>
  );
}

// ─── HandMesh ─────────────────────────────────────────────────────────────────

function HandMesh({ color, emissiveColor, transparent, opacity }: {
  color: string; emissiveColor?: string; transparent?: boolean; opacity?: number;
}) {
  const mp = {
    color, emissive: emissiveColor ?? "#000000",
    emissiveIntensity: emissiveColor ? 0.15 : 0,
    roughness: 0.65, metalness: 0.03,
    transparent: !!transparent, opacity: opacity ?? 1,
  };
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.16, 0.26, 0.055]} />
        <meshStandardMaterial {...mp} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[0.13, 0.06, 0.048]} />
        <meshStandardMaterial {...mp} />
      </mesh>
      <mesh position={[0.095, 0.04, 0]} rotation={[0, 0, -0.5]}>
        <capsuleGeometry args={[0.022, 0.09, 4, 6]} />
        <meshStandardMaterial {...mp} />
      </mesh>
      <mesh position={[0, -0.17, 0]}>
        <boxGeometry args={[0.10, 0.08, 0.05]} />
        <meshStandardMaterial {...mp} />
      </mesh>
    </group>
  );
}

// ─── TorsoMesh ────────────────────────────────────────────────────────────────

function TorsoMesh({ color, emissiveColor, transparent, opacity }: {
  color: string; emissiveColor?: string; transparent?: boolean; opacity?: number;
}) {
  const mp = {
    color, emissive: emissiveColor ?? "#000000",
    emissiveIntensity: emissiveColor ? 0.15 : 0,
    roughness: 0.65, metalness: 0.03,
    transparent: !!transparent, opacity: opacity ?? 1,
  };
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.38, 0.55, 0.18]} />
        <meshStandardMaterial {...mp} />
      </mesh>
      <mesh position={[0, 0.24, 0]}>
        <boxGeometry args={[0.44, 0.06, 0.16]} />
        <meshStandardMaterial {...mp} />
      </mesh>
      <mesh position={[0, -0.26, 0]}>
        <boxGeometry args={[0.34, 0.06, 0.16]} />
        <meshStandardMaterial {...mp} />
      </mesh>
    </group>
  );
}

// ─── PelvisMesh ───────────────────────────────────────────────────────────────

function PelvisMesh({ color, emissiveColor, transparent, opacity }: {
  color: string; emissiveColor?: string; transparent?: boolean; opacity?: number;
}) {
  const mp = {
    color, emissive: emissiveColor ?? "#000000",
    emissiveIntensity: emissiveColor ? 0.15 : 0,
    roughness: 0.65, metalness: 0.03,
    transparent: !!transparent, opacity: opacity ?? 1,
  };
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.38, 0.24, 0.20]} />
        <meshStandardMaterial {...mp} />
      </mesh>
      <mesh position={[0, -0.06, 0]}>
        <boxGeometry args={[0.44, 0.10, 0.18]} />
        <meshStandardMaterial {...mp} />
      </mesh>
    </group>
  );
}

// ─── FootMesh ─────────────────────────────────────────────────────────────────

function FootMesh({ color, emissiveColor, transparent, opacity }: {
  color: string; emissiveColor?: string; transparent?: boolean; opacity?: number;
}) {
  const mp = {
    color, emissive: emissiveColor ?? "#000000",
    emissiveIntensity: emissiveColor ? 0.15 : 0,
    roughness: 0.65, metalness: 0.03,
    transparent: !!transparent, opacity: opacity ?? 1,
  };
  return (
    <group>
      <mesh position={[0, 0, 0.16]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[0.20, 0.085, 0.50]} />
        <meshStandardMaterial {...mp} />
      </mesh>
      <mesh position={[0, 0.025, -0.14]}>
        <boxGeometry args={[0.18, 0.11, 0.16]} />
        <meshStandardMaterial {...mp} />
      </mesh>
      <mesh position={[0, -0.02, 0.33]}>
        <boxGeometry args={[0.17, 0.055, 0.12]} />
        <meshStandardMaterial {...mp} />
      </mesh>
    </group>
  );
}

// ─── HeadMesh ─────────────────────────────────────────────────────────────────

function HeadMesh({ color }: { color: string }) {
  return (
    <group>
      <mesh scale={[1, 1.15, 0.92]}>
        <sphereGeometry args={[0.20, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.04} />
      </mesh>
      <mesh position={[0, 0.02, 0.195]} scale={[1, 0.6, 0.5]}>
        <sphereGeometry args={[0.028, 6, 6]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0} />
      </mesh>
    </group>
  );
}

// ─── BodyPartMesh dispatcher ──────────────────────────────────────────────────

function BodyPartMesh({ type, color, emissiveColor, transparent, opacity }: {
  type: BodyPartType; color: string; emissiveColor?: string; transparent?: boolean; opacity?: number;
}) {
  switch (type) {
    case "hand":
      return <HandMesh color={color} emissiveColor={emissiveColor} transparent={transparent} opacity={opacity} />;
    case "torso":
      return <TorsoMesh color={color} emissiveColor={emissiveColor} transparent={transparent} opacity={opacity} />;
    case "pelvis":
      return <PelvisMesh color={color} emissiveColor={emissiveColor} transparent={transparent} opacity={opacity} />;
    case "foot":
      return <FootMesh color={color} emissiveColor={emissiveColor} transparent={transparent} opacity={opacity} />;
    case "head":
      return <HeadMesh color={color} />;
    default: {
      const cfg = BODY_PART_CONFIGS[type];
      return (
        <TaperedLimb
          topRadius={cfg.topRadius}
          bottomRadius={cfg.bottomRadius}
          length={cfg.length}
          segments={cfg.segments ?? 8}
          color={color}
          emissiveColor={emissiveColor}
          transparent={transparent}
          opacity={opacity}
        />
      );
    }
  }
}

// ─── GhostPose ────────────────────────────────────────────────────────────────

function GhostPose({ bodyPart, angle, rotationAxis, position, color, opacity }: {
  bodyPart: BodyPartType; angle: number; rotationAxis: "x" | "y" | "z";
  position: [number, number, number]; color: string; opacity: number;
}) {
  const a = angle * (Math.PI / 180);
  const rotation: [number, number, number] = [
    rotationAxis === "x" ? a : 0,
    rotationAxis === "y" ? a : 0,
    rotationAxis === "z" ? a : 0,
  ];
  return (
    <group rotation={rotation}>
      <group position={position}>
        <BodyPartMesh type={bodyPart} color={color} transparent opacity={opacity} />
      </group>
    </group>
  );
}

// ─── JointPivot ───────────────────────────────────────────────────────────────

function JointPivot({ radius, active, calibrating }: {
  radius: number; active: boolean; calibrating: boolean;
}) {
  return (
    <>
      <mesh>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshStandardMaterial
          color={active ? "#00A3A8" : "#1a3a4a"}
          emissive={active ? "#004044" : "#001018"}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>
      {calibrating && <CalibrationRing />}
    </>
  );
}

function CalibrationRing() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 2;
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[0.22, 0.008, 8, 40]} />
      <meshStandardMaterial
        color="#00A3A8"
        emissive="#00A3A8"
        emissiveIntensity={0.8}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

// ─── SensorModule ─────────────────────────────────────────────────────────────

function SensorModule({ blinking }: { blinking: boolean }) {
  const ledRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ledRef.current) return;
    const mat = ledRef.current.material as THREE.MeshStandardMaterial;
    if (blinking) {
      const pulse = Math.abs(Math.sin(clock.getElapsedTime() * 4));
      mat.emissiveIntensity = 1 + pulse * 3;
    } else {
      mat.emissiveIntensity = 1.5;
    }
  });
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.20, 0.055, 0.26]} />
        <meshStandardMaterial color="#0d2035" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.032, 0]}>
        <boxGeometry args={[0.17, 0.005, 0.23]} />
        <meshStandardMaterial color="#0a3d2e" roughness={0.2} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.038, 0]}>
        <boxGeometry args={[0.065, 0.007, 0.065]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.1} metalness={0.8} />
      </mesh>
      <mesh ref={ledRef} position={[0.06, 0.038, 0.09]}>
        <sphereGeometry args={[0.013, 8, 8]} />
        <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[-0.165, 0, 0]}>
        <boxGeometry args={[0.13, 0.042, 0.24]} />
        <meshStandardMaterial color="#1a3055" roughness={0.8} />
      </mesh>
      <mesh position={[0.165, 0, 0]}>
        <boxGeometry args={[0.13, 0.042, 0.24]} />
        <meshStandardMaterial color="#1a3055" roughness={0.8} />
      </mesh>
      <Html position={[0, 0.055, 0]} center style={{ pointerEvents: "none" }}>
        <span style={{ fontSize: "7px", color: "#00A3A8", fontFamily: "monospace", whiteSpace: "nowrap", opacity: 0.85 }}>
          IMU
        </span>
      </Html>
    </group>
  );
}

// ─── RomArc ───────────────────────────────────────────────────────────────────

function RomArc({ maxAngle, color, radius, rotationAxis, lineWidth = 2 }: {
  maxAngle: number; color: string; radius: number;
  rotationAxis: "x" | "y" | "z"; lineWidth?: number;
}) {
  const points = useMemo(() => {
    const steps = 40;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const t = (i / steps) * maxAngle * (Math.PI / 180);
      if (rotationAxis === "x")
        return new THREE.Vector3(0, -Math.cos(t) * radius, Math.sin(t) * radius);
      if (rotationAxis === "y")
        return new THREE.Vector3(Math.sin(t) * radius, 0, -Math.cos(t) * radius);
      return new THREE.Vector3(Math.sin(t) * radius, -Math.cos(t) * radius, 0);
    });
  }, [maxAngle, radius, rotationAxis]);

  const endPt = points[points.length - 1];
  return (
    <group>
      <Line points={points} color={color} lineWidth={lineWidth} />
      <mesh position={endPt}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

// ─── CameraRig ────────────────────────────────────────────────────────────────

function CameraRig({ position, fov }: { position: [number, number, number]; fov: number }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(...position);
    (camera as THREE.PerspectiveCamera).fov = fov;
    camera.updateProjectionMatrix();
  }, [position, fov, camera]);
  return null;
}

// ─── AngleOverlay ─────────────────────────────────────────────────────────────

function AngleOverlay({ phase, currentAngle, preMaxAngle, postMaxAngle, location }: {
  phase: MeasurementPhase; currentAngle: number; preMaxAngle?: number;
  postMaxAngle?: number; location: string;
}) {
  const isMeasuring = phase === "measuring_pre" || phase === "measuring_post";
  return (
    <Html position={[-0.05, 1.6, 0]} center style={{ pointerEvents: "none" }}>
      <div style={{
        background: "rgba(5,12,24,0.82)",
        border: "0.5px solid rgba(0,163,168,0.25)",
        borderRadius: "8px",
        padding: "7px 12px",
        minWidth: "110px",
        fontFamily: "monospace",
        fontSize: "11px",
        color: "#94a3b8",
        lineHeight: "1.7",
      }}>
        <div style={{ color: "#e2e8f0", fontWeight: "500", fontSize: "12px", marginBottom: "3px" }}>{location}</div>
        {isMeasuring && (
          <div style={{ color: "#22d3ee", fontWeight: "700", fontSize: "14px" }}>{currentAngle}°</div>
        )}
        {preMaxAngle != null && (
          <div>Pre <span style={{ color: "#94a3b8", fontWeight: "500" }}>{preMaxAngle}°</span></div>
        )}
        {postMaxAngle != null && (
          <div>Post <span style={{ color: "#0891b2", fontWeight: "500" }}>{postMaxAngle}°</span></div>
        )}
        {postMaxAngle != null && preMaxAngle != null && (
          <div style={{ color: "#10b981", fontWeight: "700", fontSize: "12px", marginTop: "2px" }}>+{postMaxAngle - preMaxAngle}°</div>
        )}
      </div>
    </Html>
  );
}

// ─── JointScene ───────────────────────────────────────────────────────────────

function JointScene({ currentAngle, preMaxAngle, postMaxAngle, phase, wearLocation }: Props) {
  const cfg = JOINT_CONFIGS[wearLocation];
  const movingGroupRef = useRef<THREE.Group>(null);
  const displayedAngleRef = useRef(0);

  const isCalibrating = phase === "calibrating";
  const isMeasuring = phase === "measuring_pre" || phase === "measuring_post";
  const isActive = phase !== "idle" && phase !== "ready";
  const isAnalysisComplete = phase === "analysis_complete";

  useFrame(() => {
    displayedAngleRef.current = THREE.MathUtils.lerp(
      displayedAngleRef.current,
      currentAngle,
      0.12
    );
    if (movingGroupRef.current) {
      const a = displayedAngleRef.current * (Math.PI / 180);
      movingGroupRef.current.rotation.set(
        cfg.rotationAxis === "x" ? a : 0,
        cfg.rotationAxis === "y" ? a : 0,
        cfg.rotationAxis === "z" ? a : 0,
      );
    }
  });

  const movingColor = isMeasuring ? "#b8d4e0" : COLORS.movingBodyPart;
  const fixedColor = COLORS.fixedBodyPart;
  const movingOffset = cfg.moving.position;

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 4]} intensity={1.0} />
      <directionalLight position={[-2, 2, -3]} intensity={0.3} color="#aaccff" />
      <pointLight position={[0, 1, 2]} intensity={0.35} color="#00A3A8" distance={5} />

      <CameraRig position={cfg.camera.position} fov={cfg.camera.fov} />

      <gridHelper args={[10, 20, "#0a1e2e", "#0d2535"]} position={[0, -1.8, 0]} />

      <group position={cfg.pivot.position}>
        {/* Fixed body part */}
        <group position={cfg.fixed.position}>
          <BodyPartMesh type={cfg.fixed.bodyPart} color={fixedColor} />
          {cfg.sensor.attachTo === "fixed" && (
            <group
              position={cfg.sensor.localPosition}
              rotation={cfg.sensor.localRotation ? [cfg.sensor.localRotation[0], cfg.sensor.localRotation[1], cfg.sensor.localRotation[2]] : undefined}
            >
              <SensorModule blinking={isMeasuring} />
            </group>
          )}
        </group>

        <JointPivot radius={cfg.pivot.radius} active={isActive} calibrating={isCalibrating} />

        {/* Moving group */}
        <group ref={movingGroupRef}>
          <group position={movingOffset}>
            <BodyPartMesh
              type={cfg.moving.bodyPart}
              color={movingColor}
              emissiveColor={isMeasuring ? "#081520" : undefined}
            />
            {cfg.sensor.attachTo === "moving" && (
              <group
                position={cfg.sensor.localPosition}
                rotation={cfg.sensor.localRotation ? [cfg.sensor.localRotation[0], cfg.sensor.localRotation[1], cfg.sensor.localRotation[2]] : undefined}
              >
                <SensorModule blinking={isMeasuring} />
              </group>
            )}
          </group>
        </group>

        {/* Ghost poses at analysis_complete */}
        {isAnalysisComplete && preMaxAngle != null && (
          <GhostPose
            bodyPart={cfg.moving.bodyPart}
            angle={preMaxAngle}
            rotationAxis={cfg.rotationAxis}
            position={movingOffset}
            color={COLORS.ghostPre}
            opacity={0.28}
          />
        )}
        {isAnalysisComplete && postMaxAngle != null && (
          <GhostPose
            bodyPart={cfg.moving.bodyPart}
            angle={postMaxAngle}
            rotationAxis={cfg.rotationAxis}
            position={movingOffset}
            color={COLORS.ghostPost}
            opacity={0.40}
          />
        )}

        {/* ROM arcs */}
        {preMaxAngle != null && (
          phase === "pre_complete" || phase === "measuring_post" ||
          phase === "treatment_waiting" || phase === "post_complete" ||
          phase === "analysis_complete"
        ) && (
          <RomArc
            maxAngle={preMaxAngle}
            color={COLORS.preArc}
            radius={cfg.arc.radius}
            rotationAxis={cfg.rotationAxis}
            lineWidth={1.5}
          />
        )}
        {postMaxAngle != null && (phase === "post_complete" || phase === "analysis_complete") && (
          <RomArc
            maxAngle={postMaxAngle}
            color={COLORS.postArc}
            radius={cfg.arc.radius}
            rotationAxis={cfg.rotationAxis}
            lineWidth={2}
          />
        )}
        {isMeasuring && (
          <RomArc
            maxAngle={currentAngle}
            color={COLORS.currentArc}
            radius={cfg.arc.radius}
            rotationAxis={cfg.rotationAxis}
            lineWidth={2.5}
          />
        )}

        <AngleOverlay
          phase={phase}
          currentAngle={currentAngle}
          preMaxAngle={preMaxAngle}
          postMaxAngle={postMaxAngle}
          location={cfg.label}
        />
      </group>

      <OrbitControls
        enablePan={false}
        minDistance={1.5}
        maxDistance={5.0}
        maxPolarAngle={Math.PI * 0.85}
      />
    </>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function Joint3DView({ currentAngle, preMaxAngle, postMaxAngle, phase, wearLocation }: Props) {
  const cfg = JOINT_CONFIGS[wearLocation];
  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-[#030a10]">
      <Canvas
        camera={{ position: cfg.camera.position, fov: cfg.camera.fov }}
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          <JointScene
            currentAngle={currentAngle}
            preMaxAngle={preMaxAngle}
            postMaxAngle={postMaxAngle}
            phase={phase}
            wearLocation={wearLocation}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
