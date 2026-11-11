export type ThemeMode = 'light' | 'sepia' | 'oled';

export interface ThemePalette {
  background: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  borderSubtle: string;
  text: string;
  textMuted: string;
  accent: string;
  destructive: string;
  accentMuted: string;
  cardBackground: string;
  selectionBackground: string;
  verseSelectedBorder: string;
}

export const themes: Record<ThemeMode, ThemePalette> = {
  light: {
    background: '#ffffff',
    surface: '#f8fafc',
    surfaceRaised: '#f1f5f9',
    border: '#e2e8f0',
    borderSubtle: 'rgba(0, 0, 0, 0.06)',
    text: '#1e293b',
    textMuted: '#64748b',
    destructive: '#b91c1c',
    accent: '#0d9488',          // Turquesa sereno
    accentMuted: 'rgba(13, 148, 136, 0.12)',
    cardBackground: '#ffffff',
    selectionBackground: 'rgba(13, 148, 136, 0.08)',
    verseSelectedBorder: '#0d9488',
  },
  sepia: {
    background: '#f4ecd8',
    surface: '#ebe2cb',
    surfaceRaised: '#dfd5bd',
    border: '#d4c7a9',
    borderSubtle: 'rgba(67, 52, 34, 0.08)',
    text: '#433422',
    textMuted: '#78654e',
    destructive: '#a12622',
    accent: '#b45309',          // Ámbar terroso cálido
    accentMuted: 'rgba(180, 83, 9, 0.14)',
    cardBackground: '#f7f1e1',
    selectionBackground: 'rgba(180, 83, 9, 0.1)',
    verseSelectedBorder: '#b45309',
  },
  oled: {
    background: '#000000',
    surface: '#0f172a',
    surfaceRaised: '#1e293b',
    border: '#273549',
    borderSubtle: 'rgba(255, 255, 255, 0.08)',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    destructive: '#f87171',
    accent: '#10b981',          // Esmeralda espiritual
    accentMuted: 'rgba(16, 185, 129, 0.14)',
    cardBackground: '#0b1321',
    selectionBackground: 'rgba(16, 185, 129, 0.12)',
    verseSelectedBorder: '#10b981',
  },
};

export const highlightColors = {
  yellow: {
    name: 'Amarillo',
    background: 'rgba(254, 240, 138, 0.55)',
    border: '#fde047',
    dot: '#eab308',
  },
  green: {
    name: 'Verde',
    background: 'rgba(187, 247, 208, 0.55)',
    border: '#86efac',
    dot: '#22c55e',
  },
  blue: {
    name: 'Azul',
    background: 'rgba(191, 219, 254, 0.55)',
    border: '#93c5fd',
    dot: '#3b82f6',
  },
  pink: {
    name: 'Rosa',
    background: 'rgba(251, 207, 232, 0.55)',
    border: '#f9a8d4',
    dot: '#ec4899',
  },
} as const;

export type HighlightColor = keyof typeof highlightColors;
