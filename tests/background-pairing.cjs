const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/services/backgroundsService.ts'), 'utf8');
const context = {
  exports: {},
  console,
  AbortController,
  setTimeout,
  clearTimeout,
  fetch: async () => new Response('{}'),
  Response,
  require(name) {
    if (name === '@react-native-async-storage/async-storage') return { getItem: async () => null, setItem: async () => undefined };
    if (name === '@/src/features/share/data/cardBackgrounds') return { CARD_BACKGROUNDS: [] };
    throw new Error(`Unexpected import: ${name}`);
  },
};
vm.runInNewContext(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, context);

const rows = [
  { id: 'mount-916', pair_id: 'mount', title: 'Monte', category: 'naturaleza', aspect_ratio: '9:16', url: 'vertical.webp', created_at: '' },
  { id: 'mount-1x1', pair_id: 'mount', title: 'Monte', category: 'naturaleza', aspect_ratio: '1:1', url: 'square.webp', created_at: '' },
  { id: 'orphan', pair_id: 'orphan', title: 'Sin pareja', category: 'naturaleza', aspect_ratio: '9:16', url: 'orphan.webp', created_at: '' },
];
const paired = context.exports.pairRemoteBackgrounds(rows);
assert.equal(paired.length, 1);
assert.equal(paired[0].id, 'remote:mount');
assert.equal(paired[0].source916.uri, 'vertical.webp');
assert.equal(paired[0].source1x1.uri, 'square.webp');
console.log('PASS: remote backgrounds stay paired across 9:16 and 1:1, incomplete pairs stay hidden.');
