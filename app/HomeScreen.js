import React from 'react';
import { View } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import LanguageFab from '../components/LanguageFab';

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  return (
    <LinearGradient colors={["#7c2d12", "#b45309"]} style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <Card style={{ borderRadius: 24, overflow: 'hidden' }}>
        <Card.Content>
          <Text variant="headlineLarge" style={{ fontWeight: '900', marginBottom: 16, color: '#FDE68A' }}>{t('homeTitle')}</Text>
          <View style={{ gap: 12 }}>
            <Button mode="contained" onPress={() => navigation.navigate('SitupTest')} buttonColor="#F59E0B" textColor="#111827">
              {t('situpTest')}
            </Button>
            <Button mode="contained-tonal" onPress={() => navigation.navigate('JumpTest')} buttonColor="#D97706" textColor="#111827">
              {t('jumpTest')}
            </Button>
            <Button mode="outlined" onPress={() => navigation.navigate('MyResults')} textColor="#FDE68A">
              {t('myResults')}
            </Button>
          </View>
        </Card.Content>
      </Card>
      <LanguageFab />
    </LinearGradient>
  );
}


