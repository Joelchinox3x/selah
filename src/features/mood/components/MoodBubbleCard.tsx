import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  HeartHandshake,
  Feather,
  Moon,
  Shield,
  Sparkles,
  Smile,
  Compass,
  Flame,
} from 'lucide-react-native';
import { MoodCatalogItem } from '@/src/types/bible';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { hapticLight } from '@/src/services/haptics/hapticFeedback';

interface MoodBubbleCardProps {
  mood: MoodCatalogItem;
  onPress: (mood: MoodCatalogItem) => void;
  compact?: boolean;
}

export const MoodBubbleCard: React.FC<MoodBubbleCardProps> = ({
  mood,
  onPress,
  compact = false,
}) => {
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  const renderIcon = (color: string, size: number) => {
    switch (mood.key) {
      case 'anxiety':
        return <Feather size={size} color={color} />;
      case 'sadness':
        return <HeartHandshake size={size} color={color} />;
      case 'exhaustion':
        return <Moon size={size} color={color} />;
      case 'fear':
        return <Shield size={size} color={color} />;
      case 'gratitude':
        return <Sparkles size={size} color={color} />;
      case 'peace':
        return <Smile size={size} color={color} />;
      case 'doubt':
        return <Compass size={size} color={color} />;
      case 'anger':
        return <Flame size={size} color={color} />;
      default:
        return <Feather size={size} color={color} />;
    }
  };

  const handlePress = () => {
    hapticLight();
    onPress(mood);
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[
          styles.compactContainer,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.borderSubtle,
          },
        ]}
        activeOpacity={0.75}
        onPress={handlePress}
      >
        <View
          style={[
            styles.compactIconCircle,
            { backgroundColor: `${mood.color_hex}22` },
          ]}
        >
          {renderIcon(mood.color_hex, 18)}
        </View>
        <Text
          style={[styles.compactLabel, { color: theme.text }]}
          numberOfLines={1}
        >
          {mood.label}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.fullCard,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.borderSubtle,
          shadowColor: '#000',
        },
      ]}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <View
        style={[
          styles.fullIconCircle,
          { backgroundColor: `${mood.color_hex}25` },
        ]}
      >
        {renderIcon(mood.color_hex, 24)}
      </View>

      <View style={styles.fullTextContainer}>
        <Text style={[styles.fullLabel, { color: theme.text }]}>
          {mood.label}
        </Text>
        <Text
          style={[styles.fullTagline, { color: theme.textMuted }]}
          numberOfLines={2}
        >
          {mood.tagline}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  compactContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 84,
  },
  compactIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  compactLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  fullCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 12,
  },
  fullIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  fullTextContainer: {
    flex: 1,
  },
  fullLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  fullTagline: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
});
