import React, { useEffect, useState, useMemo } from 'react';
import { View, FlatList } from 'react-native';
import { Text, Card, DataTable, Chip } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { loadResults, getBadgeForScore } from '../services/storage';
import LanguageFab from '../components/LanguageFab';

export default function MyResults() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      const data = await loadResults();
      setItems(data);
    })();
  }, []);

  const leaderboard = useMemo(() => {
    return [...items].sort((a, b) => b.score - a.score).slice(0, 5);
  }, [items]);

  if (!items.length) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
        <Text style={{ textAlign: 'center' }}>{t('noResults')}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Card style={{ borderRadius: 16, marginBottom: 12 }}>
        <Card.Title title={t('myResults')} />
        <Card.Content>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Type</DataTable.Title>
              <DataTable.Title numeric>Score</DataTable.Title>
              <DataTable.Title>Badge</DataTable.Title>
              <DataTable.Title>When</DataTable.Title>
            </DataTable.Header>
            {items.map((r, idx) => {
              const badge = getBadgeForScore(r.score);
              const when = new Date(r.timestamp).toLocaleString();
              return (
                <DataTable.Row key={idx}>
                  <DataTable.Cell>{r.testType}</DataTable.Cell>
                  <DataTable.Cell numeric>{r.score}</DataTable.Cell>
                  <DataTable.Cell><Chip icon={badge.emoji}>{badge.label}</Chip></DataTable.Cell>
                  <DataTable.Cell>{when}</DataTable.Cell>
                </DataTable.Row>
              );
            })}
          </DataTable>
        </Card.Content>
      </Card>

      <Card style={{ borderRadius: 16 }}>
        <Card.Title title={t('leaderboard')} />
        <Card.Content>
          {leaderboard.map((r, i) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
              <Text>#{i + 1}</Text>
              <Text>{r.testType}</Text>
              <Text>{r.score}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>
      <LanguageFab />
    </View>
  );
}


