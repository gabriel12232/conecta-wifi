import { env } from 'cloudflare:workers';
import { getDb } from '../db';
import { networks } from '../db/schema';
import { and, eq, desc } from 'drizzle-orm';
import type { Network } from './wifi';
async function key() {
  const raw = (env as any).WIFI_ENCRYPTION_KEY;
  if (!raw || !/^[a-f0-9]{64}$/i.test(raw)) throw Object.assign(new Error('Criptografia indisponível.'), {name:'EncryptionConfigurationError'});
  return crypto.subtle.importKey('raw', Uint8Array.from(raw.match(/../g), (h:any)=>parseInt(h,16)), 'AES-GCM', false, ['encrypt','decrypt']);
}
export async function encrypt(password:string) {
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const bytes=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv}, await key(),new TextEncoder().encode(password)));
  return btoa(String.fromCharCode(...iv,...bytes));
}
async function decode(row:any):Promise<Network> {
  const bytes=Uint8Array.from(atob(row.secret), c=>c.charCodeAt(0));
  const password=new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.slice(0,12)}, await key(),bytes.slice(12)));
  const {secret,owner,...rest}=row; return {...rest,password,hidden:!!row.hidden};
}
export async function listNetworks(owner:string) { return Promise.all((await getDb().select().from(networks).where(eq(networks.owner,owner)).orderBy(desc(networks.created))).map(decode)); }
export async function findNetwork(id:string,owner?:string) {
  if (!/^[a-f0-9]{48}$/.test(id)) return null;
  const rows=await getDb().select().from(networks).where(owner ? and(eq(networks.id,id),eq(networks.owner,owner)) : eq(networks.id,id)).limit(1);
  return rows[0] ? decode(rows[0]) : null;
}
export async function saveNetwork(owner:string,value:any,id?:string) {
  const now=new Date().toISOString();
  const data={ssid:value.ssid,place:value.place,security:value.security,hidden:Number(value.hidden),secret:await encrypt(value.password),updated:now};
  if (id) await getDb().update(networks).set(data).where(and(eq(networks.id,id),eq(networks.owner,owner)));
  else { id=Array.from(crypto.getRandomValues(new Uint8Array(24)), n=>n.toString(16).padStart(2,'0')).join(''); await getDb().insert(networks).values({...data,id,owner,created:now}); }
  return id;
}
export async function removeNetwork(owner:string,id:string) { await getDb().delete(networks).where(and(eq(networks.id,id),eq(networks.owner,owner))); }
