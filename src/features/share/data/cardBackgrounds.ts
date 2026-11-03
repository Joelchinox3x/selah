import { ImageSourcePropType } from 'react-native';

export type BackgroundCategory = 'all' | 'real' | 'spiritual' | 'minimal';

export interface CardBackground {
  id: string;
  name: string;
  subtitle: string;
  category: 'real' | 'spiritual' | 'minimal';
  type: 'image' | 'solid';
  source?: ImageSourcePropType;
  overlayOpacity?: number;
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
  borderColor?: string;
}

export const CARD_BACKGROUNDS: CardBackground[] = [
  // --- FOTOGRAFÍA REAL PROFESIONAL ---
  {
    id: 'real_open_bible',
    name: 'Palabra Viva',
    subtitle: 'Biblia en madera con luz natural',
    category: 'real',
    type: 'image',
    source: require('@/assets/backgrounds/real_open_bible.webp'),
    overlayOpacity: 0.50,
  },
  {
    id: 'real_sunrise_ocean',
    name: 'Amanecer en el Mar',
    subtitle: 'Océano dorado y horizonte sereno',
    category: 'real',
    type: 'image',
    source: require('@/assets/backgrounds/real_sunrise_ocean.webp'),
    overlayOpacity: 0.48,
  },
  {
    id: 'real_mountain_peaks',
    name: 'Cumbres de Paz',
    subtitle: 'Montañas majestuosas y niebla',
    category: 'real',
    type: 'image',
    source: require('@/assets/backgrounds/real_mountain_peaks.webp'),
    overlayOpacity: 0.50,
  },
  {
    id: 'real_forest_sunlight',
    name: 'Luz en el Bosque',
    subtitle: 'Rayos solares entre árboles',
    category: 'real',
    type: 'image',
    source: require('@/assets/backgrounds/real_forest_sunlight.webp'),
    overlayOpacity: 0.52,
  },
  {
    id: 'real_desert_stars',
    name: 'Noche en el Desierto',
    subtitle: 'Bóveda celeste y estrellas',
    category: 'real',
    type: 'image',
    source: require('@/assets/backgrounds/real_desert_stars.webp'),
    overlayOpacity: 0.40,
  },

  // --- PAISAJES BÍBLICOS Y NATURALEZA SAGRADA ---
  {
    id: 'bg_bible_dawn',
    name: 'Amanecer Bíblico',
    subtitle: 'Escrituras iluminadas al alba',
    category: 'spiritual',
    type: 'image',
    source: require('@/assets/backgrounds/bg_bible_dawn.webp'),
    overlayOpacity: 0.50,
  },
  {
    id: 'bg_prayer_candle',
    name: 'Oración Íntima',
    subtitle: 'Vela cálida y devoción',
    category: 'spiritual',
    type: 'image',
    source: require('@/assets/backgrounds/bg_prayer_candle.webp'),
    overlayOpacity: 0.45,
  },
  {
    id: 'bg_sea_galilee',
    name: 'Mar de Galilea',
    subtitle: 'Aguas cristalinas en calma',
    category: 'spiritual',
    type: 'image',
    source: require('@/assets/backgrounds/bg_sea_galilee.webp'),
    overlayOpacity: 0.48,
  },
  {
    id: 'bg_still_waters',
    name: 'Aguas de Reposo',
    subtitle: 'Salmo 23, arroyo de montaña',
    category: 'spiritual',
    type: 'image',
    source: require('@/assets/backgrounds/bg_still_waters.webp'),
    overlayOpacity: 0.52,
  },
  {
    id: 'bg_green_pastures',
    name: 'Verdes Pastos',
    subtitle: 'Colinas serenas con flores silvestres',
    category: 'spiritual',
    type: 'image',
    source: require('@/assets/backgrounds/bg_green_pastures.webp'),
    overlayOpacity: 0.48,
  },
  {
    id: 'bg_path_light',
    name: 'Sendero de Luz',
    subtitle: 'Camino iluminado por la gracia',
    category: 'spiritual',
    type: 'image',
    source: require('@/assets/backgrounds/bg_path_light.webp'),
    overlayOpacity: 0.52,
  },
  {
    id: 'bg_starry_night',
    name: 'Cielos de Gracia',
    subtitle: 'Los cielos cuentan Su gloria',
    category: 'spiritual',
    type: 'image',
    source: require('@/assets/backgrounds/bg_starry_night.webp'),
    overlayOpacity: 0.40,
  },
  {
    id: 'bg_mount_sinai',
    name: 'Monte Sagrado',
    subtitle: 'Cumbres rocosas y amanecer dorado',
    category: 'spiritual',
    type: 'image',
    source: require('@/assets/backgrounds/bg_mount_sinai.webp'),
    overlayOpacity: 0.48,
  },
  {
    id: 'bg_gethsemane_olives',
    name: 'Getsemaní',
    subtitle: 'Olivos milenarios al crepúsculo',
    category: 'spiritual',
    type: 'image',
    source: require('@/assets/backgrounds/bg_gethsemane_olives.webp'),
    overlayOpacity: 0.50,
  },
  {
    id: 'bg_sacred_parchment',
    name: 'Pergamino Bíblico',
    subtitle: 'Vellum milenario y calidez',
    category: 'spiritual',
    type: 'image',
    source: require('@/assets/backgrounds/bg_sacred_parchment.webp'),
    overlayOpacity: 0.52,
  },

  // --- ESTILOS CLÁSICOS Y MINIMALISTAS ---
  {
    id: 'minimal_sepia',
    name: 'Sepia Calma',
    subtitle: 'Pergamino clásico de lectura',
    category: 'minimal',
    type: 'solid',
    bgColor: '#f7f1e1',
    textColor: '#3c2e1e',
    accentColor: '#b45309',
    borderColor: '#e4d6b8',
  },
  {
    id: 'minimal_oled',
    name: 'Noche OLED',
    subtitle: 'Oscuro sereno de alta concentración',
    category: 'minimal',
    type: 'solid',
    bgColor: '#090d16',
    textColor: '#f8fafc',
    accentColor: '#38bdf8',
    borderColor: '#1e293b',
  },
  {
    id: 'minimal_dawn',
    name: 'Aurora Suave',
    subtitle: 'Tonalidad cálida y acogedora',
    category: 'minimal',
    type: 'solid',
    bgColor: '#fdf4ec',
    textColor: '#2d1810',
    accentColor: '#ea580c',
    borderColor: '#fed7aa',
  },
];
