import 'server-only';
import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';
export function authConfigured(){return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);}
export async function authClient(){
 if(!authConfigured())throw new Error('Configure o Supabase nas variáveis de ambiente da Vercel.');
 const jar=await cookies();
 return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{cookies:{getAll(){return jar.getAll();},setAll(items){try{items.forEach(({name,value,options})=>jar.set(name,value,options));}catch{/* Server Components cannot set cookies; proxy refreshes sessions. */}}}});
}
