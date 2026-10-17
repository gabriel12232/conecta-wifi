import assert from 'node:assert/strict';
const base=process.env.TEST_SITE_ORIGIN||'http://127.0.0.1:3000';
for(const route of ['/','/entrar']){const r=await fetch(base+route);assert.equal(r.status,200);assert.match(await r.text(),/conecta/i);assert.match(r.headers.get('x-robots-tag'),/noindex/);}
assert.equal((await fetch(base+'/api/networks')).status,401);
assert.equal((await fetch(base+'/api/networks',{headers:{'oai-authenticated-user-id':'forged-user','oai-authenticated-user-email':'forged@example.com'}})).status,401);
assert.equal((await fetch(base+'/api/auth',{method:'POST',headers:{Origin:'https://wrong.example','Content-Type':'application/json'},body:JSON.stringify({action:'login',email:'test@example.com',password:'not-a-real-password'})})).status,403);
assert.equal((await fetch(base+'/r/invalid-token')).status,404);
console.log('PASS: page rendering, noindex, anonymous rejection, forged-header rejection, auth CSRF, invalid sharing token. Supabase end-to-end tests require a configured project.');
