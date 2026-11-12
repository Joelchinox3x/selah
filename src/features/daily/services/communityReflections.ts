import { getCommunityDeviceId } from './communityIdentity';
import { isMemberSuspended } from '@/src/features/auth/pastoralService';

export interface CommunityComment {
  id: string;
  userName: string;
  role: string;
  text: string;
  createdAt: string;
  isPastor?: boolean;
  isVerified?: boolean;
  avatarUrl?: string;
  userRole?: 'pastor' | 'moderador' | 'verificado' | 'miembro';
  isPinned?: boolean;
  canReply?: boolean;
  isOwn?: boolean;
  parentId: string | null;
  replyToId: string | null;
  replyToName: string | null;
  likes: number;
  liked: boolean;
  replyCount: number;
  parentReplyCount?: number;
}
export interface CommunityPage { comments: CommunityComment[]; total: number; nextCursor: string | null; replyTotal?: number }
const API = 'https://selah.boxtiove.com/api/comments';
function parseComment(value: unknown): CommunityComment | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  if ((typeof v.id !== 'string' && typeof v.id !== 'number') || String(v.id).startsWith('seed-') || typeof v.text !== 'string' || typeof v.userName !== 'string') return null;
  const isPastorRole = v.isPastor === true || v.role === 'pastor' || v.userRole === 'pastor';
  const isVerifiedRole = v.isVerified === true || isPastorRole || v.role === 'moderador' || v.userRole === 'moderador' || v.userRole === 'verificado';
  return {
    id: String(v.id),
    userName: v.userName.trim() || 'Hermano/a en Cristo',
    text: v.text,
    role: typeof v.role === 'string' ? v.role : 'Comunidad Selah',
    createdAt: typeof v.createdAt === 'string' ? v.createdAt : '',
    canReply: v.canReply === true,
    isOwn: v.isOwn === true,
    isPastor: isPastorRole,
    isVerified: isVerifiedRole,
    avatarUrl: typeof v.avatarUrl === 'string' ? v.avatarUrl : undefined,
    userRole: typeof v.userRole === 'string' ? (v.userRole as any) : undefined,
    isPinned: v.isPinned === true,
    parentId: v.parentId == null ? null : String(v.parentId),
    replyToId: v.replyToId == null ? null : String(v.replyToId),
    replyToName: typeof v.replyToName === 'string' ? v.replyToName : null,
    likes: typeof v.likes === 'number' && v.likes >= 0 ? v.likes : 0,
    liked: v.liked === true,
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
    if (!response.ok || data?.ok !== true) throw new Error([400, 403, 404, 409].includes(response.status) && typeof data?.error === 'string' ? data.error : 'No pudimos conectar con el muro. Intenta nuevamente.');
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
export async function publishCommunityReflection(
  slug: string,
  name: string,
  text: string,
  options: {
    clientRequestId: string;
    parentId?: string;
    replyToId?: string;
    isVerified?: boolean;
    avatarUrl?: string;
    userRole?: string;
  }
): Promise<CommunityComment> {
  const userName = name.trim() || 'Hermano/a en Cristo';
  const message = text.trim();
  if (!message || message.length > 400 || userName.length > 60) throw new Error('Revisa el comentario y el límite de 400 caracteres.');
  
  // Verify pastoral suspension before publishing
  const suspended = await isMemberSuspended(userName);
  if (suspended) {
    throw new Error('Esta cuenta ha sido suspendida temporalmente por moderación comunitaria.');
  }

  const data = await request(new URLSearchParams(), {
    method: 'POST',
    body: JSON.stringify({ action: 'comment', verse: slug, userName, text: message, ...options }),
  });
  const comment = parseComment(data.comment);
  if (!comment) throw new Error('No pudimos confirmar la publicación. Actualiza el muro antes de intentar otra vez.');
  
  if (options.isVerified) {
    comment.isVerified = true;
  }
  if (options.avatarUrl) {
    comment.avatarUrl = options.avatarUrl;
  }
  if (options.userRole) {
    comment.userRole = options.userRole as any;
    if (options.userRole === 'pastor' || options.userRole === 'admin') {
      comment.isPastor = true;
    }
    if (options.userRole === 'moderador') {
      comment.role = 'Líder / Moderador';
    }
  }
  return comment;
}
export async function setCommunityCommentLike(slug: string, commentId: string, liked: boolean): Promise<CommunityComment> {
  const data = await request(new URLSearchParams(), { method: 'POST', body: JSON.stringify({ action: 'like', verse: slug, commentId, liked }) });
  const comment = parseComment(data.comment);
  if (!comment) throw new Error('No pudimos guardar el Me gusta. Intenta nuevamente.');
  return comment;
}
export async function editCommunityReflection(slug: string, commentId: string, text: string): Promise<CommunityComment> {
  const message = text.trim();
  if (!message || message.length > 400) throw new Error('Escribe entre 1 y 400 caracteres.');
  const data = await request(new URLSearchParams(), { method: 'POST', body: JSON.stringify({ action: 'edit', verse: slug, commentId, text: message }) });
  const comment = parseComment(data.comment);
  if (!comment) throw new Error('No pudimos confirmar la edición.');
  return comment;
}
export async function deleteCommunityReflection(slug: string, commentId: string): Promise<{ deletedIds: string[]; total: number; parentId: string | null; parentReplyCount: number }> {
  const data = await request(new URLSearchParams(), { method: 'POST', body: JSON.stringify({ action: 'delete', verse: slug, commentId }) });
  if (!Array.isArray(data.deletedIds) || !Number.isInteger(data.total)) throw new Error('No pudimos confirmar el borrado.');
  return { deletedIds: data.deletedIds.map(String), total: data.total, parentId: data.parentId == null ? null : String(data.parentId), parentReplyCount: Number(data.parentReplyCount || 0) };
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
