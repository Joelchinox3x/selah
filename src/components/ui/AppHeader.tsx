import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Search, User, Bell } from 'lucide-react-native';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { hapticLight } from '@/src/services/haptics/hapticFeedback';

export type AppHeaderVariant = 'main' | 'detail';

interface AppHeaderProps {
  variant?: AppHeaderVariant;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  onSearchPress?: () => void;
  onProfilePress?: () => void;
  onNotificationsPress?: () => void;
  hasUnreadNotifications?: boolean;
  rightAction?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  variant = 'main',
  title,
  subtitle,
  showBack = false,
  onBack,
  onSearchPress,
  onProfilePress,
  onNotificationsPress,
  hasUnreadNotifications = false,
  rightAction,
}) => {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  const handleBack = () => {
    hapticLight();
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleSearch = () => {
    hapticLight();
    if (onSearchPress) {
      onSearchPress();
    } else {
      router.push('/search' as any);
    }
  };

  const handleProfile = () => {
    hapticLight();
    if (onProfilePress) {
      onProfilePress();
    } else {
      router.push('/settings' as any);
    }
  };

  if (variant === 'main') {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.background,
            borderBottomColor: theme.borderSubtle,
          },
        ]}
      >
        {/* Brand & Logo at Start */}
        <View style={styles.brandRow}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logoImage}
            resizeMode="cover"
          />
          <Text style={[styles.brandText, { color: theme.text }]}>SELAH</Text>
        </View>

        {/* Action Buttons Right (Notifications + Search + Profile) */}
        <View style={styles.rightActionsRow}>
          {rightAction ? (
            rightAction
          ) : (
            <>
              {onNotificationsPress && (
                <TouchableOpacity
                  style={[
                    styles.iconButton,
                    { backgroundColor: theme.surfaceRaised },
                  ]}
                  onPress={() => {
                    hapticLight();
                    onNotificationsPress();
                  }}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Notificaciones de comunidad"
                >
                  <Bell size={18} color={theme.text} />
                  {hasUnreadNotifications && (
                    <View style={styles.unreadDot} />
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.iconButton,
                  { backgroundColor: theme.surfaceRaised },
                ]}
                onPress={handleSearch}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Search size={18} color={theme.text} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.iconButton,
                  { backgroundColor: theme.surfaceRaised },
                ]}
                onPress={handleProfile}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <User size={18} color={theme.text} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  }

  // variant === 'detail'
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          borderBottomColor: theme.borderSubtle,
        },
      ]}
    >
      <View style={styles.leftDetailContainer}>
        {showBack && (
          <TouchableOpacity
            onPress={handleBack}
            style={[styles.iconButton, { backgroundColor: theme.surfaceRaised }]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <ChevronLeft size={20} color={theme.text} />
          </TouchableOpacity>
        )}
        <View style={styles.titleWrapper}>
          <Text style={[styles.detailTitle, { color: theme.text }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[styles.detailSubtitle, { color: theme.textMuted }]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {rightAction ? <View style={styles.rightActionsRow}>{rightAction}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoImage: {
    width: 30,
    height: 30,
    borderRadius: 8,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f59e0b',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  leftDetailContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  detailSubtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
});
