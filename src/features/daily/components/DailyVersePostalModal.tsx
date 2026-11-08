import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  ScrollView,
  Pressable,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  MoreHorizontal,
  Heart,
  MessageSquare,
  Share2,
  Layers,
  RotateCw,
} from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { DailyDevotional } from '@/src/services/db/bibleDb';
import { toggleBookmark, getChapterUserData } from '@/src/services/db/userDb';
import { CARD_BACKGROUNDS, getVerseBackground } from '@/src/features/share/data/cardBackgrounds';
import { hapticLight, hapticSuccess } from '@/src/services/haptics/hapticFeedback';
import { CommunityReflectionsModal } from './CommunityReflectionsModal';
import { DailyVerseActionSheet } from './DailyVerseActionSheet';

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
  const [isFocused, setIsFocused] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, [])
  );

  const [controlsVisible, setControlsVisible] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [bgIndexOffset, setBgIndexOffset] = useState(0);

  // Modals state
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [reflectionsVisible, setReflectionsVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live community metrics (Likes, Shares, Comments)
  const [metrics, setMetrics] = useState({
    likes: 142,
    shares: 58,
    comments: 24,
  });

  useEffect(() => {
    if (visible) {
      setBgIndexOffset(0);
      setControlsVisible(true);
    }
  }, [visible, devotional?.verse.id]);

  // Clean slug for URLs and metrics (e.g. juan-3-16, salmos-23-1)
  const cleanSlug = useMemo(() => {
    if (!devotional) return 'juan-3-16';
    const raw = (devotional.verse.book_name || 'juan')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    return `${raw}-${devotional.verse.chapter}-${devotional.verse.verse}`;
  }, [devotional?.verse.id, devotional?.verse.chapter, devotional?.verse.verse]);

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

  // Fetch live metrics from Cloudflare Worker
  useEffect(() => {
    if (!visible || !cleanSlug) return;
    const controller = new AbortController();

    fetch(`https://selah.boxtiove.com/api/metrics?verse=${cleanSlug}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data) {
          setMetrics({
            likes: data.data.likes ?? 142,
            shares: data.data.shares ?? 58,
            comments: data.data.comments ?? 24,
          });
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [visible, cleanSlug]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Full-bleed 9:16 vertical scenery background
  const bgItem = useMemo(() => {
    if (!devotional) return CARD_BACKGROUNDS[0];
    return getVerseBackground(devotional.verse.id, bgIndexOffset);
  }, [devotional?.verse.id, bgIndexOffset]);

  const bgSource = bgItem?.source916 || bgItem?.source || CARD_BACKGROUNDS[0].source;

  if (!devotional) return null;

  const { verse } = devotional;
  const citation = `${verse.book_name?.toUpperCase() || ''} ${verse.chapter}:${verse.verse}`;

  // Responsive font sizing based on verse text length
  const textLength = verse.text.length;
  const fontSize =
    textLength > 170 ? 23 : textLength > 110 ? 26 : textLength > 60 ? 29 : 32;
  const lineHeight =
    textLength > 170 ? 34 : textLength > 110 ? 38 : textLength > 60 ? 42 : 46;

  const handleToggleBookmark = async () => {
    hapticSuccess();
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    await toggleBookmark(verse.book_id, verse.chapter, verse.verse);

    if (nextSaved) {
      setMetrics((m) => ({ ...m, likes: m.likes + 1 }));
      showToast('⭐ Guardado en tus favoritos');
      // Report metric to Cloudflare
      fetch('https://selah.boxtiove.com/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verse: cleanSlug, action: 'like' }),
      }).catch(() => {});
    } else {
      setMetrics((m) => ({ ...m, likes: Math.max(0, m.likes - 1) }));
      showToast('Quitado de favoritos');
    }
  };

  const handleGoToReader = () => {
    hapticLight();
    onNavigateToReader(verse.book_id, verse.chapter, verse.verse);
  };

  // Ultra-clean short sharing link
  const handleQuickShare = async () => {
    hapticLight();
    const shareUrl = `https://selah.boxtiove.com/v/${cleanSlug}`;
    const cleanMessage = `«${verse.text}»\n— ${verse.book_name} ${verse.chapter}:${verse.verse}\n\n${shareUrl}`;

    try {
      setMetrics((m) => ({ ...m, shares: m.shares + 1 }));
      await Share.share({
        message: cleanMessage,
        url: shareUrl,
        title: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
      });

      // Report metric to Cloudflare
      fetch('https://selah.boxtiove.com/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verse: cleanSlug, action: 'share' }),
      }).catch(() => {});
    } catch {
      onShare();
    }
  };

  const handleCopyVerse = async () => {
    const textToCopy = `«${verse.text}»\n— ${verse.book_name} ${verse.chapter}:${verse.verse} (RVR1909)`;
    try {
      await Share.share({
        message: textToCopy,
        title: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
      });
      showToast('📋 Versículo preparado para copiar');
    } catch {
      showToast('📋 Texto listo');
    }
  };

  const handleCopyLink = async () => {
    const linkToCopy = `https://selah.boxtiove.com/v/${cleanSlug}`;
    try {
      await Share.share({
        message: linkToCopy,
        url: linkToCopy,
        title: 'Enlace de Selah Biblia',
      });
      showToast('🔗 Enlace web listo');
    } catch {
      showToast('🔗 Enlace copiado');
    }
  };

  return (
    <Modal
      visible={visible && isFocused}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.container}
        onPress={() => setControlsVisible((current) => !current)}
        accessible={false}
      >
        <StatusBar
          hidden={!controlsVisible}
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />

        {/* 1. Full-screen 9:16 vertical scenery background */}
        <Image source={bgSource} style={StyleSheet.absoluteFill} resizeMode="cover" />

        {/* 2. Gradient scrim for contrast */}
        <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="postalGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
              <Stop offset="22%" stopColor="#000000" stopOpacity="0.15" />
              <Stop offset="65%" stopColor="#000000" stopOpacity="0.30" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0.75" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100" height="100" fill="url(#postalGrad)" />
        </Svg>

        {/* Floating Toast Notification */}
        {toastMessage && (
          <View style={[styles.toast, { top: Math.max(insets.top + 60, 72) }]}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}

        {/* 3. Top Action Bar: Close (X) on left, 3 dots on right */}
        <View
          pointerEvents={controlsVisible ? 'auto' : 'none'}
          style={[
            styles.topBar,
            {
              opacity: controlsVisible ? 1 : 0,
              paddingTop: Math.max(insets.top + 10, 24),
            },
          ]}
        >
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

            {/* 3-dots Menu Button */}
            <TouchableOpacity
              style={styles.iconCircleBtn}
              onPress={() => {
                hapticLight();
                setActionSheetVisible(true);
              }}
              activeOpacity={0.75}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MoreHorizontal size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Postal heading, scripture, and direct links to Bible */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.categoryTitle, { opacity: controlsVisible ? 1 : 0 }]}>
            Versículo del día
          </Text>
          <View style={styles.verseSection}>
            <Text style={[styles.verseBody, { fontSize, lineHeight }]}>
              {verse.text}
            </Text>
            <View
              pointerEvents={controlsVisible ? 'auto' : 'none'}
              style={[styles.readingRow, { opacity: controlsVisible ? 1 : 0 }]}
            >
              <TouchableOpacity
                style={styles.citationButton}
                onPress={handleGoToReader}
                accessibilityRole="button"
                accessibilityLabel={`Leer ${citation} en la Biblia`}
                activeOpacity={0.8}
              >
                <Text style={styles.citationTitle}>{citation}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* 5. Bottom Engagement Bar (4 perfectly aligned action buttons) */}
        <View
          pointerEvents={controlsVisible ? 'auto' : 'none'}
          style={[
            styles.bottomBar,
            {
              opacity: controlsVisible ? 1 : 0,
              paddingBottom: Math.max(insets.bottom + 12, 24),
            },
          ]}
        >
          {/* 1. Me Gusta / Guardar */}
          <TouchableOpacity
            style={styles.bottomActionItem}
            onPress={handleToggleBookmark}
            activeOpacity={0.75}
          >
            <View style={styles.iconBox}>
              <Heart
                size={24}
                color={isSaved ? '#ef4444' : '#FFFFFF'}
                fill={isSaved ? '#ef4444' : 'transparent'}
              />
            </View>
            <Text
              style={[
                styles.bottomActionLabel,
                isSaved && styles.bottomActionLabelActive,
              ]}
            >
              {metrics.likes}
            </Text>
          </TouchableOpacity>

          {/* 2. Comentarios / Muro de Reflexiones (Opción A) */}
          <TouchableOpacity
            style={styles.bottomActionItem}
            onPress={() => {
              hapticLight();
              setReflectionsVisible(true);
            }}
            activeOpacity={0.75}
          >
            <View style={styles.iconBox}>
              <MessageSquare size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.bottomActionLabel}>{metrics.comments}</Text>
          </TouchableOpacity>

          {/* 3. Compartir (texto limpio y corto) */}
          <TouchableOpacity
            style={styles.bottomActionItem}
            onPress={handleQuickShare}
            activeOpacity={0.75}
          >
            <View style={styles.iconBox}>
              <Share2 size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.bottomActionLabel}>{metrics.shares}</Text>
          </TouchableOpacity>

          {/* 4. Crear Tarjeta con Imagen (Alineado exactamente) */}
          <TouchableOpacity
            style={styles.bottomActionItem}
            onPress={() => {
              hapticLight();
              onClose();
              onShare();
            }}
            activeOpacity={0.75}
          >
            <View style={[styles.iconBox, styles.thumbnailCard]}>
              <Layers size={17} color="#fbbf24" />
            </View>
            <Text style={styles.bottomActionLabel}>Crear</Text>
          </TouchableOpacity>
        </View>

        {/* Modals: Action Sheet (3 dots) & Community Reflections (Opción A) */}
        <DailyVerseActionSheet
          visible={actionSheetVisible}
          verseCitation={citation}
          isSaved={isSaved}
          onCopyVerse={handleCopyVerse}
          onCopyLink={handleCopyLink}
          onShare={handleQuickShare}
          onToggleBookmark={handleToggleBookmark}
          onDesignCard={() => {
            onClose();
            onShare();
          }}
          onReadFullChapter={handleGoToReader}
          onClose={() => setActionSheetVisible(false)}
        />

        <CommunityReflectionsModal
          visible={reflectionsVisible}
          verseSlug={cleanSlug}
          verseCitation={citation}
          onClose={() => setReflectionsVisible(false)}
          onCommentCountChange={(cnt) =>
            setMetrics((m) => ({ ...m, comments: cnt }))
          }
        />
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050811',
    justifyContent: 'space-between',
  },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(9, 13, 22, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.5)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    zIndex: 99,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  toastText: {
    color: '#fbbf24',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
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
    gap: 12,
  },
  iconCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 26,
    paddingTop: 20,
    paddingBottom: 20,
    zIndex: 5,
  },
  categoryTitle: {
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.3,
    marginBottom: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  verseSection: {
    alignItems: 'flex-start',
  },
  readingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    marginTop: 18,
  },
  citationButton: {
    minHeight: 44,
    justifyContent: 'center',
  },
  citationTitle: {
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  verseBody: {
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '600',
    letterSpacing: -0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.80)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingTop: 12,
    zIndex: 10,
  },
  bottomActionItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minWidth: 58,
  },
  iconBox: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderRadius: 9,
    backgroundColor: 'rgba(0, 0, 0, 0.50)',
    borderWidth: 1.5,
    borderColor: '#fbbf24',
  },
});
