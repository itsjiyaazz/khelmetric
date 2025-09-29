import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Accelerometer } from 'expo-sensors';
import { Button, Text, Card } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { saveResult } from '../services/storage';
import LanguageFab from '../components/LanguageFab';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SitupTest({ navigation }) {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('');
  const [active, setActive] = useState(true);
  const insets = useSafeAreaInsets();
  const lastMoveTs = useRef(Date.now());
  const stateRef = useRef('down'); // 'down' -> 'up' detection
  const tiltAwayRef = useRef(0);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission, requestPermission]);

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      if (!active) return;
      const now = Date.now();
      // simple sit-up heuristic using z-axis changes
      if (z > 0.6 && stateRef.current === 'down') {
        stateRef.current = 'up';
        lastMoveTs.current = now;
      } else if (z < 0.1 && stateRef.current === 'up') {
        stateRef.current = 'down';
        setCount((c) => c + 1);
        lastMoveTs.current = now;
      }
      // inactivity
      if (now - lastMoveTs.current > 5000) {
        setMessage(t('incompleteAttempt'));
        setActive(false);
      }
      // cheat-ish detection: device tilted away from face for >2s
      const tilt = Math.abs(y) > 0.8; // portrait phone turned sideways/down
      if (tilt) {
        tiltAwayRef.current += 1;
      } else {
        tiltAwayRef.current = 0;
      }
      if (tiltAwayRef.current > 20) { // ~2s at 100ms interval
        setMessage(t('invalidAttempt'));
        setActive(false);
      }
    });
    return () => sub && sub.remove();
  }, [active, t]);

  const finish = async () => {
    const result = {
      userId: 'local',
      testType: 'situp',
      score: count,
      timestamp: Date.now(),
    };
    await saveResult(result);
    navigation.replace('Result', { count });
  };

  if (!permission?.granted) return null;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }} pointerEvents="none">
        <CameraView style={{ flex: 1 }} facing="front" enableTorch={false} mirror={true} />
      </View>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: Math.max(insets.bottom, 12), zIndex: 20, paddingHorizontal: 8 }} pointerEvents="auto">
        <Card style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
          <Card.Content>
            <Text variant="headlineMedium" style={{ fontWeight: '800', color: '#FDE68A' }}>{count}</Text>
            {message ? <Text style={{ color: '#ef4444', marginTop: 4 }}>{message}</Text> : null}
            <Button mode="contained" onPress={finish} style={{ marginTop: 12, height: 52, justifyContent: 'center' }} buttonColor="#F59E0B" textColor="#111827">{t('finishTest')}</Button>
          </Card.Content>
        </Card>
      </View>
      <LanguageFab />
    </View>
  );
}


