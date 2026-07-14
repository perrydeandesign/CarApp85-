import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '../ui/Icon';
import { T } from '../constants/theme';

type Props = {
  /** Currently selected date (or null). */
  value: Date | null;
  onChange: (d: Date) => void;
  /** yyyy-mm-dd strings to mark with a dot (e.g. days with events). */
  marked?: Set<string>;
  /** Initial visible month (defaults to value or today-ish via `initialMonth`). */
  initialMonth?: Date;
};

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function key(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Dependency-free month grid — date selection + event-day dots. */
export function MonthCalendar({ value, onChange, marked, initialMonth }: Props) {
  const base = initialMonth ?? value ?? new Date(2026, 6, 1);
  const [view, setView] = useState({ y: base.getFullYear(), m: base.getMonth() });

  const firstDay = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const shift = (delta: number) => {
    const m = view.m + delta;
    setView({ y: view.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 });
  };

  const selKey = value ? key(value.getFullYear(), value.getMonth(), value.getDate()) : null;

  return (
    <View style={{ backgroundColor: T.card, borderRadius: 14, borderWidth: 1, borderColor: T.bd, padding: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <TouchableOpacity onPress={() => shift(-1)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="chevron-back" size="sm" color={T.tx} />
        </TouchableOpacity>
        <Text style={{ color: T.tx, fontWeight: '700', fontSize: 15 }}>
          {MONTHS[view.m]} {view.y}
        </Text>
        <TouchableOpacity onPress={() => shift(1)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="chevron-forward" size="sm" color={T.tx} />
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row' }}>
        {WEEKDAYS.map((w, i) => (
          <Text key={i} style={{ flex: 1, textAlign: 'center', color: T.mu, fontSize: 11, fontWeight: '700' }}>
            {w}
          </Text>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
        {cells.map((d, i) => {
          if (d === null) return <View key={i} style={{ width: `${100 / 7}%`, height: 40 }} />;
          const k = key(view.y, view.m, d);
          const selected = k === selKey;
          const isMarked = marked?.has(k);
          return (
            <TouchableOpacity
              key={i}
              onPress={() => onChange(new Date(view.y, view.m, d))}
              style={{ width: `${100 / 7}%`, height: 40, alignItems: 'center', justifyContent: 'center' }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: selected ? T.accent : 'transparent',
                }}
              >
                <Text style={{ color: selected ? '#fff' : T.tx, fontSize: 14, fontWeight: selected ? '700' : '500' }}>
                  {d}
                </Text>
              </View>
              {isMarked && !selected ? (
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: T.accent, marginTop: 1 }} />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
