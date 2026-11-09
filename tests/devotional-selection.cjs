// Run: node tests/devotional-selection.cjs
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const path = require('node:path');
function load(relative) {
  const filename = path.join(__dirname, '..', relative);
  const js = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const context = { exports: {} };
  vm.runInNewContext(js, context, { filename });
  return context.exports;
}
const { selectDevotional, parseDevotionalSelection, localDateKey } = load('src/features/daily/data/devotionalSelection.ts');
const { DEVOTIONAL_CATALOG: catalog } = load('src/features/daily/data/devotionalCatalog.ts');
const ids = Array.from(catalog, (entry) => entry.verseId);
assert.equal(ids.length, 365);
assert.equal(new Set(ids).size, 365);
assert.equal(new Set(Array.from(catalog, (entry) => entry.reflection)).size, 365);
assert.ok(catalog.every((entry) => entry.theme && entry.reflection));
const date = new Date(2026, 10, 7, 12);
let state = selectDevotional(null, ids, date);
const main = state.history[0];
const drawn = new Set([main]);
for (let i = 1; i < 365; i++) {
  state = selectDevotional(state, ids, date, 'random', () => 0.42);
  const current = state.history.at(-1);
  assert.ok(!drawn.has(current), 'No repeats before exhausting 365');
  drawn.add(current);
}
assert.equal(drawn.size, 365);
const last = state.history.at(-1);
state = selectDevotional(state, ids, date, 'random', () => 0.42);
assert.notEqual(state.history.at(-1), last, 'No immediate repeat at cycle boundary');
assert.equal(state.seen.length, 2);
state = selectDevotional(state, ids, date, 'random', () => 0.42);
assert.equal(state.seen.length, 3, 'Old history must not repopulate completed cycle');
const restored = parseDevotionalSelection(JSON.stringify(state));
assert.equal(selectDevotional(restored, ids, date).history.at(-1), state.history.at(-1));
const previous = state.history.at(-2);
state = selectDevotional(state, ids, date, 'previous');
assert.equal(state.history.at(-1), previous);
const nextDate = new Date(2026, 10, 8, 0, 1);
const next = selectDevotional(state, ids, nextDate);
assert.equal(next.history.length, 1);
assert.notEqual(next.history[0], main);
assert.equal(next.dateKey, localDateKey(nextDate));
assert.ok(next.seen.length >= state.seen.length, 'Seen cycle persists across dates');
assert.equal(selectDevotional(null, ids, date, 'previous').history.length, 1);
assert.equal(parseDevotionalSelection('{broken'), null);
assert.equal(parseDevotionalSelection('{"dateKey":"x","seen":[null],"history":[]}'), null);
const cleaned = selectDevotional({ dateKey: localDateKey(date), seen: [-1], history: [-1] }, ids, date);
assert.equal(cleaned.history[0], main);
const yearEnd = selectDevotional(null, ids, new Date(2026, 11, 31));
const yearStart = selectDevotional(yearEnd, ids, new Date(2027, 0, 1));
assert.equal(ids.indexOf(yearStart.history[0]), (ids.indexOf(yearEnd.history[0]) + 1) % 365);
console.log('PASS: 365 entries, unique reflections, complete shuffle cycles, persistence, back history, date/year rollover, corrupt state recovery.');

// Exercise the persistence/serialization code with storage and Bible I/O mocked.
(async () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/services/db/bibleDb.ts'), 'utf8');
  const service = source.slice(source.indexOf('const DEVOTIONAL_STORAGE_KEY'), source.indexOf('// ================= BIBLICAL PEOPLE'));
  const storage = new Map();
  let writes = 0;
  const context = {
    exports: {}, DEVOTIONAL_CATALOG: catalog, selectDevotional, parseDevotionalSelection,
    AsyncStorage: {
      getItem: async (key) => storage.get(key) ?? null,
      setItem: async (key, value) => { writes++; storage.set(key, value); },
    },
    getVerseById: async (id) => ({ id, text: 'Mock verse' }),
  };
  vm.runInNewContext(ts.transpileModule(service, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, context);
  const get = context.exports.getDailyDevotional;
  const first = await get();
  assert.equal(first.canGoBack, false);
  const [a, b] = await Promise.all([get({ randomize: true }), get({ randomize: true })]);
  assert.notEqual(a.verse.id, first.verse.id);
  assert.notEqual(b.verse.id, a.verse.id);
  assert.equal(b.canGoBack, true);
  const meta = catalog.find((entry) => entry.verseId === b.verse.id);
  assert.equal(b.theme, meta.theme);
  assert.equal(b.reflection, meta.reflection);
  assert.equal((await get()).verse.id, b.verse.id);
  const before = writes;
  for (let i = 1; i <= 14; i++) await get({ date: new Date(2030, 0, i) });
  assert.equal(writes, before, 'Notification previews cannot write user state');
  assert.equal((await get()).verse.id, b.verse.id);
  assert.equal((await get({ previous: true })).verse.id, a.verse.id);
  assert.equal((await get({ previous: true })).verse.id, first.verse.id);
  assert.equal((await get()).canGoBack, false);
  console.log('PASS: serialized concurrent draws, saved selection, matching theme/reflection, 14-day notification previews, previous button state.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
