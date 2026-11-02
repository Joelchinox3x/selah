import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Volume2,
  VolumeX,
  Heart,
  Palette,
  Bookmark,
  Sparkles,
  RotateCw,
  ChevronRight,
  BookOpen,
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
    const { verse } = devotional;
    // Check if verse is already bookmarked
    getChapterUserData(verse.book_id, verse.chapter).then((ud) => {
      if (ud.bookmarks[verse.verse]) {
        setIsSaved(true);
      }
    });
  }, [devotional]);

  if (!devotional) return null;

  const { verse, theme: topic } = devotional;
  const citation = `${verse.book_name} ${verse.chapter}:${verse.verse}`;

  const handleToggleVoice = () => {
    hapticLight();
    setIsSpeaking((prev) => !prev);
  };

  const handleToggleBookmarkAction = async () => {
    hapticSuccess();
    await toggleBookmark(verse.book_id, verse.chapter, verse.verse);
    setIsSaved((prev) => !prev);
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
      {/* Top Badge & Voice Button */}
      <View style={styles.topRow}>
        <View style={[styles.badge, { backgroundColor: theme.accentMuted }]}>
          <Text style={[styles.badgeText, { color: theme.accent }]}>
            VERSÍCULO DEL DÍA •
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {onRotateVerse && (
            <TouchableOpacity
              style={[
                styles.audioBtn,
                {
                  backgroundColor: theme.surfaceRaised,
                },
              ]}
              onPress={() => {
                hapticLight();
                onRotateVerse();
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <RotateCw size={16} color={theme.accent} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.audioBtn,
              {
                backgroundColor: isSpeaking ? theme.accent : theme.surfaceRaised,
              },
            ]}
            onPress={handleToggleVoice}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {isSpeaking ? (
              <Volume2 size={18} color="#FFFFFF" />
            ) : (
              <Volume2 size={18} color={theme.text} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Scripture Text with Editorial Curved Quotes */}
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

      {/* Citation, Version & Saved Status (Clickable to read full chapter) */}
      <View style={styles.metaRow}>
        <TouchableOpacity
          onPress={handleOpenChapter}
          activeOpacity={0.75}
          style={styles.citationTouch}
        >
          <View style={styles.citationRow}>
            <Text style={[styles.citation, { color: theme.text }]}>
              {citation}
            </Text>
            <View style={[styles.readPill, { backgroundColor: theme.surfaceRaised }]}>
              <Text style={[styles.readPillText, { color: theme.accent }]}>Leer capítulo</Text>
              <ChevronRight size={12} color={theme.accent} />
            </View>
          </View>
          <Text style={[styles.versionText, { color: theme.textMuted }]}>
            Reina-Valera 1909 · Tocar para abrir
          </Text>
        </TouchableOpacity>

        <View style={styles.savedStatusWrap}>
          <Text
            style={[
              styles.savedStatusText,
              { color: isSaved ? theme.accent : theme.textMuted },
            ]}
          >
            {isSaved ? '🤎 Guardado hoy' : '🤍 Guardar'}
          </Text>
        </View>
      </View>

      {/* 3 Quick Action Buttons (Photo 1) */}
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

        {/* 3. Tesoros */}
        <TouchableOpacity
          style={[
            styles.actionBtn,
            styles.treasureBtn,
            { backgroundColor: isSaved ? theme.accent : theme.surfaceRaised },
          ]}
          onPress={handleToggleBookmarkAction}
          activeOpacity={0.75}
        >
          <Bookmark
            size={16}
            color={isSaved ? '#FFFFFF' : theme.text}
          />
          <Text
            style={[
              styles.actionBtnText,
              { color: isSaved ? '#FFFFFF' : theme.text },
            ]}
          >
            Tesoros
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
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  audioBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verseText: {
    fontSize: 20,
    lineHeight: 32,
    fontWeight: '500',
    letterSpacing: -0.2,
    fontStyle: 'italic',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 16,
  },
  citationTouch: {
    flex: 1,
    marginRight: 12,
  },
  citationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  citation: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  readPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  readPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  versionText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  savedStatusWrap: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  savedStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    minHeight: 46,
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
  treasureBtn: {},
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
});
