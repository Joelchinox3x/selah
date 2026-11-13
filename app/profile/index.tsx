import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Camera,
  ShieldCheck,
  BadgeCheck,
  Check,
  Sparkles,
  Lock,
  Mail,
  User,
  BookOpen,
  Heart,
  MessageSquare,
  Pin,
  RefreshCw,
  X,
  ExternalLink,
  KeyRound,
  Upload,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Screen } from '@/src/components/ui/Screen';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { useAuthStore } from '@/src/features/auth/authStore';
import { themes } from '@/src/theme/colors';
import {
  getClerkPublishableKey,
  setClerkPublishableKey,
  isClerkConfigured,
  extractGooglePhotoUrl,
} from '@/src/features/auth/clerkService';
import { hapticLight, hapticSuccess } from '@/src/services/haptics/hapticFeedback';

// Galería de avatares espirituales de alta resolución en proporción cuadrada 1:1
const SPIRITUAL_AVATARS = [
  {
    id: 'dove',
    name: 'Paloma de Paz',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    icon: '🕊️',
  },
  {
    id: 'cross',
    name: 'Cruz de Gracia',
    url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=300&auto=format&fit=crop&q=80',
    icon: '✝️',
  },
  {
    id: 'bible',
    name: 'Escrituras',
    url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=300&auto=format&fit=crop&q=80',
    icon: '📖',
  },
  {
    id: 'mountain',
    name: 'Monte de Oración',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&auto=format&fit=crop&q=80',
    icon: '🏔️',
  },
  {
    id: 'sunrise',
    name: 'Amanecer',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80',
    icon: '🌅',
  },
  {
    id: 'olive',
    name: 'Rama de Olivo',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    icon: '🌿',
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;
  const isDark = themeMode === 'oled';

  const authUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const updateProfileDetails = useAuthStore((s) => s.updateProfileDetails);

  // Estados de edición del perfil
  const [name, setName] = useState(authUser?.name || 'Creyente en Cristo');
  const [bio, setBio] = useState(authUser?.bio || '');
  const [favoriteVerse, setFavoriteVerse] = useState(authUser?.favoriteVerse || '');
  const [avatarUrl, setAvatarUrl] = useState(
    authUser?.avatarUrl ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
  );
  const [saving, setSaving] = useState(false);

  // Modal de edición de avatar y recorte cuadrado
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [previewingAvatar, setPreviewingAvatar] = useState(avatarUrl);

  // Modal de configuración Clerk
  const [clerkModalVisible, setClerkModalVisible] = useState(false);
  const [clerkKeyInput, setClerkKeyInput] = useState('');

  // Guardar perfil completo
  const handleSaveProfile = async () => {
    if (saving) return;
    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 2) {
      Alert.alert('Aviso', 'El nombre debe tener al menos 2 caracteres.');
      return;
    }
    setSaving(true);
    try {
      hapticLight();
      await updateProfileDetails({
        name: cleanName,
        bio: bio.trim(),
        favoriteVerse: favoriteVerse.trim(),
        avatarUrl,
      });
      hapticSuccess();
      Alert.alert('Perfil Actualizado', 'Tus datos e imagen cuadrada se han guardado con éxito.');
    } catch {
      Alert.alert('Error', 'No se pudieron guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  // Estado de procesamiento de imagen
  const [processingImage, setProcessingImage] = useState(false);

  // Aplicar avatar recortado
  const handleApplyAvatar = (url: string) => {
    hapticLight();
    setAvatarUrl(url);
    setPreviewingAvatar(url);
    setAvatarModalVisible(false);
    setCustomUrlInput('');
  };

  // Procesar, recortar y redimensionar estrictamente a cuadrado 1:1 (512x512)
  const processAndSetImage = async (uri: string) => {
    try {
      setProcessingImage(true);
      const manip = await manipulateAsync(
        uri,
        [{ resize: { width: 512, height: 512 } }],
        { compress: 0.85, format: SaveFormat.JPEG }
      );
      setPreviewingAvatar(manip.uri);
      hapticLight();
    } catch {
      // Fallback seguro a URI original
      setPreviewingAvatar(uri);
    } finally {
      setProcessingImage(false);
    }
  };

  // Seleccionar de Galería con recorte cuadrado 1:1
  const handlePickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permiso Requerido',
          'Concede acceso a tus fotos para recortar tu imagen en formato cuadrado 1:1.'
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1], // Proporción cuadrada estricta 1:1
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        await processAndSetImage(result.assets[0].uri);
      }
    } catch (err: any) {
      Alert.alert('Error', 'No se pudo cargar la imagen: ' + (err?.message || 'Error desconocido'));
    }
  };

  // Tomar Foto con Cámara y recorte 1:1
  const handleTakePhotoWithCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permiso Requerido',
          'Concede acceso a la cámara para capturar tu foto de perfil cuadrada.'
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1], // Proporción cuadrada estricta 1:1
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        await processAndSetImage(result.assets[0].uri);
      }
    } catch (err: any) {
      Alert.alert('Error', 'No se pudo abrir la cámara: ' + (err?.message || 'Error desconocido'));
    }
  };

  // Restaurar foto de Google
  const handleRestoreGooglePhoto = () => {
    if (authUser?.provider === 'google' && authUser.email) {
      // Reconstruye avatar por Google o Clerk
      const googlePic = authUser.avatarUrl && !authUser.avatarUrl.includes('unsplash')
        ? authUser.avatarUrl
        : `https://lh3.googleusercontent.com/a/default-user=s512-c`;
      handleApplyAvatar(googlePic);
    } else {
      Alert.alert(
        'Foto de Google',
        'Inicia sesión con tu cuenta de Google para sincronizar tu foto oficial automáticamente.'
      );
    }
  };

  // Abrir modal de Clerk
  const handleOpenClerkModal = async () => {
    const key = await getClerkPublishableKey();
    setClerkKeyInput(key);
    setClerkModalVisible(true);
  };

  // Guardar Clerk Key
  const handleSaveClerkKey = async () => {
    hapticLight();
    await setClerkPublishableKey(clerkKeyInput);
    hapticSuccess();
    setClerkModalVisible(false);
    Alert.alert(
      'Clerk Configurado',
      clerkKeyInput.trim()
        ? 'Se ha guardado la Publishable Key de Clerk. Ahora los inicios de sesión con Google usarán este entorno.'
        : 'Se ha restablecido la clave predeterminada de Clerk.'
    );
  };

  const roleLabel = useMemo(() => {
    if (authUser?.isPastor || authUser?.role === 'pastor') return 'Pastor de la Comunidad';
    if (authUser?.role === 'moderador') return 'Líder / Moderador';
    if (authUser?.isVerified) return 'Creyente Verificado';
    return 'Lector de la Comunidad';
  }, [authUser]);

  return (
    <Screen safeTop safeBottom={false}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* HEADER */}
        <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Volver a Ajustes"
          >
            <ArrowLeft size={22} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={[styles.title, { color: theme.text }]}>Mi Perfil Devocional</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              Identidad visual, avatar cuadrado y testimonio en la comunidad.
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* SECCIÓN DEL AVATAR CUADRADO 1:1 CON MÁSCARA CIRCULAR */}
          <View style={[styles.avatarSection, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: avatarUrl }}
                style={[
                  styles.avatarImage,
                  {
                    borderColor: authUser?.isPastor
                      ? '#d97706'
                      : authUser?.role === 'moderador'
                      ? '#0ea5e9'
                      : theme.accent,
                  },
                ]}
              />
              {/* Botón flotante para editar foto */}
              <TouchableOpacity
                style={[styles.cameraButton, { backgroundColor: theme.accent }]}
                onPress={() => {
                  hapticLight();
                  setPreviewingAvatar(avatarUrl);
                  setAvatarModalVisible(true);
                }}
                accessibilityRole="button"
                accessibilityLabel="Cambiar foto de perfil"
              >
                <Camera size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <View style={styles.avatarInfo}>
              <View style={styles.nameBadgeRow}>
                <Text style={[styles.profileHeaderName, { color: theme.text }]}>{name}</Text>
                {authUser?.isPastor && <ShieldCheck size={16} color="#d97706" />}
                {!authUser?.isPastor && authUser?.isVerified && <BadgeCheck size={16} color="#0284c7" />}
              </View>
              <Text style={[styles.roleBadgeText, { color: theme.textMuted }]}>{roleLabel}</Text>
              <TouchableOpacity
                style={[styles.changePhotoBtn, { backgroundColor: theme.surfaceRaised, borderColor: theme.borderSubtle }]}
                onPress={() => {
                  hapticLight();
                  setPreviewingAvatar(avatarUrl);
                  setAvatarModalVisible(true);
                }}
              >
                <Text style={[styles.changePhotoBtnText, { color: theme.accent }]}>
                  Cambiar / Recortar Foto
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ESTADÍSTICAS DEVOCIONALES DEL USUARIO */}
          <View style={styles.metricsRow}>
            <View style={[styles.metricCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <MessageSquare size={16} color={theme.accent} />
              <Text style={[styles.metricValue, { color: theme.text }]}>{authUser?.reflectionsCount || 0}</Text>
              <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Reflexiones</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <Pin size={16} color={isDark ? '#fbbf24' : '#b45309'} />
              <Text style={[styles.metricValue, { color: theme.text }]}>
                {authUser?.isPastor ? 'Destacado' : 'Activo'}
              </Text>
              <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Testimonios</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <Sparkles size={16} color="#10b981" />
              <Text style={[styles.metricValue, { color: theme.text }]}>{authUser?.blessingsCount || 1}</Text>
              <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Amén / Likes</Text>
            </View>
          </View>

          {/* FORMULARIO DE EDICIÓN */}
          <View style={[styles.formCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.formTitle, { color: theme.text }]}>Datos del Hermano</Text>

            {/* Campo: Nombre */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Nombre en la Comunidad</Text>
              <View style={[styles.inputBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <User size={16} color={theme.textMuted} />
                <TextInput
                  style={[styles.textInput, { color: theme.text }]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Tu nombre público"
                  placeholderTextColor={theme.textMuted}
                  maxLength={60}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Campo: Versículo Lema */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Versículo Lema / Favorito</Text>
              <View style={[styles.inputBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <BookOpen size={16} color={theme.textMuted} />
                <TextInput
                  style={[styles.textInput, { color: theme.text }]}
                  value={favoriteVerse}
                  onChangeText={setFavoriteVerse}
                  placeholder="Ej: Filipenses 4:13 o Salmos 23:1"
                  placeholderTextColor={theme.textMuted}
                  maxLength={80}
                />
              </View>
            </View>

            {/* Campo: Biografía / Testimonio */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Testimonio o Breve Presentación</Text>
              <View style={[styles.inputBox, styles.bioBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <TextInput
                  style={[styles.textInput, styles.bioInput, { color: theme.text }]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Comparte una breve frase de fe o tu congregación…"
                  placeholderTextColor={theme.textMuted}
                  maxLength={160}
                  multiline
                />
              </View>
              <Text style={[styles.charCounter, { color: theme.textMuted }]}>{bio.length}/160</Text>
            </View>

            {/* Campo: Correo (Lectura con candado) */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Correo Vinculado</Text>
              <View style={[styles.inputBox, { backgroundColor: theme.surfaceRaised, borderColor: theme.borderSubtle }]}>
                <Mail size={16} color={theme.textMuted} />
                <Text style={[styles.emailReadOnly, { color: theme.text }]}>
                  {authUser?.email || 'Sin vincular a Google'}
                </Text>
                <Lock size={14} color={theme.textMuted} />
              </View>
            </View>

            {/* BOTÓN GUARDAR */}
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.accent }]}
              onPress={handleSaveProfile}
              disabled={saving}
              accessibilityRole="button"
            >
              {saving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Check size={18} color="#ffffff" />
                  <Text style={styles.saveBtnText}>Guardar Cambios de Perfil</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* TARJETA DE VINCULACIÓN CON CLERK & GOOGLE */}
          <View style={[styles.clerkCard, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
            <View style={styles.clerkHeader}>
              <View style={styles.clerkHeaderLeft}>
                <Sparkles size={16} color={theme.accent} />
                <Text style={[styles.clerkTitle, { color: theme.text }]}>Acceso con Google (Clerk)</Text>
              </View>
              <TouchableOpacity onPress={handleOpenClerkModal}>
                <KeyRound size={16} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.clerkSubtitle, { color: theme.textMuted }]}>
              {isAuthenticated
                ? 'Tu sesión está autenticada y tus reflexiones portan el distintivo de confianza de la comunidad.'
                : 'Conéctate mediante Clerk para mantener tus reflexiones protegidas y sincronizar tu foto oficial de Google.'}
            </Text>

            <TouchableOpacity
              style={[styles.clerkConfigBtn, { backgroundColor: theme.surfaceRaised, borderColor: theme.borderSubtle }]}
              onPress={handleOpenClerkModal}
            >
              <Text style={[styles.clerkConfigBtnText, { color: theme.accent }]}>
                ⚙️ Configuración y Claves de Clerk
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* MODAL: SELECCIÓN Y RECORTE CUADRADO DE AVATAR (1:1) */}
        <Modal
          visible={avatarModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setAvatarModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Elegir Foto Cuadrada 1:1</Text>
                <TouchableOpacity onPress={() => setAvatarModalVisible(false)}>
                  <X size={20} color={theme.textMuted} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
                Tu foto se optimiza en formato cuadrado para lucir con máxima nitidez en el muro de reflexiones.
              </Text>

              {/* Vista previa 1:1 */}
              <View style={styles.previewContainer}>
                <Image source={{ uri: previewingAvatar }} style={[styles.previewImage, { borderColor: theme.accent }]} />
                <Text style={[styles.previewNotice, { color: theme.textMuted }]}>
                  Proporción Cuadrada 1:1 (512×512 px)
                </Text>
              </View>

              {/* ACCIONES DE FOTO CUADRADA 1:1 CON CÁMARA O GALERÍA */}
              <View style={styles.pickerActionRow}>
                <TouchableOpacity
                  style={[styles.pickerActionBtn, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}
                  onPress={handlePickFromGallery}
                  disabled={processingImage}
                  activeOpacity={0.7}
                >
                  <Upload size={18} color={theme.accent} />
                  <View style={styles.pickerActionTexts}>
                    <Text style={[styles.pickerActionTitle, { color: theme.text }]}>Elegir de Galería</Text>
                    <Text style={[styles.pickerActionHint, { color: theme.textMuted }]}>Recorte 1:1 a 512×512</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.pickerActionBtn, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}
                  onPress={handleTakePhotoWithCamera}
                  disabled={processingImage}
                  activeOpacity={0.7}
                >
                  <Camera size={18} color={theme.accent} />
                  <View style={styles.pickerActionTexts}>
                    <Text style={[styles.pickerActionTitle, { color: theme.text }]}>Tomar Foto</Text>
                    <Text style={[styles.pickerActionHint, { color: theme.textMuted }]}>Cámara directa</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {processingImage && (
                <View style={[styles.processingBadge, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
                  <ActivityIndicator size="small" color={theme.accent} />
                  <Text style={[styles.processingText, { color: theme.textMuted }]}>
                    Optimizando tamaño y nitidez cuadrada (512×512 px)...
                  </Text>
                </View>
              )}

              {/* Opción: Foto oficial de Google */}
              {authUser?.provider === 'google' && (
                <TouchableOpacity
                  style={[styles.googleOptionBtn, { backgroundColor: theme.surfaceRaised, borderColor: theme.borderSubtle }]}
                  onPress={handleRestoreGooglePhoto}
                >
                  <RefreshCw size={15} color={theme.accent} />
                  <Text style={[styles.googleOptionBtnText, { color: theme.text }]}>
                    Usar mi foto original de Google
                  </Text>
                </TouchableOpacity>
              )}

              {/* Opción 2: Galería Espiritual Cuadrada */}
              <Text style={[styles.spiritualTitle, { color: theme.text }]}>Avatares de Fe Prediseñados:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.spiritualRow}>
                {SPIRITUAL_AVATARS.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.spiritualItem,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                      previewingAvatar === item.url && { borderColor: theme.accent, borderWidth: 2 },
                    ]}
                    onPress={() => setPreviewingAvatar(item.url)}
                  >
                    <Image source={{ uri: item.url }} style={styles.spiritualThumb} />
                    <Text style={[styles.spiritualItemName, { color: theme.text }]}>{item.icon} {item.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Opción 3: Pegar enlace de foto */}
              <View style={styles.customUrlGroup}>
                <Text style={[styles.customUrlLabel, { color: theme.textMuted }]}>O pega la URL de tu imagen:</Text>
                <View style={[styles.customUrlRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <TextInput
                    style={[styles.customUrlInput, { color: theme.text }]}
                    placeholder="https://ejemplo.com/mi-foto.jpg"
                    placeholderTextColor={theme.textMuted}
                    value={customUrlInput}
                    onChangeText={(val) => {
                      setCustomUrlInput(val);
                      if (val.trim().startsWith('http')) setPreviewingAvatar(val.trim());
                    }}
                    autoCapitalize="none"
                  />
                  {!!customUrlInput && (
                    <TouchableOpacity
                      style={[styles.previewApplyBtn, { backgroundColor: theme.accent }]}
                      onPress={() => setPreviewingAvatar(customUrlInput.trim())}
                    >
                      <Text style={styles.previewApplyBtnText}>Ver</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Botón Aplicar */}
              <TouchableOpacity
                style={[styles.applyAvatarBtn, { backgroundColor: theme.accent }]}
                onPress={() => handleApplyAvatar(previewingAvatar)}
              >
                <Check size={18} color="#ffffff" />
                <Text style={styles.applyAvatarBtnText}>Aplicar Esta Foto</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* MODAL: CONFIGURACIÓN DE CLERK */}
        <Modal
          visible={clerkModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setClerkModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <KeyRound size={18} color={theme.accent} />
                  <Text style={[styles.modalTitle, { color: theme.text }]}>Clerk Publishable Key</Text>
                </View>
                <TouchableOpacity onPress={() => setClerkModalVisible(false)}>
                  <X size={20} color={theme.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
                Tu entorno de autenticación Clerk para Google OAuth. Cada aplicación de Clerk está 100% aislada, por lo que tus otros proyectos no se verán afectados.
              </Text>

              {/* Tarjeta de entorno actual */}
              <View style={[styles.clerkEnvBox, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
                <Text style={[styles.clerkEnvTitle, { color: theme.text }]}>Instancia Activa:</Text>
                <Text style={[styles.clerkEnvUrl, { color: theme.accent }]}>
                  grand-cougar-4326.clerk.accounts.dev
                </Text>
                <Text style={[styles.clerkEnvDesc, { color: theme.textMuted }]}>
                  Base de usuarios independiente para Selah Bible.
                </Text>
              </View>

              <View style={[styles.clerkInputBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <TextInput
                  style={[styles.clerkTextInput, { color: theme.text }]}
                  placeholder="pk_test_... o pk_live_..."
                  placeholderTextColor={theme.textMuted}
                  value={clerkKeyInput}
                  onChangeText={setClerkKeyInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.clerkModalActions}>
                <TouchableOpacity
                  style={[styles.saveClerkBtn, { backgroundColor: theme.accent }]}
                  onPress={handleSaveClerkKey}
                >
                  <Check size={16} color="#ffffff" />
                  <Text style={styles.saveClerkBtnText}>Guardar Clave de Clerk</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.resetClerkBtn, { backgroundColor: theme.surfaceRaised, borderColor: theme.borderSubtle }]}
                  onPress={() => {
                    setClerkKeyInput('pk_test_Z3JhbmQtY291Z2FyLTQzMjYuY2xlcmsuYWNjb3VudHMuZGV2JA');
                    hapticLight();
                  }}
                >
                  <RefreshCw size={14} color={theme.textMuted} />
                  <Text style={[styles.resetClerkBtnText, { color: theme.textMuted }]}>
                    Restablecer clave actual
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 14,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  avatarInfo: {
    flex: 1,
    gap: 4,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileHeaderName: {
    fontSize: 16,
    fontWeight: '800',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  changePhotoBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 4,
  },
  changePhotoBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  formCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  bioBox: {
    alignItems: 'flex-start',
    minHeight: 76,
  },
  bioInput: {
    textAlignVertical: 'top',
  },
  charCounter: {
    fontSize: 10,
    textAlign: 'right',
  },
  emailReadOnly: {
    flex: 1,
    fontSize: 13,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: 6,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  clerkCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  clerkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clerkHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clerkTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  clerkSubtitle: {
    fontSize: 11,
    lineHeight: 16,
  },
  clerkConfigBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 2,
  },
  clerkConfigBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  // Modales
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 12,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  previewContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  previewImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
  },
  previewNotice: {
    fontSize: 11,
  },
  googleOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  googleOptionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  spiritualTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  spiritualRow: {
    gap: 10,
    paddingVertical: 4,
  },
  spiritualItem: {
    alignItems: 'center',
    padding: 6,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
    width: 86,
  },
  spiritualThumb: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  spiritualItemName: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  customUrlGroup: {
    gap: 6,
    marginTop: 6,
  },
  customUrlLabel: {
    fontSize: 11,
  },
  customUrlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  customUrlInput: {
    flex: 1,
    fontSize: 12,
    padding: 0,
  },
  previewApplyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  previewApplyBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  applyAvatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: 8,
  },
  applyAvatarBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  pickerActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  pickerActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  pickerActionTexts: {
    flex: 1,
  },
  pickerActionTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  pickerActionHint: {
    fontSize: 10,
    marginTop: 1,
  },
  processingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    marginTop: 4,
  },
  processingText: {
    fontSize: 11,
    fontWeight: '500',
  },
  clerkEnvBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 2,
  },
  clerkEnvTitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  clerkEnvUrl: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  clerkEnvDesc: {
    fontSize: 10,
  },
  clerkModalActions: {
    gap: 8,
  },
  clerkInputBox: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clerkTextInput: {
    fontSize: 13,
  },
  saveClerkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  saveClerkBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  resetClerkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  resetClerkBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
