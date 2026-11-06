import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Volume2, Heart, RotateCw, ChevronRight } from 'lucide-react-native';
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
    verseLen > 150 ? 15 : verseLen > 100 ? 16.5 : verseLen > 60 ? 18.5 : 21;
  const lineHeight =
    verseLen > 150 ? 22 : verseLen > 100 ? 24.5 : verseLen > 60 ? 27 : 30;

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
          backgroundColor: '#090d16',
          shadowColor: '#000',
        },
      ]}
    >
      {/* 1. Dedicated Full-Bleed 1:1 Spiritual Photography */}
      <Image
        source={bgSource}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {/* 2. Guaranteed 100% full-surface dark base tint (eliminates unshaded edge gaps on all Android screens) */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(5, 8, 17, 0.40)' },
        ]}
      />

      {/* 3. Deep vertical gradient overlay with proper viewBox */}
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <LinearGradient id="heroScrimGrad" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor="#050811" stopOpacity="0.75" />
            <Stop offset="30%" stopColor="#050811" stopOpacity="0.30" />
            <Stop offset="70%" stopColor="#050811" stopOpacity="0.65" />
            <Stop offset="100%" stopColor="#050811" stopOpacity="0.95" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill="url(#heroScrimGrad)" />
      </Svg>

      {/* 4. Foreground Content */}
      <View style={styles.cardContent}>
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
                <RotateCw size={14} color="#fbbf24" />
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
              onPress={handleToggleVoice}
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

        {/* Bottom Row: [🧘 Meditar] [🎨 Tarjeta] on left, [Juan 8:12 ›] on right */}
        <View style={styles.bottomRow}>
          <View style={styles.bottomActionsLeft}>
            <TouchableOpacity
              style={styles.actionPill}
              onPress={() => {
                hapticLight();
                onMeditate();
              }}
              activeOpacity={0.75}
            >
              <Text style={styles.actionIcon}>🧘</Text>
              <Text style={styles.actionPillText}>Meditar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionPill}
              onPress={() => {
                hapticLight();
                onShare();
              }}
              activeOpacity={0.75}
            >
              <Text style={styles.actionIcon}>🎨</Text>
              <Text style={styles.actionPillText}>Tarjeta</Text>
            </TouchableOpacity>
          </View>

          {/* Citation aligned to the RIGHT */}
          <TouchableOpacity
            onPress={handleOpenChapter}
            activeOpacity={0.75}
            style={styles.citationBadge}
          >
            <Text style={styles.citationText}>{citation}</Text>
            <ChevronRight size={13} color="#fbbf24" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 24,
    borderWidth: 1,
    aspectRatio: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 20,
    position: 'relative',
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.50)',
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
    gap: 6,
  },
  topBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.50)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  topBtnHeartSaved: {
    backgroundColor: 'rgba(239, 68, 68, 0.30)',
    borderColor: '#ef4444',
  },
  topBtnAudioActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.30)',
    borderColor: '#fbbf24',
  },
  verseTouchable: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 6,
  },
  verseText: {
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: -0.2,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.95)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  bottomActionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.50)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
  },
  actionIcon: {
    fontSize: 12,
  },
  actionPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  citationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  citationText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fbbf24',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
