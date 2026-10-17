import {authClient,authConfigured} from '../../../lib/supabase/server';
const json=(data:any,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Origem não permitida.'},403);
 if(!authConfigured())return json({error:'Configure o Supabase na Vercel para habilitar o login.'},503);
 let body:any;try{const text=await req.text();if(text.length>2048)return json({error:'Dados inválidos.'},400);body=JSON.parse(text);}catch{return json({error:'Dados inválidos.'},400);}
 if(!['login','register','logout'].includes(body.action))return json({error:'Ação inválida.'},400);
 try{const client=await authClient();if(body.action==='logout'){const {error}=await client.auth.signOut();return error?json({error:'Não foi possível sair.'},503):json({ok:true});}
 if(typeof body.email!=='string'||!/^\S+@\S+\.\S+$/.test(body.email)||body.email.length>254||typeof body.password!=='string'||body.password.length<8||body.password.length>128)return json({error:'Informe um e-mail válido e uma senha de 8 a 128 caracteres.'},400);
 if(body.action==='register'){const site=process.env.NEXT_PUBLIC_SITE_URL||new URL(req.url).origin;const {data,error}=await client.auth.signUp({email:body.email.trim(),password:body.password,options:{emailRedirectTo:site+'/auth/confirm'}});if(error)return json({error:error.status===429?'Muitas tentativas. Aguarde e tente novamente.':'Não foi possível criar a conta. Verifique os dados ou tente entrar.'},400);return json({confirmation:!data.session});}
 const {error}=await client.auth.signInWithPassword({email:body.email.trim(),password:body.password});if(error)return json({error:error.status===429?'Muitas tentativas. Aguarde e tente novamente.':'E-mail ou senha incorretos, ou e-mail ainda não confirmado.'},401);return json({ok:true});
 }catch{return json({error:'Não foi possível acessar o serviço de autenticação. Tente novamente.'},503);}
}
