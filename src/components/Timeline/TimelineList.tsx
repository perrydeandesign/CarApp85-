import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T } from '../../constants/theme';
import { TimelineItem } from './TimelineItem';
import type { TimelineEntry } from '../../hooks/useTimeline';

type Props = {
  entries: TimelineEntry[];
  emptyText?: string;
  canDelete?: boolean;
  onDelete?: (id: string) => void;
};

export function TimelineList({
  entries,
  emptyText = 'No timeline entries yet',
  canDelete,
  onDelete,
}: Props) {
  if (entries.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="calendar-outline" size={32} color="#333" />
        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <View>
      {entries.map((entry, i) => (
        <TimelineItem
          key={entry.id}
          entry={entry}
          isFirst={i === 0}
          isLast={i === entries.length - 1}
          canDelete={canDelete}
          onLongPress={
            canDelete && onDelete
              ? () => {
                  Alert.alert(
                    'Delete entry',
                    `Remove "${entry.title}" from your timeline?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => onDelete(entry.id),
                      },
                    ],
                  );
                }
              : undefined
          }
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: T.mu,
    fontSize: 13,
    marginTop: 8,
  },
});
