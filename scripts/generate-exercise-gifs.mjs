/**
 * Generates animated GIFs for each stretching exercise.
 * Output: public/gifs/{exerciseId}.gif
 * Run: node scripts/generate-exercise-gifs.mjs
 */

import GIFEncoder from "gif-encoder-2";
import * as pureimage from "pureimage";
import { PassThrough } from "stream";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "gifs");

// ─── Exercise data (joint + poseAngle) ────────────────────────────────────────

const EXERCISES = [
  // wrist
  { id: "w1", label: "손목 굴곡근", joint: "wrist", poseAngle: 35 },
  { id: "w2", label: "손목 신전근", joint: "wrist", poseAngle: 55 },
  // elbow
  { id: "e1", label: "팔꿈치 굴곡근", joint: "elbow", poseAngle: 90 },
  { id: "e2", label: "전완 회전", joint: "elbow", poseAngle: 130 },
  // shoulder
  { id: "s1", label: "어깨 교차", joint: "shoulder", poseAngle: 70 },
  { id: "s2", label: "어깨 외전", joint: "shoulder", poseAngle: 90 },
  // neck
  { id: "n1", label: "경추 굴곡", joint: "neck", poseAngle: 35 },
  { id: "n2", label: "경추 측굴", joint: "neck", poseAngle: 25 },
  // lowerBack
  { id: "lb1", label: "요추 굴곡", joint: "lowerBack", poseAngle: 40 },
  { id: "lb2", label: "요추 신전", joint: "lowerBack", poseAngle: 25 },
  // knee
  { id: "k1", label: "슬관절 굴곡", joint: "knee", poseAngle: 90 },
  { id: "k2", label: "대퇴 스트레칭", joint: "knee", poseAngle: 120 },
  // ankle
  { id: "a1", label: "족관절 배굴", joint: "ankle", poseAngle: 20 },
  { id: "a2", label: "종아리 스트레칭", joint: "ankle", poseAngle: 30 },
];

// ─── Drawing constants ─────────────────────────────────────────────────────────

const W = 240;
const H = 240;
const CX = W / 2;
const CY = H / 2 + 10;

const FIXED_LEN = 78;   // pixels — fixed limb (upward)
const MOVING_LEN = 72;  // pixels — moving limb (downward, sweeps)
const LIMB_HALF_W = 12; // half-width of limb rect

const COLORS = {
  bg: [7, 17, 31],
  fixed: [130, 160, 175],
  moving: [110, 210, 215],
  pivot: [0, 163, 168],
  pivotRim: [0, 200, 210],
  arc: [0, 163, 168, 60],
  label: [160, 185, 200],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexToRgb(arr) {
  return `rgb(${arr[0]},${arr[1]},${arr[2]})`;
}
function hexToRgba(arr) {
  return `rgba(${arr[0]},${arr[1]},${arr[2]},${(arr[3] ?? 255) / 255})`;
}

/** Draw a simple pill/capsule shape using only lineTo + arc (no arcTo) */
function drawPill(ctx, cx, cy, halfW, halfH) {
  const r = halfW;
  ctx.beginPath();
  ctx.arc(cx, cy - halfH + r, r, Math.PI, 0, false);       // top cap
  ctx.lineTo(cx + halfW, cy + halfH - r);
  ctx.arc(cx, cy + halfH - r, r, 0, Math.PI, false);        // bottom cap
  ctx.lineTo(cx - halfW, cy - halfH + r);
  ctx.closePath();
}

function drawFrame(ctx, poseAngleDeg, currentAngleDeg) {
  const maxRad = (poseAngleDeg * Math.PI) / 180;
  const curRad = (currentAngleDeg * Math.PI) / 180;

  // Background
  ctx.fillStyle = hexToRgb(COLORS.bg);
  ctx.fillRect(0, 0, W, H);

  // ── ROM arc ghost sweep ────────────────────────────────────────────────────
  ctx.strokeStyle = "rgba(0,163,168,0.22)";
  ctx.lineWidth = 20;
  ctx.beginPath();
  ctx.arc(CX, CY, MOVING_LEN, Math.PI / 2, Math.PI / 2 + maxRad, false);
  ctx.stroke();

  // ── Fixed limb (straight up from pivot) ───────────────────────────────────
  ctx.fillStyle = hexToRgb(COLORS.fixed);
  drawPill(ctx, CX, CY - FIXED_LEN / 2 - 4, LIMB_HALF_W, FIXED_LEN / 2 + 4);
  ctx.fill();

  // ── Moving limb (rotates clockwise from straight-down) ────────────────────
  ctx.save();
  ctx.translate(CX, CY);
  ctx.rotate(curRad);
  ctx.fillStyle = hexToRgb(COLORS.moving);
  drawPill(ctx, 0, MOVING_LEN / 2 + 4, LIMB_HALF_W, MOVING_LEN / 2 + 4);
  ctx.fill();
  ctx.restore();

  // ── Pivot joint ────────────────────────────────────────────────────────────
  // Glow ring
  ctx.fillStyle = "rgba(0,163,168,0.28)";
  ctx.beginPath();
  ctx.arc(CX, CY, 15, 0, Math.PI * 2);
  ctx.fill();

  // Core
  ctx.fillStyle = hexToRgb(COLORS.pivot);
  ctx.beginPath();
  ctx.arc(CX, CY, 9, 0, Math.PI * 2);
  ctx.fill();

  // Bright rim
  ctx.strokeStyle = hexToRgb(COLORS.pivotRim);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(CX, CY, 9, 0, Math.PI * 2);
  ctx.stroke();

  // ── Current angle tick line ────────────────────────────────────────────────
  const tipX = CX + Math.sin(curRad) * (MOVING_LEN + 8);
  const tipY = CY + Math.cos(curRad) * (MOVING_LEN + 8);
  ctx.strokeStyle = "rgba(110,220,225,0.55)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(CX, CY);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();
}

// ─── GIF generation ───────────────────────────────────────────────────────────

async function generateGif(exercise) {
  const FRAMES = 32;
  const DELAY = 75; // ms per frame → ~2.4s loop

  const encoder = new GIFEncoder(W, H, "neuquant", true);
  encoder.setRepeat(0);
  encoder.setDelay(DELAY);
  encoder.setQuality(8);
  encoder.start();

  for (let f = 0; f < FRAMES; f++) {
    const t = f / FRAMES;
    // Sine easing: 0 → 1 → 0 over full cycle
    const phase = (Math.sin(t * Math.PI * 2 - Math.PI / 2) + 1) / 2;
    const currentAngle = phase * exercise.poseAngle;

    const canvas = pureimage.make(W, H);
    const ctx = canvas.getContext("2d");
    drawFrame(ctx, exercise.poseAngle, currentAngle);

    // Extract pixel data and add frame
    const imgData = ctx.getImageData(0, 0, W, H);
    encoder.addFrame(imgData.data);
  }

  encoder.finish();
  const buf = encoder.out.getData();
  const outPath = path.join(OUT_DIR, `${exercise.id}.gif`);
  fs.writeFileSync(outPath, buf);
  console.log(`  ✓ ${exercise.id}.gif  (${Math.round(buf.length / 1024)} KB)`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Generating ${EXERCISES.length} exercise GIFs → public/gifs/\n`);

  for (const ex of EXERCISES) {
    process.stdout.write(`  Generating ${ex.id} (${ex.label})...`);
    try {
      await generateGif(ex);
    } catch (err) {
      console.error(`\n  ✗ ${ex.id} failed:`, err.message);
    }
  }

  console.log("\nDone.");
}

main();
