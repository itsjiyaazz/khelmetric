// Pose-based sit-up counter using TensorFlow.js + BlazePose (pose-detection)
// Expo-managed friendly: uses tfjs-react-native with rn-webgl backend and Camera stills.
// No frame processors/native plugins required. Captures low-res frames periodically.
//
// Public API:
// - createSitupPoseCounter(): returns an object with ensureReady(), processImageTensor(tensor, now), stop(), snapshot()
// - processImageTensor expects a Tensor3D (H, W, 3) from decodeJpeg or other source.
//
// Counting model:
// - Compute torso angle as angle-from-vertical of vector (hipCenter -> shoulderCenter)
// - down when angle >= downThreshold (more horizontal), up when angle <= upThreshold (more vertical)
// - Count on transition up->down->up

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native'; // registers 'rn-webgl' backend
import * as posedetection from '@tensorflow-models/pose-detection';

const DEFAULT_CFG = {
  upThresholdDeg: 25,
  downThresholdDeg: 55,
  minDeltaToMoveDeg: 6,
  maxNoMoveMs: 5000,
  maxNoFaceMs: 2000,
  flipHorizontal: true, // front camera
  modelType: 'lite', // 'lite' for speed in hackathon demos
};

export function createSitupPoseCounter(config = {}) {
  const cfg = { ...DEFAULT_CFG, ...config };

  let detector = null;
  let ready = false;

  const state = {
    phase: 'down',
    count: 0,
    status: 'valid',
    message: '',
    lastMoveTs: Date.now(),
    lastFaceTs: Date.now(),
    lastAngle: null,
    startedAt: Date.now(),
    stoppedAt: null,
    active: true,
  };

  async function ensureReady() {
    if (ready) return;
    await tf.ready();
    // Prefer rn-webgl; fall back to cpu if necessary
    try { await tf.setBackend('rn-webgl'); } catch {}
    await tf.ready();
    detector = await posedetection.createDetector(posedetection.SupportedModels.BlazePose, {
      runtime: 'tfjs',
      modelType: cfg.modelType,
    });
    ready = true;
  }

  function angleFromVerticalDeg(shoulder, hip) {
    // Image coordinates: x to right, y down
    const dx = (shoulder.x - hip.x);
    const dy = (shoulder.y - hip.y);
    // angle between vector and vertical axis
    const rad = Math.abs(Math.atan2(dx, dy));
    return rad * (180 / Math.PI);
  }

  function center(a, b) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, score: Math.min(a.score ?? 1, b.score ?? 1) };
  }

  function getKP(map, name) {
    return map.get(name) || null;
  }

  function toKPMap(keypoints) {
    const map = new Map();
    keypoints?.forEach(kp => {
      const name = kp.name || kp.part; // compatibility with different versions
      if (name) map.set(name, kp);
    });
    return map;
  }

  function updateFromLandmarks(landmarks, now) {
    if (!state.active) return snapshot(now);
    const ts = now ?? Date.now();

    const kps = toKPMap(landmarks);
    const ls = getKP(kps, 'left_shoulder');
    const rs = getKP(kps, 'right_shoulder');
    const lh = getKP(kps, 'left_hip');
    const rh = getKP(kps, 'right_hip');

    // Face presence
    const nose = getKP(kps, 'nose');
    const le = getKP(kps, 'left_eye');
    const re = getKP(kps, 'right_eye');
    const faceSeen = [nose, le, re].some(k => (k?.score ?? 0) > 0.5);
    if (faceSeen) state.lastFaceTs = ts;

    if (ls && rs && lh && rh) {
      const shoulderC = center(ls, rs);
      const hipC = center(lh, rh);
      const angleDeg = angleFromVerticalDeg(shoulderC, hipC);

      // movement tracking
      if (state.lastAngle == null) state.lastAngle = angleDeg;
      const delta = Math.abs(angleDeg - state.lastAngle);
      if (delta >= cfg.minDeltaToMoveDeg) state.lastMoveTs = ts;
      state.lastAngle = angleDeg;

      // phase transitions
      if (angleDeg <= cfg.upThresholdDeg && state.phase === 'down') {
        state.phase = 'up';
      } else if (angleDeg >= cfg.downThresholdDeg && state.phase === 'up') {
        state.phase = 'down';
        state.count += 1;
      }
    }

    // Cheat: no face visible too long
    if (ts - state.lastFaceTs > cfg.maxNoFaceMs) {
      state.status = 'invalid';
      state.message = 'Face not visible';
      state.active = false;
      state.stoppedAt = ts;
      return snapshot(ts);
    }

    // Inactivity stop
    if (ts - state.lastMoveTs > cfg.maxNoMoveMs) {
      state.message = 'Inactive for too long';
      state.active = false;
      state.stoppedAt = ts;
      return snapshot(ts);
    }

    return snapshot(ts);
  }

  async function processImageTensor(tensor, now) {
    if (!ready) await ensureReady();
    // Expect tensor: [H, W, 3] uint8
    const poses = await detector.estimatePoses(tensor, {
      maxPoses: 1,
      flipHorizontal: cfg.flipHorizontal,
    });
    const landmarks = poses?.[0]?.keypoints || [];
    return updateFromLandmarks(landmarks, now);
  }

  function stop(now) {
    if (!state.stoppedAt) state.stoppedAt = now ?? Date.now();
    state.active = false;
    return snapshot(state.stoppedAt);
  }

  function snapshot(ts = Date.now()) {
    const durationMs = (state.stoppedAt ?? ts) - state.startedAt;
    return {
      phase: state.phase,
      count: state.count,
      status: state.status,
      message: state.message,
      active: state.active,
      startedAt: state.startedAt,
      stoppedAt: state.stoppedAt,
      durationMs,
    };
  }

  return { ensureReady, processImageTensor, updateFromLandmarks, stop, snapshot };
}