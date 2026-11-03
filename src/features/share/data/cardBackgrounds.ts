import { ImageSourcePropType } from 'react-native';

export type BackgroundCategory = 'all' | 'spiritual' | 'minimal';

export interface CardBackground {
  id: string;
  name: string;
  subtitle: string;
  category: 'spiritual' | 'minimal';
  type: 'image' | 'solid';
  source?: ImageSourcePropType;
  source916?: ImageSourcePropType;
  source1x1?: ImageSourcePropType;
  overlayOpacity?: number;
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
  borderColor?: string;
}

export const CARD_BACKGROUNDS: CardBackground[] = [
  // --- FOTOGRAFÍA SAGRADA (9:16 vertical & 1:1 cuadrado dedicados) ---
  {
    id: 'bg_bible_dawn',
    name: 'Amanecer Bíblico',
    subtitle: 'Escrituras iluminadas al alba sobre madera',
    category: 'spiritual',
    type: 'image',
    source: require('@/assets/backgrounds/bg_bible_sanctuary.webp'),
    source916: require('@/assets/backgrounds/bg_bible_sanctuary.webp'),
    source1x1: require('@/assets/backgrounds/bg_1x1_bible_dawn.webp'),
    overlayOpacity: 0.35,
  },
  {
    id: 'bg_prayer_candle',
    name: 'Oración Íntima',
    subtitle: 'Cálida vela de bronce y devoción',
    category: 'spiritual',
    type: 'image',
    source: require('@/assets/backgrounds/bg_prayer_candle.webp'),
    source916: require('@/assets/backgrounds/bg_prayer_candle.webp'),
    source1x1: require('@/assets/backgrounds/bg_1x1_prayer_candle.webp'),
    overlayOpacity: 0.30,
  },
  {
    id: 'bg_sea_galilee',
    name: 'Mar de Galilea',
    subtitle: 'Aguas cristalinas en calma al alba',
    category: 'spiritual',
    type: 'image',
    source: require('@/assets/backgrounds/bg_sea_galilee.webp'),
    source916: require('@/assets/backgrounds/bg_sea_galilee.webp'),
    source1x1: require('@/assets/backgrounds/bg_1x1_sea_galilee.webp'),
    overlayOpacity: 0.35,
  },
  {
    id: 'bg_still_waters',
    name: 'Aguas de Reposo',
    subtitle: 'Salmo 23, arroyo de montaña y piedras',
    category: 'spiritual',
    type: 'image',
    source: require('@/assets/backgrounds/bg_still_waters.webp'),
    source916: require('@/assets/backgrounds/bg_still_waters.webp'),
    source1x1: require('@/assets/backgrounds/bg_1x1_still_waters.webp'),
    overlayOpacity: 0.38,
  },
  {
    id: 'bg_green_pastures',
    name: 'Verdes Pastos',
    subtitle: 'Colinas serenas con flores silvestres',
    category: 'spiritual',
    type: 'image',
    source: require('@/assets/backgrounds/bg_green_pastures.webp'),
    source916: require('@/assets/backgrounds/bg_green_pastures.webp'),
    source1x1: require('@/assets/backgrounds/bg_1x1_green_pastures.webp'),
    overlayOpacity: 0.35,
  },
  {
    id: 'bg_path_light',
    name: 'Sendero de Luz',
    subtitle: 'Camino iluminado por la gracia',
    category: 'spiritual',
    type: 'image',
    source: require('@/assets/backgrounds/bg_path_light.webp'),
    source916: require('@/assets/backgrounds/bg_path_light.webp'),
    source1x1: require('@/assets/backgrounds/bg_1x1_path_light.webp'),
    overlayOpacity: 0.38,
  },
  {
    id: 'bg_starry_night',
    name: 'Cielos de Gracia',
    subtitle: 'Los cielos cuentan Su gloria',
    category: 'spiritual',
    type: 'image',
    source: require('@/assets/backgrounds/bg_starry_night.webp'),
    source916: require('@/assets/backgrounds/bg_starry_night.webp'),
    source1x1: require('@/assets/backgrounds/bg_1x1_starry_night.webp'),
    overlayOpacity: 0.28,
  },
  {
    id: 'bg_mount_sinai',
    name: 'Monte Sagrado',
    subtitle: 'Cumbres rocosas y amanecer dorado',
    category: 'spiritual',
    type: 'image',
    source: require('@/assets/backgrounds/bg_mount_sinai.webp'),
    source916: require('@/assets/backgrounds/bg_mount_sinai.webp'),
    source1x1: require('@/assets/backgrounds/bg_1x1_mount_sinai_v3.webp'),
    overlayOpacity: 0.35,
  },
  {
    id: 'bg_gethsemane_olives',
    name: 'Getsemaní',
    subtitle: 'Olivos milenarios al crepúsculo',
    category: 'spiritual',
    type: 'image',
    source: require('@/assets/backgrounds/bg_gethsemane_olives.webp'),
    source916: require('@/assets/backgrounds/bg_gethsemane_olives.webp'),
    source1x1: require('@/assets/backgrounds/bg_1x1_gethsemane_olives.webp'),
    overlayOpacity: 0.38,
  },
  {
    id: 'bg_sacred_parchment',
    name: 'Pergamino Bíblico',
    subtitle: 'Vellum milenario y calidez',
    category: 'spiritual',
    type: 'image',
    source: require('@/assets/backgrounds/bg_sacred_parchment_v3.webp'),
    source916: require('@/assets/backgrounds/bg_sacred_parchment_v3.webp'),
    source1x1: require('@/assets/backgrounds/bg_1x1_sacred_parchment_v3.webp'),
    overlayOpacity: 0.38,
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
