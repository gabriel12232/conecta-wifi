import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

// Run the actual route with isolated auth/database doubles, without production data.
const id = 'a'.repeat(48), owner = 'owner-a';
let user = null, row = {owner}, databaseError = null, inserted = null, requestedOwner = null;
const client = {
  from(table) {
    if(table === 'networks') return {select(columns) {
      assert.ok(!columns.includes('secret'));
      return {eq(column,value) {
        if(column === 'id') {assert.equal(value,id);return {async maybeSingle(){return {data:row,error:databaseError};}};}
        assert.equal(column,'owner');assert.equal(value,owner);
        return {async order(){return {data:[{id,ssid:'Test',place:''}],error:databaseError};}};
      }};
    }};
    assert.equal(table,'network_events');
    return {async upsert(value,options){inserted={value,options};return {error:databaseError};}};
  },
  async rpc(name,args){assert.equal(name,'network_analytics');requestedOwner=args.p_owner;return {data:[],error:databaseError};},
};
globalThis.__analyticsTest = {getChatGPTUser:async()=>user,db:()=>client};
const source = fs.readFileSync(new URL('../app/api/analytics/route.ts',import.meta.url),'utf8')
  .replace("import {getChatGPTUser} from '../../chatgpt-auth';",'const {getChatGPTUser} = globalThis.__analyticsTest;')
  .replace("import {db} from '../../storage';",'const {db} = globalThis.__analyticsTest;');
const compiled = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const route = await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
const payload = {networkId:id,sessionId:'12345678-1234-4234-8234-123456789012',event:'view'};
const request = (body=payload,origin='https://conecta.test') => new Request('https://conecta.test/api/analytics',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(body)});

assert.equal((await route.GET()).status,401,'Anonymous users cannot read analytics');
user={userId:owner};
const result=await route.GET();assert.equal(result.status,200);assert.equal(requestedOwner,owner);
assert.equal((await route.POST(request(payload,'https://other.test'))).status,403);
assert.equal((await route.POST(request({...payload,event:'password'}))).status,400);
assert.equal((await route.POST(request({...payload,networkId:'guess'}))).status,400);
assert.equal((await route.POST(request({...payload,sessionId:'invalid'}))).status,400);
assert.equal((await route.POST(request())).status,200);assert.equal(inserted,null,'Owner visits are excluded');
user=null;
for(const event of ['view','copy','download','print']) {
  assert.equal((await route.POST(request({...payload,event,day:'2000-01-01',password:'do-not-store'}))).status,200);
  assert.deepEqual(inserted.value,{network_id:id,session_id:payload.sessionId,event},'Ignore extra fields and client-supplied dates');
  assert.equal(inserted.options.ignoreDuplicates,true);
  assert.equal(inserted.options.onConflict,'network_id,session_id,event,day');
}
row=null;assert.equal((await route.POST(request())).status,404);
row={owner};databaseError={message:'private database details'};
assert.equal((await route.POST(request())).status,503);
user={userId:owner};const failed=await route.GET();assert.equal(failed.status,503);assert.ok(!(await failed.text()).includes('private database details'));
delete globalThis.__analyticsTest;
console.log('Analytics: authorization, ownership, validation, event filtering, deduplication configuration and error handling passed.');
