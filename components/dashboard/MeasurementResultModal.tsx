"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  preRom?: number;
  postRom?: number;
  prePainNrs?: number;
  postPainNrs?: number;
  onClose: () => void;
};

function useCountUp(target: number, duration = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf: number;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

export default function MeasurementResultModal({ preRom, postRom, prePainNrs, postPainNrs, onClose }: Props) {
  if (!preRom || !postRom) return null;

  const romImprovement = postRom - preRom;
  const romPct = ((romImprovement / preRom) * 100).toFixed(1);
  const painChange = (prePainNrs ?? 0) - (postPainNrs ?? 0);

  return (
    <ModalContent
      preRom={preRom}
      postRom={postRom}
      romImprovement={romImprovement}
      romPct={romPct}
      painChange={painChange}
      onClose={onClose}
    />
  );
}

function ModalContent({ preRom, postRom, romImprovement, romPct, painChange, onClose }: {
  preRom: number;
  postRom: number;
  romImprovement: number;
  romPct: string;
  painChange: number;
  onClose: () => void;
}) {
  const animPreRom = useCountUp(preRom);
  const animPostRom = useCountUp(postRom);
  const animRomImprovement = useCountUp(romImprovement);
  const animPainChange = useCountUp(Math.abs(painChange));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ position: "absolute", inset: 0, background: "rgba(5,8,24,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, borderRadius: "1rem" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{ background: "#0f172a", border: "1px solid rgba(0,163,168,0.3)", borderRadius: "1rem", padding: "28px 32px", minWidth: "320px", maxWidth: "420px", width: "90%" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <p style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>측정 완료</p>
            <p style={{ fontSize: "16px", fontWeight: "600", color: "#e2e8f0" }}>치료 전후 결과</p>
          </div>
          <button onClick={onClose} style={{ color: "#475569", fontSize: "18px", lineHeight: 1, background: "none", border: "none", cursor: "pointer" }}>✕</button>
        </div>

        {/* ROM comparison */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
            <p style={{ fontSize: "10px", color: "#64748b", marginBottom: "4px" }}>치료 전 ROM</p>
            <p style={{ fontSize: "28px", fontWeight: "700", color: "#94a3b8", fontFamily: "monospace" }}>{animPreRom}°</p>
          </div>
          <div style={{ background: "rgba(0,163,168,0.08)", border: "1px solid rgba(0,163,168,0.2)", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
            <p style={{ fontSize: "10px", color: "#0891b2", marginBottom: "4px" }}>치료 후 ROM</p>
            <p style={{ fontSize: "28px", fontWeight: "700", color: "#22d3ee", fontFamily: "monospace" }}>{animPostRom}°</p>
          </div>
        </div>

        {/* Improvement badges */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <div style={{ flex: 1, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
            <p style={{ fontSize: "10px", color: "#10b981", marginBottom: "2px" }}>ROM 개선</p>
            <p style={{ fontSize: "18px", fontWeight: "700", color: "#34d399" }}>+{animRomImprovement}° <span style={{ fontSize: "12px" }}>({romPct}%)</span></p>
          </div>
          {painChange > 0 && (
            <div style={{ flex: 1, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
              <p style={{ fontSize: "10px", color: "#10b981", marginBottom: "2px" }}>통증 감소</p>
              <p style={{ fontSize: "18px", fontWeight: "700", color: "#34d399" }}>-{animPainChange}점 NRS</p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontSize: "13px", cursor: "pointer" }}
          >
            닫기
          </button>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: "10px", borderRadius: "8px", background: "#0891b2", border: "none", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
          >
            확인 완료 ✓
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
