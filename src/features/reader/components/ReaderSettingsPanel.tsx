import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemePalette, ThemeMode } from '@/src/theme/colors';
import { hapticLight } from '@/src/services/haptics/hapticFeedback';

interface ReaderSettingsPanelProps {
  theme: ThemePalette;
  themeMode: ThemeMode;
  fontSize: number;
  lineSpacing: number;
  onThemeChange: (mode: ThemeMode) => void;
  onFontSizeChange: (size: number) => void;
  onLineSpacingChange: (spacing: number) => void;
}

export const ReaderSettingsPanel: React.FC<ReaderSettingsPanelProps> = ({
  theme,
  themeMode,
  fontSize,
  lineSpacing,
  onThemeChange,
  onFontSizeChange,
  onLineSpacingChange,
}) => {
  return (
    <View
      style={[
        styles.settingsPanel,
        {
          backgroundColor: theme.cardBackground,
          borderBottomColor: theme.borderSubtle,
        },
      ]}
    >
      {/* LIENZO row */}
      <View style={styles.settingsRow}>
        <Text style={[styles.settingsLabel, { color: theme.textMuted }]}>
          LIENZO
        </Text>
        <View style={styles.segmentedOptions}>
          <TouchableOpacity
            style={[
              styles.segmentItem,
              themeMode === 'light' && {
                backgroundColor: theme.accent,
              },
            ]}
            onPress={() => {
              hapticLight();
              onThemeChange('light');
            }}
          >
            <Text
              style={[
                styles.segmentText,
                { color: themeMode === 'light' ? '#FFFFFF' : theme.text },
              ]}
            >
              Claro
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentItem,
              themeMode === 'sepia' && {
                backgroundColor: theme.accent,
              },
            ]}
            onPress={() => {
              hapticLight();
              onThemeChange('sepia');
            }}
          >
            <Text
              style={[
                styles.segmentText,
                { color: themeMode === 'sepia' ? '#FFFFFF' : theme.text },
              ]}
            >
              • Sepia
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentItem,
              themeMode === 'oled' && {
                backgroundColor: theme.accent,
              },
            ]}
            onPress={() => {
              hapticLight();
              onThemeChange('oled');
            }}
          >
            <Text
              style={[
                styles.segmentText,
                { color: themeMode === 'oled' ? '#FFFFFF' : theme.text },
              ]}
            >
              Oscuro OLED
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tipografía & Espaciado row */}
      <View style={[styles.settingsRow, { marginTop: 12 }]}>
        <View style={styles.settingSubGroup}>
          <Text style={[styles.settingsLabel, { color: theme.textMuted }]}>
            Tipografía
          </Text>
          <View style={styles.fontSizeControls}>
            <TouchableOpacity
              style={[styles.smallBtn, { backgroundColor: theme.surfaceRaised }]}
              onPress={() => {
                hapticLight();
                onFontSizeChange(Math.max(14, fontSize - 1));
              }}
            >
              <Text style={[styles.smallBtnText, { color: theme.text }]}>A-</Text>
            </TouchableOpacity>
            <Text style={[styles.fontSizeLabel, { color: theme.text }]}>
              {fontSize}pt
            </Text>
            <TouchableOpacity
              style={[styles.smallBtn, { backgroundColor: theme.surfaceRaised }]}
              onPress={() => {
                hapticLight();
                onFontSizeChange(Math.min(28, fontSize + 1));
              }}
            >
              <Text style={[styles.smallBtnText, { color: theme.text }]}>A+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingSubGroup}>
          <Text style={[styles.settingsLabel, { color: theme.textMuted }]}>
            Espaciado
          </Text>
          <View style={styles.fontSizeControls}>
            {[1.5, 1.75, 2.0].map((spacing) => (
              <TouchableOpacity
                key={spacing}
                style={[
                  styles.smallBtn,
                  {
                    backgroundColor:
                      lineSpacing === spacing
                        ? theme.accent
                        : theme.surfaceRaised,
                  },
                ]}
                onPress={() => {
                  hapticLight();
                  onLineSpacingChange(spacing);
                }}
              >
                <Text
                  style={[
                    styles.smallBtnText,
                    {
                      color: lineSpacing === spacing ? '#FFFFFF' : theme.text,
                    },
                  ]}
                >
                  {spacing === 1.5 ? '≡' : spacing === 1.75 ? '≣' : '='}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  settingsPanel: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  segmentedOptions: {
    flexDirection: 'row',
    gap: 6,
  },
  segmentItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  settingSubGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fontSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  smallBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  fontSizeLabel: {
    fontSize: 12,
    fontWeight: '700',
    minWidth: 32,
    textAlign: 'center',
  },
});
