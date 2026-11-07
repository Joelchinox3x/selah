import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Share,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  MoreHorizontal,
  Heart,
  MessageSquare,
  Share2,
  BookOpen,
  ChevronRight,
  Layers,
  RotateCw,
} from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { DailyDevotional } from '@/src/services/db/bibleDb';
import { toggleBookmark, getChapterUserData } from '@/src/services/db/userDb';
import { CARD_BACKGROUNDS } from '@/src/features/share/data/cardBackgrounds';
import { hapticLight, hapticSuccess } from '@/src/services/haptics/hapticFeedback';

interface DailyVersePostalModalProps {
  visible: boolean;
  devotional: DailyDevotional | null;
  onClose: () => void;
  onNavigateToReader: (bookId: number, chapter: number, verse: number) => void;
  onShare: () => void;
  onMeditate: () => void;
  onRotateVerse?: () => void;
}

export const DailyVersePostalModal: React.FC<DailyVersePostalModalProps> = ({
  visible,
  devotional,
  onClose,
  onNavigateToReader,
  onShare,
  onMeditate,
  onRotateVerse,
}) => {
  const insets = useSafeAreaInsets();
  const [isSaved, setIsSaved] = useState(false);
  const [bgIndexOffset, setBgIndexOffset] = useState(0);

  // Sync bookmark status when modal becomes visible or verse changes
  useEffect(() => {
    if (!devotional || !visible) return;
    const { verse } = devotional;
    getChapterUserData(verse.book_id, verse.chapter)
      .then((ud) => {
        setIsSaved(Boolean(ud?.bookmarks && ud.bookmarks[verse.verse]));
      })
      .catch(() => {
        setIsSaved(false);
      });
  }, [devotional, visible]);

  // Full-bleed 9:16 vertical scenery background
  const bgItem = useMemo(() => {
    if (!devotional) return CARD_BACKGROUNDS[0];
    const imageList = CARD_BACKGROUNDS.filter((bg) => bg.type === 'image');
    if (imageList.length === 0) return CARD_BACKGROUNDS[0];
    const baseIdx = Math.abs(devotional.verse.id) % imageList.length;
    const finalIdx = (baseIdx + bgIndexOffset) % imageList.length;
    return imageList[finalIdx];
  }, [devotional?.verse.id, bgIndexOffset]);

  const bgSource = bgItem?.source916 || bgItem?.source || CARD_BACKGROUNDS[0].source;

  if (!devotional) return null;

  const { verse } = devotional;
  const citation = `${verse.book_name?.toUpperCase() || ''} ${verse.chapter}:${verse.verse} RVR1909`;

  // Responsive font sizing based on verse text length
  const textLength = verse.text.length;
  const fontSize =
    textLength > 170 ? 20 : textLength > 110 ? 22.5 : textLength > 60 ? 25 : 28;
  const lineHeight =
    textLength > 170 ? 30 : textLength > 110 ? 33.5 : textLength > 60 ? 37 : 41;

  const handleToggleBookmark = async () => {
    hapticSuccess();
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    await toggleBookmark(verse.book_id, verse.chapter, verse.verse);
  };

  const handleGoToReader = () => {
    hapticLight();
    onClose();
    onNavigateToReader(verse.book_id, verse.chapter, verse.verse);
  };

  const handleQuickShare = async () => {
    hapticLight();
    try {
      await Share.share({
        message: `«${verse.text}»\n— ${verse.book_name} ${verse.chapter}:${verse.verse} (RVR1909)\n\nLeído en Selah Biblia`,
      });
    } catch {
      onShare();
    }
  };

  const handleChangeBackground = () => {
    hapticLight();
    setBgIndexOffset((prev) => prev + 1);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* 1. Full-screen 9:16 vertical scenery background */}
        <Image
          source={bgSource}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />

        {/* 2. Soft, natural scrim gradient (leaves the photo bright and scenic) */}
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={StyleSheet.absoluteFill}
        >
          <Defs>
            <LinearGradient id="postalGrad" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
              <Stop offset="22%" stopColor="#000000" stopOpacity="0.15" />
              <Stop offset="65%" stopColor="#000000" stopOpacity="0.30" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0.75" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100" height="100" fill="url(#postalGrad)" />
        </Svg>

        {/* 3. Top Action Bar: Close (X) on left, More (...) on right */}
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top + 10, 24) }]}>
          <TouchableOpacity
            style={styles.iconCircleBtn}
            onPress={() => {
              hapticLight();
              onClose();
            }}
            activeOpacity={0.75}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.topRightActions}>
            {/* Rotate Verse Action */}
            {onRotateVerse && (
              <TouchableOpacity
                style={styles.iconCircleBtn}
                onPress={() => {
                  hapticLight();
                  onRotateVerse();
                }}
                activeOpacity={0.75}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <RotateCw size={19} color="#FFFFFF" />
              </TouchableOpacity>
            )}

            {/* Change background scenery */}
            <TouchableOpacity
              style={styles.iconCircleBtn}
              onPress={handleChangeBackground}
              activeOpacity={0.75}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MoreHorizontal size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Main Postal Verse Content (Left-aligned, matching YouVersion layout) */}
        <View style={styles.contentContainer}>
          {/* Subtitle */}
          <Text style={styles.categoryTitle}>Versículo del Día</Text>

          {/* Citation - Tapping opens Bible */}
          <TouchableOpacity
            onPress={handleGoToReader}
            activeOpacity={0.8}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 8 }}
          >
            <Text style={styles.citationTitle}>{citation}</Text>
          </TouchableOpacity>

          {/* User Request: "en donde esta el versiculo al lado izquierdo ahi pone seguir leyendo y si le hace click ahi o al versiculo te lleva a la biblia" */}
          <TouchableOpacity
            style={styles.continueReadingBtn}
            onPress={handleGoToReader}
            activeOpacity={0.8}
          >
            <BookOpen size={14} color="#FFFFFF" />
            <Text style={styles.continueReadingText}>Seguir leyendo</Text>
            <ChevronRight size={14} color="#fbbf24" />
          </TouchableOpacity>

          {/* Scripture Verse Text - Tapping opens Bible */}
          <TouchableOpacity
            onPress={handleGoToReader}
            activeOpacity={0.85}
            style={styles.verseTouchable}
          >
            <Text
              style={[
                styles.verseBody,
                {
                  fontSize,
                  lineHeight,
                },
              ]}
            >
              {verse.text}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 5. Bottom Engagement Bar (Mirrors YouVersion story engagement) */}
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 12, 24) }]}>
          {/* Like / Bookmark Button */}
          <TouchableOpacity
            style={styles.bottomActionItem}
            onPress={handleToggleBookmark}
            activeOpacity={0.75}
          >
            <Heart
              size={26}
              color={isSaved ? '#ef4444' : '#FFFFFF'}
              fill={isSaved ? '#ef4444' : 'transparent'}
            />
            <Text style={[styles.bottomActionLabel, isSaved && styles.bottomActionLabelActive]}>
              {isSaved ? 'Guardado' : '1,646M'}
            </Text>
          </TouchableOpacity>

          {/* Meditar (Chat bubble / contemplation) */}
          <TouchableOpacity
            style={styles.bottomActionItem}
            onPress={() => {
              hapticLight();
              onClose();
              onMeditate();
            }}
            activeOpacity={0.75}
          >
            <MessageSquare size={25} color="#FFFFFF" />
            <Text style={styles.bottomActionLabel}>30.444</Text>
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity
            style={styles.bottomActionItem}
            onPress={handleQuickShare}
            activeOpacity={0.75}
          >
            <Share2 size={25} color="#FFFFFF" />
            <Text style={styles.bottomActionLabel}>672,1m</Text>
          </TouchableOpacity>

          {/* Custom Card Creator Thumbnail (Far Right) */}
          <TouchableOpacity
            style={styles.bottomActionItem}
            onPress={() => {
              hapticLight();
              onClose();
              onShare();
            }}
            activeOpacity={0.75}
          >
            <View style={styles.thumbnailCard}>
              <Layers size={17} color="#fbbf24" />
            </View>
            <Text style={styles.bottomActionLabel}>Crear</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050811',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 0, 0, 0.40)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 26,
    paddingTop: 10,
    paddingBottom: 20,
    zIndex: 5,
  },
  categoryTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.3,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  citationTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 6,
  },
  continueReadingBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.45)',
    marginTop: 10,
    marginBottom: 18,
  },
  continueReadingText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  verseTouchable: {
    paddingVertical: 4,
  },
  verseBody: {
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '500',
    letterSpacing: -0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.80)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingTop: 16,
    zIndex: 10,
  },
  bottomActionItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minWidth: 54,
  },
  bottomActionLabel: {
    color: 'rgba(255, 255, 255, 0.90)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomActionLabelActive: {
    color: '#ef4444',
    fontWeight: '700',
  },
  thumbnailCard: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: 'rgba(0, 0, 0, 0.50)',
    borderWidth: 1.5,
    borderColor: '#fbbf24',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
