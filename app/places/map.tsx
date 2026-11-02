import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Compass, Filter, Sparkles } from 'lucide-react-native';
import { Screen } from '@/src/components/ui/Screen';
import { BiblicalMapViewer } from '@/src/features/places/components/BiblicalMapViewer';
import { getAllPlaces } from '@/src/services/db/bibleDb';
import { BiblicalPlace } from '@/src/types/bible';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { hapticLight, hapticSelection } from '@/src/services/haptics/hapticFeedback';

type PlaceCategoryFilter = 'ALL' | 'Ciudades y Aldeas' | 'Montes Sagrados' | 'Ríos y Aguas' | 'Santuarios y Desiertos' | 'Rutas Apostólicas';

export default function HolyLandFullMapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ focusedPlace?: string }>();
  const initialFocusedId = params.focusedPlace ? parseInt(params.focusedPlace, 10) : 1;

  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  const [places, setPlaces] = useState<BiblicalPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategoryFilter>('ALL');
  const [focusedId, setFocusedId] = useState<number>(initialFocusedId);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await getAllPlaces();
        setPlaces(list);
      } catch (e) {
        console.warn('Error loading places for map:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredPlaces = useMemo(() => {
    if (selectedCategory === 'ALL') return places;
    return places.filter((p) => p.category === selectedCategory);
  }, [places, selectedCategory]);

  const categories: { key: PlaceCategoryFilter; label: string; icon: string }[] = [
    { key: 'ALL', label: 'Todos (24)', icon: '🗺️' },
    { key: 'Ciudades y Aldeas', label: 'Ciudades', icon: '🏛️' },
    { key: 'Montes Sagrados', label: 'Montes', icon: '⛰️' },
    { key: 'Ríos y Aguas', label: 'Aguas', icon: '🌊' },
    { key: 'Santuarios y Desiertos', label: 'Santuarios', icon: '🕊️' },
    { key: 'Rutas Apostólicas', label: 'Rutas Misioneras', icon: '📜' },
  ];

  const handleSelectCategory = (cat: PlaceCategoryFilter) => {
    hapticSelection();
    setSelectedCategory(cat);
  };

  const handleNavigateToCharacter = (characterId: number) => {
    hapticLight();
    router.push(`/characters/${characterId}` as any);
  };

  const handleNavigateToReader = (bookId: number, chapter: number, verse?: number) => {
    hapticLight();
    router.push({
      pathname: `/reader/${bookId}/${chapter}`,
      params: verse ? { highlightVerse: String(verse) } : {},
    } as any);
  };

  const handleViewPlaceDetails = (placeId: number) => {
    hapticLight();
    router.push(`/places/${placeId}` as any);
  };

  return (
    <Screen safeTop safeBottom={false}>
      {/* Header Bar */}
      <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.headerBtn, { backgroundColor: theme.surfaceRaised }]}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            El Mapa Sagrado
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
            Tierra Santa & Perímetros Antiguos con Leaflet
          </Text>
        </View>

        <View style={styles.headerRightPlaceholder}>
          <View
            style={[styles.countBadge, { backgroundColor: theme.accentMuted }]}
          >
            <Text style={[styles.countBadgeText, { color: theme.accent }]}>
              {filteredPlaces.length}
            </Text>
          </View>
        </View>
      </View>

      {/* Filter Chips Scroll */}
      <View
        style={[
          styles.filtersBar,
          {
            backgroundColor: theme.cardBackground,
            borderBottomColor: theme.borderSubtle,
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
        >
          {categories.map((c) => {
            const isSelected = selectedCategory === c.key;
            return (
              <TouchableOpacity
                key={c.key}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected
                      ? theme.accent
                      : theme.surfaceRaised,
                    borderColor: isSelected
                      ? theme.accent
                      : theme.borderSubtle,
                  },
                ]}
                onPress={() => handleSelectCategory(c.key)}
                activeOpacity={0.75}
              >
                <Text style={styles.filterChipIcon}>{c.icon}</Text>
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isSelected ? '#FFFFFF' : theme.text },
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Interactive Map View */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>
            Cargando geografía sagrada...
          </Text>
        </View>
      ) : (
        <View style={styles.mapFlexContainer}>
          <BiblicalMapViewer
            places={filteredPlaces}
            focusedPlaceId={focusedId}
            onSelectPlace={(p) => setFocusedId(p.id)}
            onNavigateToCharacter={handleNavigateToCharacter}
            onNavigateToReader={handleNavigateToReader}
            onViewPlaceDetails={handleViewPlaceDetails}
            height="100%"
            showFullControls={true}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  headerRightPlaceholder: {
    width: 38,
    alignItems: 'flex-end',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  filtersBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  filtersScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterChipIcon: {
    fontSize: 12,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  mapFlexContainer: {
    flex: 1,
  },
});
