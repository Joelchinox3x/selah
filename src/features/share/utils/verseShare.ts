export function getVerseShareUrl(bookName: string | undefined, chapter: number, verse: number): string {
  const bookSlug = (bookName ?? '').trim().toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
  if (!bookSlug || !Number.isInteger(chapter) || chapter < 1 || !Number.isInteger(verse) || verse < 1) {
    throw new Error('No se pudo identificar el versículo para compartir.');
  }
  return `https://selah.boxtiove.com/v/${encodeURIComponent(bookSlug)}-${chapter}-${verse}`;
}

export function getVerseShareMessage(url: string): string {
  if (!/^https:\/\/selah\.boxtiove\.com\/v\/[a-z0-9%-]+-\d+-\d+$/.test(url)) {
    throw new Error('El enlace del versículo no es válido.');
  }
  return `Leer en Selah:\n${url}`;
}
