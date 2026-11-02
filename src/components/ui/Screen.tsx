import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  safeBottom?: boolean;
  safeTop?: boolean;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  style,
  safeBottom = true,
  safeTop = true,
}) => {
  const insets = useSafeAreaInsets();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  const statusBarStyle = themeMode === 'oled' ? 'light' : 'dark';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingTop: safeTop ? insets.top : 0,
          paddingBottom: safeBottom ? insets.bottom : 0,
        },
        style,
      ]}
    >
      <StatusBar style={statusBarStyle} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
