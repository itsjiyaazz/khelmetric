// Lightweight sit-up counter + cheat detection
// Expo-compatible (no native frame processors). Designed to accept sensor snapshots
// so we can later swap in a pose engine (e.g., MediaPipe/TensorFlow.js) without
// rewriting business logic.
//
// Inputs (per update):
//   - torsoInclinationDeg: 0..90 approx angle between device z-axis and gravity
//       (0 ~ lying flat face-up, 90 ~ vertical). We proxy torso angle with device angle.
//   - headPitchDeg (optional): if available from a pose/face engine; not required.
//   - faceVisible: boolean (true if a face is detected in camera)
//   - now: current ms timestamp
//
// Configurable thresholds:
const DEFAULT_CFG = {
  upThreshold: 55,         // degrees considered "up" position
  downThreshold: 25,       // degrees considered "down" position
  minDeltaToCount: 8,      // movement delta to treat as activity
  maxNoMoveMs: 5000,       // inactivity window => stop counter
  maxNoFaceMs: 2000,       // if no face seen for this long => invalid attempt
};

export function createSitupCounter(config = {}) {
  const cfg = { ...DEFAULT_CFG, ...config };

  const state = {
    phase: 'down',         // 'down' | 'up'
    count: 0,
    status: 'valid',       // 'valid' | 'invalid'
    message: '',
    lastMoveTs: Date.now(),
    lastFaceTs: Date.now(),
    lastAngle: null,
    startedAt: Date.now(),
    stoppedAt: null,
    active: true,
  };

  function update({ torsoInclinationDeg, headPitchDeg, faceVisible, now }) {
    if (!state.active) return { ...snapshot(now) };
    const ts = now ?? Date.now();

    // Track face presence for cheat detection
    if (faceVisible) state.lastFaceTs = ts;

    // Inactivity detection based on body/device angle changes
    if (typeof torsoInclinationDeg === 'number') {
      if (state.lastAngle == null) state.lastAngle = torsoInclinationDeg;
      const delta = Math.abs(torsoInclinationDeg - state.lastAngle);
      if (delta >= cfg.minDeltaToCount) state.lastMoveTs = ts;
      state.lastAngle = torsoInclinationDeg;

      // Phase transitions (down -> up -> down)
      if (torsoInclinationDeg >= cfg.upThreshold && state.phase === 'down') {
        state.phase = 'up';
      } else if (torsoInclinationDeg <= cfg.downThreshold && state.phase === 'up') {
        state.phase = 'down';
        state.count += 1; // Completed one sit-up
      }
    }

    // Cheat: no face visible for too long
    if (ts - state.lastFaceTs > cfg.maxNoFaceMs) {
      state.status = 'invalid';
      state.message = 'Face not visible';
      state.active = false;
      state.stoppedAt = ts;
      return { ...snapshot(ts) };
    }

    // Stop if inactivity window exceeded
    if (ts - state.lastMoveTs > cfg.maxNoMoveMs) {
      state.message = 'Inactive for too long';
      state.active = false;
      state.stoppedAt = ts;
      return { ...snapshot(ts) };
    }

    return { ...snapshot(ts) };
  }

  function stop(now) {
    if (!state.stoppedAt) state.stoppedAt = now ?? Date.now();
    state.active = false;
    return { ...snapshot(state.stoppedAt) };
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

  return { update, stop, snapshot };
}