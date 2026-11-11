import { getCommunityDeviceId } from './communityIdentity';
export interface CommunityComment {
  id: string; userName: string; role: string; text: string; createdAt: string; isPastor?: boolean; isPinned?: boolean;
  canReply?: boolean;
  parentId: string | null; replyToId: string | null; replyToName: string | null;
  likes: number; liked: boolean; replyCount: number; parentReplyCount?: number;
}
export interface CommunityPage { comments: CommunityComment[]; total: number; nextCursor: string | null; replyTotal?: number }
const API = 'https://selah.boxtiove.com/api/comments';
function parseComment(value: unknown): CommunityComment | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  if ((typeof v.id !== 'string' && typeof v.id !== 'number') || String(v.id).startsWith('seed-') || typeof v.text !== 'string' || typeof v.userName !== 'string') return null;
  return {
    id: String(v.id), userName: v.userName.trim() || 'Hermano/a en Cristo', text: v.text,
    role: typeof v.role === 'string' ? v.role : 'Comunidad Selah', createdAt: typeof v.createdAt === 'string' ? v.createdAt : '',
    canReply: v.canReply === true,
    isPastor: v.isPastor === true, isPinned: v.isPinned === true,
    parentId: v.parentId == null ? null : String(v.parentId), replyToId: v.replyToId == null ? null : String(v.replyToId), replyToName: typeof v.replyToName === 'string' ? v.replyToName : null,
    likes: typeof v.likes === 'number' && v.likes >= 0 ? v.likes : 0, liked: v.liked === true,
    replyCount: typeof v.replyCount === 'number' && v.replyCount >= 0 ? v.replyCount : 0,
    parentReplyCount: typeof v.parentReplyCount === 'number' && v.parentReplyCount >= 0 ? v.parentReplyCount : undefined,
  };
}
async function request(query: URLSearchParams, options: RequestInit = {}, externalSignal?: AbortSignal) {
  const device = await getCommunityDeviceId();
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (externalSignal?.aborted) abort();
  externalSignal?.addEventListener('abort', abort);
  const timeout = setTimeout(abort, 10000);
  try {
    const queryString = query.toString();
    const response = await fetch(`${API}${queryString ? `?${queryString}` : ''}`, {
      ...options, headers: { 'Content-Type': 'application/json', 'X-Selah-Device': device }, signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok || data?.ok !== true) throw new Error([400, 404, 409].includes(response.status) && typeof data?.error === 'string' ? data.error : 'No pudimos conectar con el muro. Intenta nuevamente.');
    return data;
  } catch (error) {
    if (controller.signal.aborted) throw new Error('No recibimos respuesta a tiempo. Tu texto se conserva; puedes reintentar.');
    throw error;
  } finally { clearTimeout(timeout); externalSignal?.removeEventListener('abort', abort); }
}
export async function loadCommunityReflections(slug: string, signal?: AbortSignal, options: { parentId?: string; cursor?: string } = {}): Promise<CommunityPage> {
  const query = new URLSearchParams({ verse: slug });
  if (options.parentId) query.set('parent', options.parentId);
  if (options.cursor) query.set('cursor', options.cursor);
  const data = await request(query, {}, signal);
  if (!Array.isArray(data.comments)) throw new Error('No pudimos leer los comentarios. Intenta nuevamente.');
  const comments = data.comments.map(parseComment).filter((c: CommunityComment | null): c is CommunityComment => c !== null) as CommunityComment[];
  return { comments, total: Number.isInteger(data.total) && data.total >= 0 ? data.total : comments.length, replyTotal: typeof data.replyTotal === 'number' ? data.replyTotal : undefined, nextCursor: typeof data.nextCursor === 'string' ? data.nextCursor : null };
}
export async function publishCommunityReflection(slug: string, name: string, text: string, options: { clientRequestId: string; parentId?: string; replyToId?: string }): Promise<CommunityComment> {
  const userName = name.trim() || 'Hermano/a en Cristo';
  const message = text.trim();
  if (!message || message.length > 400 || userName.length > 60) throw new Error('Revisa el comentario y el límite de 400 caracteres.');
  const data = await request(new URLSearchParams(), { method: 'POST', body: JSON.stringify({ action: 'comment', verse: slug, userName, text: message, ...options }) });
  const comment = parseComment(data.comment);
  if (!comment) throw new Error('No pudimos confirmar la publicación. Actualiza el muro antes de intentar otra vez.');
  return comment;
}
export async function setCommunityCommentLike(slug: string, commentId: string, liked: boolean): Promise<CommunityComment> {
  const data = await request(new URLSearchParams(), { method: 'POST', body: JSON.stringify({ action: 'like', verse: slug, commentId, liked }) });
  const comment = parseComment(data.comment);
  if (!comment) throw new Error('No pudimos guardar el Me gusta. Intenta nuevamente.');
  return comment;
}
export function formatReflectionDate(value: string): string {
  if (!value) return '';
  const normalized = /^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/.test(value) ? value.replace(' ', 'T') + 'Z' : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return '';
  const elapsed = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d`;
  if (days < 35) return `${Math.floor(days / 7)} sem`;
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  }
  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? 'año' : 'años'}`;
}
