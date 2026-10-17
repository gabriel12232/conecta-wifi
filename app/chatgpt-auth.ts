// Compatibility exports for the existing UI. Identity now comes from verified Supabase sessions.
import {authClient,authConfigured} from '../lib/supabase/server';
import {redirect} from 'next/navigation';
export async function getChatGPTUser(){
 if(!authConfigured())return null;
 const client=await authClient();const {data:{user},error}=await client.auth.getUser();
 if(error||!user)return null;
 return {userId:user.id,email:user.email||'',displayName:typeof user.user_metadata?.full_name==='string'?user.user_metadata.full_name:user.email||'Minha conta',fullName:null};
}
export async function requireChatGPTUser(returnTo:string){const user=await getChatGPTUser();if(user)return user;redirect(chatGPTSignInPath(returnTo));}
export function chatGPTSignInPath(_returnTo='/'){return '/entrar';}
export function chatGPTSignOutPath(_returnTo='/'){return '/auth/sair';}
