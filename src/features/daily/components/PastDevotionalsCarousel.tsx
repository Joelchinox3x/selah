import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Calendar, ChevronRight, BookOpen, Sparkles } from 'lucide-react-native';
import { DailyDevotional, getDailyDevotional } from '@/src/services/db/bibleDb';
import { ThemePalette } from '@/src/theme/colors';
import { hapticLight } from '@/src/services/haptics/hapticFeedback';

interface PastDevotionalsCarouselProps {
  theme: ThemePalette;
  onSelectDevotional: (dev: DailyDevotional) => void;
}

interface PastDayItem {
  devotional: DailyDevotional;
  dayLabel: string;
  dateLabel: string;
}

export const PastDevotionalsCarousel: React.FC<PastDevotionalsCarouselProps> = ({
  theme,
  onSelectDevotional,
}) => {
  const [items, setItems] = useState<PastDayItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadPastDays() {
      try {
        const results: PastDayItem[] = [];
        const today = new Date();

        for (let i = 1; i <= 7; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);

          const dev = await getDailyDevotional({ date: d });

          let dayLabel = '';
          if (i === 1) {
            dayLabel = 'Ayer';
          } else {
            const rawDay = d.toLocaleDateString('es-ES', { weekday: 'long' });
            dayLabel = rawDay.charAt(0).toUpperCase() + rawDay.slice(1);
          }

          const dateLabel = d.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
          });

          results.push({
            devotional: dev,
            dayLabel,
            dateLabel,
          });
        }

        if (isMounted) {
          setItems(results);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Error loading past devotionals:', err);
        if (isMounted) setLoading(false);
      }
    }

    loadPastDays();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading && items.length === 0) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="small" color={theme.accent} />
        <Text style={[styles.loadingText, { color: theme.textMuted }]}>
          Cargando versículos anteriores...
        </Text>
      </View>
    );
  }

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <View style={[styles.iconWrap, { backgroundColor: theme.surfaceRaised }]}>
            <Calendar size={15} color={theme.accent} />
          </View>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Versículos de días anteriores
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
              Repasa devocionales pasados y sigue las reflexiones
            </Text>
          </View>
        </View>
      </View>

      {/* Horizontal Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={280}
      >
        {items.map((item, index) => {
          const { devotional, dayLabel, dateLabel } = item;
          const { verse } = devotional;
          const citation = `${verse.book_name} ${verse.chapter}:${verse.verse}`;

          return (
            <TouchableOpacity
              key={`${devotional.dateKey}-${index}`}
              style={[
                styles.card,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.borderSubtle,
                },
              ]}
              activeOpacity={0.8}
              onPress={() => {
                hapticLight();
                onSelectDevotional(devotional);
              }}
            >
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={[styles.dayBadge, { backgroundColor: theme.surfaceRaised }]}>
                  <Text style={[styles.dayBadgeText, { color: theme.accent }]}>
                    {dayLabel} · {dateLabel}
                  </Text>
                </View>

                {!!devotional.theme && (
                  <View style={[styles.themeTag, { backgroundColor: theme.surfaceRaised }]}>
                    <Sparkles size={11} color={theme.textMuted} />
                    <Text
                      style={[styles.themeTagText, { color: theme.textMuted }]}
                      numberOfLines={1}
                    >
                      {devotional.theme}
                    </Text>
                  </View>
                )}
              </View>

              {/* Citation */}
              <Text style={[styles.citation, { color: theme.text }]}>
                {citation}
              </Text>

              {/* Verse Snippet */}
              <Text
                style={[styles.verseSnippet, { color: theme.textMuted }]}
                numberOfLines={2}
              >
                "{verse.text}"
              </Text>

              {/* Card Footer */}
              <View style={styles.cardFooter}>
                <View style={styles.footerLeft}>
                  <BookOpen size={12} color={theme.accent} />
                  <Text style={[styles.openPostalText, { color: theme.accent }]}>
                    Ver postal y muro
                  </Text>
                </View>
                <ChevronRight size={14} color={theme.accent} />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 4,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 11.5,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 8,
  },
  card: {
    width: 270,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 8,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  dayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  dayBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  themeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    maxWidth: 130,
  },
  themeTagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  citation: {
    fontSize: 15,
    fontWeight: '800',
  },
  verseSnippet: {
    fontSize: 12.5,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  openPostalText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  loadingWrap: {
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
  },
});
