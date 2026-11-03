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
  Check,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
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
type TextVerticalPosition = 'top' | 'center' | 'bottom';

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
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>('9:16');
  const [selectedBgId, setSelectedBgId] = useState<string>(() => getRandomImageBgId());
  const [fontPreset, setFontPreset] = useState<TypographyPreset>('classic');
  const [textPosition, setTextPosition] = useState<TextVerticalPosition>('center');
  const [activeCategory, setActiveCategory] = useState<BackgroundCategory>('all');
  const [isExporting, setIsExporting] = useState(false);

  // Separate ref for the high-res offscreen export view so exported images are never zoomed
  const exportCardRef = useRef<View>(null);
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

  // Preview dimensions (exact 9:16 ratio matching the 1080x1920 image with 0 cropping)
  const previewWidth = aspectRatio === '1:1' ? Math.min(SCREEN_WIDTH - 64, 270) : 210;
  const previewHeight = aspectRatio === '1:1' ? Math.min(SCREEN_WIDTH - 64, 270) : 373;

  const cleanVerses = (versesText || '').trim();
  const cleanRef = (referenceText || '').trim();
  const textLength = cleanVerses.length;

  // Refined compact typography for on-screen preview so entire image (hills, sky, stars) is visible
  const getDynamicTypography = () => {
    let fontSize = 11;
    let lineHeight = 16;

    if (aspectRatio === '9:16') {
      if (textLength > 200) {
        fontSize = 9.5;
        lineHeight = 14;
      } else if (textLength > 110) {
        fontSize = 10.5;
        lineHeight = 15;
      } else {
        fontSize = 11.5;
        lineHeight = 16.5;
      }
    } else {
      if (textLength > 200) {
        fontSize = 11;
        lineHeight = 15.5;
      } else if (textLength > 110) {
        fontSize = 12;
        lineHeight = 17;
      } else {
        fontSize = 13.5;
        lineHeight = 19.5;
      }
    }

    switch (fontPreset) {
      case 'classic':
        return {
          fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
          fontWeight: '600' as const,
          fontSize,
          lineHeight,
        };
      case 'modern':
        return {
          fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
          fontWeight: '600' as const,
          fontSize,
          lineHeight,
        };
      case 'solemn':
        return {
          fontFamily: Platform.OS === 'ios' ? 'Palatino' : 'serif',
          fontWeight: '700' as const,
          fontSize,
          lineHeight,
        };
    }
  };

  // Typography for Full HD export (1080x1920)
  const getExportTypography = () => {
    let fontSize = 42;
    let lineHeight = 62;

    if (aspectRatio === '9:16') {
      if (textLength > 200) {
        fontSize = 32;
        lineHeight = 48;
      } else if (textLength > 110) {
        fontSize = 38;
        lineHeight = 56;
      } else {
        fontSize = 44;
        lineHeight = 66;
      }
    } else {
      if (textLength > 200) {
        fontSize = 34;
        lineHeight = 50;
      } else if (textLength > 110) {
        fontSize = 40;
        lineHeight = 58;
      } else {
        fontSize = 46;
        lineHeight = 68;
      }
    }

    switch (fontPreset) {
      case 'classic':
        return {
          fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
          fontWeight: '600' as const,
          fontSize,
          lineHeight,
        };
      case 'modern':
        return {
          fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
          fontWeight: '600' as const,
          fontSize,
          lineHeight,
        };
      case 'solemn':
        return {
          fontFamily: Platform.OS === 'ios' ? 'Palatino' : 'serif',
          fontWeight: '700' as const,
          fontSize,
          lineHeight,
        };
    }
  };

  const handleShare = async () => {
    try {
      hapticLight();
      setIsExporting(true);

      if (!exportCardRef.current) return;

      // Hardware-accelerated fast JPEG capture (instant, sub-100ms, zero lag!)
      const uri = await captureRef(exportCardRef, {
        format: 'jpg',
        quality: 0.92,
        result: 'tmpfile',
      });

      hapticSuccess();

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/jpeg',
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
  const activeImageSource = aspectRatio === '1:1'
    ? (currentBg.source1x1 || currentBg.source)
    : (currentBg.source916 || currentBg.source);
  const cardTextColor = isImageBg ? '#ffffff' : (currentBg.textColor || theme.text);
  const cardAccentColor = isImageBg ? '#facc15' : (currentBg.accentColor || theme.accent);
  const cardBorderColor = isImageBg ? 'rgba(255,255,255,0.20)' : (currentBg.borderColor || theme.border);
  const cardBgColor = isImageBg ? '#080a10' : (currentBg.bgColor || theme.cardBackground);

  const getContentJustify = () => {
    switch (textPosition) {
      case 'top':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'bottom':
        return 'flex-end';
    }
  };

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
                Personaliza tu postal bíblica
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

          {/* Quick Tools Row: Aspect Ratio & Text Position */}
          <View style={styles.quickToolsRow}>
            {/* Aspect Ratio (9:16 / 1:1) */}
            <View style={[styles.segmentedGroup, { backgroundColor: theme.surfaceRaised }]}>
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
            </View>

            {/* Position Selector: Top / Center / Bottom */}
            <View style={[styles.segmentedGroup, { backgroundColor: theme.surfaceRaised }]}>
              <TouchableOpacity
                style={[
                  styles.segmentIconBtn,
                  textPosition === 'top' && { backgroundColor: theme.cardBackground },
                ]}
                onPress={() => {
                  hapticLight();
                  setTextPosition('top');
                }}
              >
                <AlignVerticalJustifyStart
                  size={14}
                  color={textPosition === 'top' ? theme.accent : theme.textMuted}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentIconBtn,
                  textPosition === 'center' && { backgroundColor: theme.cardBackground },
                ]}
                onPress={() => {
                  hapticLight();
                  setTextPosition('center');
                }}
              >
                <AlignVerticalJustifyCenter
                  size={14}
                  color={textPosition === 'center' ? theme.accent : theme.textMuted}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentIconBtn,
                  textPosition === 'bottom' && { backgroundColor: theme.cardBackground },
                ]}
                onPress={() => {
                  hapticLight();
                  setTextPosition('bottom');
                }}
              >
                <AlignVerticalJustifyEnd
                  size={14}
                  color={textPosition === 'bottom' ? theme.accent : theme.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Typography Preset */}
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
                        fontWeight: fontPreset === tp ? '700' : '500',
                      },
                    ]}
                  >
                    {tp === 'classic' ? 'Serif' : tp === 'modern' ? 'Sans' : 'Solemne'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* On-Screen Card Preview Container */}
          <View style={styles.previewWrapper}>
            <View
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
              {isImageBg && activeImageSource ? (
                <>
                  <Image
                    source={activeImageSource}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: previewWidth,
                      height: previewHeight,
                    }}
                    resizeMode="cover"
                  />

                  {/* Soft transparent overlay so white text is readable */}
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: previewWidth,
                      height: previewHeight,
                      backgroundColor: `rgba(0, 0, 0, ${currentBg.overlayOpacity || 0.32})`,
                    }}
                  />

                  <View
                    style={[
                      styles.cardInnerOverlay,
                      {
                        width: previewWidth,
                        height: previewHeight,
                        justifyContent: getContentJustify(),
                      },
                    ]}
                  >
                    <View style={styles.editorialContent}>
                      <Text
                        style={[
                          styles.youversionVerseText,
                          getDynamicTypography(),
                          {
                            color: '#ffffff',
                            textShadowColor: 'rgba(0, 0, 0, 0.90)',
                            textShadowOffset: { width: 0, height: 1.5 },
                            textShadowRadius: 6,
                          },
                        ]}
                      >
                        «{cleanVerses}»
                      </Text>

                      <View style={styles.editorialRefBlock}>
                        <Text
                          style={[
                            styles.youversionReference,
                            {
                              color: cardAccentColor,
                              textShadowColor: 'rgba(0, 0, 0, 0.85)',
                              textShadowOffset: { width: 0, height: 1 },
                              textShadowRadius: 4,
                            },
                          ]}
                        >
                          — {cleanRef} —
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.bottomWatermark}>
                    <Text
                      style={[
                        styles.watermarkText,
                        {
                          color: 'rgba(255, 255, 255, 0.60)',
                          textShadowColor: 'rgba(0, 0, 0, 0.90)',
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 3,
                        },
                      ]}
                    >
                      ✦ SELAH
                    </Text>
                  </View>
                </>
              ) : (
                <View
                  style={[
                    styles.cardInnerOverlay,
                    { justifyContent: getContentJustify() },
                  ]}
                >
                  <View style={styles.editorialContent}>
                    <Text
                      style={[
                        styles.youversionVerseText,
                        getDynamicTypography(),
                        { color: cardTextColor },
                      ]}
                    >
                      «{cleanVerses}»
                    </Text>

                    <View style={styles.editorialRefBlock}>
                      <Text style={[styles.youversionReference, { color: cardAccentColor }]}>
                        — {cleanRef} —
                      </Text>
                    </View>
                  </View>

                  <View style={styles.bottomWatermark}>
                    <Text style={[styles.watermarkText, { color: cardTextColor, opacity: 0.5 }]}>
                      ✦ SELAH
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Background Category Selector */}
          <View style={styles.categoryRow}>
            {(
              [
                { id: 'all', label: 'Todos (13)' },
                { id: 'spiritual', label: 'Paisajes y Fotos (10)' },
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
                    {bg.type === 'image' && (bg.source || bg.source916) ? (
                      <Image
                        source={aspectRatio === '1:1' ? (bg.source1x1 || bg.source) : (bg.source916 || bg.source)}
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
                    Compartir Postal
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* DEDICATED OFFSCREEN FULL HD 1080x1920 EXPORT CANVAS - 0 ZOOM, 0 DISTORTION */}
      <View
        ref={exportCardRef}
        collapsable={false}
        style={{
          position: 'absolute',
          left: -9999,
          top: -9999,
          width: aspectRatio === '1:1' ? 1080 : 1080,
          height: aspectRatio === '1:1' ? 1080 : 1920,
          backgroundColor: cardBgColor,
          overflow: 'hidden',
        }}
      >
        {isImageBg && activeImageSource ? (
          <>
            <Image
              source={activeImageSource}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 1080,
                height: aspectRatio === '1:1' ? 1080 : 1920,
              }}
              resizeMode="cover"
            />
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 1080,
                height: aspectRatio === '1:1' ? 1080 : 1920,
                backgroundColor: `rgba(0, 0, 0, ${currentBg.overlayOpacity || 0.32})`,
              }}
            />
            <View
              style={{
                ...StyleSheet.absoluteFill,
                paddingHorizontal: 90,
                paddingVertical: 120,
                alignItems: 'center',
                justifyContent: getContentJustify(),
              }}
            >
              <View style={{ alignItems: 'center', width: '100%', maxWidth: 900 }}>
                <Text
                  style={[
                    getExportTypography(),
                    {
                      color: '#ffffff',
                      textAlign: 'center',
                      textShadowColor: 'rgba(0, 0, 0, 0.92)',
                      textShadowOffset: { width: 0, height: 4 },
                      textShadowRadius: 14,
                    },
                  ]}
                >
                  «{cleanVerses}»
                </Text>

                <View style={{ marginTop: 32, alignItems: 'center' }}>
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: '800',
                      letterSpacing: 1.5,
                      color: cardAccentColor,
                      textShadowColor: 'rgba(0, 0, 0, 0.90)',
                      textShadowOffset: { width: 0, height: 3 },
                      textShadowRadius: 10,
                    }}
                  >
                    — {cleanRef} —
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ position: 'absolute', bottom: 32, alignSelf: 'center' }}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: '800',
                  letterSpacing: 3,
                  color: 'rgba(255, 255, 255, 0.65)',
                  textShadowColor: 'rgba(0, 0, 0, 0.90)',
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 8,
                }}
              >
                ✦ SELAH
              </Text>
            </View>
          </>
        ) : (
          <View
            style={{
              ...StyleSheet.absoluteFill,
              paddingHorizontal: 90,
              paddingVertical: 120,
              alignItems: 'center',
              justifyContent: getContentJustify(),
            }}
          >
            <View style={{ alignItems: 'center', width: '100%', maxWidth: 900 }}>
              <Text
                style={[
                  getExportTypography(),
                  {
                    color: cardTextColor,
                    textAlign: 'center',
                  },
                ]}
              >
                «{cleanVerses}»
              </Text>

              <View style={{ marginTop: 32, alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: '800',
                    letterSpacing: 1.5,
                    color: cardAccentColor,
                  }}
                >
                  — {cleanRef} —
                </Text>
              </View>
            </View>

            <View style={{ position: 'absolute', bottom: 32, alignSelf: 'center' }}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: '800',
                  letterSpacing: 3,
                  color: cardTextColor,
                  opacity: 0.5,
                }}
              >
                ✦ SELAH
              </Text>
            </View>
          </View>
        )}
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
    paddingTop: 12,
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
  quickToolsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 6,
  },
  segmentedGroup: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 2.5,
    gap: 2,
  },
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 8,
  },
  segmentIconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 8,
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '600',
  },
  previewWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  cardView: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
    position: 'relative',
  },
  cardInnerOverlay: {
    ...StyleSheet.absoluteFill,
    paddingHorizontal: 20,
    paddingVertical: 18,
    alignItems: 'center',
  },
  editorialContent: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 220,
  },
  youversionVerseText: {
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  editorialRefBlock: {
    marginTop: 6,
    alignItems: 'center',
  },
  youversionReference: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bottomWatermark: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
  },
  watermarkText: {
    fontSize: 7.5,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 2,
    gap: 6,
  },
  catChip: {
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 10,
    borderWidth: 1,
  },
  catChipText: {
    fontSize: 10.5,
  },
  carouselContainer: {
    paddingVertical: 5,
  },
  carouselContent: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  thumbItem: {
    width: 60,
    alignItems: 'center',
    borderRadius: 10,
    padding: 2,
    borderWidth: 1.5,
    borderColor: 'transparent',
    position: 'relative',
  },
  thumbImage: {
    width: 54,
    height: 54,
    borderRadius: 8,
  },
  thumbSolid: {
    width: 54,
    height: 54,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbSolidText: {
    fontSize: 15,
    fontWeight: '700',
  },
  thumbCheckBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
    zIndex: 10,
  },
  thumbName: {
    fontSize: 9.5,
    marginTop: 3,
    textAlign: 'center',
    maxWidth: 60,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  shareActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  shareActionBtnText: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '700',
  },
});
