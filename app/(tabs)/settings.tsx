import { getCommunityName, saveCommunityName } from '@/src/features/daily/services/communityIdentity';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  Modal,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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
  BadgeCheck,
  ShieldCheck,
  LogOut,
  KeyRound,
  X,
  User,
  Mail,
  Lock,
  ChevronRight,
} from 'lucide-react-native';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { useAuthStore } from '@/src/features/auth/authStore';
import { themes, ThemeMode } from '@/src/theme/colors';
import { scheduleSliding14DayNotifications } from '@/src/services/notifications/notificationService';
import { hapticLight, hapticSuccess } from '@/src/services/haptics/hapticFeedback';

export default function SettingsScreen() {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isPastoralUnlocked = useAuthStore((s) => s.isPastoralUnlocked);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const logout = useAuthStore((s) => s.logout);
  const updateProfileName = useAuthStore((s) => s.updateProfileName);
  const unlockPastoralSession = useAuthStore((s) => s.unlockPastoralSession);

  const [communityName, setCommunityName] = useState('');
  const [savingName, setSavingName] = useState(false);

  // Google Clerk Modal State
  const [googleModalVisible, setGoogleModalVisible] = useState(false);
  const [googleName, setGoogleName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleLoggingIn, setGoogleLoggingIn] = useState(false);

  useEffect(() => {
    let active = true;
    getCommunityName().then((name) => {
      if (active) {
        setCommunityName(name);
        if (!googleName) setGoogleName(name || 'Guillermo Quispe');
      }
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (authUser?.name) {
      setCommunityName(authUser.name);
    }
  }, [authUser?.name]);

  const handleSaveCommunityName = async () => {
    if (savingName) return;
    setSavingName(true);
    try {
      if (isAuthenticated) {
        await updateProfileName(communityName);
      } else {
        await saveCommunityName(communityName);
      }
      hapticSuccess();
      Alert.alert('Nombre guardado', 'Se usará al publicar nuevas reflexiones en la comunidad.');
    } catch {
      Alert.alert('No se pudo guardar', 'Intenta nuevamente.');
    } finally {
      setSavingName(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (googleLoggingIn) return;
    setGoogleLoggingIn(true);
    try {
      const name = (googleName.trim() || communityName.trim() || 'Guillermo Quispe');
      const email = (googleEmail.trim() || 'guillermo.quispe@gmail.com');
      await loginWithGoogle({ name, email });
      setGoogleModalVisible(false);
      hapticSuccess();
      Alert.alert(
        '¡Cuenta Verificada!',
        'Has iniciado sesión con Google. Ahora tus reflexiones contarán con la insignia celestial azul en el Muro de Reflexiones.'
      );
    } catch (err: any) {
      Alert.alert('Error de autenticación', err?.message || 'No se pudo iniciar sesión con Google.');
    } finally {
      setGoogleLoggingIn(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Deseas salir de tu cuenta verificada de Google?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            hapticLight();
            await logout();
          },
        },
      ]
    );
  };
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
        {/* IDENTIDAD COMUNITARIA Y GOOGLE CLERK AUTH */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Identidad Comunitaria y Verificación
          </Text>
          <Text style={{ color: theme.textMuted, fontSize: 13, lineHeight: 20, marginBottom: 12 }}>
            Verifica tu nombre en el Muro de Reflexiones de Selah o accede a las herramientas pastorales.
          </Text>

          {authUser && isAuthenticated ? (
            /* Tarjeta de Usuario Verificado */
            <View style={[styles.identityCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <View style={styles.identityHeader}>
                {authUser.avatarUrl ? (
                  <Image source={{ uri: authUser.avatarUrl }} style={styles.identityAvatar} />
                ) : (
                  <View style={[styles.identityAvatarFallback, { backgroundColor: theme.accentMuted }]}>
                    <Text style={[styles.identityInitials, { color: theme.accent }]}>
                      {authUser.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.identityInfo}>
                  <View style={styles.identityNameRow}>
                    <Text style={[styles.identityName, { color: theme.text }]} numberOfLines={1}>
                      {authUser.name}
                    </Text>
                    {authUser.isVerified && !authUser.isPastor && (
                      <BadgeCheck size={16} color="#0284c7" />
                    )}
                    {authUser.isPastor && (
                      <ShieldCheck size={16} color="#d97706" />
                    )}
                  </View>
                  <Text style={[styles.identityEmail, { color: theme.textMuted }]}>
                    {authUser.email}
                  </Text>
                  <View style={styles.roleBadgeRow}>
                    <View style={[styles.roleBadge, { backgroundColor: authUser.isPastor ? 'rgba(217, 119, 6, 0.15)' : 'rgba(2, 132, 199, 0.12)' }]}>
                      <Text style={[styles.roleBadgeText, { color: authUser.isPastor ? '#d97706' : '#0284c7' }]}>
                        {authUser.role === 'pastor' ? 'Pastor / Administrador' : authUser.role === 'moderador' ? 'Líder / Moderador' : 'Creyente Verificado'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Quick Display Name Edit */}
              <View style={styles.identityEditRow}>
                <TextInput
                  accessibilityLabel="Editar nombre en comentarios"
                  value={communityName}
                  onChangeText={setCommunityName}
                  maxLength={60}
                  placeholder="Tu nombre público"
                  placeholderTextColor={theme.textMuted}
                  autoCapitalize="words"
                  style={[styles.identityInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface }]}
                />
                <TouchableOpacity
                  onPress={handleSaveCommunityName}
                  disabled={savingName}
                  style={[styles.saveNameBtn, { backgroundColor: theme.accent }]}
                  accessibilityRole="button"
                >
                  <Text style={styles.saveNameBtnText}>{savingName ? '...' : 'Actualizar'}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleLogout}
                style={[styles.logoutBtn, { borderColor: theme.borderSubtle }]}
                accessibilityRole="button"
              >
                <LogOut size={15} color={theme.textMuted} />
                <Text style={[styles.logoutBtnText, { color: theme.textMuted }]}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Tarjeta de No Logueado con Botón Google Clerk */
            <View style={[styles.identityCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <View style={styles.guestIntro}>
                <Sparkles size={20} color={theme.accent} style={{ marginBottom: 6 }} />
                <Text style={[styles.guestTitle, { color: theme.text }]}>Obtén tu distintivo verificado</Text>
                <Text style={[styles.guestSubtitle, { color: theme.textMuted }]}>
                  Al acceder con Google, tus reflexiones mostrarán el distintivo celestial azul en el Muro de Reflexiones de la comunidad.
                </Text>
              </View>

              {/* Botón Google */}
              <TouchableOpacity
                onPress={() => {
                  hapticLight();
                  setGoogleName(communityName || 'Guillermo Quispe');
                  setGoogleEmail('guillermo.quispe@gmail.com');
                  setGoogleModalVisible(true);
                }}
                style={styles.googleBtn}
                activeOpacity={0.85}
                accessibilityRole="button"
              >
                <View style={styles.googleIconContainer}>
                  <Text style={styles.googleG}>G</Text>
                </View>
                <Text style={styles.googleBtnText}>Continuar con Google</Text>
              </TouchableOpacity>

              <View style={styles.orDivider}>
                <View style={[styles.dividerLine, { backgroundColor: theme.borderSubtle }]} />
                <Text style={[styles.orText, { color: theme.textMuted }]}>o usa un apodo</Text>
                <View style={[styles.dividerLine, { backgroundColor: theme.borderSubtle }]} />
              </View>

              {/* Manual name fallback */}
              <TextInput
                accessibilityLabel="Nombre para tus comentarios"
                value={communityName}
                onChangeText={setCommunityName}
                maxLength={60}
                placeholder="Tu nombre (opcional)"
                placeholderTextColor={theme.textMuted}
                autoCapitalize="words"
                style={[styles.identityInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface, marginBottom: 8 }]}
              />
              <TouchableOpacity
                onPress={handleSaveCommunityName}
                disabled={savingName}
                accessibilityRole="button"
                style={[styles.guestSaveBtn, { backgroundColor: theme.accentMuted }]}
              >
                <Text style={{ color: theme.accent, fontWeight: '700' }}>
                  {savingName ? 'Guardando…' : 'Guardar apodo'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* SECCIÓN MINISTERIAL: SOLO VISIBLE SI EL USUARIO VERIFICADO ES PASTOR */}
          {authUser && authUser.isPastor && (
            <View style={[styles.pastoralBox, { backgroundColor: 'rgba(217, 119, 6, 0.08)', borderColor: 'rgba(217, 119, 6, 0.35)' }]}>
              <View style={styles.pastoralBoxHeader}>
                <ShieldCheck size={22} color="#d97706" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.pastoralBoxTitle, { color: theme.text }]}>Herramientas de Pastoreo</Text>
                  <Text style={[styles.pastoralBoxSubtitle, { color: theme.textMuted }]}>
                    Supervisión de la congregación, miembros activos y cuidado espiritual.
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  hapticLight();
                  router.push('/admin' as any);
                }}
                style={[styles.openPastoralBtn, { backgroundColor: '#d97706' }]}
                activeOpacity={0.85}
                accessibilityRole="button"
              >
                <Text style={styles.openPastoralBtnText}>Abrir Panel de Supervisión</Text>
                <ChevronRight size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
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

      {/* MODAL CLERK GOOGLE AUTH */}
      <Modal
        visible={googleModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setGoogleModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBackdrop}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.surfaceRaised }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={styles.googleIconContainer}>
                  <Text style={styles.googleG}>G</Text>
                </View>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Entrar con Google</Text>
              </View>
              <TouchableOpacity
                onPress={() => setGoogleModalVisible(false)}
                disabled={googleLoggingIn}
                hitSlop={8}
                accessibilityRole="button"
              >
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
              Verifica tu nombre oficial para mostrar la insignia celestial azul en tus reflexiones comunitarias.
            </Text>

            <View style={styles.modalInputGroup}>
              <Text style={[styles.modalLabel, { color: theme.text }]}>Tu nombre completo</Text>
              <TextInput
                value={googleName}
                onChangeText={setGoogleName}
                placeholder="Ej. Guillermo Quispe"
                placeholderTextColor={theme.textMuted}
                autoCapitalize="words"
                editable={!googleLoggingIn}
                style={[styles.modalInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface }]}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={[styles.modalLabel, { color: theme.text }]}>Correo de Google</Text>
              <TextInput
                value={googleEmail}
                onChangeText={setGoogleEmail}
                placeholder="ejemplo@gmail.com"
                placeholderTextColor={theme.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!googleLoggingIn}
                style={[styles.modalInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface }]}
              />
            </View>

            <TouchableOpacity
              onPress={handleGoogleLogin}
              disabled={googleLoggingIn}
              style={[styles.modalPrimaryBtn, { backgroundColor: '#4285F4' }]}
              activeOpacity={0.85}
              accessibilityRole="button"
            >
              {googleLoggingIn ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.modalPrimaryBtnText}>Verificar y Entrar</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  identityCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  identityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  identityAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  identityAvatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityInitials: {
    fontSize: 18,
    fontWeight: '800',
  },
  identityInfo: {
    flex: 1,
  },
  identityNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  identityName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  identityEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  roleBadgeRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  identityEditRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  identityInput: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    fontSize: 14,
  },
  saveNameBtn: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveNameBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  guestIntro: {
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 12,
  },
  guestTitle: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  guestSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  googleIconContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  googleG: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 13,
  },
  googleBtnText: {
    color: '#1e293b',
    fontSize: 14,
    fontWeight: '700',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  orText: {
    fontSize: 11,
    fontWeight: '500',
  },
  guestSaveBtn: {
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  pastoralLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
    backgroundColor: 'rgba(217, 119, 6, 0.05)',
  },
  pastoralLinkText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  modalInputGroup: {
    marginBottom: 14,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalInput: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  modalPrimaryBtn: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  modalPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  modalErrorText: {
    color: '#ef4444',
    fontSize: 12,
    marginBottom: 10,
  },
  pastoralBox: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginTop: 14,
    gap: 12,
  },
  pastoralBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pastoralBoxTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  pastoralBoxSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  openPastoralBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  openPastoralBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
