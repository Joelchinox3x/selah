import React from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { Users, MapPin, Clock, Sparkles, ArrowUpRight } from 'lucide-react-native';
import { ThemePalette } from '@/src/theme/colors';
import { DailyDiscovery } from '@/src/types/bible';
import { hapticLight } from '@/src/services/haptics/hapticFeedback';

interface BiblicalExplorationGridProps {
  theme: ThemePalette;
  todayDiscovery: DailyDiscovery | null;
  onNavigate: (route: string) => void;
}

export const BiblicalExplorationGrid: React.FC<BiblicalExplorationGridProps> = ({
  theme,
  todayDiscovery,
  onNavigate,
}) => {
  const { width, fontScale } = useWindowDimensions();
  const singleColumn = width < 360 || fontScale >= 1.3;
  const word = todayDiscovery?.original_word?.trim();
  const entries = [
    { title: 'Personajes de la Biblia', description: 'Sus historias y enseñanzas', icon: Users, route: '/characters' },
    { title: 'Lugares bíblicos', description: 'Explora sus mapas e historia', icon: MapPin, route: '/places' },
    { title: 'Línea del tiempo', description: 'Recorre las épocas de la Biblia', icon: Clock, route: '/timeline' },
    {
      title: 'Raíces y tesoros',
      description: word ? `Hoy: ${word}` : 'Palabras, cultura y descubrimientos',
      icon: Sparkles,
      route: '/discoveries',
    },
  ];

  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={[styles.sectionTitle, { color: theme.text }]}>
        Exploración bíblica
      </Text>
      {[entries.slice(0, 2), entries.slice(2)].map((row, index) => (
        <View key={index} style={[styles.row, singleColumn && styles.column]}>
          {row.map(({ title, description, icon: Icon, route }) => (
            <Pressable
              key={route}
              accessibilityRole="button"
              accessibilityLabel={title}
              accessibilityHint={description}
              onPress={() => {
                hapticLight();
                onNavigate(route);
              }}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: pressed ? theme.accentMuted : theme.cardBackground,
                  borderColor: pressed ? theme.accent : theme.border,
                },
              ]}
            >
              <View style={styles.cardTop} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                <View style={[styles.iconWrap, { backgroundColor: theme.accentMuted }]}>
                  <Icon size={20} color={theme.accent} strokeWidth={1.8} />
                </View>
                <ArrowUpRight size={17} color={theme.textMuted} />
              </View>
              <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
              <Text style={[styles.description, { color: theme.textMuted }]}>{description}</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginTop: 26, marginBottom: 12, gap: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', letterSpacing: -0.2, marginBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'stretch', gap: 12 },
  column: { flexDirection: 'column' },
  card: { flex: 1, minWidth: 0, minHeight: 148, borderRadius: 16, borderCurve: 'continuous', borderWidth: 1, padding: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  iconWrap: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, lineHeight: 21, fontWeight: '700', marginBottom: 4 },
  description: { fontSize: 12, lineHeight: 18 },
});
