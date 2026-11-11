import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
  Platform,
  UIManager,
  LayoutAnimation,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles, ChevronRight, BookOpen, Shuffle, Share2 } from 'lucide-react-native';
import {
  BiblicalCuriosity,
  BIBLICAL_CURIOSITIES,
  getCuriosityHighlightParam,
} from '@/src/features/curiosities/data/biblicalCuriosities';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { hapticLight } from '@/src/services/haptics/hapticFeedback';

interface DailyCuriosityCardProps {
  curiosity: BiblicalCuriosity;
}

export const DailyCuriosityCard: React.FC<DailyCuriosityCardProps> = ({
  curiosity: initialCuriosity,
}) => {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;
  const isDark = themeMode === 'oled';

  const [curiosity, setCuriosity] = useState<BiblicalCuriosity>(initialCuriosity);

  // Sincronizar si cambia la curiosidad inicial enviada por props
  useEffect(() => {
    if (initialCuriosity) {
      setCuriosity(initialCuriosity);
    }
  }, [initialCuriosity?.id]);

  // Cambiar a otra curiosidad aleatoria al toque
  const handleShuffle = () => {
    hapticLight();
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const pool = BIBLICAL_CURIOSITIES.filter((c) => c.id !== curiosity.id);
    const nextItem = pool[Math.floor(Math.random() * pool.length)] || pool[0];
    setCuriosity(nextItem);
  };

  const handleOpenCuriosities = () => {
    hapticLight();
    router.push('/curiosities' as any);
  };

  const handleOpenReader = () => {
    hapticLight();
    router.push({
      pathname: `/reader/${curiosity.bookId}/${curiosity.chapter}`,
      params: { highlightVerse: getCuriosityHighlightParam(curiosity) },
    } as any);
  };

  const handleShare = async () => {
    hapticLight();
    try {
      const shareMessage = `💡 *¿Sabías qué?* — Curiosidad Bíblica\n\n✨ *${curiosity.title}*\n📖 ${curiosity.biblicalCitation}\n\n«${curiosity.verseSnippet}»\n\n📌 *El dato:* ${curiosity.didYouKnow}\n\n🌱 *Reflexión:* ${curiosity.keyTakeaway}\n\n— Descubre más en Selah: Biblia & Calma Espiritual\nhttps://selah.boxtiove.com`;
      await Share.share({
        message: shareMessage,
        title: curiosity.title,
      });
    } catch (e) {
      console.warn('Error sharing curiosity:', e);
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.borderSubtle,
        },
      ]}
    >
      {/* 1. Fila Superior: Badge + Categoría a la izquierda, Botón "Cambiar" a la derecha */}
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isDark
                  ? 'rgba(217, 119, 6, 0.18)'
                  : 'rgba(217, 119, 6, 0.10)',
              },
            ]}
          >
            <Sparkles size={11} color={theme.accent} />
            <Text style={[styles.badgeText, { color: theme.accent }]}>
              ¿SABÍAS QUÉ?
            </Text>
          </View>

          <View
            style={[
              styles.categoryChip,
              {
                borderColor: theme.borderSubtle,
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.03)',
              },
            ]}
          >
            <Text style={[styles.categoryText, { color: theme.textMuted }]}>
              {curiosity.categoryTag}
            </Text>
          </View>
        </View>

        {/* Botón táctil para renovar/cambiar inmediatamente */}
        <TouchableOpacity
          style={[
            styles.shuffleBtn,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.07)'
                : 'rgba(0, 0, 0, 0.04)',
              borderColor: theme.borderSubtle,
            },
          ]}
          onPress={handleShuffle}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Ver otra curiosidad aleatoria"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Shuffle size={12} color={theme.accent} />
          <Text style={[styles.shuffleText, { color: theme.accent }]}>
            Cambiar
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2. Hero Pill del Dato Métrico Destacado (Récords, Cifras, Insólitos) */}
      {curiosity.badgeValue ? (
        <View
          style={[
            styles.metricHeroPill,
            {
              backgroundColor: isDark
                ? 'rgba(217, 119, 6, 0.12)'
                : 'rgba(217, 119, 6, 0.08)',
              borderColor: isDark
                ? 'rgba(217, 119, 6, 0.28)'
                : 'rgba(217, 119, 6, 0.20)',
            },
          ]}
        >
          <Text style={styles.metricEmoji}>{curiosity.emoji}</Text>
          <Text style={[styles.metricHeroText, { color: theme.accent }]}>
            {curiosity.badgeValue}
          </Text>
        </View>
      ) : null}

      {/* 3. Título de la Curiosidad */}
      <TouchableOpacity onPress={handleOpenCuriosities} activeOpacity={0.85}>
        <Text style={[styles.title, { color: theme.text }]}>
          {curiosity.title}
        </Text>
      </TouchableOpacity>

      {/* 4. Párrafo Revelador */}
      <Text
        style={[styles.didYouKnow, { color: theme.textMuted }]}
        numberOfLines={3}
      >
        {curiosity.didYouKnow}
      </Text>

      {/* 5. Pie de Tarjeta: Leer Pasaje + Compartir Rápido + Ver Más */}
      <View style={[styles.footer, { borderTopColor: theme.borderSubtle }]}>
        {/* Leer versículo en la Biblia */}
        <TouchableOpacity
          style={[
            styles.verseBtn,
            {
              backgroundColor: isDark
                ? '#1e293b'
                : 'rgba(217, 119, 6, 0.08)',
            },
          ]}
          onPress={handleOpenReader}
          activeOpacity={0.8}
        >
          <BookOpen size={13} color={theme.accent} />
          <Text style={[styles.verseBtnText, { color: theme.accent }]}>
            Leer {curiosity.biblicalCitation}
          </Text>
        </TouchableOpacity>

        {/* Acciones Rápidas */}
        <View style={styles.footerRight}>
          {/* Botón Compartir en 1 toque */}
          <TouchableOpacity
            style={[
              styles.shareBtn,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.07)'
                  : 'rgba(0, 0, 0, 0.04)',
                borderColor: theme.borderSubtle,
              },
            ]}
            onPress={handleShare}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Compartir curiosidad"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Share2 size={12} color={theme.text} />
            <Text style={[styles.shareBtnText, { color: theme.text }]}>
              Compartir
            </Text>
          </TouchableOpacity>

          {/* Ver más en catálogo */}
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={handleOpenCuriosities}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.seeAllText, { color: theme.textMuted }]}>
              Ver más
            </Text>
            <ChevronRight size={13} color={theme.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4.5,
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  categoryChip: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  shuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4.5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  shuffleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  metricHeroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginBottom: 8,
  },
  metricEmoji: {
    fontSize: 13,
  },
  metricHeroText: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 5,
  },
  didYouKnow: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  verseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    flexShrink: 1,
  },
  verseBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4.5,
    paddingHorizontal: 8,
    paddingVertical: 5.5,
    borderRadius: 8,
    borderWidth: 1,
  },
  shareBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingLeft: 2,
  },
  seeAllText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
