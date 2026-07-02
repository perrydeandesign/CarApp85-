import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { SubPage } from '../../components/SubPage';
import { Icon } from '../../ui/Icon';
import { T } from '../../constants/theme';
import { useEvents, CarEvent, EventRSVP } from '../../hooks/useEvents';

export type EventsRoute = 'list' | 'detail' | 'create';

function fmtDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}
function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------------------
// LIST
// ---------------------------------------------------------------------------
export function EventsList({
  ev,
  onOpen,
  onCreate,
  onBack,
}: {
  ev: ReturnType<typeof useEvents>;
  onOpen: (e: CarEvent) => void;
  onCreate: () => void;
  onBack: () => void;
}) {
  return (
    <SubPage title="Events" onBack={onBack}>
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          onPress={onCreate}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            margin: 14,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: T.accent,
          }}
        >
          <Icon name="add" size="sm" color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Host an event</Text>
        </TouchableOpacity>

        {ev.loading ? (
          <ActivityIndicator color={T.accent} style={{ marginTop: 30 }} />
        ) : ev.error ? (
          <Text style={{ color: T.mu, textAlign: 'center', marginTop: 30 }}>{ev.error}</Text>
        ) : ev.events.length === 0 ? (
          <Text style={{ color: T.mu, textAlign: 'center', marginTop: 30 }}>
            No upcoming events. Host the first one!
          </Text>
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            {ev.events.map((e) => (
              <TouchableOpacity
                key={e.id}
                onPress={() => onOpen(e)}
                style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}
              >
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 10,
                    backgroundColor: T.card2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                  }}
                >
                  <Text style={{ color: T.accent, fontSize: 11, fontWeight: '700' }}>
                    {fmtDate(e.startsAt).split(' ')[0].toUpperCase()}
                  </Text>
                  <Text style={{ color: T.tx, fontSize: 18, fontWeight: '800' }}>
                    {new Date(e.startsAt).getDate()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: T.tx, fontSize: 15, fontWeight: '700' }} numberOfLines={1}>
                    {e.title}
                  </Text>
                  <Text style={{ color: T.mu, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                    {fmtTime(e.startsAt)}
                    {e.locationText ? ` · ${e.locationText}` : ''} · {e.attendeeCount} going
                  </Text>
                </View>
                {e.myStatus ? (
                  <View style={{ backgroundColor: T.accentDim, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ color: T.accent, fontSize: 11, fontWeight: '700' }}>{e.myStatus}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </SubPage>
  );
}

// ---------------------------------------------------------------------------
// DETAIL
// ---------------------------------------------------------------------------
export function EventDetail({
  event,
  onRSVP,
  onBack,
}: {
  event: CarEvent;
  onRSVP: (id: string, status: EventRSVP | null) => void;
  onBack: () => void;
}) {
  const [status, setStatus] = useState<EventRSVP | null>(event.myStatus);
  const set = (s: EventRSVP) => {
    const next = status === s ? null : s;
    setStatus(next);
    onRSVP(event.id, next);
  };

  const Btn = ({ s, label, icon }: { s: EventRSVP; label: string; icon: string }) => {
    const active = status === s;
    return (
      <TouchableOpacity
        onPress={() => set(s)}
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 6,
          paddingVertical: 12,
          borderRadius: 12,
          backgroundColor: active ? T.accent : T.card2,
        }}
      >
        <Icon name={icon} size="sm" color={active ? '#fff' : T.tx} />
        <Text style={{ color: active ? '#fff' : T.tx, fontWeight: '700' }}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SubPage title="Event" onBack={onBack}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
        <Text style={{ color: T.tx, fontSize: 22, fontWeight: '800' }}>{event.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
          <Icon name="calendar-outline" size="sm" color={T.accent} />
          <Text style={{ color: T.tx2, fontSize: 14 }}>
            {fmtDate(event.startsAt)} · {fmtTime(event.startsAt)}
          </Text>
        </View>
        {event.locationText ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <Icon name="location-outline" size="sm" color={T.accent} />
            <Text style={{ color: T.tx2, fontSize: 14 }}>{event.locationText}</Text>
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <Icon name="people-outline" size="sm" color={T.accent} />
          <Text style={{ color: T.tx2, fontSize: 14 }}>{event.attendeeCount} going</Text>
        </View>

        {event.description ? (
          <Text style={{ color: T.tx2, fontSize: 14, lineHeight: 21, marginTop: 16 }}>{event.description}</Text>
        ) : null}

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
          <Btn s="going" label="Going" icon="checkmark-circle-outline" />
          <Btn s="interested" label="Interested" icon="star-outline" />
        </View>
      </ScrollView>
    </SubPage>
  );
}

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------
export function CreateEvent({
  onCreate,
  onBack,
}: {
  onCreate: (input: { title: string; description?: string; locationText?: string; startsAt: string }) => Promise<void>;
  onBack: () => void;
}) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(''); // YYYY-MM-DD
  const [time, setTime] = useState('18:00'); // HH:MM
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!title.trim()) {
      Alert.alert('Add a title', 'Your event needs a name.');
      return;
    }
    const iso = new Date(`${date}T${time || '00:00'}:00`).toISOString();
    if (!date || Number.isNaN(new Date(iso).getTime())) {
      Alert.alert('Add a valid date', 'Use the format YYYY-MM-DD.');
      return;
    }
    setSaving(true);
    try {
      await onCreate({ title, description, locationText: location, startsAt: iso });
      onBack();
    } catch (e: any) {
      Alert.alert('Could not create event', e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, value: string, set: (t: string) => void, ph: string, opts?: { multiline?: boolean }) => (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: T.mu, fontSize: 12, fontWeight: '700', marginBottom: 6, marginLeft: 4 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={set}
        placeholder={ph}
        placeholderTextColor={T.mu}
        multiline={opts?.multiline}
        style={{
          color: T.tx,
          backgroundColor: T.card,
          borderWidth: 1,
          borderColor: T.bd,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 15,
          minHeight: opts?.multiline ? 80 : undefined,
          textAlignVertical: opts?.multiline ? 'top' : 'center',
        }}
      />
    </View>
  );

  return (
    <SubPage title="Host an event" onBack={onBack}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {field('Title', title, setTitle, 'Sunday Cars & Coffee')}
        {field('Date (YYYY-MM-DD)', date, setDate, '2026-07-15')}
        {field('Time (HH:MM)', time, setTime, '18:00')}
        {field('Location', location, setLocation, 'Where is it?')}
        {field('Description', description, setDescription, 'Details, rules, what to bring…', { multiline: true })}

        <TouchableOpacity
          onPress={submit}
          disabled={saving}
          style={{
            backgroundColor: T.accent,
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: 'center',
            marginTop: 6,
            opacity: saving ? 0.6 : 1,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>{saving ? 'Creating…' : 'Create event'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SubPage>
  );
}
