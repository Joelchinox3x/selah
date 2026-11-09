const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
function load(file, globals = {}) {
  const context = { exports: {}, Request, Response, URL, AbortController, setTimeout, clearTimeout, console, ...globals };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText, context, { filename: file });
  return context.exports;
}
const root = path.resolve(__dirname, '..');
const handler = load(path.resolve(root, '../selah-landing/src/communityComments.ts'), { console: { error() {} } }).handleCommunityComments;
const rows = [];
let broken = false;
const db = { prepare(sql) {
  let args;
  return {
    bind(...values) { args = values; return this; },
    async run() {
      if (broken) throw Error('D1 unavailable');
      const [verse_slug, user_name, text] = args;
      const id = rows.length + 1;
      rows.push({ id, verse_slug, user_name, text, role: 'Comunidad Selah', is_pastor: 0, created_at: '2026-11-08 12:00:00', status: 'approved' });
      return { success: true, meta: { last_row_id: id } };
    },
    async all() {
      if (broken) throw Error('D1 unavailable');
      return { success: true, results: rows.filter((r) => r.verse_slug === args[0] && r.status === 'approved').sort((a,b) => b.is_pastor - a.is_pastor || b.id - a.id).slice(0,50) };
    },
    async first() {
      if (broken) throw Error('D1 unavailable');
      return { total: rows.filter((r) => r.verse_slug === args[0] && r.status === 'approved').length };
    },
  };
} };
const req = (slug = 'juan-3-16') => new Request(`https://selah.boxtiove.com/api/comments?verse=${slug}`);
const post = (body) => new Request('https://selah.boxtiove.com/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
let captured;
let failHTTP = false;
const client = load(path.join(root, 'src/features/daily/services/communityReflections.ts'), {
  fetch: async (url, options) => {
    captured = { url, options };
    if (failHTTP) return new Response(JSON.stringify({ ok: false, error: 'failure' }), { status: 503 });
    return handler(new Request(url, options), db);
  },
});
(async () => {
  let response = await handler(req(), db);
  let data = await response.json();
  assert.equal(data.comments.length, 0, 'Empty database must not invent people');
  assert.equal(data.total, 0);
  assert.equal((await client.loadCommunityReflections('juan-3-16')).comments.length, 0);
  const draft = { name: ' Ana ', text: ' Una reflexión real ' };
  const published = await client.publishCommunityReflection('juan-3-16', draft.name, draft.text);
  assert.equal(published.userName, 'Ana');
  assert.equal(published.text, 'Una reflexión real');
  assert.equal(published.isPastor, false);
  assert.equal(published.id, '1');
  assert.equal(JSON.parse(captured.options.body).verse, 'juan-3-16');
  rows.push({ id: 2, verse_slug: 'juan-3-16', user_name: 'Pastor', text: 'Reflexión pastoral', role: 'Pastor', is_pastor: 1, created_at: '2026-11-08 12:00:00', status: 'approved' });
  rows.push({ id: 3, verse_slug: 'juan-3-16', user_name: 'Hidden', text: 'Oculto', is_pastor: 0, status: 'hidden' });
  let result = await client.loadCommunityReflections('juan-3-16');
  assert.equal(result.total, 2);
  assert.equal(result.comments[0].isPastor, true);
  assert.equal((await client.loadCommunityReflections('salmos-23-1')).comments.length, 0, 'No comments from another verse');
  assert.equal((await handler(post({verse:'juan-3-16', text:'x'.repeat(401)}), db)).status,400);
  assert.equal((await handler(post({verse:'juan-3-16', text:'ok', userName:'n'.repeat(61)}), db)).status,400);
  assert.equal((await handler(post({verse:'juan-3-16', text:'   '}), db)).status,400);
  assert.equal((await handler(req('invalid'), db)).status,400);
  assert.equal((await handler(req(), undefined)).status,503);
  broken = true;
  assert.equal((await handler(req(), db)).status,503);
  await assert.rejects(client.publishCommunityReflection('juan-3-16', 'Ana', 'Conservar borrador'));
  assert.equal(draft.text, ' Una reflexión real ', 'Failed publication cannot mutate caller draft');
  broken = false;
  failHTTP = true;
  await assert.rejects(client.loadCommunityReflections('juan-3-16'));
  const legacy = load(path.join(root, 'src/features/daily/services/communityReflections.ts'), {
    fetch: async () => new Response(JSON.stringify({ok:true, comments:[{id:'seed-1',userName:'Demo',text:'Demo'}]})),
  });
  assert.equal((await legacy.loadCommunityReflections('juan-3-16')).comments.length,0, 'Old server demo entries are hidden');
  const storage = new Map();
  const drafts = load(path.join(root, 'src/features/daily/services/reflectionDrafts.ts'), {
    require: () => ({ getItem: async (k) => storage.get(k) ?? null, setItem: async (k,v) => storage.set(k,v) }),
  });
  await Promise.all([
    drafts.saveReflectionDraft('juan-3-16', {name:'Ana',text:'Uno'}),
    drafts.saveReflectionDraft('juan-3-16', {name:'Ana',text:'Último borrador'}),
    drafts.saveReflectionDraft('salmos-23-1', {name:'Ana',text:'Otro versículo'}),
  ]);
  assert.equal((await drafts.loadReflectionDraft('juan-3-16')).text,'Último borrador');
  assert.equal((await drafts.loadReflectionDraft('salmos-23-1')).text,'Otro versículo');
  const cold = load(path.join(root, 'src/features/daily/services/reflectionDrafts.ts'), {
    require: () => ({ getItem: async (k) => storage.get(k) ?? null, setItem: async (k,v) => storage.set(k,v) }),
  });
  assert.equal((await cold.loadReflectionDraft('juan-3-16')).text,'Último borrador', 'Draft survives reload');
  assert.equal(client.formatReflectionDate('Hoy'),'');
  assert.ok(client.formatReflectionDate('2026-11-08 12:00:00'));
  console.log('PASS: empty wall, approved entries, pastoral priority, confirmed publishing, errors, limits, verse isolation, legacy demo filtering, persisted drafts and dates.');
})().catch((error) => { console.error(error); process.exitCode=1; });
