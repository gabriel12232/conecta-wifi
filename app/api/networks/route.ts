import { getChatGPTUser } from '../../chatgpt-auth';
import { listNetworks,findNetwork,saveNetwork,removeNetwork } from '../../storage';
import { validateNetwork } from '../../wifi';
export const dynamic='force-dynamic';
const json=(data:any,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer'}});
export async function GET() { const u=await getChatGPTUser(); if(!u) return json({error:'Entre para acessar suas redes.'},401); try{return json(await listNetworks(u.userId));}catch{return json({error:'Não foi possível carregar as redes. Tente novamente.'},503);} }
async function mutate(req:Request,method:string) {
  const user=await getChatGPTUser(); if(!user) return json({error:'Sua sessão expirou. Entre novamente.'},401);
  if(req.headers.get('origin')!==new URL(req.url).origin) return json({error:'Origem não permitida.'},403);
  let body:any; try { if(Number(req.headers.get('content-length')||0)>4096) return json({error:'Dados muito extensos.'},413); const raw=await req.text(); if(raw.length>4096)return json({error:'Dados muito extensos.'},413);body=JSON.parse(raw); }catch{return json({error:'Dados inválidos.'},400);}
  try {
    if(method!=='POST' && (!body.id || !await findNetwork(body.id,user.userId))) return json({error:'Rede não encontrada.'},404);
    if(method==='DELETE') {await removeNetwork(user.userId,body.id);return json({ok:true});}
    let data;try{data=validateNetwork(body);}catch(e){return json({error:(e as Error).message},400);}
    const id=await saveNetwork(user.userId,data,method==='PUT'?body.id:undefined);return json({id},method==='POST'?201:200);
  }catch{return json({error:'Não foi possível salvar. Tente novamente.'},503);}
}
export const POST=(r:Request)=>mutate(r,'POST');
export const PUT=(r:Request)=>mutate(r,'PUT');
export const DELETE=(r:Request)=>mutate(r,'DELETE');
