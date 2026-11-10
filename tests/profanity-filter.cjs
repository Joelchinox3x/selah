const fs = require('fs');
const assert = require('assert');

// Cargar y evaluar profanityFilter.ts sin dependencias externas
const code = fs.readFileSync('src/features/daily/services/profanityFilter.ts', 'utf8')
  .replace(/export\s+/g, '')
  .replace(/:\s*Array<string>/g, '')
  .replace(/:\s*Promise<void>/g, '')
  .replace(/:\s*string/g, '')
  .replace(/:\s*\{[^}]+\}/g, '')
  .replace(/\?\s*:/g, ':');
eval(code);

const blockedCases = [
  'iglesia de mierda',
  'pastor de mierda',
  'm1erda total',
  'm.i.e.r.d.a',
  'miiiierda',
  'que pendejada es esta',
  'p.u.t.a',
  'hijo de puta',
  'son unos idiotas',
  'maldito seas',
  'chingada madre',
];

const allowedCases = [
  'Cristo nos salvó del pecado y de la condenación eterna.',
  'La muerte fue vencida en la cruz del calvario.',
  'Resistid al diablo y huirá de vosotros.',
  'El juicio de Dios es justo y verdadero.',
  'Por su sangre derramada fuimos limpios.',
  'Pido oración por mi familia y por la salud de mi madre.',
  'Amén, gloria a Dios por esta palabra tan hermosa.',
  'El infierno no prevalecerá contra la iglesia.',
];

console.log('--- Probando Casos Ofensivos (Deben Bloquearse) ---');
for (const phrase of blockedCases) {
  const res = hasProfanity(phrase);
  assert.strictEqual(res.blocked, true, `Fallo: '${phrase}' debió ser bloqueada`);
  console.log(`✓ Bloqueado correctamente: "${phrase}" (palabra: ${res.word})`);
}

console.log('\n--- Probando Casos Bíblicos / Legítimos (Deben Permitirse) ---');
for (const phrase of allowedCases) {
  const res = hasProfanity(phrase);
  assert.strictEqual(res.blocked, false, `Fallo: '${phrase}' NO debió ser bloqueada`);
  console.log(`✓ Permitido legítimo: "${phrase}"`);
}

console.log('\n✅ TODOS LOS TESTS DE PROFANITY FILTER PASARON AL 100%');
