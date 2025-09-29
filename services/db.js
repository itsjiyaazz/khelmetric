// Firestore save helper with safe fallback to local AsyncStorage.
// - If Firebase config is present and Firebase can initialize, writes to Firestore.
// - Otherwise falls back to local persistence via services/storage.js
//
// Note: To enable Firestore writes, install Firebase:
//   npm install firebase
// and populate services/firebaseConfig.js with valid credentials.

import { firebaseConfig } from './firebaseConfig';
import { saveResult as saveLocalResult } from './storage';

let _firebaseApp = null;
let _db = null;

async function ensureFirebase() {
  try {
    if (!firebaseConfig || !firebaseConfig.apiKey) return null;
    // Lazy import to avoid bundling firebase if unused
    const { initializeApp, getApps } = await import('firebase/app');
    if (!getApps().length) {
      _firebaseApp = initializeApp(firebaseConfig);
    }
    const { getFirestore } = await import('firebase/firestore');
    _db = getFirestore();
    return _db;
  } catch (e) {
    // Firebase not available or failed to init; fall back to local storage
    return null;
  }
}

export async function saveTestResult(result) {
  // Always write to local history for in-app UX
  await saveLocalResult({
    userId: result.userId || 'local',
    testType: result.test || 'situp',
    score: result.count,
    timestamp: Date.now(),
    status: result.status,
    durationMs: result.durationMs,
  });

  const db = await ensureFirebase();
  if (!db) return { ok: true, localOnly: true };

  try {
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    await addDoc(collection(db, 'testResults'), {
      ...result,
      createdAt: serverTimestamp(),
    });
    return { ok: true, localOnly: false };
  } catch (e) {
    // Ignore remote errors for demo resilience
    return { ok: false, error: String(e), localOnly: true };
  }
}