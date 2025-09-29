import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { FAB, Portal, Modal, Button, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '../services/storage';

export default function LanguageFab() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const langs = useMemo(() => ([
    { key: 'en', label: t('english') },
    { key: 'hi', label: t('hindi') },
    { key: 'kn', label: t('kannada') },
  ]), [t]);

  const change = async (lng) => {
    await setLanguage(lng);
    i18n.changeLanguage(lng);
    setOpen(false);
  };

  return (
    <Portal>
      <FAB icon="translate" onPress={() => setOpen(true)} style={{ position: 'absolute', right: 16, bottom: 24 }} />
      <Modal visible={open} onDismiss={() => setOpen(false)} contentContainerStyle={{ backgroundColor: 'white', margin: 16, borderRadius: 16, padding: 16 }}>
        <Text variant="titleMedium" style={{ fontWeight: '800', marginBottom: 12 }}>{t('selectLanguage')}</Text>
        {langs.map((l) => (
          <Button key={l.key} mode={i18n.language === l.key ? 'contained' : 'outlined'} onPress={() => change(l.key)} style={{ marginBottom: 8 }}>
            {l.label}
          </Button>
        ))}
        <Button onPress={() => setOpen(false)}>Close</Button>
      </Modal>
    </Portal>
  );
}


