import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
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
          // Show live debug info to verify pose and angle
          const angleTxt = Number.isFinite(snap?.debug?.lastAngle) ? snap.debug.lastAngle.toFixed(1) : '–';
          const scoreTxt = Number.isFinite(snap?.debug?.lastPoseScore) ? snap.debug.lastPoseScore.toFixed(2) : '–';
          setMessage(snap.message || `angle ${angleTxt}°, score ${scoreTxt}`);
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
    }, 350); // ~3 fps; adjust for device performance

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, t]);

  // Finish & persist
  const finish = async () => {
    const snap = counterRef.current.snapshot();
    const result = {
      test: 'sit-up',
      count: snap.count,
      status: snap.status,
      duration: `${Math.max(1, Math.round(snap.durationMs / 1000))}s`,
      durationMs: snap.durationMs,
      startedAt: snap.startedAt,
    };
    await saveTestResult(result);
    navigation.replace('Result', { count: snap.count });
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
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: Math.max(insets.bottom, 12), zIndex: 20, paddingHorizontal: 8 }} pointerEvents="auto">
        <Card style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
          <Card.Content>
            <Text variant="headlineMedium" style={{ fontWeight: '800', color: '#FDE68A' }}>{count}</Text>
            {message ? <Text style={{ color: status === 'invalid' ? '#ef4444' : '#E5E7EB', marginTop: 4 }}>{message}</Text> : null}
            <Button mode="contained" onPress={finish} style={{ marginTop: 12, height: 52, justifyContent: 'center' }} buttonColor="#F59E0B" textColor="#111827">{t('finishTest')}</Button>
          </Card.Content>
        </Card>
      </View>
      <LanguageFab />
    </View>
  );
}


