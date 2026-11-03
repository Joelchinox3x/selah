import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import {
  X,
  Share2,
  Square,
  Smartphone,
  Sparkles,
  Check,
} from 'lucide-react-native';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { hapticSuccess, hapticLight } from '@/src/services/haptics/hapticFeedback';
import {
  CARD_BACKGROUNDS,
  BackgroundCategory,
} from '../data/cardBackgrounds';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type AspectRatioMode = '1:1' | '9:16';
type TypographyPreset = 'classic' | 'modern' | 'solemn';

interface ShareCardModalProps {
  visible: boolean;
  versesText: string;
  referenceText: string;
  onClose: () => void;
}

// Function to pick a random photographic image by default
const getRandomImageBgId = (): string => {
  const imageList = CARD_BACKGROUNDS.filter((bg) => bg.type === 'image');
  if (imageList.length === 0) return CARD_BACKGROUNDS[0].id;
  const randomIndex = Math.floor(Math.random() * imageList.length);
  return imageList[randomIndex].id;
};

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  visible,
  versesText,
  referenceText,
  onClose,
}) => {
  // All hooks declared unconditionally at the very top
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>('1:1');
  const [selectedBgId, setSelectedBgId] = useState<string>(() => getRandomImageBgId());
  const [fontPreset, setFontPreset] = useState<TypographyPreset>('classic');
  const [activeCategory, setActiveCategory] = useState<BackgroundCategory>('all');
  const [isExporting, setIsExporting] = useState(false);

  const cardRef = useRef<View>(null);
  const prevVisible = useRef(false);

  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  // Whenever modal opens from closed to open, pick a new random photographic background
  useEffect(() => {
    if (visible && !prevVisible.current) {
      setSelectedBgId(getRandomImageBgId());
    }
    prevVisible.current = visible;
  }, [visible]);

  const currentBg = useMemo(() => {
    return (
      CARD_BACKGROUNDS.find((bg) => bg.id === selectedBgId) ||
      CARD_BACKGROUNDS[0]
    );
  }, [selectedBgId]);

  const filteredBackgrounds = useMemo(() => {
    if (activeCategory === 'all') return CARD_BACKGROUNDS;
    return CARD_BACKGROUNDS.filter((bg) => bg.category === activeCategory);
  }, [activeCategory]);

  // Preview dimensions calculated synchronously without hook overhead
  const previewWidth = aspectRatio === '1:1' ? Math.min(SCREEN_WIDTH - 64, 260) : 172;
  const previewHeight = aspectRatio === '1:1' ? Math.min(SCREEN_WIDTH - 64, 260) : 306;

  const cleanVerses = (versesText || '').trim();
  const cleanRef = (referenceText || '').trim();
  const textLength = cleanVerses.length;

  const getDynamicTypography = () => {
    let fontSize = 16;
    let lineHeight = 24;

    if (textLength > 280) {
      fontSize = aspectRatio === '9:16' ? 12 : 11;
      lineHeight = aspectRatio === '9:16' ? 17 : 16;
    } else if (textLength > 150) {
      fontSize = aspectRatio === '9:16' ? 14 : 13;
      lineHeight = aspectRatio === '9:16' ? 20 : 19;
    } else {
      fontSize = aspectRatio === '9:16' ? 17 : 15;
      lineHeight = aspectRatio === '9:16' ? 25 : 23;
    }

    switch (fontPreset) {
      case 'classic':
        return {
          fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
          fontStyle: 'italic' as const,
          fontWeight: '600' as const,
          fontSize,
          lineHeight,
        };
      case 'modern':
        return {
          fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
          fontWeight: '700' as const,
          fontStyle: 'normal' as const,
          fontSize,
          lineHeight,
        };
      case 'solemn':
        return {
          fontFamily: Platform.OS === 'ios' ? 'Palatino' : 'serif',
          fontWeight: '700' as const,
          fontStyle: 'normal' as const,
          fontSize,
          lineHeight,
        };
    }
  };

  const handleShare = async () => {
    try {
      hapticLight();
      setIsExporting(true);

      if (!cardRef.current) return;

      // Force 1080p high definition export so letters are razor-sharp on WhatsApp & Social Media
      const targetWidth = 1080;
      const targetHeight = aspectRatio === '1:1' ? 1080 : 1920;

      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
        width: targetWidth,
        height: targetHeight,
      });

      hapticSuccess();

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: `Compartir ${cleanRef}`,
        });
      }
    } catch (err) {
      console.warn('Error exporting shareable card:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const isImageBg = currentBg.type === 'image';
  const cardTextColor = isImageBg ? '#ffffff' : (currentBg.textColor || theme.text);
  const cardAccentColor = isImageBg ? '#fde047' : (currentBg.accentColor || theme.accent);
  const cardBorderColor = isImageBg ? 'rgba(255,255,255,0.25)' : (currentBg.borderColor || theme.border);
  const cardBgColor = isImageBg ? '#0d1117' : (currentBg.bgColor || theme.cardBackground);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
            <View>
              <Text style={[styles.title, { color: theme.text }]}>
                Crear Postal Bíblica
              </Text>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                Personaliza para WhatsApp y Redes Sociales
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.closeBtn}
            >
              <X size={20} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Controls Bar 1: Aspect Ratio & Typography */}
          <View style={styles.controlsRow}>
            {/* Aspect ratio segmented pills */}
            <View style={[styles.segmentedGroup, { backgroundColor: theme.surfaceRaised }]}>
              <TouchableOpacity
                style={[
                  styles.segmentBtn,
                  aspectRatio === '1:1' && { backgroundColor: theme.cardBackground },
                ]}
                onPress={() => {
                  hapticLight();
                  setAspectRatio('1:1');
                }}
              >
                <Square size={13} color={aspectRatio === '1:1' ? theme.accent : theme.textMuted} />
                <Text
                  style={[
                    styles.segmentText,
                    { color: aspectRatio === '1:1' ? theme.accent : theme.textMuted },
                  ]}
                >
                  1:1 Post
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentBtn,
                  aspectRatio === '9:16' && { backgroundColor: theme.cardBackground },
                ]}
                onPress={() => {
                  hapticLight();
                  setAspectRatio('9:16');
                }}
              >
                <Smartphone size={13} color={aspectRatio === '9:16' ? theme.accent : theme.textMuted} />
                <Text
                  style={[
                    styles.segmentText,
                    { color: aspectRatio === '9:16' ? theme.accent : theme.textMuted },
                  ]}
                >
                  9:16 Historia
                </Text>
              </TouchableOpacity>
            </View>

            {/* Typography preset toggles */}
            <View style={[styles.segmentedGroup, { backgroundColor: theme.surfaceRaised }]}>
              {(['classic', 'modern', 'solemn'] as TypographyPreset[]).map((tp) => (
                <TouchableOpacity
                  key={tp}
                  style={[
                    styles.segmentBtn,
                    fontPreset === tp && { backgroundColor: theme.cardBackground },
                  ]}
                  onPress={() => {
                    hapticLight();
                    setFontPreset(tp);
                  }}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      {
                        color: fontPreset === tp ? theme.accent : theme.textMuted,
                        fontStyle: tp === 'classic' ? 'italic' : 'normal',
                        fontWeight: tp === 'solemn' ? '700' : '600',
                      },
                    ]}
                  >
                    {tp === 'classic' ? 'Serif' : tp === 'modern' ? 'Sans' : 'Solemne'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Background Category Selector (No AI tags) */}
          <View style={styles.categoryRow}>
            {(
              [
                { id: 'all', label: 'Todos (18)' },
                { id: 'real', label: 'Fotografía (5)' },
                { id: 'spiritual', label: 'Paisajes Bíblicos (10)' },
                { id: 'minimal', label: 'Clásicos (3)' },
              ] as { id: BackgroundCategory; label: string }[]
            ).map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor: isActive ? theme.accentMuted : theme.surfaceRaised,
                      borderColor: isActive ? theme.accent : theme.borderSubtle,
                    },
                  ]}
                  onPress={() => {
                    hapticLight();
                    setActiveCategory(cat.id);
                  }}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      {
                        color: isActive ? theme.accent : theme.textMuted,
                        fontWeight: isActive ? '700' : '500',
                      },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Horizontal Background Thumbnails Carousel */}
          <View style={styles.carouselContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContent}
            >
              {filteredBackgrounds.map((bg) => {
                const isSelected = bg.id === selectedBgId;
                return (
                  <TouchableOpacity
                    key={bg.id}
                    activeOpacity={0.8}
                    style={[
                      styles.thumbItem,
                      isSelected && {
                        borderColor: theme.accent,
                        borderWidth: 2,
                      },
                    ]}
                    onPress={() => {
                      hapticLight();
                      setSelectedBgId(bg.id);
                    }}
                  >
                    {bg.type === 'image' && bg.source ? (
                      <Image
                        source={bg.source}
                        style={styles.thumbImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={[
                          styles.thumbSolid,
                          {
                            backgroundColor: bg.bgColor || '#333',
                            borderColor: bg.borderColor || '#666',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.thumbSolidText,
                            { color: bg.textColor || '#fff' },
                          ]}
                        >
                          Aa
                        </Text>
                      </View>
                    )}

                    {/* Checkmark badge for selected background */}
                    {isSelected && (
                      <View style={[styles.thumbCheckBadge, { backgroundColor: theme.accent }]}>
                        <Check size={11} color="#ffffff" strokeWidth={3} />
                      </View>
                    )}

                    <Text
                      numberOfLines={1}
                      style={[
                        styles.thumbName,
                        {
                          color: isSelected ? theme.accent : theme.textMuted,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {bg.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Card Preview Container - Centered, never cut off */}
          <View style={styles.previewWrapper}>
            <View
              ref={cardRef}
              collapsable={false}
              style={[
                styles.cardView,
                {
                  width: previewWidth,
                  height: previewHeight,
                  backgroundColor: cardBgColor,
                  borderColor: cardBorderColor,
                },
              ]}
            >
              {isImageBg && currentBg.source ? (
                <>
                  {/* Full Cover Background Image */}
                  <Image
                    source={currentBg.source}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                  />

                  {/* Deep Scrim Overlay for high contrast */}
                  <View
                    style={[
                      StyleSheet.absoluteFill,
                      {
                        backgroundColor: `rgba(0, 0, 0, ${currentBg.overlayOpacity || 0.48})`,
                      },
                    ]}
                  />

                  {/* Inner Content with Frosted Glass Contrast Box */}
                  <View style={styles.cardInner}>
                    <View style={styles.cardCenterBody}>
                      {/* High-Legibility Glass Container for WhatsApp & Social Clarity */}
                      <View style={styles.verseGlassContainer}>
                        <Sparkles size={13} color="#fde047" style={{ marginBottom: 6, opacity: 0.95 }} />

                        <Text
                          style={[
                            styles.cardVerseText,
                            getDynamicTypography(),
                            {
                              color: '#ffffff',
                              textShadowColor: 'rgba(0, 0, 0, 0.95)',
                              textShadowOffset: { width: 0, height: 1 },
                              textShadowRadius: 4,
                            },
                          ]}
                        >
                          «{cleanVerses}»
                        </Text>

                        <View style={styles.cardRefWrapper}>
                          <Text
                            style={[
                              styles.cardReference,
                              {
                                color: '#fde047',
                                textShadowColor: 'rgba(0, 0, 0, 0.9)',
                                textShadowOffset: { width: 0, height: 1 },
                                textShadowRadius: 3,
                              },
                            ]}
                          >
                            — {cleanRef} —
                          </Text>
                          <Text
                            style={[
                              styles.cardVersion,
                              {
                                color: 'rgba(255, 255, 255, 0.9)',
                                textShadowColor: 'rgba(0, 0, 0, 0.9)',
                                textShadowOffset: { width: 0, height: 1 },
                                textShadowRadius: 2,
                              },
                            ]}
                          >
                            Reina-Valera 1909
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Footer Watermark */}
                    <View style={styles.cardFooter}>
                      <Text
                        style={[
                          styles.watermark,
                          {
                            color: 'rgba(255, 255, 255, 0.9)',
                            textShadowColor: 'rgba(0, 0, 0, 0.9)',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 3,
                          },
                        ]}
                      >
                        ✦ Selah · Calma Espiritual
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                /* Solid / Minimalist Card View */
                <View style={styles.cardInner}>
                  <View style={[styles.ornamentLine, { backgroundColor: cardAccentColor }]} />

                  <View style={styles.cardCenterBody}>
                    <Text
                      style={[
                        styles.cardVerseText,
                        getDynamicTypography(),
                        { color: cardTextColor },
                      ]}
                    >
                      «{cleanVerses}»
                    </Text>

                    <View style={styles.cardRefWrapper}>
                      <Text style={[styles.cardReference, { color: cardAccentColor }]}>
                        — {cleanRef} —
                      </Text>
                      <Text style={[styles.cardVersion, { color: cardTextColor, opacity: 0.7 }]}>
                        Reina-Valera 1909
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={[styles.watermark, { color: cardTextColor, opacity: 0.65 }]}>
                      ✦ Selah · Calma Espiritual
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Footer with High-Resolution Share Button */}
          <View style={[styles.modalFooter, { borderTopColor: theme.borderSubtle }]}>
            <TouchableOpacity
              style={[styles.shareActionBtn, { backgroundColor: theme.accent }]}
              onPress={handleShare}
              disabled={isExporting}
              activeOpacity={0.8}
            >
              {isExporting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Share2 size={18} color="#ffffff" />
                  <Text style={styles.shareActionBtnText}>
                    Compartir postal (WhatsApp / Redes)
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 1,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
    gap: 8,
  },
  segmentedGroup: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    gap: 3,
  },
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9,
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 4,
    gap: 6,
  },
  catChip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  catChipText: {
    fontSize: 11,
  },
  carouselContainer: {
    paddingVertical: 6,
  },
  carouselContent: {
    paddingHorizontal: 20,
    gap: 10,
    alignItems: 'center',
  },
  thumbItem: {
    width: 64,
    alignItems: 'center',
    borderRadius: 12,
    padding: 2,
    borderWidth: 1.5,
    borderColor: 'transparent',
    position: 'relative',
  },
  thumbImage: {
    width: 58,
    height: 58,
    borderRadius: 10,
  },
  thumbSolid: {
    width: 58,
    height: 58,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbSolidText: {
    fontSize: 16,
    fontWeight: '700',
  },
  thumbCheckBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
    zIndex: 10,
  },
  thumbName: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 64,
  },
  previewWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  cardView: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  cardInner: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ornamentLine: {
    width: 36,
    height: 3,
    borderRadius: 2,
    alignSelf: 'center',
  },
  cardCenterBody: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseGlassContainer: {
    backgroundColor: 'rgba(5, 8, 16, 0.72)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  cardVerseText: {
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  cardRefWrapper: {
    marginTop: 10,
    alignItems: 'center',
  },
  cardReference: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  cardVersion: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  cardFooter: {
    alignItems: 'center',
    paddingTop: 4,
  },
  watermark: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  shareActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  shareActionBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
