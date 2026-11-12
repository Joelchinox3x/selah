const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process'),ts=require('typescript');
const context={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/features/characters/utils/filterPeople.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);
const people=JSON.parse(execFileSync('python3',['-c',"import sqlite3,json;c=sqlite3.connect('file:assets/db/bible_readonly.db?mode=ro',uri=True);c.row_factory=sqlite3.Row;print(json.dumps([dict(r) for r in c.execute('SELECT * FROM people')]))"],{encoding:'utf8'}));
const {filterPeople}=context.exports;
assert.equal(filterPeople(people,'Todos','').length,people.length);
assert.ok(filterPeople(people,'Todos','moises').some(p=>p.name_es==='Moisés'));
for(const category of new Set(people.map(p=>p.category))){const result=filterPeople(people,category,'');assert.ok(result.length);assert.ok(result.every(p=>p.category===category));}
assert.equal(filterPeople(people,'Todos','nombre_que_no_existe_937').length,0);
assert.ok(filterPeople(people,'Todos','').some(p=>p.testament==='OT'));
assert.ok(filterPeople(people,'Todos','').some(p=>p.testament==='NT'));
console.log('PASS: real catalog, accent-insensitive search, actual categories, empty results and both testaments available');
