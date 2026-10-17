import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
const base='http://127.0.0.1:5173';
const anonymous=await fetch(base+'/api/networks');assert.equal(anonymous.status,401);
const spoof=await fetch(base+'/api/networks',{headers:{'oai-authenticated-user-id':'other','oai-authenticated-user-email':'other@test.local'}});assert.equal(spoof.status,401);
const login=await fetch(base+'/signin-with-chatgpt?return_to=/',{redirect:'manual'});const cookie=login.headers.get('set-cookie').split(';')[0];
const headers={'Cookie':cookie,'Origin':base,'Content-Type':'application/json'};
const input={ssid:'Café; Sala: "A", \\ Rede',password:'s;en:ha,"\\123',place:'Teste automatizado',security:'WPA',hidden:true};
async function call(method,body,extra={}){return fetch(base+'/api/networks',{method,headers:{...headers,...extra},body:body?JSON.stringify(body):undefined});}
let response=await call('POST',input);assert.equal(response.status,201);const {id}=await response.json();assert.match(id,/^[a-f0-9]{48}$/);
try {
 let all=await (await call('GET')).json();assert.equal(all.find(n=>n.id===id).password,input.password);
 let page=await fetch(base+'/r/'+id);assert.equal(page.status,200);let html=await page.text();assert.ok(html.includes('Teste automatizado'));assert.match(page.headers.get('x-robots-tag'),/noindex/);assert.match(page.headers.get('cache-control'),/no-store/);
 const dataDir='.wrangler/state/v3/d1/miniflare-D1DatabaseObject';const sqlite=fs.readdirSync(dataDir).find(f=>f.endsWith('.sqlite'));const db=new DatabaseSync(path.join(dataDir,sqlite));const stored=db.prepare('SELECT secret FROM networks WHERE id=?').get(id);assert.ok(stored.secret);assert.ok(!stored.secret.includes(input.password));
 const foreignId='a'.repeat(48);db.prepare('INSERT INTO networks SELECT ?, ?, ssid, place, security, hidden, secret, created, updated FROM networks WHERE id=?').run(foreignId,'another-user',id);
 try{all=await(await call('GET')).json();assert.ok(!all.some(n=>n.id===foreignId));assert.equal((await call('PUT',{...input,id:foreignId})).status,404);assert.equal((await call('DELETE',{id:foreignId})).status,404);}finally{db.prepare('DELETE FROM networks WHERE id=?').run(foreignId);db.close();}
 const changed={...input,id,password:'Nova;senha:123'};assert.equal((await call('PUT',changed)).status,200);all=await(await call('GET')).json();assert.equal(all.find(n=>n.id===id).password,changed.password);assert.equal((await fetch(base+'/r/'+id)).status,200);
 assert.equal((await call('POST',{...input,password:'123'})).status,400);assert.equal((await call('POST',input,{Origin:'https://wrong.example'})).status,403);
 console.log('PASS: authentication, spoof rejection, CRUD, persistence, encrypted storage, owner isolation, public page, stable link, validation, CSRF, noindex, no-store.');
} finally {assert.equal((await call('DELETE',{id})).status,200);assert.equal((await fetch(base+'/r/'+id)).status,404);}
