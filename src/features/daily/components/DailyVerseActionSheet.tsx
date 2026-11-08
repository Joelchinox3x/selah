import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Copy, Link2, Share2, Bookmark, Palette, BookOpen, X, ChevronRight, ArrowLeft, RotateCcw } from 'lucide-react-native';
import { hapticLight } from '@/src/services/haptics/hapticFeedback';

interface DailyVerseActionSheetProps {
  visible: boolean;
  verseCitation: string;
  isSaved: boolean;
  onCopyVerse: () => void;
  onCopyLink: () => void;
  onShare: () => void;
  onToggleBookmark: () => void;
  onDesignCard: () => void;
  onReadFullChapter: () => void;
  onFlipPostal?: () => void;
  onClose: () => void;
}

export const DailyVerseActionSheet: React.FC<DailyVerseActionSheetProps> = ({
  visible, verseCitation, isSaved, onCopyVerse, onCopyLink, onShare,
  onToggleBookmark, onDesignCard, onReadFullChapter, onFlipPostal, onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [copyMenu, setCopyMenu] = useState(false);
  useEffect(() => { if (visible) setCopyMenu(false); }, [visible]);

  const handleAction = (action: () => void) => {
    hapticLight();
    onClose();
    setTimeout(action, 150);
  };

  const mainActions = [
    ...(onFlipPostal ? [{
      key: 'flip-postal',
      icon: RotateCcw,
      color: '#34d399',
      title: 'Girar al reverso de la postal',
      description: 'Muro de reflexión y testimonios de la comunidad',
      action: () => handleAction(onFlipPostal),
    }] : []),
    { key: 'share-text', icon: Share2, color: '#fbbf24', title: 'Compartir texto y enlace', description: 'Envía el versículo y su enlace, sin imagen', action: () => handleAction(onShare) },
    { key: 'copy', icon: Copy, color: '#38bdf8', title: 'Copiar…', description: 'Elige el texto del versículo o su enlace', action: () => { hapticLight(); setCopyMenu(true); } },
    { key: 'bookmark', icon: Bookmark, color: isSaved ? '#ef4444' : '#f43f5e', title: isSaved ? 'Quitar de favoritos' : 'Guardar en favoritos', description: isSaved ? 'Retira el versículo de tu colección' : 'Conserva el versículo en tu colección', action: () => handleAction(onToggleBookmark) },
    { key: 'design', icon: Palette, color: '#a855f7', title: 'Personalizar postal', description: 'Ajusta la foto, el formato y la tipografía', action: () => handleAction(onDesignCard) },
    { key: 'read', icon: BookOpen, color: '#fbbf24', title: 'Leer capítulo completo', description: 'Abre el pasaje en la Biblia', action: () => handleAction(onReadFullChapter) },
  ];
  const copyActions = [
    { key: 'copy-text', icon: Copy, color: '#38bdf8', title: 'Texto del versículo', description: 'Copia el texto bíblico y su referencia', action: () => handleAction(onCopyVerse) },
    { key: 'copy-link', icon: Link2, color: '#34d399', title: 'Enlace', description: 'Copia el enlace para abrir el versículo en Selah', action: () => handleAction(onCopyLink) },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => copyMenu ? setCopyMenu(false) : onClose()}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.sheetContainer, { paddingBottom: Math.max(insets.bottom + 8, 20) }]} onStartShouldSetResponder={() => true}>
          <View style={styles.indicatorWrap}><View style={styles.dragIndicator} /></View>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.headerSubtitle}>{copyMenu ? 'COPIAR' : 'OPCIONES DEL VERSÍCULO'}</Text>
              <Text style={styles.headerCitation}>{verseCitation}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Cerrar opciones">
              <X size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.actionsScroll} contentContainerStyle={styles.actionsList} showsVerticalScrollIndicator={false}>
            {copyMenu && (
              <TouchableOpacity style={styles.backRow} onPress={() => { hapticLight(); setCopyMenu(false); }} accessibilityRole="button">
                <ArrowLeft size={18} color="#94a3b8" />
                <Text style={styles.actionDesc}>Volver a las opciones</Text>
              </TouchableOpacity>
            )}
            {(copyMenu ? copyActions : mainActions).map(({ key, icon: Icon, color, title, description, action }) => (
              <TouchableOpacity key={key} style={styles.actionItem} onPress={action} activeOpacity={0.7} accessibilityRole="button">
                <View style={[styles.iconCircle, { backgroundColor: `${color}1F` }]}>
                  <Icon size={19} color={color} fill={key === 'bookmark' && isSaved ? color : 'none'} />
                </View>
                <View style={styles.actionTextWrap}>
                  <Text style={styles.actionTitle}>{title}</Text>
                  <Text style={styles.actionDesc}>{description}</Text>
                </View>
                {key === 'copy' && <ChevronRight size={17} color="#94a3b8" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8} accessibilityRole="button">
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
  headerText: { flex: 1, paddingRight: 12 },
  backRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 6 },
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
    width: 44,
    height: 44,
    borderRadius: 22,
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
