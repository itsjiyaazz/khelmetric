import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { CameraView } from 'expo-camera';
import { Accelerometer } from 'expo-sensors';
import { useTranslation } from 'react-i18next';
import { saveResult } from '../services/storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function JumpTest({ navigation }) {
  const { t } = useTranslation();
  const [peak, setPeak] = useState(0);
  const [active, setActive] = useState(true);
  const lastTs = useRef(Date.now());
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Accelerometer.setUpdateInterval(50);
    const sub = Accelerometer.addListener(({ z }) => {
      if (!active) return;
      const g = Math.abs(z);
      if (g > peak) setPeak(g);
      if (Date.now() - lastTs.current > 5000) setActive(false);
    });
    return () => sub && sub.remove();
  }, [active, peak]);

  const finish = async () => {
    const score = Math.round((peak - 1) * 30); // rough height estimate
    await saveResult({ userId: 'local', testType: 'jump', score, timestamp: Date.now() });
    navigation.reset({ index: 0, routes: [{ name: 'Result', params: { count: score } }] });
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraView style={{ flex: 1 }} facing="front">
        <View pointerEvents="none" style={{ flex: 1 }} />
      </CameraView>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: Math.max(insets.bottom, 12) }}>
        <Card style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
          <Card.Content>
            <Text variant="headlineMedium" style={{ fontWeight: '800', color: '#FDE68A' }}>{t('jumpTest')}</Text>
            <Text style={{ marginTop: 8, color: '#E5E7EB' }}>Peak g: {peak.toFixed(2)}</Text>
            <Button mode="contained" onPress={finish} style={{ marginTop: 12, height: 52, justifyContent: 'center' }} buttonColor="#F59E0B" textColor="#111827">{t('finishTest')}</Button>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}


