export interface ModerationComment {
  id: string;
  verseSlug: string;
  userName: string;
  role: string;
  text: string;
  isPastor: boolean;
  isPinned: boolean;
  status: string;
  createdAt: string;
  parentId: string | null;
}

export interface SuspendedUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: string;
  status: string;
  lastActiveAt: string;
}

export interface SpamAttempt {
  id: string;
  userName: string;
  verseSlug: string;
  detectedWord: string;
  attemptedText: string;
  createdAt: string;
}

export interface ModerationOverview {
  blockedWords: string[];
  comments: ModerationComment[];
  suspendedUsers: SuspendedUser[];
  pinnedComments: ModerationComment[];
  spamAttempts: SpamAttempt[];
  metrics: {
    totalComments: number;
    totalBlockedWords: number;
    totalSuspended: number;
    totalPinned: number;
    totalSpamAttempts: number;
  };
}

const BASE_URL = 'https://selah.boxtiove.com';

export async function fetchModerationOverview(): Promise<ModerationOverview> {
  const res = await fetch(`${BASE_URL}/api/moderation/overview`, {
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error('Error al conectar con el servidor de moderación');
  const data = await res.json() as any;
  if (!data?.ok) throw new Error(data?.error || 'No se pudo obtener el resumen de moderación');
  return {
    blockedWords: data.blockedWords || [],
    comments: data.comments || [],
    suspendedUsers: data.suspendedUsers || [],
    pinnedComments: data.pinnedComments || [],
    spamAttempts: data.spamAttempts || [],
    metrics: data.metrics || {
      totalComments: 0,
      totalBlockedWords: 0,
      totalSuspended: 0,
      totalPinned: 0,
      totalSpamAttempts: 0,
    },
  };
}

export async function addBlockedWord(wordOrWords: string): Promise<string[]> {
  const clean = wordOrWords.trim().toLowerCase();
  if (!clean || clean.length < 2) throw new Error('La palabra debe tener al menos 2 caracteres');

  const res = await fetch(`${BASE_URL}/api/blocked-words/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ words: clean }),
  });
  if (!res.ok) throw new Error('Error al registrar la palabra en el servidor');
  const data = await res.json() as any;
  if (!data?.ok) throw new Error(data?.error || 'No se pudo agregar la palabra');
  return data.words || [];
}

export async function deleteBlockedWord(word: string): Promise<string[]> {
  const clean = word.trim().toLowerCase();
  if (!clean) return [];

  const res = await fetch(`${BASE_URL}/api/blocked-words/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word: clean }),
  });
  if (!res.ok) throw new Error('Error al eliminar la palabra del servidor');
  const data = await res.json() as any;
  if (!data?.ok) throw new Error(data?.error || 'No se pudo eliminar la palabra');
  return data.words || [];
}

export async function unbanSuspendedUser(emailOrId: string): Promise<boolean> {
  const clean = emailOrId.trim();
  if (!clean) return false;

  const isEmail = clean.includes('@');
  const res = await fetch(`${BASE_URL}/api/moderation/unban`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(isEmail ? { email: clean } : { id: clean }),
  });
  if (!res.ok) throw new Error('Error al reactivar usuario');
  const data = await res.json() as any;
  return Boolean(data?.ok);
}

export async function togglePinCommentRemote(commentId: string, isPinned: boolean): Promise<boolean> {
  const clean = commentId.trim();
  if (!clean) return false;

  const res = await fetch(`${BASE_URL}/api/moderation/pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ commentId: clean, isPinned }),
  });
  if (!res.ok) throw new Error('Error al modificar estado destacado');
  const data = await res.json() as any;
  return Boolean(data?.ok);
}

export async function clearSpamAttempts(): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/api/moderation/clear-spam-attempts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Error al limpiar el registro de spam');
  const data = await res.json() as any;
  return Boolean(data?.ok);
}

