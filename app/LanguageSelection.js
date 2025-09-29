import React from 'react';
import { View } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '../services/storage';

export default function LanguageSelection({ navigation }) {
  const { t, i18n } = useTranslation();

  const select = async (lang) => {
    await setLanguage(lang);
    i18n.changeLanguage(lang);
    navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16, backgroundColor: '#0f172a' }}>
      <Card style={{ borderRadius: 20 }}>
        <Card.Content>
          <Text variant="headlineMedium" style={{ fontWeight: '800', marginBottom: 16 }}>
            {t('selectLanguage')}
          </Text>
          <Button mode="contained" onPress={() => select('en')} style={{ marginBottom: 8 }}>
            {t('english')}
          </Button>
          <Button mode="contained" onPress={() => select('hi')} style={{ marginBottom: 8 }}>
            {t('hindi')}
          </Button>
          <Button mode="contained" onPress={() => select('kn')}>
            {t('kannada')}
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}


