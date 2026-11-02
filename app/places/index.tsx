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
  MapPin,
  Compass,
  Navigation,
  ChevronRight,
  BookOpen,
  Sparkles,
} from 'lucide-react-native';
import { Screen } from '@/src/components/ui/Screen';
import { getAllPlaces } from '@/src/services/db/bibleDb';
import { BiblicalPlace } from '@/src/types/bible';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { hapticLight, hapticSelection } from '@/src/services/haptics/hapticFeedback';

const CATEGORIES = [
  'Todos',
  'Montes Sagrados',
  'Ciudades y Aldeas',
  'Ríos y Aguas',
  'Santuarios y Desiertos',
  'Rutas Apostólicas',
];

export default function PlacesIndexScreen() {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  const [places, setPlaces] = useState<BiblicalPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllPlaces();
      setPlaces(data);
    } catch (e) {
      console.warn('Error loading places:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredPlaces = useMemo(() => {
    let list = places;

    if (selectedCategory !== 'Todos') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name_es.toLowerCase().includes(q) ||
          p.spiritual_meaning.toLowerCase().includes(q) ||
          p.modern_location.toLowerCase().includes(q) ||
          p.description_es.toLowerCase().includes(q) ||
          (p.hebrew_greek_name && p.hebrew_greek_name.toLowerCase().includes(q))
      );
    }

    return list;
  }, [places, selectedCategory, searchQuery]);

  const handleSelectPlace = (place: BiblicalPlace) => {
    hapticLight();
    router.push(`/places/${place.id}` as any);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Montes Sagrados':
        return '⛰️';
      case 'Ríos y Aguas':
        return '🌊';
      case 'Santuarios y Desiertos':
        return '🏜️';
      case 'Rutas Apostólicas':
        return '🧭';
      default:
        return '🏛️';
    }
  };

  return (
    <Screen safeTop safeBottom={false}>
      {/* Header */}
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
            Lugares Bíblicos
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
            Geografía Sagrada & Tierra Santa
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.headerMapBtn, { backgroundColor: theme.accent }]}
          onPress={() => {
            hapticLight();
            router.push('/places/map' as any);
          }}
          activeOpacity={0.8}
        >
          <Compass size={14} color="#FFFFFF" />
          <Text style={styles.headerMapBtnText}>Mapa</Text>
        </TouchableOpacity>
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
            placeholder="Buscar monte, ciudad, río o significado..."
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

      {/* Category Pills */}
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

      {/* List content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>
            Cargando geografía sagrada...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPlaces}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.infoBanner}>
              <TouchableOpacity
                style={[
                  styles.infoBannerCard,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.accent,
                  },
                ]}
                onPress={() => {
                  hapticLight();
                  router.push('/places/map' as any);
                }}
                activeOpacity={0.85}
              >
                <View style={styles.infoBannerHeader}>
                  <Compass size={16} color={theme.accent} />
                  <Text style={[styles.infoBannerTitle, { color: theme.accent }]}>
                    MAPA INTERACTIVO Y COBERTURA HISTÓRICA
                  </Text>
                  <View style={[styles.badgeLive, { backgroundColor: theme.accent + '22' }]}>
                    <Sparkles size={11} color={theme.accent} />
                    <Text style={[styles.badgeLiveText, { color: theme.accent }]}>Satelital</Text>
                  </View>
                </View>
                <Text style={[styles.infoBannerText, { color: theme.textMuted }]}>
                  Explora Damasco, Jerusalén, Sinaí y más con sus perímetros antiguos, satélite y personajes bíblicos asociados.
                </Text>
                <View style={[styles.bannerCtaRow, { borderTopColor: theme.borderSubtle }]}>
                  <Text style={[styles.bannerCtaText, { color: theme.accent }]}>
                    Abrir Mapa Satelital de Tierra Santa →
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No se encontraron lugares
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                Prueba buscando otro término o seleccionando otra categoría.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.placeCard,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.borderSubtle,
                },
              ]}
              onPress={() => handleSelectPlace(item)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.categoryCircle,
                    {
                      backgroundColor:
                        themeMode === 'oled' ? '#182436' : 'rgba(217, 119, 6, 0.1)',
                      borderColor:
                        themeMode === 'oled' ? '#293a52' : 'rgba(217, 119, 6, 0.25)',
                    },
                  ]}
                >
                  <Text style={styles.categoryEmoji}>
                    {getCategoryIcon(item.category)}
                  </Text>
                </View>

                <View style={styles.cardMainTitles}>
                  <View style={styles.cardTopRow}>
                    <Text style={[styles.placeName, { color: theme.text }]}>
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

                  {item.hebrew_greek_name ? (
                    <Text
                      style={[styles.originalName, { color: theme.accent }]}
                      numberOfLines={1}
                    >
                      {item.hebrew_greek_name}
                    </Text>
                  ) : null}
                </View>

                <ChevronRight size={18} color={theme.textMuted} />
              </View>

              {/* Spiritual Meaning Pill */}
              <View
                style={[
                  styles.meaningBox,
                  {
                    backgroundColor:
                      themeMode === 'oled'
                        ? '#141d18'
                        : 'rgba(217, 119, 6, 0.08)',
                    borderColor:
                      themeMode === 'oled'
                        ? '#1e3324'
                        : 'rgba(217, 119, 6, 0.22)',
                  },
                ]}
              >
                <Sparkles size={13} color={theme.accent} />
                <Text
                  style={[styles.meaningText, { color: theme.accent }]}
                  numberOfLines={1}
                >
                  {item.spiritual_meaning}
                </Text>
              </View>

              {/* Description preview */}
              <Text
                style={[styles.descSnippet, { color: theme.text }]}
                numberOfLines={2}
              >
                {item.description_es}
              </Text>

              {/* Card Footer: GPS Badge & Verses Count */}
              <View
                style={[
                  styles.cardFooter,
                  { borderTopColor: theme.borderSubtle },
                ]}
              >
                <View style={styles.gpsRow}>
                  <MapPin size={12} color={theme.textMuted} />
                  <Text
                    style={[styles.gpsText, { color: theme.textMuted }]}
                    numberOfLines={1}
                  >
                    {item.modern_location}
                  </Text>
                </View>

                <View style={styles.versesBadge}>
                  <BookOpen size={11} color={theme.accent} />
                  <Text style={[styles.versesText, { color: theme.accent }]}>
                    {item.verse_count > 0
                      ? `${item.verse_count} versículos`
                      : 'Ver detalles'}
                  </Text>
                </View>
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
  headerMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  headerMapBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
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
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  badgeLive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeLiveText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bannerCtaRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  bannerCtaText: {
    fontSize: 12,
    fontWeight: '700',
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
  placeCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  cardMainTitles: {
    flex: 1,
    marginRight: 8,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  placeName: {
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
  originalName: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  meaningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 8,
  },
  meaningText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  descSnippet: {
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
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginRight: 10,
  },
  gpsText: {
    fontSize: 11,
  },
  versesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  versesText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
