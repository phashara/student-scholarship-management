const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const {stripTypeScriptTypes}=require('node:module');
const raw=stripTypeScriptTypes(fs.readFileSync('src/services/firebaseService.ts','utf8'));
const source=raw.replace(/import[\s\S]*?from ['"]([^'"]+)['"];?/g, (_,id)=> id==='firebase/firestore' ? `const {collection,getDocsFromServer,writeBatch}=require('${id}');` : id==='../firebase' ? `const {db}=require('${id}');` : id==='../data/scholarshipData' ? `const {loadApplications:loadLocalApplications}=require('${id}');` : '').replace(/export /g,'') + '\nmodule.exports={deleteApplicationOnline,clearAllApplicationsOnline};';
function setup({deny=false,offline=false,missing=false,extra=false}={}) {
 let cache=[{id:'FSS-2569-010',studentId:'s1'},{id:'FSS-2569-011',studentId:'s1'}];
 const original=structuredClone(cache),deleted=[];
 const docs=(missing?[]:cache).map((data,i)=>({id:i?'another-auto-id':'legacy-auto-id',data:()=>({...data,id:i?data.id:'APP-2569-010'}),ref:i}));
 let committed=false;
 const firebase={collection:()=>({}),getDocsFromServer:async()=>{if(offline)throw Error('offline');const visible=committed?docs.filter(d=>!deleted.includes(d.ref)):docs;return {docs:visible,size:visible.length,empty:!visible.length}},writeBatch:()=>({delete:r=>deleted.push(r),commit:async()=>{if(deny)throw Error('permission-denied');committed=true;if(extra)cache.push({id:'FSS-2569-012',studentId:'s2'})}})};
 const module={exports:{}};
 vm.runInNewContext(source,{module,exports:module.exports,console,localStorage:{setItem:(k,v)=>{assert.ok(committed||missing);cache=JSON.parse(v)},removeItem:()=>{}},require:id=>id==='firebase/firestore'?firebase:id==='../firebase'?{db:{}}:{loadApplications:()=>cache}});
 return {api:module.exports,cache:()=>cache,original,deleted};
}
test('deletes legacy ID via real document reference; preserves another application of same student',async()=>{const x=setup();await x.api.deleteApplicationOnline('FSS-2569-010','s1');assert.deepEqual(x.deleted,[0]);assert.equal(x.cache().length,1);assert.equal(x.cache()[0].id,'FSS-2569-011')});
for(const mode of ['deny','offline','missing'])test(mode+' rejects without clearing cache',async()=>{const x=setup({[mode]:true});await assert.rejects(x.api.deleteApplicationOnline('FSS-2569-010','s1'));assert.deepEqual(x.cache(),x.original)});
test('mismatched student does not delete',async()=>{const x=setup();await assert.rejects(x.api.deleteApplicationOnline('FSS-2569-010','other'));assert.equal(x.deleted.length,0)});
test('clear rejected keeps cache',async()=>{const x=setup({deny:true});await assert.rejects(x.api.clearAllApplicationsOnline());assert.deepEqual(x.cache(),x.original)});
test('clear successful removes only initial snapshot, preserves concurrent new application',async()=>{const x=setup({extra:true});await x.api.clearAllApplicationsOnline();assert.deepEqual(x.deleted,[0,1]);assert.equal(x.cache().length,1);assert.equal(x.cache()[0].id,'FSS-2569-012')});
