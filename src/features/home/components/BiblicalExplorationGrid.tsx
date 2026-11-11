import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Compass, MapPin, Clock, Sparkles } from 'lucide-react-native';
import { ThemePalette } from '@/src/theme/colors';
import { DailyDiscovery } from '@/src/types/bible';
import { hapticLight } from '@/src/services/haptics/hapticFeedback';

interface BiblicalExplorationGridProps {
  theme: ThemePalette;
  themeMode: string;
  todayDiscovery: DailyDiscovery | null;
  onNavigate: (route: string) => void;
}

export const BiblicalExplorationGrid: React.FC<BiblicalExplorationGridProps> = ({
  theme,
  themeMode,
  todayDiscovery,
  onNavigate,
}) => {
  return (
    <>
      <View style={[styles.sectionHeader, { marginTop: 26 }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Exploración Bíblica
        </Text>
        <TouchableOpacity
          onPress={() => {
            hapticLight();
            onNavigate('/characters');
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.sectionSeeAll, { color: theme.accent }]}>
            Explorar todo
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gridContainer}>
        {/* 1. Personajes Bíblicos */}
        <TouchableOpacity
          style={[
            styles.gridCard,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.borderSubtle,
            },
          ]}
          onPress={() => {
            hapticLight();
            onNavigate('/characters');
          }}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.gridIconWrap,
              {
                backgroundColor:
                  themeMode === 'oled'
                    ? '#1e293b'
                    : 'rgba(217, 119, 6, 0.12)',
              },
            ]}
          >
            <Compass size={20} color={theme.accent} />
          </View>
          <Text style={[styles.gridTag, { color: theme.accent }]}>
            55 PERSONAJES
          </Text>
          <Text style={[styles.gridTitle, { color: theme.text }]}>
            El Árbol Humano
          </Text>
          <Text
            style={[styles.gridSubtitle, { color: theme.textMuted }]}
            numberOfLines={2}
          >
            David, Moisés, Rut y arquetipos del alma
          </Text>
        </TouchableOpacity>

        {/* 2. Lugares Sagrados GPS */}
        <TouchableOpacity
          style={[
            styles.gridCard,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.borderSubtle,
            },
          ]}
          onPress={() => {
            hapticLight();
            onNavigate('/places');
          }}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.gridIconWrap,
              {
                backgroundColor:
                  themeMode === 'oled'
                    ? '#1e293b'
                    : 'rgba(16, 185, 129, 0.12)',
              },
            ]}
          >
            <MapPin size={20} color="#10b981" />
          </View>
          <Text style={[styles.gridTag, { color: '#10b981' }]}>
            36 LUGARES GPS
          </Text>
          <Text style={[styles.gridTitle, { color: theme.text }]}>
            Mapa Sagrado
          </Text>
          <Text
            style={[styles.gridSubtitle, { color: theme.textMuted }]}
            numberOfLines={2}
          >
            Getsemaní, Sinaí, Belén y coordenadas
          </Text>
        </TouchableOpacity>

        {/* 3. Cronología Viva */}
        <TouchableOpacity
          style={[
            styles.gridCard,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.borderSubtle,
            },
          ]}
          onPress={() => {
            hapticLight();
            onNavigate('/timeline');
          }}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.gridIconWrap,
              {
                backgroundColor:
                  themeMode === 'oled'
                    ? '#1e293b'
                    : 'rgba(99, 102, 241, 0.12)',
              },
            ]}
          >
            <Clock size={20} color="#6366f1" />
          </View>
          <Text style={[styles.gridTag, { color: '#6366f1' }]}>
            9 ÉPOCAS · 62 EVENTOS
          </Text>
          <Text style={[styles.gridTitle, { color: theme.text }]}>
            Línea del Tiempo
          </Text>
          <Text
            style={[styles.gridSubtitle, { color: theme.textMuted }]}
            numberOfLines={2}
          >
            Secuencia histórica desde el Génesis a Roma
          </Text>
        </TouchableOpacity>

        {/* 4. Sabiduría Selah & Raíces */}
        <TouchableOpacity
          style={[
            styles.gridCard,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.borderSubtle,
            },
          ]}
          onPress={() => {
            hapticLight();
            onNavigate('/discoveries');
          }}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.gridIconWrap,
              {
                backgroundColor:
                  themeMode === 'oled'
                    ? '#1e293b'
                    : 'rgba(236, 72, 153, 0.12)',
              },
            ]}
          >
            <Sparkles size={20} color="#ec4899" />
          </View>
          <Text style={[styles.gridTag, { color: '#ec4899' }]}>
            30 RAÍCES Y TESOROS
          </Text>
          <Text style={[styles.gridTitle, { color: theme.text }]}>
            Raíces del Día
          </Text>
          <Text
            style={[styles.gridSubtitle, { color: theme.textMuted }]}
            numberOfLines={2}
          >
            {todayDiscovery
              ? `«${todayDiscovery.original_word || todayDiscovery.title}» · Tocar para ver`
              : 'Etimología hebrea y arqueología'}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectionSeeAll: {
    fontSize: 13,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 6,
    marginBottom: 12,
  },
  gridCard: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gridIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gridTag: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  gridSubtitle: {
    fontSize: 11.5,
    lineHeight: 16,
  },
});
