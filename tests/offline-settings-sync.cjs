const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),ts=require('typescript');
function load(file,globals){const c={exports:{},AbortController,Date,console,setTimeout,clearTimeout,...globals};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,c);return c.exports}
const store=new Map(),storage={getItem:async k=>store.get(k)??null,setItem:async(k,v)=>{store.set(k,v)}};
let fetchFn=async()=>{throw Error('offline')};const visibility=()=>load('src/services/pastoralVisibilityService.ts',{require:()=>storage,fetch:(...a)=>fetchFn(...a)});
(async()=>{let service=visibility();assert.equal(service.getPastoralVisibility(),null);await service.cachePastoralVisibility(false);
service=visibility();assert.equal(await service.loadPastoralVisibility(),false);assert.equal(await service.refreshPastoralVisibility(new AbortController().signal),false);
fetchFn=async()=>({ok:true,json:async()=>({ok:true,config:{show_pastoral_reflection:true}})});assert.equal(await service.refreshPastoralVisibility(new AbortController().signal),true);
fetchFn=async()=>({ok:true,json:async()=>({ok:true,config:{show_pastoral_reflection:false}})});assert.equal(await service.refreshPastoralVisibility(new AbortController().signal),false);
fetchFn=async()=>({ok:true,json:async()=>({ok:true,config:{}})});assert.equal(await service.refreshPastoralVisibility(new AbortController().signal),false);
service=visibility();assert.equal(await service.loadPastoralVisibility(),false);
let payload={success:true,changes:[{day_number:1}],serverTime:'2026-11-11T12:00:00Z'},calls=0,url='',failSave=false;
const calendar=load('src/services/devotionalSyncService.ts',{require:n=>n.includes('async-storage')?storage:{upsertDevotionalCalendarRows:async()=>{if(failSave)throw Error('storage failure')}},fetch:async u=>{calls++;url=u;return{ok:true,json:async()=>payload}}});
const result=await Promise.all([calendar.syncDevotionalCalendarWithServer(),calendar.syncDevotionalCalendarWithServer()]);assert.equal(calls,1);assert.equal(result[0].updated,1);assert.ok(!url.includes('?since='));
assert.equal(store.get('selah.calendar-last-sync-timestamp'),'2026-11-11 12:00:00');failSave=true;payload={...payload,serverTime:'2026-11-11T12:01:00Z'};assert.equal((await calendar.syncDevotionalCalendarWithServer()).updated,0);assert.equal(store.get('selah.calendar-last-sync-timestamp'),'2026-11-11 12:00:00');
failSave=false;payload={success:false,changes:[],serverTime:'2026-11-11T12:02:00Z'};await calendar.syncDevotionalCalendarWithServer();assert.equal(store.get('selah.calendar-last-sync-timestamp'),'2026-11-11 12:00:00');
const colors=load('src/theme/colors.ts',{}).themes;
const luminance=h=>{const a=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return a[0]*.2126+a[1]*.7152+a[2]*.0722};
for(const [name,theme] of Object.entries(colors)){const [a,b]=[luminance(theme.destructive),luminance(theme.surface)].sort((x,y)=>x-y);assert.ok((b+.05)/(a+.05)>=4.5,'Borrar contrast '+name)}
console.log('PASS: hidden setting survives cold start/offline, remote updates, malformed settings ignored, one sync at a time, cursor unchanged on failure, destructive contrast >=4.5 across themes');
})().catch(e=>{console.error(e);process.exitCode=1});
