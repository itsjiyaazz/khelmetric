import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { CommonActions } from '@react-navigation/native';
import { Button, Text, Card } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import LanguageFab from '../components/LanguageFab';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createSitupPoseCounter } from '../services/ml/situpPoseCounter';
import { saveTestResult } from '../services/db';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as tf from '@tensorflow/tfjs';
import * as base64js from 'base64-js';

export default function SitupTest({ navigation }) {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('valid');
  const [active, setActive] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [displayAngle, setDisplayAngle] = useState('–');
  const [displayScore, setDisplayScore] = useState('–');
  const [displayPhase, setDisplayPhase] = useState('–');
  const insets = useSafeAreaInsets();

  const cameraRef = useRef(null);
  const counterRef = useRef(createSitupPoseCounter());
  const processingRef = useRef(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission, requestPermission]);

  // Initialize TF + detector once
  useEffect(() => {
    (async () => {
      await counterRef.current.ensureReady();
    })();
  }, []);

  // Capture loop: take low-res stills and run BlazePose
  useEffect(() => {
    if (!active) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(async () => {
      if (!cameraRef.current || processingRef.current) return;
      processingRef.current = true;
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.2, base64: true, skipProcessing: true });
        if (photo?.base64) {
          const bytes = base64js.toByteArray(photo.base64);
          const imageTensor = decodeJpeg(bytes, 3); // Uint8 [H,W,3]
          const snap = await counterRef.current.processImageTensor(imageTensor, Date.now());
          imageTensor.dispose && imageTensor.dispose();
          setCount(snap.count);
          // Show live debug info to verify pose and angle (always visible in dedicated overlay)
          const angleTxt = Number.isFinite(snap?.debug?.lastAngle) ? snap.debug.lastAngle.toFixed(1) : '–';
          const scoreTxt = Number.isFinite(snap?.debug?.lastPoseScore) ? snap.debug.lastPoseScore.toFixed(2) : '–';
          setDisplayAngle(angleTxt);
          setDisplayScore(scoreTxt);
          setDisplayPhase(snap?.phase || '–');
          // Keep message for human-readable status only (do not override with angle text)
          setMessage(snap.message || '');
          if (!snap.active) {
            setActive(false);
            setStatus(snap.status);
          }
        }
      } catch (e) {
        // Swallow errors to keep demo resilient
      } finally {
        processingRef.current = false;
      }
    }, 350); // faster sampling (~3 fps) to catch transitions better

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, t]);

  // Finishing flag no longer needed due to hard reset navigation
  useEffect(() => {}, []);

  // Finish & persist
  const finish = async () => {
    // Stop processing immediately
    setActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    processingRef.current = false;

    const snap = counterRef.current.snapshot();
    const result = {
      test: 'sit-up',
      count: snap.count,
      status: snap.status,
      duration: `${Math.max(1, Math.round(snap.durationMs / 1000))}s`,
      durationMs: snap.durationMs,
      startedAt: snap.startedAt,
      finishedAt: Date.now(),
    };

    // Fire-and-forget save
    try { saveTestResult(result); } catch {}

    // Multi-tiered navigation to guarantee transition on all devices
    try {
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: 'Home' },
            { name: 'Result', params: { count: snap.count } },
          ],
        })
      );
    } catch (_) {}

    // Secondary fallback shortly after
    setTimeout(() => {
      try { navigation.replace('Result', { count: snap.count }); } catch (_) {}
    }, 120);

    // Final fallback in case both above were ignored
    setTimeout(() => {
      try { navigation.navigate('Result', { count: snap.count }); } catch (_) {}
    }, 400);
  };

  if (!permission?.granted) return null;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }} pointerEvents="none">
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing="front"
          enableTorch={false}
          mirror={true}
        />
      </View>
      {/* High-contrast angle/score overlay at top for visibility */}
      <View style={{ position: 'absolute', top: Math.max(insets.top, 8), left: 8, right: 8, alignItems: 'center', zIndex: 30 }} pointerEvents="none">
        <View style={{ backgroundColor: 'rgba(0,0,0,0.85)', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: '#FFFFFF99' }}>
          <Text style={{
            color: '#ffffff',
            fontSize: 20,
            fontWeight: '900',
            letterSpacing: 0.4,
            textShadowColor: 'rgba(0,0,0,0.9)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 5,
          }}>{`${displayPhase} • angle ${displayAngle}°, score ${displayScore}`}</Text>
        </View>
      </View>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: Math.max(insets.bottom, 12), zIndex: 20, paddingHorizontal: 8 }} pointerEvents="auto">
        <Card style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
          <Card.Content>
            <Text variant="headlineMedium" style={{ fontWeight: '800', color: '#FDE68A' }}>{count}</Text>
            {message ? (
              <Text style={{
                color: status === 'invalid' ? '#ff6b6b' : '#ffffff',
                marginTop: 6,
                fontWeight: '900',
                fontSize: 18,
                letterSpacing: 0.3,
                backgroundColor: 'rgba(0,0,0,0.7)',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 10,
                overflow: 'hidden',
                textShadowColor: 'rgba(0,0,0,0.85)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 5,
              }}>{message}</Text>
            ) : null}
            <Button mode="contained" onPress={finish} style={{ marginTop: 12, height: 52, justifyContent: 'center' }} buttonColor="#F59E0B" textColor="#111827">{t('finishTest')}</Button>
          </Card.Content>
        </Card>
      </View>
      <LanguageFab />
    </View>
  );
}


