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
  // Fast-count profile thresholds for hackathon demo
  upThresholdDeg: 45,   // sit-up considered when torso angle <= 45°
  downThresholdDeg: 65, // down considered when torso angle >= 65°
  minDeltaToMoveDeg: 4,
  maxNoMoveMs: 5000,
  maxNoFaceMs: 3000,
  faceWindowMs: 2000,
  faceMinVisibleRate: 0.3,
  faceScoreThreshold: 0.4,
  flipHorizontal: true, // front camera
  modelType: 'lite', // 'lite' for speed in hackathon demos
};

export function createSitupPoseCounter(config = {}) {
  const cfg = { ...DEFAULT_CFG, ...config };

  let detector = null;
  let ready = false;
  // Sliding window of face visibility booleans
  let faceHistory = [];

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
    lastPoseScore: 0,
  };

  async function ensureReady() {
    if (ready) return;
    await tf.ready();
    // Prefer rn-webgl; fall back to cpu if necessary
    try { await tf.setBackend('rn-webgl'); } catch {}
    await tf.ready();
    console.log('TFJS backend:', tf.getBackend());
    detector = await posedetection.createDetector(posedetection.SupportedModels.BlazePose, {
      runtime: 'tfjs',
      modelType: cfg.modelType,
      enableSmoothing: true,
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

    // Face presence (robust): compute max score among nose/eyes
    const nose = getKP(kps, 'nose');
    const le = getKP(kps, 'left_eye');
    const re = getKP(kps, 'right_eye');
    const faceScore = Math.max(nose?.score ?? 0, le?.score ?? 0, re?.score ?? 0);
    const faceSeen = faceScore >= cfg.faceScoreThreshold;
    if (faceSeen) state.lastFaceTs = ts;
    // Update face history window
    faceHistory.push({ ts, visible: faceSeen });
    const cutoff = ts - cfg.faceWindowMs;
    faceHistory = faceHistory.filter(h => h.ts >= cutoff);

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
        // Count on completing the upward motion (down -> up)
        state.phase = 'up';
        state.count += 1;
        state.message = `Rep ${state.count} completed`;
      } else if (angleDeg >= cfg.downThresholdDeg && state.phase === 'up') {
        // Reset phase when going back down
        state.phase = 'down';
      }
    }

    // Optional: require a minimally confident pose to proceed (helps on noisy frames)
    if ((state.lastPoseScore ?? 0) < 0.1) {
      // Do not stop, just skip this frame
      return snapshot(ts);
    }

    // Cheat detection: insufficient face visibility over recent window OR extended absence
    const recent = faceHistory;
    if (recent.length > 0) {
      const visibleCount = recent.filter(h => h.visible).length;
      const rate = visibleCount / recent.length;
      if (rate < cfg.faceMinVisibleRate || (ts - state.lastFaceTs > cfg.maxNoFaceMs)) {
        state.status = 'invalid';
        state.message = 'Face not visible';
        state.active = false;
        state.stoppedAt = ts;
        return snapshot(ts);
      }
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
    try {
      // Expect tensor: [H, W, 3] uint8
      const poses = await detector.estimatePoses(tensor, {
        maxPoses: 1,
        flipHorizontal: cfg.flipHorizontal,
      });
      const pose = poses?.[0];
      state.lastPoseScore = pose?.score ?? 0;
      const landmarks = pose?.keypoints || [];
      if (!pose || !landmarks?.length) {
        // No pose detected; keep state but provide snapshot for UI
        return snapshot(now ?? Date.now());
      }
      return updateFromLandmarks(landmarks, now);
    } catch (err) {
      console.log('estimatePoses error:', err?.message || String(err));
      return snapshot(now ?? Date.now());
    }
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
      debug: {
        lastAngle: state.lastAngle,
        lastPoseScore: state.lastPoseScore,
        lastFaceAgoMs: ts - state.lastFaceTs,
        lastMoveAgoMs: ts - state.lastMoveTs,
      },
    };
  }

  return { ensureReady, processImageTensor, updateFromLandmarks, stop, snapshot };
}