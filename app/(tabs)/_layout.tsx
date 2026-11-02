import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import {
  Home,
  Sun,
  BookOpen,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react-native';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';

export default function TabLayout() {
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.borderSubtle,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Home size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mood"
        options={{
          title: 'Ánimo',
          tabBarIcon: ({ color, size }) => (
            <Sun size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bible"
        options={{
          title: 'Biblia',
          tabBarIcon: ({ color, size }) => <BookOpen size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Tesoros',
          tabBarIcon: ({ color, size }) => <Sparkles size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color, size }) => <SlidersHorizontal size={size - 2} color={color} />,
        }}
      />
    </Tabs>
  );
}
