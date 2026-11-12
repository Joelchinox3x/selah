import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Share2, BookOpen, ArrowUpRight } from 'lucide-react-native';
import { Screen } from '@/src/components/ui/Screen';
import { getPersonById, getVersesForPerson } from '@/src/services/db/bibleDb';
import { BiblicalPerson, Verse } from '@/src/types/bible';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { hapticLight } from '@/src/services/haptics/hapticFeedback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CharacterDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const personId = Number(id);
  const mode = useSettingsStore(s => s.theme);
  const theme = themes[mode] || themes.sepia;
  const [person, setPerson] = useState<BiblicalPerson | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [shareError, setShareError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true); setError(false); setShareError(false); setPerson(null); setVerses([]);
    if (!Number.isSafeInteger(personId) || personId < 1) { setLoading(false); return; }
    Promise.all([getPersonById(personId), getVersesForPerson(personId, 30)])
      .then(([profile, passages]) => { if (active) { setPerson(profile); setVerses(passages); } })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [personId, retry]);

  const handleShare = async () => {
    if (!person) return;
    hapticLight(); setShareError(false);
    try {
      await Share.share({ title: `${person.name_es} · Personajes de la Biblia`, message: `${person.name_es}\n${person.display_title_es}\n\n${person.archetype}\n\n${person.bio_es}\n\nDescubre más en Selah.` });
    } catch { setShareError(true); }
  };
  const openVerse = (verse: Verse) => {
    hapticLight();
    router.push({ pathname: `/reader/${verse.book_id}/${verse.chapter}`, params: { highlightVerse: String(verse.verse) } } as any);
  };

  return (
    <Screen safeTop safeBottom={false}>
      <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver al listado" onPress={() => router.back()} style={({ pressed }) => [styles.iconButton, { backgroundColor: pressed ? theme.accentMuted : theme.surface }]}><ChevronLeft size={22} color={theme.text} /></Pressable>
        <Text accessibilityRole="header" style={[styles.headerTitle, { color: theme.text }]}>Personajes de la Biblia</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Compartir biografía" accessibilityState={{ disabled: !person || loading }} disabled={!person || loading} onPress={handleShare} style={({ pressed }) => [styles.iconButton, { backgroundColor: pressed ? theme.accentMuted : theme.surface, opacity: person && !loading ? 1 : 0.4 }]}><Share2 size={19} color={theme.text} /></Pressable>
      </View>
      <FlatList
        data={loading || error || !person ? [] : verses}
        keyExtractor={item => String(item.id)}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}
        ListHeaderComponent={!loading && !error && person ? <>
          <View style={styles.profile}>
            <View style={[styles.avatar, { backgroundColor: theme.accentMuted }]}><Text style={[styles.initials, { color: theme.accent }]}>{person.name_es.slice(0, 2).toUpperCase()}</Text></View>
            <Text style={[styles.category, { color: theme.accent }]}>{person.category}</Text>
            <Text selectable style={[styles.name, { color: theme.text }]}>{person.name_es}</Text>
            <Text selectable style={[styles.subtitle, { color: theme.textMuted }]}>{person.display_title_es}</Text>
          </View>
          {!!person.archetype && <View style={[styles.trait, { backgroundColor: theme.accentMuted }]}><Text style={[styles.eyebrow, { color: theme.accent }]}>Rasgo destacado</Text><Text selectable style={[styles.traitText, { color: theme.text }]}>{person.archetype}</Text></View>}
          {!!shareError && <View style={styles.shareError}><Text accessibilityRole="alert" style={[styles.subtitle, { color: theme.destructive }]}>No se pudo compartir.</Text><Pressable accessibilityRole="button" onPress={handleShare} style={styles.retry}><Text style={[styles.link, { color: theme.accent }]}>Reintentar</Text></Pressable></View>}
          <View style={[styles.biography, { borderBottomColor: theme.borderSubtle }]}>
            <Text accessibilityRole="header" style={[styles.sectionTitle, { color: theme.text }]}>Su historia</Text>
            <Text selectable style={[styles.body, { color: theme.text }]}>{person.bio_es || 'Esta biografía todavía no tiene contenido disponible.'}</Text>
          </View>
          <View style={styles.passageHeading}><BookOpen size={19} color={theme.accent} /><Text accessibilityRole="header" style={[styles.sectionTitle, { color: theme.text }]}>En la Biblia</Text></View>
          {verses.length > 0 && <Text style={[styles.passageHint, { color: theme.textMuted }]}>{verses.length} {verses.length === 1 ? 'pasaje para explorar' : 'pasajes para explorar'}. Toca uno para leer el capítulo.</Text>}
        </> : null}
        ListEmptyComponent={<View style={styles.state}>{loading ? <><ActivityIndicator color={theme.accent} /><Text style={[styles.stateText, { color: theme.textMuted }]}>Cargando biografía…</Text></> : error || !person ? <><Text style={[styles.stateTitle, { color: theme.text }]}>{error ? 'No pudimos cargar la biografía' : 'Personaje no encontrado'}</Text><Text style={[styles.stateText, { color: theme.textMuted }]}>{error ? 'Intenta cargarla de nuevo.' : 'Vuelve al listado para elegir otro personaje.'}</Text><Pressable accessibilityRole="button" onPress={error ? () => setRetry(n => n + 1) : () => router.back()} style={({ pressed }) => [styles.retry, { backgroundColor: pressed ? theme.surface : theme.accentMuted }]}><Text style={[styles.link, { color: theme.accent }]}>{error ? 'Reintentar' : 'Volver al listado'}</Text></Pressable></> : <Text style={[styles.stateText, { color: theme.textMuted }]}>No hay pasajes vinculados disponibles para este personaje.</Text>}</View>}
        renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityLabel={`Leer ${item.book_name} ${item.chapter}:${item.verse}`} accessibilityHint="Abre el capítulo y resalta este versículo" onPress={() => openVerse(item)} style={({ pressed }) => [styles.passage, { backgroundColor: pressed ? theme.accentMuted : theme.cardBackground, borderColor: theme.borderSubtle }]}>
          <View style={styles.passageReference}><Text style={[styles.reference, { color: theme.accent }]}>{item.book_name} {item.chapter}:{item.verse}</Text><ArrowUpRight size={18} color={theme.accent} /></View>
          <Text selectable style={[styles.verseText, { color: theme.text }]}>{item.text}</Text>
        </Pressable>}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 10, borderBottomWidth: StyleSheet.hairlineWidth }, iconButton: { minWidth: 44, minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, headerTitle: { flex: 1, fontSize: 15, fontWeight: '600' },
  content: { flexGrow: 1, padding: 20 }, profile: { alignItems: 'flex-start', gap: 8, paddingBottom: 20 }, avatar: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }, initials: { fontSize: 18, fontWeight: '700' }, category: { fontSize: 12, fontWeight: '600' }, name: { fontSize: 30, lineHeight: 38, fontWeight: '700' }, subtitle: { fontSize: 14, lineHeight: 21 },
  trait: { padding: 16, gap: 6, borderRadius: 14, marginBottom: 24 }, eyebrow: { fontSize: 12, fontWeight: '600' }, traitText: { fontSize: 16, lineHeight: 24, fontWeight: '600' }, biography: { paddingBottom: 24, marginBottom: 24, gap: 12, borderBottomWidth: StyleSheet.hairlineWidth }, sectionTitle: { fontSize: 18, fontWeight: '700', flexShrink: 1 }, body: { fontSize: 16, lineHeight: 27 },
  passageHeading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }, passageHint: { fontSize: 13, lineHeight: 20, marginBottom: 16 }, passage: { padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 12 }, passageReference: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }, reference: { fontSize: 14, fontWeight: '700', flexShrink: 1 }, verseText: { fontSize: 15, lineHeight: 24 },
  state: { alignItems: 'center', paddingVertical: 32, gap: 14 }, stateTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' }, stateText: { fontSize: 14, lineHeight: 21, textAlign: 'center' }, retry: { minHeight: 44, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }, link: { fontSize: 14, fontWeight: '600' }, shareError: { marginBottom: 16, alignItems: 'flex-start', gap: 4 },
});
