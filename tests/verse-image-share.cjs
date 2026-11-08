const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
function load(name, requireMock = () => { throw new Error('Unexpected dependency'); }) {
  const file = path.join(__dirname, '../src/features/share/utils', `${name}.ts`);
  const context = { exports: {}, require: requireMock };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText, context);
  return context.exports;
}
const links = load('verseShare');
assert.equal(links.getVerseShareUrl('Juan', 3, 16), 'https://selah.boxtiove.com/v/juan-3-16');
assert.equal(links.getVerseShareUrl('  1 Corintios ', 13, 4), 'https://selah.boxtiove.com/v/1-corintios-13-4');
assert.equal(links.getVerseShareUrl('Génesis', 1, 1), 'https://selah.boxtiove.com/v/genesis-1-1');
assert.throws(() => links.getVerseShareUrl(undefined, 1, 1));
assert.throws(() => links.getVerseShareUrl('Juan', 0, 16));
assert.throws(() => links.getVerseShareMessage('https://example.com/v/juan-3-16'));
let nativeAvailable = true;
let imported = false;
let captured;
const platform = { OS: 'android' };
const share = load('shareVerseImage', (name) => {
  if (name === './verseShare') return links;
  if (name === 'react-native') return { Platform: platform, TurboModuleRegistry: { get: () => nativeAvailable ? {} : null } };
  if (name === 'react-native-share') {
    imported = true;
    return { open: async (options) => { captured = options; return { success: false }; } };
  }
  throw new Error(`Unexpected dependency: ${name}`);
});
(async () => {
  const url = links.getVerseShareUrl('Juan', 3, 16);
  await share.shareVerseImage('/cache/postal.jpg', url, 'Juan 3:16');
  assert.equal(captured.url, 'file:///cache/postal.jpg');
  assert.equal(captured.type, 'image/jpeg');
  assert.equal(captured.message, `Leer en Selah:\n${url}`);
  assert.equal(captured.failOnCancel, false);
  await share.shareVerseImage('file:///cache/diseno.jpg', url, 'Juan 3:16');
  assert.equal(captured.url, 'file:///cache/diseno.jpg');
  imported = false;
  nativeAvailable = false;
  await assert.rejects(share.shareVerseImage('/cache/test.jpg', url, 'Juan 3:16'), /nueva APK/);
  assert.equal(imported, false, 'Older APK must not import missing native module');
  platform.OS = 'web';
  assert.throws(() => share.assertImageCaptionSharingAvailable(), /desde la app/);
  console.log('PASS: canonical verse links, caption + JPEG payload, cancellation, old APK guard, web guard.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
