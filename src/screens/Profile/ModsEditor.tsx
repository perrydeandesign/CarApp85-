import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { T } from '../../constants/theme';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useCarMods, type ModRow } from '../../hooks/useProfileData';
import { useCarModsMutations, type ModCategory } from '../../hooks/useCarModsMutations';

const CATEGORIES: { key: ModCategory; label: string }[] = [
  { key: 'engine', label: 'Engine' },
  { key: 'wheels', label: 'Wheels' },
  { key: 'interior', label: 'Interior' },
  { key: 'exterior', label: 'Exterior' },
];

/**
 * Per-car build editor: add / rename / delete modifications, grouped by
 * category. Each action persists to Supabase immediately (optimistic local
 * state). `onClose` fires after edits so the parent can refresh the build.
 */
export function ModsEditor({
  carId,
  carName,
  visible,
  onClose,
}: {
  carId: string;
  carName: string;
  visible: boolean;
  onClose: (changed: boolean) => void;
}) {
  const { data, loading } = useCarMods(visible ? carId : null);
  const { addMod, updateMod, deleteMod } = useCarModsMutations(carId);

  const [mods, setMods] = useState<ModRow[]>([]);
  const [changed, setChanged] = useState(false);
  const [addingCat, setAddingCat] = useState<ModCategory | null>(null);
  const [draftName, setDraftName] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data) setMods(data);
  }, [data]);

  const byCategory = useMemo(() => {
    const out: Record<ModCategory, ModRow[]> = { engine: [], wheels: [], interior: [], exterior: [] };
    for (const m of mods) out[m.category]?.push(m);
    return out;
  }, [mods]);

  const commitAdd = async (category: ModCategory) => {
    const name = draftName.trim();
    if (!name) {
      setAddingCat(null);
      setDraftName('');
      return;
    }
    setBusy(true);
    try {
      const created = await addMod(category, name);
      if (created) {
        setMods((prev) => [...prev, created]);
        setChanged(true);
      }
    } catch (e: any) {
      Alert.alert('Could not add modification', e?.message ?? String(e));
    } finally {
      setBusy(false);
      setAddingCat(null);
      setDraftName('');
    }
  };

  const commitRename = async (mod: ModRow, next: string) => {
    const name = next.trim();
    if (!name || name === mod.name) return;
    setMods((prev) => prev.map((m) => (m.id === mod.id ? { ...m, name } : m)));
    setChanged(true);
    try {
      await updateMod(mod.id, { name });
    } catch (e: any) {
      // revert on failure
      setMods((prev) => prev.map((m) => (m.id === mod.id ? { ...m, name: mod.name } : m)));
      Alert.alert('Could not save', e?.message ?? String(e));
    }
  };

  const confirmDelete = (mod: ModRow) => {
    Alert.alert('Remove modification?', `"${mod.name}" will be removed from this build.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const prev = mods;
          setMods((p) => p.filter((m) => m.id !== mod.id));
          setChanged(true);
          try {
            await deleteMod(mod.id);
          } catch (e: any) {
            setMods(prev); // revert
            Alert.alert('Could not remove', e?.message ?? String(e));
          }
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={() => onClose(changed)}>
      <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: T.bd,
          }}
        >
          <TouchableOpacity onPress={() => onClose(changed)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-back" size={26} color={T.wh} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={{ color: T.wh, fontSize: 17, fontWeight: '800' }}>Edit build</Text>
            <Text style={{ color: T.mu, fontSize: 12 }} numberOfLines={1}>
              {carName}
            </Text>
          </View>
        </View>

        {loading && mods.length === 0 ? (
          <ActivityIndicator color={T.accent} style={{ marginTop: 40 }} />
        ) : (
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
            {CATEGORIES.map((cat) => (
              <View key={cat.key} style={{ marginBottom: 22 }}>
                <Text style={{ color: T.accent, fontSize: 13, fontWeight: '800', marginBottom: 8, letterSpacing: 0.4 }}>
                  {cat.label.toUpperCase()}
                </Text>

                {byCategory[cat.key].map((mod) => (
                  <View
                    key={mod.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: T.card,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: T.bd,
                      paddingLeft: 12,
                      marginBottom: 8,
                    }}
                  >
                    <TextInput
                      defaultValue={mod.name}
                      onEndEditing={(e) => commitRename(mod, e.nativeEvent.text)}
                      placeholder="Modification"
                      placeholderTextColor={T.mu}
                      style={{ flex: 1, color: T.tx, fontSize: 15, paddingVertical: 12 }}
                    />
                    <TouchableOpacity onPress={() => confirmDelete(mod)} style={{ padding: 12 }}>
                      <Ionicons name="trash-outline" size={18} color={T.danger} />
                    </TouchableOpacity>
                  </View>
                ))}

                {addingCat === cat.key ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: T.card,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: T.accent,
                      paddingLeft: 12,
                    }}
                  >
                    <TextInput
                      autoFocus
                      value={draftName}
                      onChangeText={setDraftName}
                      onEndEditing={() => commitAdd(cat.key)}
                      placeholder={`Add ${cat.label.toLowerCase()} mod`}
                      placeholderTextColor={T.mu}
                      style={{ flex: 1, color: T.tx, fontSize: 15, paddingVertical: 12 }}
                    />
                    <TouchableOpacity onPress={() => commitAdd(cat.key)} disabled={busy} style={{ padding: 12 }}>
                      <Ionicons name="checkmark" size={20} color={T.accent} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      setDraftName('');
                      setAddingCat(cat.key);
                    }}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingLeft: 4 }}
                  >
                    <Ionicons name="add-circle-outline" size={18} color={T.accent} />
                    <Text style={{ color: T.accent, fontSize: 13, fontWeight: '600' }}>Add {cat.label.toLowerCase()} mod</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <PrimaryButton label="Done" onPress={() => onClose(changed)} style={{ marginTop: 4 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}
