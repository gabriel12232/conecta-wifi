import 'server-only';
import {createClient} from '@supabase/supabase-js';
import type {Network} from './wifi';
export function db(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,secret=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!secret)throw new Error('Configure o banco Supabase.');
 return createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
}
async function key(){
 const raw=process.env.WIFI_ENCRYPTION_KEY;
 if(!raw||!/^[a-f0-9]{64}$/i.test(raw))throw new Error('Criptografia indisponível.');
 return crypto.subtle.importKey('raw',Uint8Array.from(raw.match(/../g)!,h=>parseInt(h,16)),'AES-GCM',false,['encrypt','decrypt']);
}
export async function encrypt(password:string){const iv=crypto.getRandomValues(new Uint8Array(12));const bytes=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},await key(),new TextEncoder().encode(password)));return btoa(String.fromCharCode(...iv,...bytes));}
async function decode(row:any):Promise<Network>{const bytes=Uint8Array.from(atob(row.secret),c=>c.charCodeAt(0));const password=new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.slice(0,12)},await key(),bytes.slice(12)));const {secret,owner,...rest}=row;return {...rest,password,hidden:!!row.hidden};}
export async function listNetworks(owner:string){const {data,error}=await db().from('networks').select('*').eq('owner',owner).order('created',{ascending:false});if(error)throw new Error('Database operation failed');return Promise.all((data||[]).map(decode));}
export async function findNetwork(id:string,owner?:string){if(!/^[a-f0-9]{48}$/.test(id))return null;let query=db().from('networks').select('*').eq('id',id);if(owner)query=query.eq('owner',owner);const {data,error}=await query.maybeSingle();if(error)throw new Error('Database operation failed');return data?decode(data):null;}
export async function saveNetwork(owner:string,value:any,id?:string){const now=new Date().toISOString();const data={ssid:value.ssid,place:value.place,security:value.security,hidden:!!value.hidden,secret:await encrypt(value.password),updated:now};if(id){const {error}=await db().from('networks').update(data).eq('id',id).eq('owner',owner);if(error)throw new Error('Database operation failed');}else{id=Array.from(crypto.getRandomValues(new Uint8Array(24)),n=>n.toString(16).padStart(2,'0')).join('');const {error}=await db().from('networks').insert({...data,id,owner,created:now});if(error)throw new Error('Database operation failed');}return id;}
export async function removeNetwork(owner:string,id:string){const {error}=await db().from('networks').delete().eq('id',id).eq('owner',owner);if(error)throw new Error('Database operation failed');}
