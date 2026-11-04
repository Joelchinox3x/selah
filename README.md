# Selah: Biblia & Calma Espiritual (Luz & Palabra)

Aplicación móvil desarrollada en **React Native (Expo SDK ~57)** con arquitectura **100% Offline-First**, diseñada para brindar una experiencia de lectura bíblica profunda, estética y un refugio de calma emocional para el creyente moderno.

---

## 🌟 Características Principales

### 1. 📖 Lectura Sagrada de Alto Rendimiento (Reina-Valera 1909)
- **Base de Datos SQLite Local (`bible_readonly.db`)**: 66 libros y 31,102 versículos empaquetados localmente desde `scrollmapper/bible_databases`.
- **Lector Fluido a 60 FPS**: Renderizado ultraligero con `FlatList` nativa optimizada.
- **Selección Múltiple Intuitiva**: Borde izquierdo punteado sutil (`borderStyle: 'dashed'`) y fondo tenue al seleccionar versículos.
- **Barra de Acciones Flotante**:
  - 4 bolitas de colores pastel (Amarillo, Verde, Azul, Rosa) para resaltado inmediato.
  - Botón de favoritos (Marcador).
  - Editor de notas personales con citas embebidas.
  - Copiado rápido de cita bíblica.
  - Generador de tarjetas para compartir en WhatsApp.

### 2. 🕊️ Acompañamiento Emocional («¿Cómo te sientes hoy?»)
- **8 Estados Emocionales Curados**: Ansiedad, Agotamiento, Tristeza, Miedo, Gratitud, Paz, Duda y Enojo.
- **Formato Historia / Story Inmersivo**:
  - **Paso 1**: Validación empática («Dios no ignora tu cansancio...»).
  - **Pasos 2 al 4**: Promesas de la Palabra de Dios con notas de contexto.
  - **Paso 5**: Oración guiada en primera persona con botón **«Amén»** que activa vibración háptica y guarda el momento de alivio en la bitácora personal.

### 3. 🌬️ Calma Inmediata (SOS) - Respiración Espiritual
- **Ritmo Guiado 4-4-4**: 4s Inhala paz · 4s Sostén y confía · 4s Suelta la carga.
- **Aura Animada con Reanimated**: Pulso armónico y vibraciones hápticas sincronizadas.
- **Anclas Bíblicas Reconfortantes**: Versículos de refugio y paz (Salmos 46:10, Filipenses 4:6-7, Mateo 11:28, etc.).
- **Aviso Ético de Salud**: Descargo ético claro indicando que el acompañamiento espiritual complementa pero no reemplaza la atención médica profesional.

### 4. ⚡ Búsqueda Instantánea FTS5 (<15ms)
- Motor SQLite FTS5 compilado con `unicode61 remove_diacritics 2`.
- Búsqueda insensible a mayúsculas y acentos: buscar `"corazon"` encuentra `"corazón"` al instante en los 31,102 versículos.
- Filtro por ámbito: Toda la Biblia, Antiguo Testamento o Nuevo Testamento.

### 5. 🔔 Notificaciones Inteligentes (Regla de los 14 Días)
- **Ventana Deslizante de 14 Días**: Programa 14 alertas matutinas (07:00) y nocturnas (21:30).
- **Protección iOS**: No supera las 28 alertas simultáneas, garantizando un margen seguro bajo el límite estricto de 64 de Apple.
- **Deep Linking**: Al pulsar la notificación, abre directamente el lector en el versículo exacto.

### 6. 🎨 Tarjetas Estéticas para WhatsApp (1:1 y 9:16)
- Exportador visual con `react-native-view-shot` y `expo-sharing`.
- Formato **1:1 (Post)** o **9:16 (Estado de WhatsApp / Story de Instagram)**.
- 3 Estilos visuales: Pergamino Sepia, Noche OLED y Amanecer Dorado.

---

## 🎨 Paletas y Diseño
- **Sepia (Por defecto)**: Pergamino cálido `#f4ecd8` con acentos ámbar `#b45309` para descanso ocular prolongado.
- **Claro**: Fondo puro `#ffffff` con acentos turquesa sereno `#0d9488`.
- **OLED**: Negro absoluto `#000000` con acentos esmeralda `#10b981`.

---

## 🚀 Cómo Ejecutar

```bash
cd /home/adminjoe/selah-bible

# Iniciar servidor de desarrollo
npm run start

# Abrir en Android
npm run android

# Abrir en iOS
npm run ios

# Abrir en Web
npm run web
```
