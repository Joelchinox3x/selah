import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { Volume2, Heart, ArrowLeft, ArrowRight } from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { DailyDevotional } from '@/src/services/db/bibleDb';
import { toggleBookmark, getChapterUserData } from '@/src/services/db/userDb';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { hapticLight, hapticSuccess } from '@/src/services/haptics/hapticFeedback';
import { CARD_BACKGROUNDS, getVerseBackground } from '@/src/features/share/data/cardBackgrounds';

interface DailyVerseHeroProps {
  devotional: DailyDevotional | null;
  onShare: () => void;
  onMeditate: () => void;
  dayOffset?: number;
  onPreviousDay?: () => void;
  onNextDay?: () => void;
  verseBusy?: boolean;
  onOpenPostal: () => void;
  onReadVerse: () => void;
}

export const DailyVerseHero: React.FC<DailyVerseHeroProps> = ({
  devotional,
  onShare,
  onMeditate,
  dayOffset = 0,
  onPreviousDay,
  onNextDay,
  verseBusy = false,
  onOpenPostal,
  onReadVerse,
}) => {
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [cardWidth, setCardWidth] = useState<number | null>(null);

  useEffect(() => {
    if (!devotional) return;
    setIsSaved(false);
    const { verse } = devotional;
    getChapterUserData(verse.book_id, verse.chapter)
      .then((ud) => {
        setIsSaved(Boolean(ud?.bookmarks && ud.bookmarks[verse.verse]));
      })
      .catch(() => {
        setIsSaved(false);
      });
  }, [devotional]);

  // Dynamically select a beautiful spiritual scenery background mapped to the verse
  const bgItem = useMemo(() => {
    if (!devotional) return CARD_BACKGROUNDS[0];
    return getVerseBackground(devotional.verse.id);
  }, [devotional?.verse.id]);

  const bgSource = bgItem?.source1x1 || bgItem?.source916 || bgItem?.source || CARD_BACKGROUNDS[0].source;

  if (!devotional) return null;

  const { verse } = devotional;
  const citation = `${verse.book_name} ${verse.chapter}:${verse.verse}`;

  // Dynamic font sizing so verse text fits comfortably within the square
  const verseLen = verse.text.length;
  const fontSize =
    verseLen > 150 ? 15 : verseLen > 100 ? 16.5 : verseLen > 60 ? 18 : 20;
  const lineHeight =
    verseLen > 150 ? 22 : verseLen > 100 ? 24 : verseLen > 60 ? 26 : 28;

  const handleToggleVoice = () => {
    hapticLight();
    setIsSpeaking((prev) => !prev);
  };

  const handleToggleBookmarkAction = async () => {
    hapticSuccess();
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    await toggleBookmark(verse.book_id, verse.chapter, verse.verse);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.96}
      onPress={() => {
        hapticLight();
        onOpenPostal();
      }}
      onLayout={(e) => {
        const w = Math.round(e.nativeEvent.layout.width);
        if (w > 0 && w !== cardWidth) {
          setCardWidth(w);
        }
      }}
      style={[
        styles.cardContainer,
        {
          borderColor: 'rgba(255, 255, 255, 0.15)',
          backgroundColor: '#090d16',
          shadowColor: '#000',
        },
        cardWidth ? { height: cardWidth } : null,
      ]}
    >
      {/* 1. Full-Bleed Natural Spiritual Photography */}
      <Image
        source={bgSource}
        style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
        resizeMode="cover"
      />

      {/* 2. Soft, natural vertical gradient (photo stays vibrant and natural) */}
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <LinearGradient id="heroScrimGrad" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
            <Stop offset="25%" stopColor="#000000" stopOpacity="0.15" />
            <Stop offset="65%" stopColor="#000000" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0.75" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill="url(#heroScrimGrad)" />
      </Svg>

      {/* 3. Foreground Content */}
      <View style={styles.cardContent}>
        {/* Top Row: Dynamic Badge on left + temporal navigation & action buttons on right */}
        <View style={styles.topRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {dayOffset === 0
                ? 'VERSÍCULO DE HOY'
                : dayOffset === 1
                ? 'AYER'
                : `HACE ${dayOffset} DÍAS`}
            </Text>
          </View>

          <View style={styles.topButtonsRow}>
            {/* 1. Flecha Anterior (← Ayer / Días pasados hasta 7) */}
            {onPreviousDay && (
              <TouchableOpacity
                style={[styles.topBtn, (dayOffset >= 7 || verseBusy) && { opacity: 0.3 }]}
                disabled={dayOffset >= 7 || verseBusy}
                accessibilityRole="button"
                accessibilityLabel="Ver día anterior"
                onPress={(e) => {
                  e.stopPropagation?.();
                  hapticLight();
                  onPreviousDay();
                }}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <ArrowLeft size={14} color="#FFFFFF" />
              </TouchableOpacity>
            )}

            {/* 2. Flecha Siguiente (→ hacia Hoy, solo si dayOffset > 0) */}
            {onNextDay && dayOffset > 0 && (
              <TouchableOpacity
                style={[styles.topBtn, verseBusy && { opacity: 0.3 }]}
                disabled={verseBusy}
                accessibilityRole="button"
                accessibilityLabel="Ver día siguiente hacia hoy"
                onPress={(e) => {
                  e.stopPropagation?.();
                  hapticLight();
                  onNextDay();
                }}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <ArrowRight size={14} color="#fbbf24" />
              </TouchableOpacity>
            )}

            {/* 2. Corazón (guardar en favoritos / tesoros) */}
            <TouchableOpacity
              style={[
                styles.topBtn,
                isSaved && styles.topBtnHeartSaved,
              ]}
              onPress={(e) => {
                e.stopPropagation?.();
                handleToggleBookmarkAction();
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Heart
                size={14}
                color={isSaved ? '#ef4444' : '#FFFFFF'}
                fill={isSaved ? '#ef4444' : 'transparent'}
              />
            </TouchableOpacity>

            {/* 3. Sonido / Escuchar */}
            <TouchableOpacity
              style={[
                styles.topBtn,
                isSpeaking && styles.topBtnAudioActive,
              ]}
              onPress={(e) => {
                e.stopPropagation?.();
                handleToggleVoice();
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Volume2
                size={15}
                color={isSpeaking ? '#fbbf24' : '#FFFFFF'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Center: Main Scripture Text (Tapping anywhere opens full postal) */}
        <View style={styles.verseTouchable}>
          <Text
            style={[
              styles.verseText,
              {
                fontSize,
                lineHeight,
              },
            ]}
            numberOfLines={5}
            ellipsizeMode="tail"
          >
            “{verse.text}”
          </Text>
          <TouchableOpacity
            style={styles.citationLink}
            accessibilityRole="button"
            accessibilityLabel={`Leer ${citation} en la Biblia`}
            onPress={(e) => {
              e.stopPropagation?.();
              hapticLight();
              onReadVerse();
            }}
            activeOpacity={0.75}
            hitSlop={8}
          >
            <Text style={styles.citationText}>{citation}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSection}>
          {/* 2 Quick Action Buttons below: Meditar y Crear tarjeta */}
          <View style={styles.actionsRow}>
            {/* 1. Meditar */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={(e) => {
                e.stopPropagation?.();
                hapticLight();
                onMeditate();
              }}
              activeOpacity={0.75}
            >
              <Text style={styles.actionIcon}>🧘</Text>
              <Text style={styles.actionBtnText}>Meditar</Text>
            </TouchableOpacity>

            {/* 2. Crear Tarjeta */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={(e) => {
                e.stopPropagation?.();
                hapticLight();
                onShare();
              }}
              activeOpacity={0.75}
            >
              <Text style={styles.actionIcon}>🎨</Text>
              <Text style={styles.actionBtnText}>Crear tarjeta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 20,
    position: 'relative',
  },
  cardContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.45)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fbbf24',
    letterSpacing: 0.3,
  },
  topButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  topBtnHeartSaved: {
    backgroundColor: 'rgba(239, 68, 68, 0.35)',
    borderColor: '#ef4444',
  },
  topBtnAudioActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.35)',
    borderColor: '#fbbf24',
  },
  verseTouchable: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  verseText: {
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '500',
    letterSpacing: -0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.90)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 6,
  },
  bottomSection: {
    zIndex: 2,
    marginTop: 2,
  },
  citationLink: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.50)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.40)',
  },
  citationText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#fbbf24',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  actionIcon: {
    fontSize: 13,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.1,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
