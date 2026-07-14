import React, { useState } from 'react';
import { View } from 'react-native';
import { T } from '../../constants/theme';
import { useEvents, CarEvent } from '../../hooks/useEvents';
import { EventsList, EventDetail, CreateEvent } from './EventsScreens';

/**
 * Self-contained Events surface (list / detail / create). State-based routing
 * (mirrors SettingsRoot) so it plugs into MainNavigator without touching the
 * existing navigators. `onClose` returns to the app home. `initialCreate`
 * opens straight to the create form (used by the "+" hub).
 */
export function EventsRoot({ onClose, initialCreate }: { onClose: () => void; initialCreate?: boolean }) {
  const ev = useEvents();
  const [route, setRoute] = useState<'list' | 'detail' | 'create' | 'edit'>(initialCreate ? 'create' : 'list');
  const [selected, setSelected] = useState<CarEvent | null>(null);

  const render = () => {
    if (route === 'create') {
      return (
        <CreateEvent
          onCreate={async (input) => {
            await ev.createEvent(input);
          }}
          onBack={() => setRoute('list')}
        />
      );
    }
    if (route === 'edit' && selected) {
      return (
        <CreateEvent
          initial={selected}
          onCreate={async (input) => {
            await ev.updateEvent(selected.id, input);
          }}
          onBack={() => setRoute('list')}
        />
      );
    }
    if (route === 'detail' && selected) {
      return (
        <EventDetail
          event={selected}
          isHost={!!ev.uid && selected.hostId === ev.uid}
          onRSVP={ev.rsvp}
          onEdit={() => setRoute('edit')}
          onDelete={async () => {
            await ev.deleteEvent(selected.id);
            setRoute('list');
          }}
          onBack={() => setRoute('list')}
        />
      );
    }
    return (
      <EventsList
        ev={ev}
        onOpen={(e) => {
          setSelected(e);
          setRoute('detail');
        }}
        onCreate={() => setRoute('create')}
        onBack={onClose}
      />
    );
  };

  return <View style={{ flex: 1, backgroundColor: T.bg }}>{render()}</View>;
}
