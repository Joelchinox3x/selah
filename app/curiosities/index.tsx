import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Search,
  X,
  BookOpen,
  Share2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Bookmark,
} from 'lucide-react-native';
import { Screen } from '@/src/components/ui/Screen';
import {
  BIBLICAL_CURIOSITIES,
  BiblicalCuriosity,
  CURIOSITY_CATEGORIES,
  CuriosityCategory,
  getTodayCuriosity,
} from '@/src/features/curiosities/data/biblicalCuriosities';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { hapticLight } from '@/src/services/haptics/hapticFeedback';

export default function CuriositiesScreen() {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;
  const isDark = themeMode === 'oled';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | CuriosityCategory>('all');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const todayCuriosity = useMemo(() => getTodayCuriosity(), []);

  const toggleExpand = (id: string) => {
    hapticLight();
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleOpenReader = (curiosity: BiblicalCuriosity) => {
    hapticLight();
    router.push({
      pathname: `/reader/${curiosity.bookId}/${curiosity.chapter}`,
      params: { highlightVerse: String(curiosity.verse) },
    } as any);
  };

  const handleShare = async (curiosity: BiblicalCuriosity) => {
    hapticLight();
    try {
      const shareMessage = `✨ *${curiosity.title}*\n📖 ${curiosity.biblicalCitation}\n\n«${curiosity.verseSnippet}»\n\n💡 *¿Sabías qué?*\n${curiosity.didYouKnow}\n\n🌱 *Reflexión:*\n${curiosity.keyTakeaway}\n\n— Descubierto en Selah: Biblia & Calma Espiritual`;
      await Share.share({
        message: shareMessage,
        title: curiosity.title,
      });
    } catch (e) {
      console.warn('Error sharing curiosity:', e);
    }
  };

  const filteredCuriosities = useMemo(() => {
    let list = BIBLICAL_CURIOSITIES;

    if (selectedCategory !== 'all') {
      list = list.filter((c) => c.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.didYouKnow.toLowerCase().includes(q) ||
          c.deepDive.toLowerCase().includes(q) ||
          c.biblicalCitation.toLowerCase().includes(q) ||
          c.badgeValue?.toLowerCase().includes(q) ||
          c.keyTakeaway.toLowerCase().includes(q)
      );
    }

    return list;
  }, [selectedCategory, searchQuery]);

  const renderCuriosityCard = ({ item }: { item: BiblicalCuriosity }) => {
    const isExpanded = !!expandedIds[item.id];
    const isToday = item.id === todayCuriosity.id;

    return (
      <View
        style={[
          styles.curiosityCard,
          {
            backgroundColor: theme.cardBackground,
            borderColor: isToday ? theme.accent : theme.borderSubtle,
            borderWidth: isToday ? 1.5 : 1,
          },
        ]}
      >
        {/* Top Badges */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.tagWrap}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <View
              style={[
                styles.categoryBadge,
                {
                  backgroundColor: isDark
                    ? 'rgba(217, 119, 6, 0.16)'
                    : 'rgba(217, 119, 6, 0.10)',
                },
              ]}
            >
              <Text style={[styles.categoryBadgeText, { color: theme.accent }]}>
                {item.categoryLabel.toUpperCase()}
              </Text>
            </View>
            {isToday && (
              <View
                style={[
                  styles.todayBadge,
                  { backgroundColor: theme.accent },
                ]}
              >
                <Sparkles size={10} color="#fff" />
                <Text style={styles.todayBadgeText}>DE HOY</Text>
              </View>
            )}
          </View>

          {item.badgeValue ? (
            <View
              style={[
                styles.recordValuePill,
                {
                  backgroundColor: isDark ? '#1e293b' : 'rgba(0, 0, 0, 0.04)',
                  borderColor: theme.borderSubtle,
                },
              ]}
            >
              <Text style={[styles.recordValueText, { color: theme.textMuted }]}>
                {item.badgeValue}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Card Title */}
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          {item.title}
        </Text>

        {/* Verse Citation & Quote snippet */}
        <View
          style={[
            styles.verseSnippetBox,
            {
              backgroundColor: isDark ? '#111827' : 'rgba(217, 119, 6, 0.04)',
              borderLeftColor: theme.accent,
            },
          ]}
        >
          <View style={styles.citationRow}>
            <BookOpen size={12} color={theme.accent} />
            <Text style={[styles.citationText, { color: theme.accent }]}>
              {item.biblicalCitation}
            </Text>
          </View>
          <Text
            style={[styles.snippetText, { color: theme.textMuted }]}
            numberOfLines={isExpanded ? 0 : 3}
          >
            «{item.verseSnippet}»
          </Text>
        </View>

        {/* Did You Know Insight */}
        <Text style={[styles.didYouKnowText, { color: theme.text }]}>
          {item.didYouKnow}
        </Text>

        {/* Expandable Deep Dive Context */}
        {isExpanded && (
          <View
            style={[
              styles.deepDiveBox,
              {
                backgroundColor: isDark ? '#0f172a' : 'rgba(0, 0, 0, 0.02)',
                borderColor: theme.borderSubtle,
              },
            ]}
          >
            <Text style={[styles.deepDiveTitle, { color: theme.accent }]}>
              Profundización histórica & teológica:
            </Text>
            <Text style={[styles.deepDiveBody, { color: theme.textMuted }]}>
              {item.deepDive}
            </Text>

            <View style={styles.takeawayDivider} />

            <Text style={[styles.takeawayTitle, { color: theme.text }]}>
              🌱 Semilla para tu vida:
            </Text>
            <Text style={[styles.takeawayBody, { color: theme.textMuted }]}>
              {item.keyTakeaway}
            </Text>
          </View>
        )}

        {/* Expand toggle */}
        <TouchableOpacity
          style={styles.expandToggle}
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.7}
        >
          <Text style={[styles.expandToggleText, { color: theme.accent }]}>
            {isExpanded ? 'Mostrar menos' : 'Leer contexto completo y reflexión'}
          </Text>
          {isExpanded ? (
            <ChevronUp size={14} color={theme.accent} />
          ) : (
            <ChevronDown size={14} color={theme.accent} />
          )}
        </TouchableOpacity>

        {/* Bottom Actions Bar */}
        <View
          style={[
            styles.cardActionsRow,
            { borderTopColor: theme.borderSubtle },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.openBibleBtn,
              { backgroundColor: theme.accent },
            ]}
            onPress={() => handleOpenReader(item)}
            activeOpacity={0.8}
          >
            <BookOpen size={14} color="#ffffff" />
            <Text style={styles.openBibleBtnText}>
              Ver en la Biblia
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.shareBtn,
              {
                backgroundColor: isDark
                  ? '#1e293b'
                  : 'rgba(0, 0, 0, 0.05)',
                borderColor: theme.borderSubtle,
              },
            ]}
            onPress={() => handleShare(item)}
            activeOpacity={0.7}
          >
            <Share2 size={15} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Screen safeTop safeBottom={false}>
      {/* Top Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.background,
            borderBottomColor: theme.borderSubtle,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            hapticLight();
            router.back();
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ArrowLeft size={22} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Curiosidades & Récords
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
            {filteredCuriosities.length} datos de las Sagradas Escrituras
          </Text>
        </View>
      </View>

      {/* Search Input Bar */}
      <View
        style={[
          styles.searchBarWrap,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.borderSubtle,
          },
        ]}
      >
        <Search size={18} color={theme.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Buscar récord, versículo o personaje..."
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={16} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Pills Scroll */}
      <View style={styles.categoryBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryBarContent}
        >
          {CURIOSITY_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: isSelected
                      ? theme.accent
                      : isDark
                      ? '#1e293b'
                      : theme.cardBackground,
                    borderColor: isSelected
                      ? theme.accent
                      : theme.borderSubtle,
                  },
                ]}
                onPress={() => {
                  hapticLight();
                  setSelectedCategory(cat.id);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text
                  style={[
                    styles.categoryPillText,
                    {
                      color: isSelected ? '#ffffff' : theme.text,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* FlatList of Curiosities */}
      <FlatList
        data={filteredCuriosities}
        keyExtractor={(item) => item.id}
        renderItem={renderCuriosityCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No encontramos curiosidades
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
              Intenta con otra palabra como «Ester», «Matusalén», «sol» o «récord».
            </Text>
            <TouchableOpacity
              style={[
                styles.emptyResetBtn,
                { backgroundColor: theme.accentMuted },
              ]}
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              <Text style={[styles.emptyResetText, { color: theme.accent }]}>
                Ver todas las curiosidades
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
  },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  categoryBarContainer: {
    height: 48,
    marginBottom: 6,
  },
  categoryBarContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryPillText: {
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 16,
  },
  curiosityCard: {
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  tagWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  emoji: {
    fontSize: 18,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  todayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  todayBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
  },
  recordValuePill: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  recordValueText: {
    fontSize: 10,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 23,
    marginBottom: 10,
  },
  verseSnippetBox: {
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    marginBottom: 12,
  },
  citationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  citationText: {
    fontSize: 12,
    fontWeight: '700',
  },
  snippetText: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  didYouKnowText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  expandToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    marginBottom: 6,
  },
  expandToggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deepDiveBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
  },
  deepDiveTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  deepDiveBody: {
    fontSize: 13,
    lineHeight: 19,
  },
  takeawayDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginVertical: 10,
  },
  takeawayTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  takeawayBody: {
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
    gap: 10,
  },
  openBibleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 40,
    borderRadius: 10,
  },
  openBibleBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyResetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyResetText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
