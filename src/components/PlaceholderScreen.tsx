import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';
import { Screen } from './Screen';

type PlaceholderScreenProps = {
  title: string;
  description: string;
  items?: readonly string[];
  note?: string;
};

export function PlaceholderScreen({
  title,
  description,
  items = [],
  note,
}: PlaceholderScreenProps) {
  return (
    <Screen title={title} description={description}>
      <StatusBar style="light" />
      {items.length > 0 ? (
        <View style={styles.list}>
          {items.map((item) => (
            <View key={item} style={styles.card}>
              <Text style={styles.cardText}>{item}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {note ? (
        <View style={styles.note}>
          <Text style={styles.noteText}>{note}</Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  cardText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  note: {
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  noteText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
});
