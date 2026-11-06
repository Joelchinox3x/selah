import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Volume2, Heart, RotateCw } from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { DailyDevotional } from '@/src/services/db/bibleDb';
import { toggleBookmark, getChapterUserData } from '@/src/services/db/userDb';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { hapticLight, hapticSuccess } from '@/src/services/haptics/hapticFeedback';
import { CARD_BACKGROUNDS } from '@/src/features/share/data/cardBackgrounds';

interface DailyVerseHeroProps {
  devotional: DailyDevotional | null;
  onShare: () => void;
  onMeditate: () => void;
  onRotateVerse?: () => void;
}

export const DailyVerseHero: React.FC<DailyVerseHeroProps> = ({
  devotional,
  onShare,
  onMeditate,
  onRotateVerse,
}) => {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!devotional) return;
    // Reset immediately on verse change so rotating doesn't keep previous bookmark state
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

  // Dynamically select a beautiful 1:1 spiritual background mapped to the verse
  const bgItem = useMemo(() => {
    if (!devotional) return CARD_BACKGROUNDS[0];
    const idx = Math.abs(devotional.verse.id) % CARD_BACKGROUNDS.length;
    return CARD_BACKGROUNDS[idx];
  }, [devotional?.verse.id]);

  const bgSource = bgItem?.source1x1 || CARD_BACKGROUNDS[0].source1x1;

  if (!devotional) return null;

  const { verse } = devotional;
  const citation = `${verse.book_name} ${verse.chapter}:${verse.verse}`;

  // Dynamic font sizing so both short and long verses fit comfortably in the 1:1 box
  const verseLen = verse.text.length;
  const fontSize =
    verseLen > 150 ? 15 : verseLen > 100 ? 17 : verseLen > 60 ? 19 : 21;
  const lineHeight =
    verseLen > 150 ? 23 : verseLen > 100 ? 26 : verseLen > 60 ? 29 : 32;

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

  const handleOpenChapter = () => {
    hapticLight();
    router.push(
      `/reader/${verse.book_id}/${verse.chapter}?highlightVerse=${verse.verse}` as any
    );
  };

  return (
    <View
      style={[
        styles.cardContainer,
        {
          borderColor: theme.border,
          shadowColor: '#000',
        },
      ]}
    >
      <ImageBackground
        source={bgSource}
        style={styles.bgImage}
        imageStyle={styles.imageInner}
      >
        {/* Scrim Gradient Overlay for max contrast & readability */}
        <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="scrimGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#050811" stopOpacity="0.55" />
              <Stop offset="0.32" stopColor="#050811" stopOpacity="0.38" />
              <Stop offset="0.68" stopColor="#050811" stopOpacity="0.65" />
              <Stop offset="1" stopColor="#050811" stopOpacity="0.90" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#scrimGrad)" />
        </Svg>

        {/* Top Row: Badge on left + 3 glass buttons on right */}
        <View style={styles.topRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>VERSÍCULO DEL DÍA</Text>
          </View>

          <View style={styles.topButtonsRow}>
            {/* 1. Actualizar (renueva un nuevo versículo) */}
            {onRotateVerse && (
              <TouchableOpacity
                style={styles.topBtn}
                onPress={() => {
                  hapticLight();
                  onRotateVerse();
                }}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <RotateCw size={15} color="#fbbf24" />
              </TouchableOpacity>
            )}

            {/* 2. Corazón (guardar en favoritos / tesoros) */}
            <TouchableOpacity
              style={[
                styles.topBtn,
                isSaved && styles.topBtnHeartSaved,
              ]}
              onPress={handleToggleBookmarkAction}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Heart
                size={15}
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
              onPress={handleToggleVoice}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Volume2
                size={16}
                color={isSpeaking ? '#fbbf24' : '#FFFFFF'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Center: Main Scripture Text (Tapping navigates to chapter) */}
        <TouchableOpacity
          onPress={handleOpenChapter}
          activeOpacity={0.8}
          style={styles.verseTouchable}
        >
          <Text
            style={[
              styles.verseText,
              {
                fontSize,
                lineHeight,
              },
            ]}
            numberOfLines={6}
          >
            “{verse.text}”
          </Text>
        </TouchableOpacity>

        {/* Bottom Section: Right-aligned Citation + 2 Action Buttons */}
        <View style={styles.bottomSection}>
          {/* Citation aligned to the RIGHT */}
          <TouchableOpacity
            onPress={handleOpenChapter}
            activeOpacity={0.75}
            style={styles.citationContainer}
          >
            <Text style={styles.citationText}>{citation}</Text>
          </TouchableOpacity>

          {/* 2 Quick Action Buttons: Meditar y Crear tarjeta */}
          <View style={styles.actionsRow}>
            {/* 1. Meditar */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
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
              onPress={() => {
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
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 24,
    borderWidth: 1,
    aspectRatio: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
    marginBottom: 20,
  },
  bgImage: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
  },
  imageInner: {
    borderRadius: 23,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  badge: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fbbf24',
    letterSpacing: 0.8,
  },
  topButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  topBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  topBtnHeartSaved: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderColor: '#ef4444',
  },
  topBtnAudioActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    borderColor: '#fbbf24',
  },
  verseTouchable: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 8,
    zIndex: 2,
  },
  verseText: {
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: -0.2,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 8,
  },
  bottomSection: {
    zIndex: 2,
  },
  citationContainer: {
    alignSelf: 'flex-end',
    marginBottom: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  citationText: {
    fontSize: 13,
    fontWeight: '700',
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
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.50)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  actionIcon: {
    fontSize: 14,
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
