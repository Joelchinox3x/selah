import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CommunityNotificationItem {
  id: string;
  type: 'pastoral_reply' | 'reaction' | 'comment';
  author: string;
  action: string;
  text: string;
  verseSlug: string;
  verseCitation: string;
  timeLabel: string;
  isRead: boolean;
  createdAt: string;
}

const STORAGE_KEY_READ_IDS = '@selah_notifications_read_ids_v1';

const DEFAULT_NOTIFICATIONS: CommunityNotificationItem[] = [
  {
    id: 'notif-1',
    type: 'pastoral_reply',
    author: 'Ps. Guillermo Quispe C.',
    action: 'compartió una reflexión pastoral en',
    text: 'Que la paz y la gracia del Señor sobreabunden en cada corazón que hoy medita en esta palabra viva.',
    verseSlug: 'juan-3-16',
    verseCitation: 'Juan 3:16',
    timeLabel: 'Hace 2 horas',
    isRead: false,
    createdAt: '2026-11-09T04:00:00Z',
  },
  {
    id: 'notif-2',
    type: 'reaction',
    author: 'Comunidad Selah',
    action: 'A 3 hermanos les bendijo tu testimonio en',
    text: 'Tu reflexión sobre la paz de Dios inspiró y consoló a hermanos en el muro comunitario.',
    verseSlug: 'juan-3-16',
    verseCitation: 'Juan 3:16',
    timeLabel: 'Ayer, 6:40 pm',
    isRead: false,
    createdAt: '2026-11-08T23:40:00Z',
  },
  {
    id: 'notif-3',
    type: 'comment',
    author: 'Sofía R.',
    action: 'compartió una reflexión en',
    text: 'Hermosa promesa para iniciar el día en gratitud. Dios nunca nos desampara en medio de las pruebas.',
    verseSlug: 'juan-3-16',
    verseCitation: 'Juan 3:16',
    timeLabel: 'Ayer, 11:30 am',
    isRead: true,
    createdAt: '2026-11-08T16:30:00Z',
  },
];

export async function getNotifications(): Promise<CommunityNotificationItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_READ_IDS);
    const readIds: string[] = raw ? JSON.parse(raw) : [];
    return DEFAULT_NOTIFICATIONS.map((item) => ({
      ...item,
      isRead: item.isRead || readIds.includes(item.id),
    }));
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_READ_IDS);
    const readIds: string[] = raw ? JSON.parse(raw) : [];
    if (!readIds.includes(id)) {
      readIds.push(id);
      await AsyncStorage.setItem(STORAGE_KEY_READ_IDS, JSON.stringify(readIds));
    }
  } catch (err) {
    console.warn('Error marking notification read:', err);
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    const allIds = DEFAULT_NOTIFICATIONS.map((n) => n.id);
    await AsyncStorage.setItem(STORAGE_KEY_READ_IDS, JSON.stringify(allIds));
  } catch (err) {
    console.warn('Error marking all notifications read:', err);
  }
}
