import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Copy,
  Image as ImageIcon,
  Link2,
  Share2,
  Bookmark,
  Palette,
  BookOpen,
  X,
} from 'lucide-react-native';
import { hapticLight } from '@/src/services/haptics/hapticFeedback';

interface DailyVerseActionSheetProps {
  visible: boolean;
  verseCitation: string;
  isSaved: boolean;
  onCopyVerse: () => void;
  onCopyLink: () => void;
  onShare: () => void;
  onShareImage: () => void;
  onToggleBookmark: () => void;
  onDesignCard: () => void;
  onReadFullChapter: () => void;
  onClose: () => void;
}

export const DailyVerseActionSheet: React.FC<DailyVerseActionSheetProps> = ({
  visible,
  verseCitation,
  isSaved,
  onCopyVerse,
  onCopyLink,
  onShare,
  onShareImage,
  onToggleBookmark,
  onDesignCard,
  onReadFullChapter,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  const handleAction = (action: () => void) => {
    hapticLight();
    onClose();
    setTimeout(() => {
      action();
    }, 150);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={[styles.sheetContainer, { paddingBottom: Math.max(insets.bottom + 8, 20) }]}
          onStartShouldSetResponder={() => true}
        >
          {/* Drag Indicator */}
          <View style={styles.indicatorWrap}>
            <View style={styles.dragIndicator} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerSubtitle}>OPCIONES DEL VERSÍCULO</Text>
              <Text style={styles.headerCitation}>{verseCitation}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                hapticLight();
                onClose();
              }}
              activeOpacity={0.7}
              hitSlop={10}
            >
              <X size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.actionsScroll} contentContainerStyle={styles.actionsList} showsVerticalScrollIndicator={false}>
            {/* 1. Copiar versículo */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handleAction(onCopyVerse)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(56, 189, 248, 0.12)' }]}>
                <Copy size={19} color="#38bdf8" />
              </View>
              <View style={styles.actionTextWrap}>
                <Text style={styles.actionTitle}>Copiar versículo</Text>
                <Text style={styles.actionDesc}>Copia el texto bíblico y la cita</Text>
              </View>
            </TouchableOpacity>

            {/* 2. Copiar enlace web */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handleAction(onCopyLink)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(52, 211, 153, 0.12)' }]}>
                <Link2 size={19} color="#34d399" />
              </View>
              <View style={styles.actionTextWrap}>
                <Text style={styles.actionTitle}>Copiar enlace web</Text>
                <Text style={styles.actionDesc}>Enlace corto para redes y estados</Text>
              </View>
            </TouchableOpacity>

            {/* 3. Compartir en WhatsApp o redes */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handleAction(onShare)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(251, 191, 36, 0.15)' }]}>
                <Share2 size={19} color="#fbbf24" />
              </View>
              <View style={styles.actionTextWrap}>
                <Text style={styles.actionTitle}>Compartir en WhatsApp o redes</Text>
                <Text style={styles.actionDesc}>Comparte el texto y su enlace web</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handleAction(onShareImage)}
              activeOpacity={0.7}
              accessibilityRole="button"
            >
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(56, 189, 248, 0.12)' }]}>
                <ImageIcon size={19} color="#38bdf8" />
              </View>
              <View style={styles.actionTextWrap}>
                <Text style={styles.actionTitle}>Compartir como imagen</Text>
                <Text style={styles.actionDesc}>Foto, versículo y referencia, listos para enviar</Text>
              </View>
            </TouchableOpacity>

            {/* 4. Guardar en mis versículos favoritos */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handleAction(onToggleBookmark)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: isSaved ? 'rgba(239, 68, 68, 0.15)' : 'rgba(244, 63, 94, 0.12)' },
                ]}
              >
                <Bookmark
                  size={19}
                  color={isSaved ? '#ef4444' : '#f43f5e'}
                  fill={isSaved ? '#ef4444' : 'transparent'}
                />
              </View>
              <View style={styles.actionTextWrap}>
                <Text style={styles.actionTitle}>
                  {isSaved ? 'Quitar de mis favoritos' : 'Guardar en mis versículos favoritos'}
                </Text>
                <Text style={styles.actionDesc}>
                  {isSaved ? 'Eliminar de tu colección guardada' : 'Colecciona versículos para meditar'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* 5. Diseñar postal / tarjeta con imagen */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handleAction(onDesignCard)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(168, 85, 247, 0.12)' }]}>
                <Palette size={19} color="#a855f7" />
              </View>
              <View style={styles.actionTextWrap}>
                <Text style={styles.actionTitle}>Diseñar postal / tarjeta con imagen</Text>
                <Text style={styles.actionDesc}>Personaliza fondos y tipografías para compartir</Text>
              </View>
            </TouchableOpacity>

            {/* 6. Leer capítulo completo en la Biblia */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handleAction(onReadFullChapter)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(217, 119, 6, 0.15)' }]}>
                <BookOpen size={19} color="#fbbf24" />
              </View>
              <View style={styles.actionTextWrap}>
                <Text style={styles.actionTitle}>Leer capítulo completo en la Biblia</Text>
                <Text style={styles.actionDesc}>Abre el contexto bíblico completo sin conexión</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* Cancel button */}
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              hapticLight();
              onClose();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  sheetContainer: {
    maxHeight: '90%',
    backgroundColor: '#0c121e',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 20,
  },
  indicatorWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  dragIndicator: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fbbf24',
    letterSpacing: 0.8,
  },
  headerCitation: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsScroll: {
    flexShrink: 1,
  },
  actionsList: {
    paddingVertical: 8,
    gap: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 11,
    paddingHorizontal: 6,
    borderRadius: 14,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextWrap: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#f8fafc',
  },
  actionDesc: {
    fontSize: 11.5,
    color: '#94a3b8',
  },
  cancelBtn: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#cbd5e1',
  },
});
