import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Search, X, ChevronRight, Dices } from 'lucide-react-native';
import { Screen } from '@/src/components/ui/Screen';
import { getAllPeople } from '@/src/services/db/bibleDb';
import { BiblicalPerson } from '@/src/types/bible';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { hapticLight, hapticSelection } from '@/src/services/haptics/hapticFeedback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { filterPeople } from '@/src/features/characters/utils/filterPeople';

export default function CharactersIndexScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mode = useSettingsStore(s => s.theme);
  const theme = themes[mode] || themes.sepia;
  const [people, setPeople] = useState<BiblicalPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [category, setCategory] = useState('Todos');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true); setError(false);
    getAllPeople().then(data => { if (active) setPeople(data); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);

  const categories = useMemo(() => ['Todos', ...[...new Set(people.map(p => p.category))].sort((a, b) => a.localeCompare(b, 'es'))], [people]);
  const filtered = useMemo(() => filterPeople(people, category, query), [people, category, query]);
  const openPerson = (person: BiblicalPerson) => { hapticLight(); router.push(`/characters/${person.id}` as any); };
  const reset = () => { setQuery(''); setCategory('Todos'); };

  return (
    <Screen safeTop safeBottom={false}>
      <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => router.back()} style={({ pressed }) => [styles.iconButton, { backgroundColor: pressed ? theme.accentMuted : theme.surface }]}><ChevronLeft size={22} color={theme.text} /></Pressable>
        <Text accessibilityRole="header" style={[styles.heading, { color: theme.text }]}>Personajes de la Biblia</Text>
      </View>
      <View style={styles.tools}>
        <View style={[styles.search, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Search size={18} color={theme.textMuted} />
          <TextInput accessibilityLabel="Buscar personajes" placeholder="Buscar nombre o historia" placeholderTextColor={theme.textMuted} style={[styles.searchInput, { color: theme.text }]} value={query} onChangeText={setQuery} autoCorrect={false} returnKeyType="search" />
          {!!query && <Pressable accessibilityRole="button" accessibilityLabel="Limpiar búsqueda" onPress={() => setQuery('')} style={styles.iconButton}><X size={18} color={theme.textMuted} /></Pressable>}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.filters}>
          {categories.map(item => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: category === item }} onPress={() => { hapticSelection(); setCategory(item); }} style={({ pressed }) => [styles.chip, { backgroundColor: category === item || pressed ? theme.accentMuted : theme.surface, borderColor: category === item ? theme.accent : theme.borderSubtle }]}><Text style={[styles.chipText, { color: category === item ? theme.accent : theme.textMuted }]}>{item}</Text></Pressable>)}
        </ScrollView>
      </View>
      <FlatList
        data={loading || error ? [] : filtered}
        keyExtractor={item => String(item.id)}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.list, { paddingBottom: Math.max(insets.bottom, 16) }]}
        ListHeaderComponent={!loading && !error ? <View style={styles.results}><Text style={[styles.resultCount, { color: theme.textMuted }]}>{filtered.length} {filtered.length === 1 ? 'personaje' : 'personajes'}</Text><Pressable accessibilityRole="button" accessibilityLabel="Descubrir un personaje al azar de los resultados" disabled={!filtered.length} onPress={() => openPerson(filtered[Math.floor(Math.random() * filtered.length)])} style={({ pressed }) => [styles.random, { backgroundColor: pressed ? theme.accentMuted : theme.surface, opacity: filtered.length ? 1 : 0.4 }]}><Dices size={17} color={theme.accent} /><Text style={[styles.chipText, { color: theme.accent }]}>Al azar</Text></Pressable></View> : null}
        ListEmptyComponent={<View style={styles.state}>{loading ? <><ActivityIndicator color={theme.accent} /><Text style={[styles.stateText, { color: theme.textMuted }]}>Cargando personajes…</Text></> : <><Text style={[styles.stateTitle, { color: theme.text }]}>{error ? 'No pudimos cargar los personajes' : people.length ? 'Sin coincidencias' : 'No hay personajes disponibles'}</Text><Text style={[styles.stateText, { color: theme.textMuted }]}>{error ? 'Intenta cargar el listado otra vez.' : people.length ? 'Prueba otro nombre o restablece la categoría.' : 'Vuelve a intentar cargar el catálogo.'}</Text><Pressable accessibilityRole="button" onPress={error || !people.length ? () => setRetry(n => n + 1) : reset} style={({ pressed }) => [styles.retry, { backgroundColor: pressed ? theme.surface : theme.accentMuted }]}><Text style={[styles.chipText, { color: theme.accent }]}>{error || !people.length ? 'Reintentar' : 'Restablecer búsqueda'}</Text></Pressable></> }</View>}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.borderSubtle }]} />}
        renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityLabel={`${item.name_es}. ${item.display_title_es}`} accessibilityHint="Abrir biografía y pasajes" onPress={() => openPerson(item)} style={({ pressed }) => [styles.personRow, { backgroundColor: pressed ? theme.accentMuted : theme.background }]}>
          <View style={[styles.avatar, { backgroundColor: theme.accentMuted }]}><Text style={[styles.initials, { color: theme.accent }]}>{item.name_es.slice(0, 2).toUpperCase()}</Text></View>
          <View style={styles.personText}><Text style={[styles.name, { color: theme.text }]}>{item.name_es}</Text><Text style={[styles.description, { color: theme.textMuted }]}>{item.display_title_es}</Text><Text style={[styles.category, { color: theme.accent }]}>{item.category}</Text></View>
          <ChevronRight size={18} color={theme.textMuted} />
        </Pressable>}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  iconButton: { minWidth: 44, minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  heading: { flex: 1, fontSize: 20, fontWeight: '700' }, tools: { paddingTop: 16, gap: 12 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, paddingLeft: 14, borderWidth: 1, borderRadius: 14 },
  searchInput: { flex: 1, minWidth: 0, minHeight: 48, paddingVertical: 12, fontSize: 15 },
  filters: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 }, chip: { minHeight: 44, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, justifyContent: 'center' }, chipText: { fontSize: 13, fontWeight: '600' },
  list: { flexGrow: 1, paddingTop: 4 }, results: { paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  resultCount: { fontSize: 12 }, random: { flexDirection: 'row', gap: 8, alignItems: 'center', minHeight: 44, borderRadius: 12, paddingHorizontal: 12 },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 16 },
  avatar: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, initials: { fontSize: 14, fontWeight: '700' }, personText: { flex: 1, gap: 4 }, name: { fontSize: 17, fontWeight: '700' }, description: { fontSize: 13, lineHeight: 19 }, category: { fontSize: 12 }, separator: { height: StyleSheet.hairlineWidth, marginLeft: 72, marginRight: 16 },
  state: { padding: 28, gap: 14, alignItems: 'center' }, stateTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center' }, stateText: { fontSize: 14, lineHeight: 21, textAlign: 'center' }, retry: { minHeight: 44, borderRadius: 12, padding: 14 },
});
