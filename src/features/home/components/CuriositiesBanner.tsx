import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Trophy, ChevronRight } from 'lucide-react-native';
import { ThemePalette } from '@/src/theme/colors';
import { BIBLICAL_CURIOSITIES } from '@/src/features/curiosities/data/biblicalCuriosities';

interface CuriositiesBannerProps {
  theme: ThemePalette;
  themeMode: string;
  onPress: () => void;
}

export const CuriositiesBanner: React.FC<CuriositiesBannerProps> = ({
  theme,
  themeMode,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.curiositiesBanner,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.borderSubtle,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.curiositiesBannerLeft}>
        <View
          style={[
            styles.curiositiesIconCircle,
            {
              backgroundColor:
                themeMode === 'oled'
                  ? '#1e293b'
                  : 'rgba(217, 119, 6, 0.12)',
            },
          ]}
        >
          <Trophy size={20} color={theme.accent} />
        </View>
        <View style={styles.curiositiesTextWrap}>
          <View style={styles.curiositiesTagRow}>
            <Text style={[styles.curiositiesTag, { color: theme.accent }]}>
              {BIBLICAL_CURIOSITIES.length} TEMAS ASOMBROSOS
            </Text>
          </View>
          <Text style={[styles.curiositiesBannerTitle, { color: theme.text }]}>
            Curiosidades & Récords
          </Text>
          <Text
            style={[styles.curiositiesBannerSubtitle, { color: theme.textMuted }]}
            numberOfLines={2}
          >
            Versículo más largo, ciencia anticipada, Matusalén y hechos insólitos
          </Text>
        </View>
      </View>
      <ChevronRight size={18} color={theme.accent} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  curiositiesBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 32,
  },
  curiositiesBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  curiositiesIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  curiositiesTextWrap: {
    flex: 1,
  },
  curiositiesTagRow: {
    marginBottom: 2,
  },
  curiositiesTag: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  curiositiesBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  curiositiesBannerSubtitle: {
    fontSize: 11.5,
    lineHeight: 16,
  },
});
