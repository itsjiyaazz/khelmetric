import React from 'react';
import { View } from 'react-native';
import { Button, Text, Card, Chip } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { getBadgeForScore } from '../services/storage';
import LanguageFab from '../components/LanguageFab';

export default function ResultScreen({ route, navigation }) {
  const { t } = useTranslation();
  const count = route?.params?.count ?? 0;
  const badge = getBadgeForScore(count);

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16, backgroundColor: '#0f172a' }}>
      <Card style={{ borderRadius: 20 }}>
        <Card.Content>
          <Text variant="headlineLarge" style={{ fontWeight: '900', marginBottom: 8 }}>{t('youDidXSitups', { count })}</Text>
          <Chip icon={badge.emoji} style={{ alignSelf: 'flex-start', marginBottom: 12 }} selectedColor={badge.color}>
            {badge.label}
          </Chip>
          <Button mode="contained" onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}>{t('goHome')}</Button>
        </Card.Content>
      </Card>
      <LanguageFab />
    </View>
  );
}


