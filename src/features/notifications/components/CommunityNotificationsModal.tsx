import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, X, ShieldCheck, Heart, MessageSquare, CheckCheck, ChevronRight } from 'lucide-react-native';
import { themes } from '@/src/theme/colors';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { hapticLight, hapticSuccess } from '@/src/services/haptics/hapticFeedback';
import {
  CommunityNotificationItem,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notificationsStore';

interface CommunityNotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectVerse: (item: { verseSlug: string; verseCitation: string }) => void;
  onUnreadChange?: (hasUnread: boolean) => void;
}

export const CommunityNotificationsModal: React.FC<CommunityNotificationsModalProps> = ({
  visible,
  onClose,
  onSelectVerse,
  onUnreadChange,
}) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  const [notifications, setNotifications] = useState<CommunityNotificationItem[]>([]);

  const loadList = async () => {
    const list = await getNotifications();
    setNotifications(list);
    const unread = list.some((n) => !n.isRead);
    onUnreadChange?.(unread);
  };

  useEffect(() => {
    if (visible) {
      loadList();
    }
  }, [visible]);

  const handleMarkAllRead = async () => {
    hapticSuccess();
    await markAllNotificationsAsRead();
    await loadList();
  };

  const handlePressItem = async (item: CommunityNotificationItem) => {
    hapticLight();
    await markNotificationAsRead(item.id);
    await loadList();
    onClose();
    onSelectVerse({
      verseSlug: item.verseSlug,
      verseCitation: item.verseCitation,
    });
  };

  const renderIcon = (type: CommunityNotificationItem['type']) => {
    switch (type) {
      case 'pastoral_reply':
        return <ShieldCheck size={16} color={theme.accent} />;
      case 'reaction':
        return <Heart size={16} color="#ef4444" fill="#ef4444" />;
      case 'comment':
      default:
        return <MessageSquare size={16} color={theme.accent} />;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="Cerrar notificaciones"
        />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.background,
              borderColor: theme.border,
              maxHeight: height * 0.82,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          {/* Top Drag Indicator */}
          <View style={styles.indicatorWrap}>
            <View style={[styles.dragIndicator, { backgroundColor: theme.border }]} />
          </View>

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconWrap, { backgroundColor: theme.surfaceRaised }]}>
                <Bell size={17} color={theme.accent} />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: theme.text }]}>
                  Novedades de la Comunidad
                </Text>
                <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
                  Respuestas, bendiciones y reflexiones
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.surfaceRaised }]}
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Action Bar (Mark all read) */}
          {notifications.some((n) => !n.isRead) && (
            <View style={[styles.actionBar, { borderBottomColor: theme.borderSubtle }]}>
              <TouchableOpacity
                style={styles.markReadBtn}
                onPress={handleMarkAllRead}
                activeOpacity={0.7}
              >
                <CheckCheck size={14} color={theme.accent} />
                <Text style={[styles.markReadText, { color: theme.accent }]}>
                  Marcar todas como leídas
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* List */}
          <ScrollView
            style={styles.scrollList}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {notifications.map((item) => {
              const isUnread = !item.isRead;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.notifCard,
                    {
                      backgroundColor: isUnread
                        ? theme.accentMuted || 'rgba(251, 191, 36, 0.08)'
                        : theme.cardBackground,
                      borderColor: isUnread ? theme.accent : theme.borderSubtle,
                    },
                  ]}
                  activeOpacity={0.75}
                  onPress={() => handlePressItem(item)}
                >
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.typeBadge}>
                      {renderIcon(item.type)}
                      <Text style={[styles.authorName, { color: theme.text }]}>
                        {item.author}
                      </Text>
                    </View>

                    <View style={styles.cardRightMeta}>
                      <Text style={[styles.timeLabel, { color: theme.textMuted }]}>
                        {item.timeLabel}
                      </Text>
                      {isUnread && <View style={[styles.unreadDot, { backgroundColor: theme.accent }]} />}
                    </View>
                  </View>

                  <Text style={[styles.actionDescription, { color: theme.textMuted }]}>
                    {item.action}{' '}
                    <Text style={{ color: theme.accent, fontWeight: '700' }}>
                      {item.verseCitation}
                    </Text>
                  </Text>

                  <View
                    style={[
                      styles.quoteBox,
                      {
                        backgroundColor: theme.surfaceRaised,
                        borderColor: theme.borderSubtle,
                      },
                    ]}
                  >
                    <Text style={[styles.quoteText, { color: theme.text }]} numberOfLines={2}>
                      "{item.text}"
                    </Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={[styles.goToVerseText, { color: theme.accent }]}>
                      Abrir versículo y ver muro
                    </Text>
                    <ChevronRight size={14} color={theme.accent} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 11.5,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  markReadText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  scrollList: {
    flexGrow: 0,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  notifCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  cardRightMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeLabel: {
    fontSize: 11,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  actionDescription: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  quoteBox: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  quoteText: {
    fontSize: 12.5,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 2,
  },
  goToVerseText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
});
