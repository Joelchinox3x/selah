import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Search,
  X,
  Compass,
  Sparkles,
  BookOpen,
  ChevronRight,
  Users,
} from 'lucide-react-native';
import { Screen } from '@/src/components/ui/Screen';
import { getAllPeople } from '@/src/services/db/bibleDb';
import { BiblicalPerson } from '@/src/types/bible';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { hapticLight, hapticSelection } from '@/src/services/haptics/hapticFeedback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CATEGORIES = [
  'Todos',
  'Patriarcas',
  'Mujeres de Fe',
  'Profetas',
  'Apóstoles',
  'Líderes',
  'Evangelio',
];

export default function CharactersIndexScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  const [people, setPeople] = useState<BiblicalPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllPeople();
      setPeople(data);
    } catch (e) {
      console.warn('Error loading characters:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredPeople = useMemo(() => {
    let list = people;

    if (selectedCategory !== 'Todos') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name_es.toLowerCase().includes(q) ||
          p.display_title_es.toLowerCase().includes(q) ||
          p.archetype.toLowerCase().includes(q) ||
          p.bio_es.toLowerCase().includes(q)
      );
    }

    return list;
  }, [people, selectedCategory, searchQuery]);

  const handleSelectPerson = (person: BiblicalPerson) => {
    hapticLight();
    router.push(`/characters/${person.id}` as any);
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Screen safeTop safeBottom={false}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: theme.surfaceRaised }]}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            El Árbol Humano
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
            Perfiles Biográficos y Arquetipos del Alma
          </Text>
        </View>
        <View style={styles.headerRightSpace} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.borderSubtle,
            },
          ]}
        >
          <Search size={18} color={theme.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Buscar por personaje, arquetipo o título..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            clearButtonMode="never"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={18} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter Pills */}
      <View style={styles.categoryWrap}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            return (
              <TouchableOpacity
                onPress={() => {
                  hapticSelection();
                  setSelectedCategory(item);
                }}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: isSelected
                      ? theme.accent
                      : theme.surfaceRaised,
                    borderColor: isSelected
                      ? theme.accent
                      : theme.borderSubtle,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    {
                      color: isSelected ? '#FFFFFF' : theme.text,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Content list */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>
            Explorando biografías sagradas...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPeople}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(insets.bottom, 16) + 32 },
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.infoBanner}>
              <View
                style={[
                  styles.infoBannerCard,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.borderSubtle,
                  },
                ]}
              >
                <View style={styles.infoBannerHeader}>
                  <Sparkles size={16} color={theme.accent} />
                  <Text style={[styles.infoBannerTitle, { color: theme.accent }]}>
                    GRAFO BIOGRÁFICO BÍBLICO
                  </Text>
                </View>
                <Text style={[styles.infoBannerText, { color: theme.textMuted }]}>
                  Personajes de carne y hueso cuyas dudas, caídas, lágrimas y victorias
                  en Dios revelan la gracia que hoy también te acompaña.
                </Text>
                <View style={styles.infoBannerStats}>
                  <View style={styles.infoStatItem}>
                    <Users size={14} color={theme.accent} />
                    <Text style={[styles.infoStatText, { color: theme.text }]}>
                      {filteredPeople.length} Biografías
                    </Text>
                  </View>
                  <View style={styles.infoStatItem}>
                    <Compass size={14} color={theme.accent} />
                    <Text style={[styles.infoStatText, { color: theme.text }]}>
                      Arquetipos del Alma
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No se encontraron personajes
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                Intenta con otro término de búsqueda o selecciona otra categoría.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.card,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.borderSubtle,
                },
              ]}
              onPress={() => handleSelectPerson(item)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                {/* Avatar Badge */}
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor:
                        item.gender === 'F'
                          ? themeMode === 'oled'
                            ? '#2c1e28'
                            : '#fce7f3'
                          : theme.surfaceRaised,
                      borderColor:
                        item.gender === 'F'
                          ? '#f472b6'
                          : theme.accentMuted,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarText,
                      {
                        color:
                          item.gender === 'F'
                            ? '#db2777'
                            : theme.accent,
                      },
                    ]}
                  >
                    {getInitials(item.name_es)}
                  </Text>
                </View>

                {/* Main Titles */}
                <View style={styles.cardInfo}>
                  <View style={styles.cardNameRow}>
                    <Text style={[styles.cardName, { color: theme.text }]}>
                      {item.name_es}
                    </Text>
                    <View
                      style={[
                        styles.testamentBadge,
                        {
                          backgroundColor:
                            themeMode === 'oled'
                              ? '#1e293b'
                              : 'rgba(0,0,0,0.05)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.testamentBadgeText,
                          { color: theme.textMuted },
                        ]}
                      >
                        {item.testament === 'OT'
                          ? 'Antiguo T.'
                          : item.testament === 'NT'
                          ? 'Nuevo T.'
                          : 'Bíblico'}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[styles.cardTitle, { color: theme.textMuted }]}
                    numberOfLines={1}
                  >
                    {item.display_title_es}
                  </Text>
                </View>

                <ChevronRight size={18} color={theme.textMuted} />
              </View>

              {/* Archetype Pill */}
              <View
                style={[
                  styles.archetypeBadge,
                  {
                    backgroundColor:
                      themeMode === 'oled'
                        ? '#1a2214'
                        : 'rgba(217, 119, 6, 0.08)',
                    borderColor:
                      themeMode === 'oled'
                        ? '#2d3b24'
                        : 'rgba(217, 119, 6, 0.22)',
                  },
                ]}
              >
                <Compass size={13} color={theme.accent} />
                <Text
                  style={[styles.archetypeText, { color: theme.accent }]}
                  numberOfLines={1}
                >
                  {item.archetype}
                </Text>
              </View>

              {/* Bio summary snippet */}
              <Text
                style={[styles.bioSnippet, { color: theme.text }]}
                numberOfLines={2}
              >
                {item.bio_es}
              </Text>

              {/* Card Footer: Verse count & CTA */}
              <View style={[styles.cardFooter, { borderTopColor: theme.borderSubtle }]}>
                <View style={styles.cardStat}>
                  <BookOpen size={13} color={theme.textMuted} />
                  <Text style={[styles.cardStatText, { color: theme.textMuted }]}>
                    {item.verse_count > 0
                      ? `${item.verse_count} versículos vinculados`
                      : 'Presencia bíblica'}
                  </Text>
                </View>

                <Text style={[styles.readProfileText, { color: theme.accent }]}>
                  Ver perfil completo →
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  headerRightSpace: {
    width: 38,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  categoryWrap: {
    paddingBottom: 8,
  },
  categoryList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  infoBanner: {
    marginBottom: 14,
  },
  infoBannerCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  infoBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  infoBannerTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  infoBannerText: {
    fontSize: 13,
    lineHeight: 18,
  },
  infoBannerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150,150,150,0.15)',
  },
  infoStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoStatText: {
    fontSize: 12,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
  },
  cardInfo: {
    flex: 1,
    marginRight: 8,
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
  },
  testamentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  testamentBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  archetypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 8,
  },
  archetypeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bioSnippet: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.9,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cardStatText: {
    fontSize: 11,
  },
  readProfileText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
