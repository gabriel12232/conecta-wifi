import {authClient} from '../../../lib/supabase/server';
import {NextResponse} from 'next/server';
export async function GET(req:Request){const url=new URL(req.url);const code=url.searchParams.get('code');if(code){try{const client=await authClient();const {error}=await client.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL('/',url.origin));}catch{}}return NextResponse.redirect(new URL('/entrar',url.origin));}
