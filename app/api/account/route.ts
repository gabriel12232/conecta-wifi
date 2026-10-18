import {authClient} from '../../../lib/supabase/server';
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
export async function PATCH(request:Request){
  if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Origem não permitida.'},403);
  try{
    const client=await authClient();
    const {data:{user},error:authError}=await client.auth.getUser();
    if(authError||!user)return json({error:'Entre novamente para atualizar sua conta.'},401);
    const raw=await request.text();if(raw.length>1024)return json({error:'Dados inválidos.'},400);
    let body;try{body=JSON.parse(raw);}catch{return json({error:'Dados inválidos.'},400);}
    if(typeof body?.name!=='string'||body.name.trim().length<1||body.name.trim().length>80||/[\u0000-\u001f\u007f]/.test(body.name))return json({error:'Informe um nome de 1 a 80 caracteres.'},400);
    const {error}=await client.auth.updateUser({data:{full_name:body.name.trim()}});
    if(error)return json({error:'Não foi possível atualizar o nome. Tente novamente.'},503);
    return json({ok:true});
  }catch{return json({error:'Não foi possível acessar o serviço da conta.'},503);}
}
