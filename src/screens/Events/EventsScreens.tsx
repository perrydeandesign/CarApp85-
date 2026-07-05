import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Image,
  Share,
} from 'react-native';
import { SubPage } from '../../components/SubPage';
import { Icon } from '../../ui/Icon';
import { MonthCalendar } from '../../components/MonthCalendar';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ErrorState } from '../../components/ErrorState';
import { pickAndUploadImage, isImagePickerAvailable } from '../../lib/imagePicker';
import { T } from '../../constants/theme';
import { useEvents, CarEvent, EventRSVP } from '../../hooks/useEvents';

export type EventsRoute = 'list' | 'detail' | 'create';

function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function dateToKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

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
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const marked = new Set(ev.events.map((e) => dayKey(e.startsAt)));
  const filtered = selectedDay
    ? ev.events.filter((e) => dayKey(e.startsAt) === dateToKey(selectedDay))
    : ev.events;

  return (
    <SubPage title="Events" onBack={onBack}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ padding: 14, paddingBottom: 4 }}>
          <MonthCalendar value={selectedDay} onChange={setSelectedDay} marked={marked} />
          {selectedDay ? (
            <TouchableOpacity onPress={() => setSelectedDay(null)} style={{ alignSelf: 'flex-end', paddingVertical: 8 }}>
              <Text style={{ color: T.accent, fontSize: 13, fontWeight: '600' }}>Show all upcoming</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <PrimaryButton
          label="Host an event"
          onPress={onCreate}
          icon={<Icon name="add" size="sm" color={T.onAccent} />}
          style={{ margin: 14 }}
        />

        {ev.loading ? (
          <ActivityIndicator color={T.accent} style={{ marginTop: 30 }} />
        ) : ev.error ? (
          <ErrorState message={ev.error} onRetry={ev.refresh} />
        ) : filtered.length === 0 ? (
          <Text style={{ color: T.mu, textAlign: 'center', marginTop: 30 }}>
            {selectedDay ? 'No events on this day.' : 'No upcoming events. Host the first one!'}
          </Text>
        ) : (
          <View>
            {filtered.map((e) => (
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
          </View>
        )}
      </ScrollView>
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
        {event.coverUrl ? (
          <Image
            source={{ uri: event.coverUrl }}
            style={{ width: '100%', height: 180, borderRadius: 12, marginBottom: 14, backgroundColor: T.card2 }}
          />
        ) : null}
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

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={async () => {
            try {
              await Share.share({
                message: `${event.title} on MODIFIED — ${fmtDate(event.startsAt)} · ${fmtTime(event.startsAt)}${event.locationText ? ` · ${event.locationText}` : ''}`,
                url: `https://modified.app/events/${event.id}`,
              });
            } catch (_) {}
          }}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12, paddingVertical: 13, borderRadius: 12, borderWidth: 1, borderColor: T.bd }}
        >
          <Icon name="share-outline" size="sm" color={T.tx} />
          <Text style={{ color: T.tx, fontWeight: '700', fontSize: 14 }}>Share event</Text>
        </TouchableOpacity>
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
  onCreate: (input: {
    title: string;
    description?: string;
    locationText?: string;
    coverUrl?: string;
    startsAt: string;
  }) => Promise<void>;
  onBack: () => void;
}) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [dateObj, setDateObj] = useState<Date | null>(null);
  const [hour, setHour] = useState(18);
  const [minute, setMinute] = useState(0);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!title.trim()) {
      Alert.alert('Add a title', 'Your event needs a name.');
      return;
    }
    if (!dateObj) {
      Alert.alert('Pick a date', 'Choose a day for your event.');
      return;
    }
    const start = new Date(dateObj);
    start.setHours(hour, minute, 0, 0);
    setSaving(true);
    try {
      await onCreate({
        title,
        // Notes are optional; fold them into the description so they persist
        // without a schema change and render on the event detail.
        description: [description.trim(), notes.trim() ? `Notes: ${notes.trim()}` : '']
          .filter(Boolean)
          .join('\n\n'),
        locationText: location,
        coverUrl,
        startsAt: start.toISOString(),
      });
      onBack();
    } catch (e: any) {
      Alert.alert('Could not create event', e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  };

  const pickCover = async () => {
    if (!isImagePickerAvailable()) {
      Alert.alert('Photo library not enabled', 'Paste an image URL for now, or enable the photo picker (npm i react-native-image-picker + pod install).');
      return;
    }
    const uploaded = await pickAndUploadImage('events');
    if (uploaded) setCoverUrl(uploaded);
  };

  const bump = (unit: 'h' | 'm', dir: 1 | -1) => {
    if (unit === 'h') setHour((h) => (h + dir + 24) % 24);
    else setMinute((m) => (m + dir * 15 + 60) % 60);
  };
  const pad = (n: number) => String(n).padStart(2, '0');

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

        <Text style={{ color: T.mu, fontSize: 12, fontWeight: '700', marginBottom: 6, marginLeft: 4 }}>Date</Text>
        <View style={{ marginBottom: 14 }}>
          <MonthCalendar value={dateObj} onChange={setDateObj} />
        </View>

        <Text style={{ color: T.mu, fontSize: 12, fontWeight: '700', marginBottom: 6, marginLeft: 4 }}>Start time</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
            backgroundColor: T.card,
            borderWidth: 1,
            borderColor: T.bd,
            borderRadius: 12,
            paddingVertical: 12,
            marginBottom: 14,
          }}
        >
          {(['h', 'm'] as const).map((unit) => (
            <View key={unit} style={{ alignItems: 'center' }}>
              <TouchableOpacity onPress={() => bump(unit, 1)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="chevron-up" size="sm" color={T.mu} />
              </TouchableOpacity>
              <Text style={{ color: T.tx, fontSize: 26, fontWeight: '800', width: 44, textAlign: 'center' }}>
                {unit === 'h' ? pad(hour) : pad(minute)}
              </Text>
              <TouchableOpacity onPress={() => bump(unit, -1)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="chevron-down" size="sm" color={T.mu} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {field('Location', location, setLocation, 'Where is it?')}
        {field('Cover image URL (optional)', coverUrl, setCoverUrl, 'https://…')}
        <TouchableOpacity
          onPress={pickCover}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: -6, marginBottom: 14, marginLeft: 4 }}
        >
          <Icon name="image-outline" size="sm" color={T.accent} />
          <Text style={{ color: T.accent, fontSize: 13, fontWeight: '600' }}>Choose from library</Text>
        </TouchableOpacity>
        {field('Description', description, setDescription, 'What the event is about…', { multiline: true })}
        {field('Notes (optional)', notes, setNotes, 'Requirements, entry fee, what to bring…', { multiline: true })}

        <PrimaryButton label="Create event" onPress={submit} loading={saving} style={{ marginTop: 6 }} />
      </ScrollView>
    </SubPage>
  );
}
