import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Volume2,
  Heart,
  RotateCw,
} from 'lucide-react-native';
import { DailyDevotional } from '@/src/services/db/bibleDb';
import { toggleBookmark, getChapterUserData } from '@/src/services/db/userDb';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { hapticLight, hapticSuccess } from '@/src/services/haptics/hapticFeedback';

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
    // Reset immediately on verse change so rotating doesn't keep previous bookmark state (BUG FIX)
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

  if (!devotional) return null;

  const { verse } = devotional;
  const citation = `${verse.book_name} ${verse.chapter}:${verse.verse}`;

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
        styles.container,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
          shadowColor: '#000',
        },
      ]}
    >
      {/* Top Row: Badge on left + 3 compact buttons on right */}
      <View style={styles.topRow}>
        <View style={[styles.badge, { backgroundColor: theme.accentMuted }]}>
          <Text style={[styles.badgeText, { color: theme.accent }]}>
            VERSÍCULO DEL DÍA
          </Text>
        </View>

        <View style={styles.topButtonsRow}>
          {/* 1. Actualizar (renueva un nuevo versículo) */}
          {onRotateVerse && (
            <TouchableOpacity
              style={[
                styles.topBtn,
                { backgroundColor: theme.surfaceRaised },
              ]}
              onPress={() => {
                hapticLight();
                onRotateVerse();
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <RotateCw size={15} color={theme.accent} />
            </TouchableOpacity>
          )}

          {/* 2. Corazón (guardar en favoritos / tesoros) */}
          <TouchableOpacity
            style={[
              styles.topBtn,
              {
                backgroundColor: isSaved
                  ? themeMode === 'oled'
                    ? '#331317'
                    : '#fee2e2'
                  : theme.surfaceRaised,
              },
            ]}
            onPress={handleToggleBookmarkAction}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Heart
              size={15}
              color={isSaved ? '#ef4444' : theme.text}
              fill={isSaved ? '#ef4444' : 'transparent'}
            />
          </TouchableOpacity>

          {/* 3. Sonido / Escuchar */}
          <TouchableOpacity
            style={[
              styles.topBtn,
              {
                backgroundColor: isSpeaking ? theme.accent : theme.surfaceRaised,
              },
            ]}
            onPress={handleToggleVoice}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Volume2
              size={16}
              color={isSpeaking ? '#FFFFFF' : theme.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Scripture Text: Tapping navigates to chapter */}
      <TouchableOpacity
        onPress={handleOpenChapter}
        activeOpacity={0.75}
        style={styles.verseTouchable}
      >
        <Text
          style={[
            styles.verseText,
            {
              color: theme.text,
            },
          ]}
        >
          “{verse.text}”
        </Text>
      </TouchableOpacity>

      {/* Citation aligned to the RIGHT */}
      <TouchableOpacity
        onPress={handleOpenChapter}
        activeOpacity={0.75}
        style={styles.citationContainer}
      >
        <Text style={[styles.citationText, { color: theme.accent }]}>
          {citation}
        </Text>
      </TouchableOpacity>

      {/* 2 Quick Action Buttons: Meditar y Crear tarjeta */}
      <View style={[styles.actionsRow, { borderTopColor: theme.borderSubtle }]}>
        {/* 1. Meditar */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.surfaceRaised }]}
          onPress={() => {
            hapticLight();
            onMeditate();
          }}
          activeOpacity={0.75}
        >
          <Text style={styles.actionIcon}>🧘</Text>
          <Text style={[styles.actionBtnText, { color: theme.text }]}>
            Meditar
          </Text>
        </TouchableOpacity>

        {/* 2. Crear Tarjeta */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.surfaceRaised }]}
          onPress={() => {
            hapticLight();
            onShare();
          }}
          activeOpacity={0.75}
        >
          <Text style={styles.actionIcon}>🎨</Text>
          <Text style={[styles.actionBtnText, { color: theme.text }]}>
            Crear tarjeta
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
    marginBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
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
  },
  verseTouchable: {
    paddingVertical: 2,
  },
  verseText: {
    fontSize: 20,
    lineHeight: 32,
    fontWeight: '500',
    letterSpacing: -0.2,
    fontStyle: 'italic',
  },
  citationContainer: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 14,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  citationText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 14,
    paddingHorizontal: 10,
  },
  actionIcon: {
    fontSize: 15,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
});
