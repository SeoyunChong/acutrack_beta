"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import type { WearLocation } from "@/lib/types";
import { JOINT_CONFIGS } from "@/lib/joint-config";
import { BODY_PART_CONFIGS } from "@/lib/body-part-config";
import type { BodyPartType } from "@/lib/body-part-config";

type Props = {
  wearLocation: WearLocation;
  poseAngle: number;
};

// ─── TaperedLimb ──────────────────────────────────────────────────────────────

function TaperedLimb({
  topRadius, bottomRadius, length, segments = 8, color,
}: {
  topRadius: number; bottomRadius: number; length: number; segments?: number;
  color: string;
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

  const matProps = { color, roughness: 0.62, metalness: 0.04 };

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

function HandMesh({ color }: { color: string }) {
  const mp = { color, roughness: 0.65, metalness: 0.03 };
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

function TorsoMesh({ color }: { color: string }) {
  const mp = { color, roughness: 0.65, metalness: 0.03 };
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

function PelvisMesh({ color }: { color: string }) {
  const mp = { color, roughness: 0.65, metalness: 0.03 };
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

function FootMesh({ color }: { color: string }) {
  const mp = { color, roughness: 0.65, metalness: 0.03 };
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

function BodyPartMesh({ type, color }: { type: BodyPartType; color: string }) {
  switch (type) {
    case "hand":
      return <HandMesh color={color} />;
    case "torso":
      return <TorsoMesh color={color} />;
    case "pelvis":
      return <PelvisMesh color={color} />;
    case "foot":
      return <FootMesh color={color} />;
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
        />
      );
    }
  }
}

// ─── StaticScene ──────────────────────────────────────────────────────────────

function StaticScene({ wearLocation, poseAngle }: Props) {
  const cfg = JOINT_CONFIGS[wearLocation];
  const angleRad = poseAngle * (Math.PI / 180);

  const movingRotation: [number, number, number] = [
    cfg.rotationAxis === "x" ? angleRad : 0,
    cfg.rotationAxis === "y" ? angleRad : 0,
    cfg.rotationAxis === "z" ? angleRad : 0,
  ];

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[2, 3, 3]} intensity={1.0} />
      <directionalLight position={[-1, 1, -2]} intensity={0.3} color="#aaccff" />

      <group position={cfg.pivot.position}>
        {/* Fixed segment */}
        <group position={cfg.fixed.position}>
          <BodyPartMesh type={cfg.fixed.bodyPart} color="#a0b4c0" />
        </group>

        {/* Joint pivot — small sphere */}
        <mesh>
          <sphereGeometry args={[cfg.pivot.radius * 0.8, 12, 12]} />
          <meshStandardMaterial color="#00A3A8" roughness={0.3} metalness={0.5} />
        </mesh>

        {/* Moving segment at pose angle */}
        <group rotation={movingRotation}>
          <group position={cfg.moving.position}>
            <BodyPartMesh type={cfg.moving.bodyPart} color="#c8dce8" />
          </group>
        </group>
      </group>
    </>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function StaticJoint3D({ wearLocation, poseAngle }: Props) {
  const cfg = JOINT_CONFIGS[wearLocation];
  const camPos = cfg.camera.position.map((v, i) => (i === 2 ? v * 0.75 : v)) as [number, number, number];

  return (
    <div style={{ width: "100%", height: "100%", background: "transparent" }}>
      <Canvas
        camera={{ position: camPos, fov: cfg.camera.fov + 5 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <StaticScene wearLocation={wearLocation} poseAngle={poseAngle} />
      </Canvas>
    </div>
  );
}
