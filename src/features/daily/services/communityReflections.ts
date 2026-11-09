export interface CommunityComment {
  id: string;
  userName: string;
  role: string;
  text: string;
  createdAt: string;
  isPastor?: boolean;
}

const API = 'https://selah.boxtiove.com/api/comments';

function parseComment(value: unknown): CommunityComment | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  if ((typeof v.id !== 'string' && typeof v.id !== 'number') || typeof v.text !== 'string' || typeof v.userName !== 'string') return null;
  // Older server versions returned demo people as if they had published real comments.
  if (String(v.id).startsWith('seed-')) return null;
  return {
    id: String(v.id), text: v.text, userName: v.userName.trim() || 'Hermano/a en Cristo',
    role: typeof v.role === 'string' ? v.role : 'Comunidad Selah',
    createdAt: typeof v.createdAt === 'string' ? v.createdAt : '', isPastor: v.isPastor === true,
  };
}

async function request(slug: string, options: RequestInit, externalSignal?: AbortSignal) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (externalSignal?.aborted) abort();
  externalSignal?.addEventListener('abort', abort);
  const timeout = setTimeout(abort, 10000);
  try {
    const response = await fetch(API + (options.method === 'POST' ? '' : `?verse=${encodeURIComponent(slug)}`), {
      ...options, signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok || data?.ok !== true) {
      throw new Error(response.status === 400 && typeof data?.error === 'string' ? data.error : 'No pudimos conectar con el muro. Intenta nuevamente.');
    }
    return data;
  } catch (error) {
    if (controller.signal.aborted) throw new Error('No recibimos respuesta a tiempo. Comprueba tu conexión.');
    throw error;
  } finally {
    clearTimeout(timeout);
    externalSignal?.removeEventListener('abort', abort);
  }
}

export async function loadCommunityReflections(slug: string, signal?: AbortSignal) {
  const data = await request(slug, {}, signal);
  if (!Array.isArray(data.comments)) throw new Error('No pudimos leer las reflexiones. Intenta nuevamente.');
  const comments: CommunityComment[] = data.comments.map(parseComment).filter((c: CommunityComment | null): c is CommunityComment => c !== null);
  return { comments, total: Number.isInteger(data.total) && data.total >= 0 ? data.total : comments.length };
}

export async function publishCommunityReflection(slug: string, name: string, text: string) {
  const author = name.trim() || 'Hermano/a en Cristo';
  const message = text.trim();
  if (!message || message.length > 400 || author.length > 60) throw new Error('Revisa tu nombre y el límite de 400 caracteres.');
  const data = await request(slug, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ verse: slug, userName: author, text: message }) });
  const comment = parseComment(data.comment) ?? (Array.isArray(data.comments)
    ? data.comments.map(parseComment).find((c: CommunityComment | null) => c && !c.isPastor && c.text === message && c.userName === author)
    : null);
  if (!comment) throw new Error('No pudimos confirmar la publicación. Actualiza el muro antes de intentar otra vez.');
  return comment as CommunityComment;
}

export function formatReflectionDate(value: string): string {
  if (!value) return '';
  const normalized = /^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/.test(value) ? value.replace(' ', 'T') + 'Z' : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}
