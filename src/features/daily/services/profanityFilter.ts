/**
 * Filtro de Palabras Ofensivas y Groserías para la Comunidad Cristiana Selah (App Móvil)
 * Bloquea insultos, lenguaje soez, vulgaridades y ataques manteniendo
 * permitidas palabras bíblicas (pecado, juicio, condenación, diablo, muerte).
 */

const PROFANITY_ROOTS = [
  'mierda',
  'mrd',
  'puta',
  'puto',
  'putas',
  'putos',
  'putita',
  'puton',
  'pendejo',
  'pendeja',
  'pendejos',
  'pendejada',
  'carajo',
  'carajos',
  'coño',
  'cono',
  'verga',
  'vrga',
  'vergacion',
  'chingar',
  'chinga',
  'chingada',
  'chingado',
  'chingon',
  'joder',
  'jode',
  'jodido',
  'jodete',
  'cabron',
  'cabrona',
  'cabrones',
  'hdp',
  'hijo de puta',
  'hija de puta',
  'maldito',
  'maldita',
  'malditos',
  'malditas',
  'malparido',
  'malparida',
  'estupido',
  'estupida',
  'estupidos',
  'imbecil',
  'imbeciles',
  'tarado',
  'tarada',
  'idiota',
  'idiotas',
  'culiao',
  'culia',
  'culero',
  'culo',
  'culos',
  'marica',
  'maricon',
  'maricones',
  'zorra',
  'zorras',
  'bastardo',
  'bastarda',
  'mamaguevo',
  'mamagwebo',
  'gonorrea',
  'pelotudo',
  'pelotuda',
  'boludo',
  'boluda',
  'chucha',
  'conchatumadre',
  'conchasumadre',
  'ctm',
  'porno',
  'porn',
  'xxx',
];

export function normalizeText(raw: string): string {
  if (!raw) return '';
  let str = raw.toLowerCase();

  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  str = str
    .replace(/@/g, 'a')
    .replace(/4/g, 'a')
    .replace(/3/g, 'e')
    .replace(/1/g, 'i')
    .replace(/!/g, 'i')
    .replace(/0/g, 'o')
    .replace(/\$/g, 's')
    .replace(/5/g, 's')
    .replace(/7/g, 't');

  return str;
}

export function hasProfanity(rawText: string): { blocked: boolean; word?: string } {
  if (!rawText || !rawText.trim()) return { blocked: false };

  const normalized = normalizeText(rawText);
  const collapsed = normalized.replace(/[^a-z0-9]/g, '');
  const deDuplicated = normalized.replace(/(.)\1{2,}/g, '$1');
  const collapsedDeDuplicated = collapsed.replace(/(.)\1{2,}/g, '$1');

  for (const root of PROFANITY_ROOTS) {
    if (root.includes(' ')) {
      if (normalized.includes(root) || deDuplicated.includes(root)) {
        return { blocked: true, word: root };
      }
      continue;
    }

    if (root.length <= 3) {
      const regexWord = new RegExp(`(^|[^a-z])${root}([^a-z]|$)`, 'i');
      if (regexWord.test(normalized) || regexWord.test(deDuplicated)) {
        return { blocked: true, word: root };
      }
      continue;
    }

    const regexWord = new RegExp(`(^|[^a-z])${root}`, 'i');
    if (regexWord.test(normalized) || regexWord.test(deDuplicated) || collapsed.includes(root) || collapsedDeDuplicated.includes(root)) {
      return { blocked: true, word: root };
    }
  }

  return { blocked: false };
}
