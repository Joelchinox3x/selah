import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Share,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  User,
  Copy,
  RefreshCw,
  ShieldAlert,
  PhoneCall,
  Volume2,
  Repeat,
  Sprout,
  Hand,
} from 'lucide-react-native';
import { Screen } from '@/src/components/ui/Screen';
import { BreathingCircle } from '@/src/features/sos/components/BreathingCircle';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { hapticLight, hapticSuccess } from '@/src/services/haptics/hapticFeedback';

const AMBIENT_SOUNDS = ['Lluvia mansa', 'Arroyo sereno', 'Silencio orante'];

export default function CalmaPresenciaScreen() {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [soundIndex, setSoundIndex] = useState(0);

  const anchorVerse = {
    text: 'La paz os dejo, mi paz os doy; yo no os la doy como el mundo la da. No se turbe vuestro corazón, ni tenga miedo.',
    citation: 'Juan 14:27',
    version: 'RVR 1909',
  };

  const handleCopyAnchorVerse = async () => {
    hapticSuccess();
    await Share.share({
      message: `«${anchorVerse.text}»\n— ${anchorVerse.citation} (${anchorVerse.version})`,
    });
  };

  const handleCycleSound = () => {
    hapticLight();
    setSoundIndex((prev) => (prev + 1) % AMBIENT_SOUNDS.length);
  };

  const handleEmergencyLines = () => {
    hapticLight();
    Alert.alert(
      'Líneas de Ayuda y Contención Gratuita',
      'Si te encuentras en una crisis severa o en peligro inmediato, busca apoyo humano ahora:\n\n' +
        '• EE.UU. / Puerto Rico: Marca al 988 (Línea de Prevención del Suicidio y Crisis).\n' +
        '• México: Marca al 800 911 2000 (Línea de la Vida).\n' +
        '• Colombia: Marca al 106 (Línea de Ayuda en Salud Mental).\n' +
        '• Argentina: Marca al (011) 5275-1135 o 135 (Centro de Asistencia).\n' +
        '• España: Marca al 024 o al 717 003 717 (Teléfono de la Esperanza).\n\n' +
        'Recuerda: Dios te sostiene y no tienes que atravesar esto en soledad.',
      [{ text: 'Entendido', style: 'default' }]
    );
  };

  return (
    <Screen safeTop safeBottom style={{ backgroundColor: theme.background }}>
      {/* 1. Top Header Bar (Photo 5) */}
      <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.headerIconBtn, { backgroundColor: theme.surfaceRaised }]}
          activeOpacity={0.7}
        >
          <ChevronLeft size={20} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.brandRow}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.headerLogoImage}
            resizeMode="cover"
          />
          <Text style={[styles.headerBrandText, { color: theme.text }]}>SELAH</Text>
          <Text style={[styles.headerPageTitle, { color: theme.text }]}>
            Calma en la Presencia
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.headerIconBtn, { backgroundColor: theme.surfaceRaised }]}
          onPress={() => router.push('/settings' as any)}
          activeOpacity={0.7}
        >
          <User size={18} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Top Card: Calma en la Presencia (Photo 5) */}
        <View
          style={[
            styles.introCard,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.borderSubtle,
            },
          ]}
        >
          <View style={styles.introHeaderRow}>
            <Sprout size={14} color={theme.accent} />
            <Text style={[styles.introTag, { color: theme.accent }]}>
              CALMA EN LA PRESENCIA
            </Text>
          </View>
          <Text style={[styles.introTitle, { color: theme.text }]}>
            Haz una pausa consciente. El Señor sostiene tu respiración.
          </Text>
          <Text style={[styles.introSubtitle, { color: theme.textMuted }]}>
            Baja los hombros y suelta la tensión acumulada en este instante.
          </Text>
        </View>

        {/* 3. Concentric 4-7-8 Breathing Circle Component (Photo 5) */}
        <BreathingCircle isActive={true} hapticEnabled={hapticsEnabled} />

        {/* 4. Sensor Controls Box (Photo 5) */}
        <View
          style={[
            styles.sensorControlsCard,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.borderSubtle,
            },
          ]}
        >
          {/* Vibración Háptica Toggle */}
          <View style={styles.sensorRow}>
            <View style={styles.sensorLeft}>
              <Text style={styles.sensorEmoji}>📳</Text>
              <Text style={[styles.sensorLabel, { color: theme.text }]}>
                Vibración háptica suave
              </Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={(val) => {
                hapticLight();
                setHapticsEnabled(val);
              }}
              trackColor={{ false: '#767577', true: theme.accent }}
              thumbColor={hapticsEnabled ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>

          <View style={[styles.sensorDivider, { backgroundColor: theme.borderSubtle }]} />

          {/* Selector de Sonido Ambiental */}
          <TouchableOpacity
            style={styles.sensorRow}
            onPress={handleCycleSound}
            activeOpacity={0.7}
          >
            <View style={styles.sensorLeft}>
              <Text style={styles.sensorEmoji}>💧</Text>
              <Text style={[styles.sensorLabel, { color: theme.text }]}>
                Sonido: {AMBIENT_SOUNDS[soundIndex]}
              </Text>
            </View>
            <Repeat size={16} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* 5. Versículo de Anclaje (Photo 5) */}
        <View
          style={[
            styles.anchorCard,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.borderSubtle,
            },
          ]}
        >
          <View style={styles.anchorHeader}>
            <View style={styles.anchorHeaderLeft}>
              <Text style={[styles.anchorHeaderTitle, { color: theme.accent }]}>
                📖 VERSÍCULO DE ANCLAJE
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleCopyAnchorVerse}
              style={styles.copyBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Copy size={16} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.anchorVerseText, { color: theme.text }]}>
            «{anchorVerse.text}»
          </Text>

          <View style={styles.anchorCitationRow}>
            <Text style={[styles.anchorCitation, { color: theme.text }]}>
              {anchorVerse.citation}
            </Text>
            <Text style={[styles.anchorVersion, { color: theme.textMuted }]}>
              {anchorVerse.version}
            </Text>
          </View>
        </View>

        {/* 6. Physical Grounding Card (Photo 5) */}
        <View
          style={[
            styles.groundingCard,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.borderSubtle,
            },
          ]}
        >
          <View
            style={[styles.groundingIconCircle, { backgroundColor: theme.surfaceRaised }]}
          >
            <Hand size={20} color={theme.text} />
          </View>
          <View style={styles.groundingTextWrap}>
            <Text style={[styles.groundingTitle, { color: theme.text }]}>
              Apoya tus pies en el suelo
            </Text>
            <Text style={[styles.groundingBody, { color: theme.textMuted }]}>
              Siente el firme soporte debajo de ti. Recuerda que este momento pasará y no estás a solas.
            </Text>
          </View>
        </View>

        {/* 7. Ethical & Protective Disclaimer Notice (Photo 5) */}
        <View
          style={[
            styles.safetyCard,
            {
              backgroundColor:
                themeMode === 'oled'
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'rgba(254, 226, 226, 0.5)',
              borderColor:
                themeMode === 'oled' ? '#7F1D1D' : '#FCA5A5',
            },
          ]}
        >
          <View style={styles.safetyHeader}>
            <ShieldAlert size={16} color="#DC2626" />
            <Text style={[styles.safetyTitle, { color: '#B91C1C' }]}>
              Aviso Importante
            </Text>
          </View>
          <Text style={[styles.safetyBody, { color: themeMode === 'oled' ? '#FCA5A5' : '#7F1D1D' }]}>
            Selah no reemplaza ayuda profesional, médica o de salud mental especializada. Si sientes que estás en peligro inmediato, sufres una crisis severa o requieres asistencia urgente, por favor comunícate de inmediato con las líneas gratuitas de contención o acude a un centro asistencial.
          </Text>

          <TouchableOpacity
            style={[styles.emergencyBtn, { backgroundColor: '#1E293B' }]}
            onPress={handleEmergencyLines}
            activeOpacity={0.8}
          >
            <PhoneCall size={15} color="#FFFFFF" />
            <Text style={styles.emergencyBtnText}>
              Ver líneas de ayuda y emergencias
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogoImage: {
    width: 26,
    height: 26,
    borderRadius: 7,
  },
  headerBrandText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerPageTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  introCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  introHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  introTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 25,
    letterSpacing: -0.2,
  },
  introSubtitle: {
    fontSize: 12,
    marginTop: 6,
    lineHeight: 17,
  },
  sensorControlsCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginVertical: 14,
  },
  sensorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  sensorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sensorEmoji: {
    fontSize: 16,
  },
  sensorLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  sensorDivider: {
    height: 1,
  },
  anchorCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginVertical: 10,
  },
  anchorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  anchorHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  anchorHeaderTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  copyBtn: {
    padding: 4,
  },
  anchorVerseText: {
    fontSize: 17,
    lineHeight: 27,
    fontStyle: 'italic',
    letterSpacing: -0.2,
  },
  anchorCitationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  anchorCitation: {
    fontSize: 13,
    fontWeight: '700',
  },
  anchorVersion: {
    fontSize: 12,
    fontWeight: '500',
  },
  groundingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginVertical: 10,
  },
  groundingIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groundingTextWrap: {
    flex: 1,
  },
  groundingTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  groundingBody: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  safetyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginTop: 14,
    marginBottom: 20,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  safetyTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  safetyBody: {
    fontSize: 11,
    lineHeight: 17,
    marginBottom: 14,
  },
  emergencyBtn: {
    minHeight: 46,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
  },
  emergencyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
