import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import {
  Sun,
  BookOpen,
  Moon,
  Bell,
  Vibrate,
  ShieldAlert,
  Info,
  Type,
  Check,
  Church,
  Sparkles,
} from 'lucide-react-native';
import Constants from 'expo-constants';
import { Screen } from '@/src/components/ui/Screen';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes, ThemeMode } from '@/src/theme/colors';
import { scheduleSliding14DayNotifications } from '@/src/services/notifications/notificationService';
import { hapticLight, hapticSuccess } from '@/src/services/haptics/hapticFeedback';

export default function SettingsScreen() {
  const themeMode = useSettingsStore((s) => s.theme);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const morningTime = useSettingsStore((s) => s.morningNotificationTime);
  const eveningTime = useSettingsStore((s) => s.eveningNotificationTime);
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);

  const setTheme = useSettingsStore((s) => s.setTheme);
  const setFontSize = useSettingsStore((s) => s.setFontSize);
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);
  const setHapticsEnabled = useSettingsStore((s) => s.setHapticsEnabled);

  const theme = themes[themeMode] || themes.sepia;

  const handleSelectTheme = (mode: ThemeMode) => {
    hapticSuccess();
    setTheme(mode);
  };

  const handleToggleNotifications = async (val: boolean) => {
    hapticLight();
    setNotificationsEnabled(val);
    if (val) {
      await scheduleSliding14DayNotifications(morningTime, eveningTime);
    }
  };

  const handleToggleHaptics = (val: boolean) => {
    hapticLight();
    setHapticsEnabled(val);
  };

  const fontSizes = [15, 17, 19, 21, 23];

  return (
    <Screen safeTop safeBottom={false}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
        <Text style={[styles.title, { color: theme.text }]}>Ajustes</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          Personaliza tu experiencia de lectura y descanso
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* THEME SELECTOR */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Tema de Lectura
          </Text>

          <View style={styles.themeGrid}>
            <TouchableOpacity
              style={[
                styles.themeCard,
                {
                  backgroundColor: '#ffffff',
                  borderColor: themeMode === 'light' ? theme.accent : '#e2e8f0',
                },
              ]}
              onPress={() => handleSelectTheme('light')}
              activeOpacity={0.8}
            >
              <Sun size={20} color="#1e293b" />
              <Text style={[styles.themeLabel, { color: '#1e293b' }]}>Claro</Text>
              {themeMode === 'light' && (
                <View style={[styles.activeCheck, { backgroundColor: theme.accent }]}>
                  <Check size={12} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeCard,
                {
                  backgroundColor: '#f4ecd8',
                  borderColor: themeMode === 'sepia' ? theme.accent : '#d4c7a9',
                },
              ]}
              onPress={() => handleSelectTheme('sepia')}
              activeOpacity={0.8}
            >
              <BookOpen size={20} color="#433422" />
              <Text style={[styles.themeLabel, { color: '#433422' }]}>Sepia</Text>
              {themeMode === 'sepia' && (
                <View style={[styles.activeCheck, { backgroundColor: theme.accent }]}>
                  <Check size={12} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeCard,
                {
                  backgroundColor: '#000000',
                  borderColor: themeMode === 'oled' ? theme.accent : '#273549',
                },
              ]}
              onPress={() => handleSelectTheme('oled')}
              activeOpacity={0.8}
            >
              <Moon size={20} color="#f1f5f9" />
              <Text style={[styles.themeLabel, { color: '#f1f5f9' }]}>OLED</Text>
              {themeMode === 'oled' && (
                <View style={[styles.activeCheck, { backgroundColor: theme.accent }]}>
                  <Check size={12} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* FONT SIZE SELECTOR */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Tamaño de Letra ({fontSize}pt)
            </Text>
            <Type size={18} color={theme.textMuted} />
          </View>

          {/* Preview box */}
          <View
            style={[
              styles.fontPreviewBox,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.borderSubtle,
              },
            ]}
          >
            <Text
              style={[
                styles.fontPreviewText,
                {
                  fontSize,
                  lineHeight: Math.round(fontSize * 1.6),
                  color: theme.text,
                },
              ]}
            >
              «Lámpara es a mis pies tu palabra, y lumbrera a mi camino.»
            </Text>
          </View>

          {/* Stepper buttons */}
          <View style={styles.fontSizeRow}>
            {fontSizes.map((sz) => {
              const isSelected = sz === fontSize;
              return (
                <TouchableOpacity
                  key={sz}
                  style={[
                    styles.fontSizePill,
                    {
                      backgroundColor: isSelected
                        ? theme.accent
                        : theme.surfaceRaised,
                      borderColor: isSelected ? theme.accent : theme.borderSubtle,
                    },
                  ]}
                  onPress={() => {
                    hapticLight();
                    setFontSize(sz);
                  }}
                >
                  <Text
                    style={[
                      styles.fontSizePillText,
                      {
                        color: isSelected ? '#ffffff' : theme.text,
                        fontWeight: isSelected ? '700' : '600',
                      },
                    ]}
                  >
                    {sz}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* NOTIFICATIONS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Notificaciones de Lectura Diaria
          </Text>

          <View
            style={[
              styles.settingCard,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.borderSubtle,
              },
            ]}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Bell size={20} color={theme.accent} />
                <View>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>
                    Versículos Diarios (14 Días)
                  </Text>
                  <Text style={[styles.settingSub, { color: theme.textMuted }]}>
                    Mañana (07:00) y Noche (21:30)
                  </Text>
                </View>
              </View>

              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: theme.border, true: theme.accent }}
              />
            </View>

            <View
              style={[
                styles.noticeBadge,
                { backgroundColor: theme.surfaceRaised },
              ]}
            >
              <Info size={14} color={theme.textMuted} />
              <Text style={[styles.noticeText, { color: theme.textMuted }]}>
                Ventana deslizante de 14 días para garantizar máxima puntualidad sin saturar tu móvil.
              </Text>
            </View>
          </View>
        </View>

        {/* HAPTICS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Sensaciones y Respuesta Háptica
          </Text>

          <View
            style={[
              styles.settingCard,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.borderSubtle,
              },
            ]}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Vibrate size={20} color={theme.accent} />
                <View>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>
                    Vibración suave
                  </Text>
                  <Text style={[styles.settingSub, { color: theme.textMuted }]}>
                    Al seleccionar versículos y en la respiración guiada
                  </Text>
                </View>
              </View>

              <Switch
                value={hapticsEnabled}
                onValueChange={handleToggleHaptics}
                trackColor={{ false: theme.border, true: theme.accent }}
              />
            </View>
          </View>
        </View>

        {/* PASTORAL DIRECTION & AUTHORSHIP */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Dirección Espiritual y Autoría
          </Text>

          <View
            style={[
              styles.authorCard,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.borderSubtle,
              },
            ]}
          >
            <View style={styles.authorHeaderRow}>
              <View
                style={[
                  styles.authorAvatarCircle,
                  {
                    backgroundColor:
                      themeMode === 'oled' ? '#182436' : 'rgba(217, 119, 6, 0.12)',
                    borderColor: theme.accent,
                  },
                ]}
              >
                <Church size={24} color={theme.accent} />
              </View>

              <View style={styles.authorTitleCol}>
                <View style={styles.authorBadgeRow}>
                  <View
                    style={[
                      styles.churchBadge,
                      { backgroundColor: theme.accent + '20' },
                    ]}
                  >
                    <Church size={12} color={theme.accent} />
                    <Text style={[styles.churchBadgeText, { color: theme.accent }]}>
                      Iglesia Emanuel
                    </Text>
                  </View>
                </View>

                <Text style={[styles.authorName, { color: theme.text }]}>
                  Ps. Guillermo Quispe C.
                </Text>
                <Text style={[styles.authorRole, { color: theme.accent }]}>
                  Guía y Asesoría Pastoral
                </Text>
              </View>
            </View>

            <View style={[styles.authorDivider, { backgroundColor: theme.borderSubtle }]} />

            <Text style={[styles.authorDescription, { color: theme.textMuted }]}>
              Programa desarrollado con el valioso acompañamiento, visión espiritual y orientación doctrinal del{' '}
              <Text style={{ fontWeight: '700', color: theme.text }}>Pastor Guillermo Quispe C.</Text>, de la{' '}
              <Text style={{ fontWeight: '700', color: theme.text }}>Iglesia Emanuel</Text>. Concebido para guiar el camino de fe, el consuelo en las Escrituras y la paz diaria en la presencia de Dios.
            </Text>

            <View
              style={[
                styles.verseDedicationBox,
                {
                  backgroundColor: theme.surfaceRaised,
                  borderColor: theme.borderSubtle,
                },
              ]}
            >
              <Text style={[styles.verseDedicationQuote, { color: theme.text }]}>
                «Y todo lo que hagáis, hacedlo de corazón, como para el Señor y no para los hombres.»
              </Text>
              <Text style={[styles.verseDedicationRef, { color: theme.accent }]}>
                Colosenses 3:23
              </Text>
            </View>
          </View>
        </View>

        {/* MEDICAL & SPIRITUAL SAFETY DISCLAIMER */}
        <View
          style={[
            styles.disclaimerCard,
            {
              backgroundColor: theme.surfaceRaised,
              borderColor: theme.borderSubtle,
            },
          ]}
        >
          <View style={styles.disclaimerHeader}>
            <ShieldAlert size={18} color={theme.accent} />
            <Text style={[styles.disclaimerTitle, { color: theme.text }]}>
              Compromiso de Cuidado y Salud
            </Text>
          </View>
          <Text style={[styles.disclaimerBody, { color: theme.textMuted }]}>
            Selah es un espacio de fe, oración y meditación bíblica. Sus ejercicios de respiración y reflexiones son de acompañamiento espiritual y no sustituyen el diagnóstico, terapia ni tratamiento médico o psicológico profesional.
          </Text>
        </View>

        {/* FOOTER / ABOUT */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            Selah: Biblia & Calma Espiritual · Versión {Constants.expoConfig?.version ?? '1.2.3'}{Constants.expoConfig?.android?.versionCode ? ` (build ${Constants.expoConfig.android.versionCode})` : ''}
          </Text>
          <Text style={[styles.footerSub, { color: theme.textMuted }]}>
            Iglesia Emanuel · En colaboración con Ps. Guillermo Quispe C.
          </Text>
          <Text style={[styles.footerSub, { color: theme.textMuted }]}>
            100% Sin conexión · Reina-Valera 1909
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.1,
    marginBottom: 12,
  },
  themeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  themeCard: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  activeCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontPreviewBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  fontPreviewText: {
    fontStyle: 'italic',
    textAlign: 'center',
  },
  fontSizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  fontSizePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontSizePillText: {
    fontSize: 13,
  },
  settingCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  settingSub: {
    fontSize: 12,
    marginTop: 2,
  },
  noticeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  noticeText: {
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },
  authorCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  authorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  authorAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorTitleCol: {
    flex: 1,
  },
  authorBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  churchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  churchBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  authorRole: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  authorDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },
  authorDescription: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  verseDedicationBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  verseDedicationQuote: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 17,
  },
  verseDedicationRef: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'right',
  },
  disclaimerCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  disclaimerBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerSub: {
    fontSize: 11,
    marginTop: 2,
  },
});
