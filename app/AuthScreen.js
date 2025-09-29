import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Button, Text, TextInput, Card } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { isAuthedOrSkipped, setAuthedOrSkipped } from '../services/storage';

export default function AuthScreen({ navigation }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    (async () => {
      const authed = await isAuthedOrSkipped();
      if (authed) navigation.replace('Home');
    })();
  }, [navigation]);

  const complete = async () => {
    await setAuthedOrSkipped(true);
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  const skip = async () => {
    await setAuthedOrSkipped(true);
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16, backgroundColor: '#0f172a' }}>
      <Card style={{ borderRadius: 20 }}>
        <Card.Content>
          <Text variant="headlineLarge" style={{ fontWeight: '900', marginBottom: 4 }}>KhelMetric</Text>
          <Text style={{ marginBottom: 16, color: '#9CA3AF' }}>Welcome! Create an account or continue.</Text>
          <TextInput label={t('email')} value={email} onChangeText={setEmail} style={{ marginBottom: 8 }} autoCapitalize="none" />
          <TextInput label={t('password')} value={password} onChangeText={setPassword} secureTextEntry style={{ marginBottom: 16 }} />
          <Button mode="contained" onPress={complete} style={{ marginBottom: 8 }} buttonColor="#F59E0B" textColor="#111827">{t('signup')}</Button>
          <Button mode="contained-tonal" onPress={complete} style={{ marginBottom: 8 }} buttonColor="#D97706" textColor="#111827">{t('login')}</Button>
          <Button onPress={skip}>{t('skipLogin')}</Button>
        </Card.Content>
      </Card>
    </View>
  );
}


