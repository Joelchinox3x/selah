import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { X, Share2, Square, Smartphone } from 'lucide-react-native';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { hapticSuccess, hapticLight } from '@/src/services/haptics/hapticFeedback';

const { width } = Dimensions.get('window');

type AspectRatioMode = '1:1' | '9:16';
type CardStyleTheme = 'sepia' | 'oled' | 'dawn';

interface ShareCardModalProps {
  visible: boolean;
  versesText: string;
  referenceText: string;
  onClose: () => void;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  visible,
  versesText,
  referenceText,
  onClose,
}) => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>('1:1');
  const [cardTheme, setCardTheme] = useState<CardStyleTheme>('sepia');
  const [isExporting, setIsExporting] = useState(false);

  const cardRef = useRef<View>(null);
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  if (!visible) return null;

  const getCardColors = () => {
    switch (cardTheme) {
      case 'sepia':
        return {
          bg: '#f7f1e1',
          text: '#3c2e1e',
          accent: '#b45309',
          border: '#e4d6b8',
        };
      case 'oled':
        return {
          bg: '#090d16',
          text: '#f8fafc',
          accent: '#38bdf8',
          border: '#1e293b',
        };
      case 'dawn':
        return {
          bg: '#fdf4ec',
          text: '#2d1810',
          accent: '#ea580c',
          border: '#fed7aa',
        };
    }
  };

  const currentCardColors = getCardColors();

  const handleShare = async () => {
    try {
      hapticLight();
      setIsExporting(true);

      if (!cardRef.current) return;

      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      hapticSuccess();

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: `Compartir ${referenceText}`,
        });
      }
    } catch (err) {
      console.warn('Error exporting shareable card:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const previewWidth = Math.min(width - 48, 360);
  const previewHeight = aspectRatio === '1:1' ? previewWidth : previewWidth * (16 / 9);

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
                Tarjeta para Compartir
              </Text>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                Personaliza para WhatsApp o Redes Sociales
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

          {/* Controls: Aspect Ratio & Theme */}
          <View style={styles.controlsRow}>
            {/* Aspect ratio toggles */}
            <View style={[styles.segmentedGroup, { backgroundColor: theme.surfaceRaised }]}>
              <TouchableOpacity
                style={[
                  styles.segmentBtn,
                  aspectRatio === '1:1' && { backgroundColor: theme.cardBackground },
                ]}
                onPress={() => setAspectRatio('1:1')}
              >
                <Square size={14} color={aspectRatio === '1:1' ? theme.accent : theme.textMuted} />
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
                onPress={() => setAspectRatio('9:16')}
              >
                <Smartphone size={14} color={aspectRatio === '9:16' ? theme.accent : theme.textMuted} />
                <Text
                  style={[
                    styles.segmentText,
                    { color: aspectRatio === '9:16' ? theme.accent : theme.textMuted },
                  ]}
                >
                  9:16 Estado
                </Text>
              </TouchableOpacity>
            </View>

            {/* Themes */}
            <View style={styles.themeCirclesRow}>
              {(['sepia', 'oled', 'dawn'] as CardStyleTheme[]).map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[
                    styles.themeCircle,
                    st === 'sepia' && { backgroundColor: '#f7f1e1', borderColor: '#b45309' },
                    st === 'oled' && { backgroundColor: '#090d16', borderColor: '#38bdf8' },
                    st === 'dawn' && { backgroundColor: '#fdf4ec', borderColor: '#ea580c' },
                    cardTheme === st && styles.activeThemeCircle,
                  ]}
                  onPress={() => setCardTheme(st)}
                />
              ))}
            </View>
          </View>

          {/* Card Preview Container */}
          <ScrollView
            style={styles.previewScroll}
            contentContainerStyle={styles.previewContent}
            showsVerticalScrollIndicator={false}
          >
            <View
              ref={cardRef}
              collapsable={false}
              style={[
                styles.cardView,
                {
                  width: previewWidth,
                  height: previewHeight,
                  backgroundColor: currentCardColors.bg,
                  borderColor: currentCardColors.border,
                },
              ]}
            >
              {/* Subtle ornamental top line */}
              <View style={[styles.ornamentLine, { backgroundColor: currentCardColors.accent }]} />

              <View style={styles.cardCenterBody}>
                <Text
                  style={[
                    styles.cardVerseText,
                    {
                      color: currentCardColors.text,
                      fontSize: aspectRatio === '9:16' ? 18 : 16,
                      lineHeight: aspectRatio === '9:16' ? 28 : 24,
                    },
                  ]}
                >
                  «{versesText}»
                </Text>

                <View style={styles.cardRefWrapper}>
                  <Text style={[styles.cardReference, { color: currentCardColors.accent }]}>
                    — {referenceText}
                  </Text>
                  <Text style={[styles.cardVersion, { color: currentCardColors.text + '88' }]}>
                    Reina-Valera 1909
                  </Text>
                </View>
              </View>

              {/* Watermark branding */}
              <View style={styles.cardFooter}>
                <Text style={[styles.watermark, { color: currentCardColors.text + '66' }]}>
                  ✦ Selah · Calma Espiritual
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer with WhatsApp Export Button */}
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
                    Compartir imagen (WhatsApp / Redes)
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
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '88%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  segmentedGroup: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    gap: 4,
  },
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  themeCirclesRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  themeCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
  },
  activeThemeCircle: {
    borderWidth: 2.5,
    transform: [{ scale: 1.15 }],
  },
  previewScroll: {
    flexGrow: 0,
    maxHeight: 400,
  },
  previewContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cardView: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  ornamentLine: {
    width: 36,
    height: 3,
    borderRadius: 2,
    alignSelf: 'center',
  },
  cardCenterBody: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  cardVerseText: {
    fontStyle: 'italic',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  cardRefWrapper: {
    marginTop: 18,
    alignItems: 'center',
  },
  cardReference: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  cardVersion: {
    fontSize: 11,
    marginTop: 2,
  },
  cardFooter: {
    alignItems: 'center',
    paddingTop: 8,
  },
  watermark: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  shareActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  shareActionBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
