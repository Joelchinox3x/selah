import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Wind, ChevronRight } from 'lucide-react-native';
import { ThemePalette } from '@/src/theme/colors';

interface CalmaBannerProps {
  theme: ThemePalette;
  onPress: () => void;
}

export const CalmaBanner: React.FC<CalmaBannerProps> = ({ theme, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.calmaBanner,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.borderSubtle,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.calmaLeft}>
        <View
          style={[styles.calmaIconCircle, { backgroundColor: theme.accentMuted }]}
        >
          <Wind size={20} color={theme.accent} />
        </View>
        <View style={styles.calmaTextWrapper}>
          <Text style={[styles.calmaTitle, { color: theme.text }]}>
            Calma en la Presencia
          </Text>
          <Text style={[styles.calmaSubtitle, { color: theme.textMuted }]}>
            Haz una pausa consciente · Respiración 4-7-8 y descanso bíblico
          </Text>
        </View>
      </View>
      <ChevronRight size={18} color={theme.accent} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  calmaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  calmaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  calmaIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  calmaTextWrapper: {
    flex: 1,
  },
  calmaTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  calmaSubtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
});
